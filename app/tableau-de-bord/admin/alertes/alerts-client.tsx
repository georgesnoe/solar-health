"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { getAdminAlerts } from "@/lib/actions/admin"
import type { AdminAlertRow } from "@/lib/actions/admin"

export function AdminAlertsView() {
  const [alerts, setAlerts] = useState<AdminAlertRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await getAdminAlerts()
      setAlerts(data)
    } catch {
      /* silent */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
    const id = setInterval(fetchAlerts, 60000)
    return () => clearInterval(id)
  }, [fetchAlerts])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {alerts.length > 0
            ? `${alerts.length} client(s) avec une alerte active`
            : "Aucune alerte active"}
        </p>
        <Button variant="outline" size="sm" onClick={fetchAlerts} disabled={loading}>
          <IconRefresh size={14} className="mr-1" />
          Actualiser
        </Button>
      </div>

      {alerts.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <IconAlertTriangle size={32} />
            <p>Aucune alerte pour le moment</p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {alerts.map((a) => (
          <Card key={a.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{a.userName}</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {new Date(a.createdAt).toLocaleString("fr-FR")}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm">
              <p>{a.message}</p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Attendu : {a.expected} kWh</span>
                <span>Réel : {a.actual} kWh</span>
                <span className="font-semibold text-destructive">-{a.percentage}%</span>
              </div>
              {a.userPhone && (
                <p className="text-xs text-muted-foreground">Tél : {a.userPhone}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
