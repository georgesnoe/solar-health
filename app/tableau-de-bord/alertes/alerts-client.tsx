"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { deleteAllAlerts, getAllAlerts } from "@/lib/actions/alert"
import type { AlertWithUser } from "@/lib/actions/alert"
import { createIntervention } from "@/lib/actions/intervention"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconAlertTriangle, IconTrash, IconBell, IconBrandWhatsapp, IconClipboardList, IconCheck } from "@tabler/icons-react"

type Alert = {
  id: string
  userId?: string
  userName?: string
  userPhone?: string | null
  userLatitude?: string | null
  userLongitude?: string | null
  message: string
  expected: string
  actual: string
  percentage: string
  createdAt: Date
  hasIntervention?: boolean
}

export function AlertsClient({
  alerts: initialAlerts,
  role,
}: {
  alerts: Alert[]
  role: string
}) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [deleting, setDeleting] = useState(false)
  const [creatingId, setCreatingId] = useState<string | null>(null)
  const router = useRouter()

  const fetchAlerts = useCallback(async () => {
    if (role !== "technician") return
    try {
      const result = await getAllAlerts()
      setAlerts(result)
    } catch {
      // ignore
    }
  }, [role])

  useEffect(() => {
    if (role !== "technician") return
    const interval = setInterval(fetchAlerts, 60_000)
    return () => clearInterval(interval)
  }, [fetchAlerts, role])

  const handleDeleteAll = async () => {
    setDeleting(true)
    await deleteAllAlerts()
    setDeleting(false)
    setAlerts([])
  }

  const isTechnician = role === "technician"

  if (alerts.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">{isTechnician ? "Alertes clients" : "Alertes"}</h1>
          <p className="text-muted-foreground">
            {isTechnician
              ? "Aucune alerte en cours chez vos clients"
              : "Historique des alertes de production"}
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-16 text-center">
          <IconBell size={48} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Aucune alerte</p>
          <p className="text-xs text-muted-foreground">
            {isTechnician
              ? "Les alertes des clients apparaîtront ici en temps réel"
              : "Les alertes apparaîtront ici lorsque la production sera anormalement basse"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{isTechnician ? "Alertes clients" : "Alertes"}</h1>
          <p className="text-muted-foreground">
            {alerts.length} alerte{alerts.length > 1 ? "s" : ""}
            {isTechnician && " en cours"}
          </p>
        </div>
        {!isTechnician && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteAll}
            disabled={deleting}
          >
            <IconTrash size={16} />
            {deleting ? "Suppression..." : "Tout supprimer"}
          </Button>
        )}
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
                  <CardTitle className="text-base">
                    {isTechnician && alert.userName
                      ? `${alert.message} — ${alert.userName}`
                      : alert.message}
                  </CardTitle>
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
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Production : {alert.actual} kWh (attendu : {alert.expected} kWh)
              </p>
              {isTechnician && alert.userPhone && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    render={
                      <a
                        href={`https://wa.me/${alert.userPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <IconBrandWhatsapp size={16} />
                    WhatsApp
                  </Button>
                  <Button
                    variant={alert.hasIntervention ? "outline" : "default"}
                    size="sm"
                    className="flex-1"
                    onClick={async () => {
                      if (!alert.userId || alert.hasIntervention) return
                      setCreatingId(alert.id)
                      try {
                        const interventionId = await createIntervention(alert.id, alert.userId)
                        router.push(`/tableau-de-bord/interventions/${interventionId}`)
                      } catch {
                        // ignore
                      }
                      setCreatingId(null)
                    }}
                    disabled={creatingId === alert.id || alert.hasIntervention}
                  >
                    {alert.hasIntervention ? <IconCheck size={16} /> : <IconClipboardList size={16} />}
                    {alert.hasIntervention ? "Déjà planifiée" : creatingId === alert.id ? "..." : "Intervenir"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
