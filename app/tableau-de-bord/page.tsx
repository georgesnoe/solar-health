import { getDashboardData } from "@/lib/actions/energy"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const h = await headers()
  const session = await auth.api.getSession({ headers: h })
  const data = await getDashboardData()

  return (
    <DashboardClient
      userName={session?.user?.name ?? ""}
      userPhone={(session?.user as { phone?: string } | undefined)?.phone ?? null}
      panelCount={data.panelCount}
      hourlyData={data.hourlyData}
      currentProduction={data.currentProduction}
      currentExpected={data.currentExpected}
      totalProduction={data.totalProduction}
      totalConsumption={data.totalConsumption}
    />
  )
}
