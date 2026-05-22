"use server"

import { db } from "@/lib/db"
import { solarPanel } from "@/lib/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"

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
