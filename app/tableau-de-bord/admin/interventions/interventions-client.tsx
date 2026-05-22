"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconRefresh } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { getAdminInterventions } from "@/lib/actions/admin"
import type { AdminInterventionRow } from "@/lib/actions/admin"

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Terminée",
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
}

export function AdminInterventionsView() {
  const [interventions, setInterventions] = useState<AdminInterventionRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    try {
      const data = await getAdminInterventions()
      setInterventions(data)
    } catch {
      /* silent */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    const id = setInterval(fetch, 60000)
    return () => clearInterval(id)
  }, [fetch])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {interventions.length > 0
            ? `${interventions.length} intervention(s)`
            : "Aucune intervention"}
        </p>
        <Button variant="outline" size="sm" onClick={fetch} disabled={loading}>
          <IconRefresh size={14} className="mr-1" />
          Actualiser
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {interventions.map((i) => (
          <Card key={i.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  {i.clientName} ← {i.technicianName}
                </CardTitle>
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[i.status]}`}>
                  {statusLabels[i.status] ?? i.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm">
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Client : {i.clientName}</span>
                <span>Technicien : {i.technicianName}</span>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Créée le {new Date(i.createdAt).toLocaleString("fr-FR")}</span>
                {i.reviewScore && <span>Note : {i.reviewScore}/5</span>}
              </div>
              {i.notes && (
                <p className="text-xs italic text-muted-foreground">{i.notes}</p>
              )}
            </CardContent>
          </Card>
        ))}

        {interventions.length === 0 && !loading && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Aucune intervention pour le moment
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
