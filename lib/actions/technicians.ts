"use server"

import { db } from "@/lib/db"
import { user } from "@/lib/schema"
import { eq, and, isNotNull } from "drizzle-orm"

export type VisibleTechnician = {
  id: string
  name: string
  phone: string | null
  latitude: string | null
  longitude: string | null
}

export async function getVisibleTechnicians(): Promise<VisibleTechnician[]> {
  return db
    .select({
      id: user.id,
      name: user.name,
      phone: user.phone,
      latitude: user.latitude,
      longitude: user.longitude,
    })
    .from(user)
    .where(
      and(
        eq(user.role, "technician"),
        eq(user.visible, true),
        isNotNull(user.phone)
      )
    )
}
