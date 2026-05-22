"use server"

import { db } from "@/lib/db"
import { energyRecord, solarPanel } from "@/lib/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { eq, and, gte } from "drizzle-orm"

export type HourlyEnergy = {
  hour: string
  production: number
  consumption: number
}

export type DashboardData = {
  panelCount: number
  hourlyData: HourlyEnergy[]
  currentProduction: number
  currentExpected: number
  totalProduction: number
  totalConsumption: number
}

export type PanelHourlyData = {
  hour: string
  production: number
}

const hourFactor: number[] = [
  0, 0, 0, 0, 0, 0.02, 0.08, 0.18, 0.32, 0.48,
  0.62, 0.73, 0.78, 0.76, 0.68, 0.55, 0.38, 0.2,
  0.06, 0, 0, 0, 0, 0,
]

function expectedForPanel(powerWp: number, hour: number): number {
  const wh = powerWp * (hourFactor[hour] ?? 0)
  return Math.round(wh / 100) / 10
}

async function getSession() {
  const h = await headers()
  return auth.api.getSession({ headers: h })
}

export async function getDashboardData(): Promise<DashboardData> {
  const session = await getSession()
  if (!session?.user) {
    return { panelCount: 0, hourlyData: [], currentProduction: 0, currentExpected: 0, totalProduction: 0, totalConsumption: 0 }
  }

  const panels = await db
    .select({ id: solarPanel.id, powerRatingWp: solarPanel.powerRatingWp })
    .from(solarPanel)
    .where(eq(solarPanel.userId, session.user.id))

  const panelCount = panels.length

  if (panelCount === 0) {
    return { panelCount: 0, hourlyData: [], currentProduction: 0, currentExpected: 0, totalProduction: 0, totalConsumption: 0 }
  }

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const now = new Date()
  const currentHour = now.getHours()

  const nowSlot = new Date(now)
  nowSlot.setMinutes(0, 0, 0)

  const records = await db
    .select({
      type: energyRecord.type,
      value: energyRecord.value,
      recordedAt: energyRecord.recordedAt,
    })
    .from(energyRecord)
    .where(
      and(
        eq(energyRecord.userId, session.user.id),
        gte(energyRecord.recordedAt, todayStart)
      )
    )

  const hourlyMap = new Map<string, { production: number; consumption: number }>()

  for (let i = 0; i < 24; i++) {
    const h = i.toString().padStart(2, "0") + ":00"
    hourlyMap.set(h, { production: 0, consumption: 0 })
  }

  for (const record of records) {
    const h = new Date(record.recordedAt).getHours().toString().padStart(2, "0") + ":00"
    const entry = hourlyMap.get(h)
    if (entry) {
      const val = parseFloat(record.value) || 0
      if (record.type === "production") entry.production += val
      else entry.consumption += val
    }
  }

  const hourlyData: HourlyEnergy[] = []
  for (let i = 0; i < 24; i++) {
    const h = i.toString().padStart(2, "0") + ":00"
    const entry = hourlyMap.get(h)!
    hourlyData.push({ hour: h, production: entry.production, consumption: entry.consumption })
  }

  const currentSlotKey = currentHour.toString().padStart(2, "0") + ":00"
  const currentSlot = hourlyMap.get(currentSlotKey)!
  const currentProduction = currentSlot.production

  const currentExpected = panels.reduce(
    (sum, p) => sum + expectedForPanel(parseInt(p.powerRatingWp) || 400, currentHour),
    0
  )

  const totalProduction = hourlyData.reduce((sum, d) => sum + d.production, 0)
  const totalConsumption = hourlyData.reduce((sum, d) => sum + d.consumption, 0)

  return { panelCount, hourlyData, currentProduction, currentExpected, totalProduction, totalConsumption }
}

export async function getPanelHourlyData(panelId: string): Promise<PanelHourlyData[]> {
  const session = await getSession()
  if (!session?.user) return []

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const records = await db
    .select({
      value: energyRecord.value,
      recordedAt: energyRecord.recordedAt,
    })
    .from(energyRecord)
    .where(
      and(
        eq(energyRecord.panelId, panelId),
        eq(energyRecord.userId, session.user.id),
        gte(energyRecord.recordedAt, todayStart)
      )
    )

  const map = new Map<string, number>()
  for (let i = 0; i < 24; i++) {
    map.set(i.toString().padStart(2, "0") + ":00", 0)
  }

  for (const record of records) {
    const h = new Date(record.recordedAt).getHours().toString().padStart(2, "0") + ":00"
    map.set(h, (map.get(h) ?? 0) + (parseFloat(record.value) || 0))
  }

  const data: PanelHourlyData[] = []
  for (let i = 0; i < 24; i++) {
    const h = i.toString().padStart(2, "0") + ":00"
    data.push({ hour: h, production: map.get(h) ?? 0 })
  }

  return data
}
