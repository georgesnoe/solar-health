"use server"

import { db } from "@/lib/db"
import { alert, user } from "@/lib/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { eq, inArray, sql, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"

async function getSession() {
  const h = await headers()
  return auth.api.getSession({ headers: h })
}

export type AlertWithUser = {
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

export async function getAlerts() {
  const session = await getSession()
  if (!session?.user) return []

  return db
    .select()
    .from(alert)
    .where(eq(alert.userId, session.user.id))
    .orderBy(alert.createdAt)
}

export async function getAllAlerts(): Promise<AlertWithUser[]> {
  const session = await getSession()
  if (!session?.user) return []

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

export async function deleteAllAlerts() {
  const session = await getSession()
  if (!session?.user) throw new Error("Non authentifié")

  await db.delete(alert).where(eq(alert.userId, session.user.id))
  revalidatePath("/tableau-de-bord/alertes")
}
