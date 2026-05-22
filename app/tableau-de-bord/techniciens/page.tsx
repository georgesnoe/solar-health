"use client"

import { useEffect, useState, useCallback } from "react"
import { getVisibleTechnicians } from "@/lib/actions/technicians"
import type { VisibleTechnician } from "@/lib/actions/technicians"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconBrandWhatsapp, IconMapPin, IconUser, IconWifiOff } from "@tabler/icons-react"

export default function TechniciensPage() {
  const [technicians, setTechnicians] = useState<VisibleTechnician[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    try {
      const result = await getVisibleTechnicians()
      setTechnicians(result)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    const interval = setInterval(fetch, 60_000)
    return () => clearInterval(interval)
  }, [fetch])

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Techniciens</h1>
          <p className="text-muted-foreground">Recherche des techniciens disponibles...</p>
        </div>
      </div>
    )
  }

  if (technicians.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Techniciens</h1>
          <p className="text-muted-foreground">Techniciens disponibles près de chez vous</p>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-16 text-center">
          <IconWifiOff size={48} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Aucun technicien disponible</p>
          <p className="text-xs text-muted-foreground">
            Revenez plus tard, les techniciens apparaîtront ici quand ils seront disponibles
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Techniciens</h1>
        <p className="text-muted-foreground">
          {technicians.length} technicien{technicians.length > 1 ? "s" : ""} disponible{technicians.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-3">
        {technicians.map((t) => (
          <Card key={t.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <IconUser size={20} />
                </div>
                <div>
                  <CardTitle className="text-base">{t.name}</CardTitle>
                  {t.latitude && t.longitude && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <IconMapPin size={12} />
                      {parseFloat(t.latitude).toFixed(4)}, {parseFloat(t.longitude).toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                render={
                  <a
                    href={`https://wa.me/${t.phone!}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <IconBrandWhatsapp size={18} />
                Contacter sur WhatsApp
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
