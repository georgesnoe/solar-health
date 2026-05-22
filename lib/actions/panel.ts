"use server"

import { db } from "@/lib/db"
import { solarPanel, energyRecord } from "@/lib/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"

const hourFactor: number[] = [
  0, 0, 0, 0, 0, 0.02, 0.08, 0.18, 0.32, 0.48,
  0.62, 0.73, 0.78, 0.76, 0.68, 0.55, 0.38, 0.2,
  0.06, 0, 0, 0, 0, 0,
]

async function getSession() {
  const h = await headers()
  return auth.api.getSession({ headers: h })
}

export async function createPanel(data: {
  name: string
  powerRatingWp: string
  installationDate?: string
  notes?: string
}) {
  const session = await getSession()
  if (!session?.user) throw new Error("Non authentifié")

  const id = crypto.randomUUID()
  await db.insert(solarPanel).values({
    id,
    name: data.name,
    powerRatingWp: data.powerRatingWp,
    installationDate: data.installationDate ? new Date(data.installationDate) : null,
    notes: data.notes ?? null,
    userId: session.user.id,
  })

  revalidatePath("/tableau-de-bord/panneaux")
  return { id }
}

export async function deletePanel(id: string) {
  const session = await getSession()
  if (!session?.user) throw new Error("Non authentifié")

  await db.delete(solarPanel).where(
    and(eq(solarPanel.id, id), eq(solarPanel.userId, session.user.id))
  )

  revalidatePath("/tableau-de-bord/panneaux")
}

export async function getPanels() {
  const session = await getSession()
  if (!session?.user) return []

  return db
    .select()
    .from(solarPanel)
    .where(eq(solarPanel.userId, session.user.id))
    .orderBy(solarPanel.createdAt)
}

export async function updatePanelSimulation(
  id: string,
  data: {
    simulationStrategy: "automatic" | "manual"
    simulationTrigger: "scheduled" | "on_demand"
    manualProductionPct: number
    manualConsumptionPct: number
  }
) {
  const session = await getSession()
  if (!session?.user) throw new Error("Non authentifié")

  await db
    .update(solarPanel)
    .set({
      simulationStrategy: data.simulationStrategy,
      simulationTrigger: data.simulationTrigger,
      manualProductionPct: data.manualProductionPct,
      manualConsumptionPct: data.manualConsumptionPct,
    })
    .where(
      and(eq(solarPanel.id, id), eq(solarPanel.userId, session.user.id))
    )

  revalidatePath(`/tableau-de-bord/panneaux/${id}`)
  revalidatePath("/tableau-de-bord/panneaux")
}

export async function triggerManualEnergyUpdate(panelId: string) {
  const session = await getSession()
  if (!session?.user) throw new Error("Non authentifié")

  const panels = await db
    .select()
    .from(solarPanel)
    .where(
      and(eq(solarPanel.id, panelId), eq(solarPanel.userId, session.user.id))
    )
    .limit(1)

  if (panels.length === 0) throw new Error("Panneau introuvable")

  const panel = panels[0]
  const now = new Date()
  const currentHour = now.getHours()
  const recordedAt = new Date(now)
  recordedAt.setMinutes(0, 0, 0)

  const wp = parseInt(panel.powerRatingWp) || 400
  const expWh = wp * (hourFactor[currentHour] ?? 0)

  let productionWh: number
  if (panel.simulationStrategy === "manual") {
    productionWh = Math.round((expWh * panel.manualProductionPct / 100) / 100) * 100
  } else {
    const noise = 0.85 + Math.random() * 0.3
    const faulty = Math.random() < 0.25 ? 0.3 + Math.random() * 0.3 : 1
    productionWh = Math.round(((expWh * noise * faulty) / 100)) * 100
  }

  let consumptionWh: number
  if (panel.simulationStrategy === "manual") {
    consumptionWh = Math.round(productionWh * (panel.manualConsumptionPct / 100))
  } else {
    const maxConsumptionWh = Math.max(Math.round(productionWh * 0.9), 100)
    consumptionWh = Math.floor(Math.random() * maxConsumptionWh)
  }

  await db.insert(energyRecord).values([
    {
      id: crypto.randomUUID(),
      panelId: panel.id,
      userId: session.user.id,
      type: "production",
      value: (productionWh / 1000).toString(),
      recordedAt,
    },
    {
      id: crypto.randomUUID(),
      panelId: null,
      userId: session.user.id,
      type: "consumption",
      value: (consumptionWh / 1000).toString(),
      recordedAt,
    },
  ])

  revalidatePath(`/tableau-de-bord/panneaux/${panelId}`)
  revalidatePath("/tableau-de-bord/panneaux")
}
