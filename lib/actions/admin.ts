"use server"

import { db } from "@/lib/db"
import { user, alert, intervention, review } from "@/lib/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { eq, inArray, sql, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"

async function getSession() {
  const h = await headers()
  return auth.api.getSession({ headers: h })
}

async function requireAdmin() {
  const session = await getSession()
  if (!session?.user) throw new Error("Non authentifié")
  const u = session.user as { role?: string }
  if (u.role !== "admin") throw new Error("Accès réservé aux administrateurs")
  return session
}

export type AdminUser = {
  id: string
  name: string
  email: string
  role: string | null
  phone: string | null
  visible: boolean
  latitude: string | null
  longitude: string | null
  createdAt: Date
}

export async function getUsers(): Promise<AdminUser[]> {
  await requireAdmin()
  return db
    .select()
    .from(user)
    .orderBy(user.createdAt) as Promise<AdminUser[]>
}

export async function updateUser(
  id: string,
  data: { name?: string; email?: string; role?: "admin" | "client" | "technician"; phone?: string }
) {
  const session = await requireAdmin()
  const adminId = session.user.id
  if (id === adminId && data.role && data.role !== "admin") {
    throw new Error("Vous ne pouvez pas modifier votre propre rôle")
  }
  await db.update(user).set(data).where(eq(user.id, id))
  revalidatePath("/tableau-de-bord/admin/utilisateurs")
}

export async function deleteUser(id: string) {
  const session = await requireAdmin()
  if (id === session.user.id) {
    throw new Error("Vous ne pouvez pas supprimer votre propre compte")
  }
  await db.delete(user).where(eq(user.id, id))
  revalidatePath("/tableau-de-bord/admin/utilisateurs")
}

export type AdminAlertRow = {
  id: string
  userId: string
  userName: string
  userPhone: string | null
  message: string
  expected: string
  actual: string
  percentage: string
  createdAt: Date
}

export async function getAdminAlerts(): Promise<AdminAlertRow[]> {
  await requireAdmin()
  const latestPerUser = db.$with("latest_per_user").as(
    db
      .select({
        userId: alert.userId,
        maxCreatedAt: sql<Date>`max(${alert.createdAt})`.as("max_created"),
      })
      .from(alert)
      .groupBy(alert.userId)
  )

  return db
    .with(latestPerUser)
    .select({
      id: alert.id,
      userId: alert.userId,
      userName: user.name,
      userPhone: user.phone,
      message: alert.message,
      expected: alert.expected,
      actual: alert.actual,
      percentage: alert.percentage,
      createdAt: alert.createdAt,
    })
    .from(alert)
    .innerJoin(user, eq(alert.userId, user.id))
    .innerJoin(latestPerUser, eq(alert.userId, latestPerUser.userId))
    .where(eq(alert.createdAt, latestPerUser.maxCreatedAt))
    .orderBy(desc(alert.createdAt))
}

export type AdminInterventionRow = {
  id: string
  alertId: string | null
  technicianId: string
  technicianName: string
  clientId: string
  clientName: string
  status: string
  notes: string | null
  createdAt: Date
  reviewScore: string | null
}

export async function getAdminInterventions(): Promise<AdminInterventionRow[]> {
  await requireAdmin()
  const rows = await db
    .select()
    .from(intervention)
    .orderBy(desc(intervention.createdAt))

  const userIds = [...new Set(rows.flatMap((r) => [r.technicianId, r.clientId]))]
  const userMap = new Map<string, { name: string }>()
  if (userIds.length > 0) {
    const users = await db
      .select({ id: user.id, name: user.name })
      .from(user)
      .where(inArray(user.id, userIds))
    for (const u of users) {
      userMap.set(u.id, u)
    }
  }

  const result: AdminInterventionRow[] = []
  for (const row of rows) {
    const rev = await db
      .select({ score: review.score })
      .from(review)
      .where(eq(review.interventionId, row.id))
      .limit(1)

    result.push({
      id: row.id,
      alertId: row.alertId,
      technicianId: row.technicianId,
      technicianName: userMap.get(row.technicianId)?.name ?? "Inconnu",
      clientId: row.clientId,
      clientName: userMap.get(row.clientId)?.name ?? "Inconnu",
      status: row.status,
      notes: row.notes,
      createdAt: row.createdAt,
      reviewScore: rev.length > 0 ? rev[0].score : null,
    })
  }
  return result
}

export type UserLocation = {
  id: string
  name: string
  role: string
  latitude: string
  longitude: string
}

export async function getUserLocations(): Promise<UserLocation[]> {
  await requireAdmin()
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      role: user.role,
      latitude: user.latitude,
      longitude: user.longitude,
    })
    .from(user)
    .where(
      sql`${user.latitude} IS NOT NULL AND ${user.longitude} IS NOT NULL`
    )
  return rows as UserLocation[]
}
