import { getUsers, getAdminAlerts, getAdminInterventions } from "@/lib/actions/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconUsers, IconAlertTriangle, IconClipboardList } from "@tabler/icons-react"

export default async function AdminOverviewPage() {
  const [users, alerts, interventions] = await Promise.all([
    getUsers().catch(() => []),
    getAdminAlerts().catch(() => []),
    getAdminInterventions().catch(() => []),
  ])

  const clients = users.filter((u) => u.role === "client")
  const techs = users.filter((u) => u.role === "technician")
  const admins = users.filter((u) => u.role === "admin")
  const pending = interventions.filter((i) => i.status === "pending")

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Administration</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <IconUsers size={20} className="text-primary" />
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {clients.length} clients · {techs.length} techniciens · {admins.length} admins
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <IconAlertTriangle size={20} className="text-amber-500" />
            <CardTitle className="text-sm font-medium">Alertes actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">Dernière alerte par client</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <IconClipboardList size={20} className="text-blue-500" />
            <CardTitle className="text-sm font-medium">Interventions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interventions.length}</div>
            <p className="text-xs text-muted-foreground">
              {pending.length} en attente · {interventions.length - pending.length} terminées
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
