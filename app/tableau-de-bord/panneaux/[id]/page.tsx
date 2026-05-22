import { db } from "@/lib/db"
import { solarPanel } from "@/lib/schema"
import { getPanelHourlyData } from "@/lib/actions/energy"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { eq, and } from "drizzle-orm"
import { notFound } from "next/navigation"
import { PanelDetailClient } from "./panel-detail-client"

export default async function PanelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const h = await headers()
  const session = await auth.api.getSession({ headers: h })
  if (!session?.user) return notFound()

  const panel = await db
    .select()
    .from(solarPanel)
    .where(and(eq(solarPanel.id, id), eq(solarPanel.userId, session.user.id)))
    .then((rows) => rows[0])

  if (!panel) return notFound()

  const hourlyData = await getPanelHourlyData(id)

  return (
    <PanelDetailClient
      panel={{
        id: panel.id,
        name: panel.name,
        powerRatingWp: panel.powerRatingWp,
        status: panel.status,
        installationDate: panel.installationDate?.toISOString() ?? null,
        notes: panel.notes,
      }}
      hourlyData={hourlyData}
    />
  )
}
