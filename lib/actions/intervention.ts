"use server"

import { db } from "@/lib/db"
import { intervention, review, user } from "@/lib/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { eq, and, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"

async function getSession() {
  const h = await headers()
  return auth.api.getSession({ headers: h })
}

export type InterventionWithDetails = {
  id: string
  alertId: string | null
  technicianId: string
  technicianName: string
  technicianPhone: string | null
  clientId: string
  clientName: string
  clientPhone: string | null
  clientLatitude: string | null
  clientLongitude: string | null
  status: string
  notes: string | null
  createdAt: Date
  updatedAt: Date
  review: {
    score: string
    comment: string | null
  } | null
}

export async function createIntervention(alertId: string, clientId: string, notes?: string) {
  const session = await getSession()
  if (!session?.user) throw new Error("Non authentifié")

  const techId = session.user.id

  const existing = await db
    .select()
    .from(intervention)
    .where(
      and(
        eq(intervention.alertId, alertId),
        eq(intervention.technicianId, techId)
      )
    )
    .limit(1)

  if (existing.length > 0) {
    throw new Error("Une intervention existe déjà pour cette alerte")
  }

  const id = crypto.randomUUID()
  await db.insert(intervention).values({
    id,
    alertId,
    technicianId: techId,
    clientId,
    notes: notes || null,
  })

  revalidatePath("/tableau-de-bord/interventions")
  revalidatePath("/tableau-de-bord/alertes")
  return id
}

export async function getInterventionById(
  interventionId: string
): Promise<InterventionWithDetails | null> {
  const session = await getSession()
  if (!session?.user) return null

  const rows = await db
    .select({
      id: intervention.id,
      alertId: intervention.alertId,
      technicianId: intervention.technicianId,
      clientId: intervention.clientId,
      status: intervention.status,
      notes: intervention.notes,
      createdAt: intervention.createdAt,
      updatedAt: intervention.updatedAt,
      technicianName: user.name,
      technicianPhone: user.phone,
    })
    .from(intervention)
    .innerJoin(user, eq(intervention.technicianId, user.id))
    .where(eq(intervention.id, interventionId))
    .limit(1)

  if (rows.length === 0) return null

  const row = rows[0]

  const clientInfo = await db
    .select({
      name: user.name,
      phone: user.phone,
      latitude: user.latitude,
      longitude: user.longitude,
    })
    .from(user)
    .where(eq(user.id, row.clientId))
    .limit(1)
    .then((r) => r[0])

  const rev = await db
    .select({ score: review.score, comment: review.comment })
    .from(review)
    .where(eq(review.interventionId, row.id))
    .limit(1)

  return {
    ...row,
    technicianName: session.user.name ?? "",
    clientName: clientInfo?.name ?? "",
    clientPhone: clientInfo?.phone ?? null,
    clientLatitude: clientInfo?.latitude ?? null,
    clientLongitude: clientInfo?.longitude ?? null,
    review: rev.length > 0 ? rev[0] : null,
  }
}

export async function getTechnicianInterventions(): Promise<InterventionWithDetails[]> {
  const session = await getSession()
  if (!session?.user) return []

  const rows = await db
    .select({
      id: intervention.id,
      alertId: intervention.alertId,
      technicianId: intervention.technicianId,
      clientId: intervention.clientId,
      status: intervention.status,
      notes: intervention.notes,
      createdAt: intervention.createdAt,
      updatedAt: intervention.updatedAt,
      clientName: user.name,
      clientPhone: user.phone,
      clientLatitude: user.latitude,
      clientLongitude: user.longitude,
    })
    .from(intervention)
    .innerJoin(user, eq(intervention.clientId, user.id))
    .where(eq(intervention.technicianId, session.user.id))
    .orderBy(desc(intervention.createdAt))

  const result: InterventionWithDetails[] = []

  for (const row of rows) {
    const rev = await db
      .select({ score: review.score, comment: review.comment })
      .from(review)
      .where(eq(review.interventionId, row.id))
      .limit(1)

    result.push({
      ...row,
      technicianName: session.user.name ?? "",
      technicianPhone: null,
      review: rev.length > 0 ? rev[0] : null,
    })
  }

  return result
}

export async function getClientInterventions(): Promise<InterventionWithDetails[]> {
  const session = await getSession()
  if (!session?.user) return []

  const rows = await db
    .select({
      id: intervention.id,
      alertId: intervention.alertId,
      technicianId: intervention.technicianId,
      clientId: intervention.clientId,
      status: intervention.status,
      notes: intervention.notes,
      createdAt: intervention.createdAt,
      updatedAt: intervention.updatedAt,
      technicianName: user.name,
      technicianPhone: user.phone,
      technicianLatitude: user.latitude,
      technicianLongitude: user.longitude,
    })
    .from(intervention)
    .innerJoin(user, eq(intervention.technicianId, user.id))
    .where(eq(intervention.clientId, session.user.id))
    .orderBy(desc(intervention.createdAt))

  const result: InterventionWithDetails[] = []

  for (const row of rows) {
    const rev = await db
      .select({ score: review.score, comment: review.comment })
      .from(review)
      .where(eq(review.interventionId, row.id))
      .limit(1)

    result.push({
      ...row,
      clientName: session.user.name ?? "",
      clientPhone: null,
      clientLatitude: null,
      clientLongitude: null,
      review: rev.length > 0 ? rev[0] : null,
    })
  }

  return result
}

export async function confirmIntervention(interventionId: string) {
  const session = await getSession()
  if (!session?.user) throw new Error("Non authentifié")

  await db
    .update(intervention)
    .set({ status: "confirmed", updatedAt: new Date() })
    .where(
      and(
        eq(intervention.id, interventionId),
        eq(intervention.clientId, session.user.id)
      )
    )

  revalidatePath("/tableau-de-bord/interventions")
}

export async function submitReview(
  interventionId: string,
  technicianId: string,
  score: number,
  comment?: string
) {
  const session = await getSession()
  if (!session?.user) throw new Error("Non authentifié")

  const existing = await db
    .select()
    .from(review)
    .where(eq(review.interventionId, interventionId))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(review)
      .set({ score: score.toString(), comment: comment || null })
      .where(eq(review.interventionId, interventionId))
  } else {
    await db.insert(review).values({
      id: crypto.randomUUID(),
      interventionId,
      technicianId,
      clientId: session.user.id,
      score: score.toString(),
      comment: comment || null,
    })
  }

  revalidatePath("/tableau-de-bord/interventions")
  revalidatePath("/tableau-de-bord/techniciens")
}

export type TechnicianReviews = {
  score: string
  comment: string | null
  clientName: string
  createdAt: Date
}

export async function getTechnicianReviews(technicianId: string): Promise<TechnicianReviews[]> {
  return db
    .select({
      score: review.score,
      comment: review.comment,
      clientName: user.name,
      createdAt: review.createdAt,
    })
    .from(review)
    .innerJoin(user, eq(review.clientId, user.id))
    .where(eq(review.technicianId, technicianId))
    .orderBy(desc(review.createdAt))
}

export type TechnicianScore = {
  average: number | null
  count: number
}

export async function getTechnicianScore(technicianId: string): Promise<TechnicianScore> {
  const rows = await db
    .select({ score: review.score })
    .from(review)
    .where(eq(review.technicianId, technicianId))

  if (rows.length === 0) return { average: null, count: 0 }

  const total = rows.reduce((sum, r) => sum + parseInt(r.score), 0)
  return { average: Math.round((total / rows.length) * 10) / 10, count: rows.length }
}
