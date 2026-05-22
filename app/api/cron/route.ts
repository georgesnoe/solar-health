import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { solarPanel, energyRecord, alert, user } from "@/lib/schema"
import { eq, inArray } from "drizzle-orm"
import { sendWhatsAppAlert } from "@/lib/whatsapp"

const CRON_API_KEY = process.env.CRON_API_KEY

const hourFactor: number[] = [
  0, 0, 0, 0, 0, 0.02, 0.08, 0.18, 0.32, 0.48,
  0.62, 0.73, 0.78, 0.76, 0.68, 0.55, 0.38, 0.2,
  0.06, 0, 0, 0, 0, 0,
]

function generateProduction(powerWp: number, hour: number): number {
  const baseWh = powerWp * (hourFactor[hour] ?? 0)
  const noise = 0.85 + Math.random() * 0.3
  const faulty = Math.random() < 0.25 ? 0.3 + Math.random() * 0.3 : 1
  return Math.round(((baseWh * noise * faulty) / 100)) * 100
}

function expectedProduction(powerWp: number, hour: number): number {
  return powerWp * (hourFactor[hour] ?? 0)
}

export async function POST(request: Request) {
  if (!CRON_API_KEY) {
    return NextResponse.json({ error: "CRON_API_KEY not configured" }, { status: 500 })
  }

  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${CRON_API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const currentHour = now.getHours()
  const recordedAt = new Date(now)
  recordedAt.setMinutes(0, 0, 0)

  const panels = await db
    .select({
      id: solarPanel.id,
      userId: solarPanel.userId,
      powerRatingWp: solarPanel.powerRatingWp,
    })
    .from(solarPanel)
    .where(eq(solarPanel.status, "active"))

  if (panels.length === 0) {
    return NextResponse.json({ message: "No panels to update" })
  }

  const productionRecords: (typeof energyRecord.$inferInsert)[] = []
  const userMap = new Map<string, { productionWh: number; expectedWh: number }>()

  for (const panel of panels) {
    const wh = generateProduction(parseInt(panel.powerRatingWp) || 400, currentHour)
    const expWh = expectedProduction(parseInt(panel.powerRatingWp) || 400, currentHour)

    const user = userMap.get(panel.userId) ?? { productionWh: 0, expectedWh: 0 }
    user.productionWh += wh
    user.expectedWh += expWh
    userMap.set(panel.userId, user)

    productionRecords.push({
      id: crypto.randomUUID(),
      panelId: panel.id,
      userId: panel.userId,
      type: "production",
      value: (wh / 1000).toString(),
      recordedAt,
    })
  }

  const userIds = [...new Set(panels.map((p) => p.userId))]

  const consumptionRecords: (typeof energyRecord.$inferInsert)[] = []
  for (const userId of userIds) {
    const user = userMap.get(userId)!
    const maxConsumptionWh = Math.max(Math.round(user.productionWh * 0.9), 100)
    const consumptionWh = Math.floor(Math.random() * maxConsumptionWh)

    consumptionRecords.push({
      id: crypto.randomUUID(),
      panelId: null,
      userId,
      type: "consumption",
      value: (consumptionWh / 1000).toString(),
      recordedAt,
    })
  }

  await db.insert(energyRecord).values([...productionRecords, ...consumptionRecords])

  const alerts: (typeof alert.$inferInsert)[] = []
  for (const userId of userIds) {
    const user = userMap.get(userId)!
    if (user.expectedWh > 0 && user.productionWh < user.expectedWh * 0.9) {
      const percentage = Math.round((1 - user.productionWh / user.expectedWh) * 100)
      alerts.push({
        id: crypto.randomUUID(),
        userId,
        message: `Production anormalement basse détectée`,
        expected: (user.expectedWh / 1000).toFixed(3),
        actual: (user.productionWh / 1000).toFixed(3),
        percentage: percentage.toString(),
      })
    }
  }

  if (alerts.length > 0) {
    await db.insert(alert).values(alerts)

    const alertUserIds = [...new Set(alerts.map((a) => a.userId))]
    const usersWithPhone = await db
      .select({ id: user.id, name: user.name, phone: user.phone })
      .from(user)
      .where(inArray(user.id, alertUserIds))

    const nowStr = now.toLocaleString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    for (const u of usersWithPhone) {
      if (!u.phone) continue
      const userAlert = alerts.find((a) => a.userId === u.id)
      if (!userAlert) continue
      await sendWhatsAppAlert(
        u.phone,
        u.name,
        parseInt(userAlert.percentage),
        userAlert.expected,
        userAlert.actual,
        nowStr
      )
    }
  }

  return NextResponse.json({
    message: "Energy data updated",
    panels: panels.length,
    alertsCreated: alerts.length,
    totalProductionKwh: [...userMap.values()].reduce((a, u) => a + u.productionWh, 0) / 1000,
  })
}
