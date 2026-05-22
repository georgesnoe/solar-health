import { getAlerts } from "@/lib/actions/alert"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AlertsClient } from "./alerts-client"

export default async function AlertesPage() {
  const h = await headers()
  const session = await auth.api.getSession({ headers: h })

  if (!session?.user) {
    redirect("/connexion")
  }

  const alerts = await getAlerts()

  return <AlertsClient alerts={alerts} />
}
