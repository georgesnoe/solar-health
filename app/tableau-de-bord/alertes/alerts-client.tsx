"use client"

import { deleteAllAlerts } from "@/lib/actions/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconAlertTriangle, IconTrash, IconBell } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Alert = {
  id: string
  message: string
  expected: string
  actual: string
  percentage: string
  createdAt: Date
}

export function AlertsClient({ alerts }: { alerts: Alert[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDeleteAll = async () => {
    setDeleting(true)
    await deleteAllAlerts()
    setDeleting(false)
    router.refresh()
  }

  if (alerts.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Alertes</h1>
          <p className="text-muted-foreground">Historique des alertes de production</p>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-16 text-center">
          <IconBell size={48} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Aucune alerte</p>
          <p className="text-xs text-muted-foreground">
            Les alertes apparaîtront ici lorsque la production sera anormalement basse
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Alertes</h1>
          <p className="text-muted-foreground">
            {alerts.length} alerte{alerts.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDeleteAll}
          disabled={deleting}
        >
          <IconTrash size={16} />
          {deleting ? "Suppression..." : "Tout supprimer"}
        </Button>
      </div>

      <div className="grid gap-3">
        {[...alerts].reverse().map((alert) => (
          <Card key={alert.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div className="flex items-start gap-3">
                <IconAlertTriangle
                  size={20}
                  className="mt-0.5 shrink-0 text-amber-500"
                />
                <div>
                  <CardTitle className="text-base">{alert.message}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(alert.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="shrink-0 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                -{alert.percentage}%
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Production : {alert.actual} kWh (attendu : {alert.expected} kWh)
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
