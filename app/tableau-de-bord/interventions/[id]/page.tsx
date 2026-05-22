"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import dynamic from "next/dynamic"
import { getInterventionById } from "@/lib/actions/intervention"
import type { InterventionWithDetails } from "@/lib/actions/intervention"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconUser, IconBrandWhatsapp, IconAlertTriangle, IconMapPin, IconClipboardList } from "@tabler/icons-react"

const LocationMap = dynamic(
  () => import("@/components/location-picker").then((m) => ({ default: m.StaticMap })),
  { ssr: false }
)

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
}

export default function InterventionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [intervention, setIntervention] = useState<InterventionWithDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInterventionById(id).then((result) => {
      setIntervention(result)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  if (!intervention) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
        <p className="text-muted-foreground">Intervention introuvable</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <IconClipboardList size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Intervention</h1>
          <p className="text-muted-foreground">{intervention.clientName}</p>
        </div>
      </div>

      <div className={`rounded-lg border px-4 py-3 text-sm ${
        intervention.status === "confirmed"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-amber-200 bg-amber-50 text-amber-800"
      }`}>
        <strong>{statusLabels[intervention.status] ?? intervention.status}</strong>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconUser size={18} />
            Client
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium">{intervention.clientName}</p>
            {intervention.clientPhone && (
              <a
                href={`https://wa.me/${intervention.clientPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <IconBrandWhatsapp size={14} />
                {intervention.clientPhone}
              </a>
            )}
          </div>
          {intervention.notes && (
            <p className="text-sm text-muted-foreground">{intervention.notes}</p>
          )}
        </CardContent>
      </Card>

      {intervention.clientLatitude && intervention.clientLongitude && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <IconMapPin size={18} />
              Localisation du client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LocationMap
              latitude={intervention.clientLatitude}
              longitude={intervention.clientLongitude}
            />
          </CardContent>
        </Card>
      )}

      {intervention.alertId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <IconAlertTriangle size={18} />
              Alerte associée
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Baisse détectée le {new Date(intervention.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
          </CardContent>
        </Card>
      )}

      {intervention.review && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avis client</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="font-medium">{intervention.review.score}/5</p>
            {intervention.review.comment && (
              <p className="mt-1 text-muted-foreground">{intervention.review.comment}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
