"use server"

import { db } from "@/lib/db"
import { alert } from "@/lib/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

async function getSession() {
  const h = await headers()
  return auth.api.getSession({ headers: h })
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

export async function deleteAllAlerts() {
  const session = await getSession()
  if (!session?.user) throw new Error("Non authentifié")

  await db.delete(alert).where(eq(alert.userId, session.user.id))
  revalidatePath("/tableau-de-bord/alertes")
}
