"use client"

import { useEffect, useState, useCallback } from "react"
import {
  getTechnicianInterventions,
  getClientInterventions,
  confirmIntervention,
  submitReview,
} from "@/lib/actions/intervention"
import type { InterventionWithDetails } from "@/lib/actions/intervention"
import { authClient } from "@/lib/auth-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconClipboardList, IconCheck, IconStar, IconBrandWhatsapp } from "@tabler/icons-react"
import { useState as useStateRaw } from "react"

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
}

export default function InterventionsPage() {
  const { data } = authClient.useSession()
  const user = data?.user as { role?: string } | undefined
  const isTechnician = user?.role === "technician"

  return isTechnician ? <TechnicianView /> : <ClientView />
}

function TechnicianView() {
  const [interventions, setInterventions] = useState<InterventionWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    try {
      const result = await getTechnicianInterventions()
      setInterventions(result)
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
    return <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4"><p className="text-muted-foreground">Chargement...</p></div>
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Mes interventions</h1>
        <p className="text-muted-foreground">
          {interventions.length} intervention{interventions.length > 1 ? "s" : ""}
        </p>
      </div>

      {interventions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-16 text-center">
          <IconClipboardList size={48} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Aucune intervention</p>
          <p className="text-xs text-muted-foreground">
            Créez une intervention depuis la page des alertes clients
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {interventions.map((inv) => (
            <Card key={inv.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="text-base">{inv.clientName}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(inv.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  inv.status === "confirmed"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {statusLabels[inv.status] ?? inv.status}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {inv.notes && (
                  <p className="text-sm text-muted-foreground">{inv.notes}</p>
                )}
                {inv.clientPhone && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    render={
                      <a
                        href={`https://wa.me/${inv.clientPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <IconBrandWhatsapp size={16} />
                    Contacter le client
                  </Button>
                )}
                {inv.review && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }, (_, i) => (
                        <IconStar
                          key={i}
                          size={14}
                          className={i < parseInt(inv.review!.score) ? "fill-current" : "opacity-30"}
                        />
                      ))}
                      <span className="ml-1 text-xs text-muted-foreground">
                        {inv.review!.score}/5
                      </span>
                    </div>
                    {inv.review!.comment && (
                      <p className="mt-1 text-xs text-muted-foreground">{inv.review!.comment}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function ClientView() {
  const [interventions, setInterventions] = useState<InterventionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [score, setScore] = useState("5")
  const [comment, setComment] = useState("")

  const fetch = useCallback(async () => {
    try {
      const result = await getClientInterventions()
      setInterventions(result)
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

  const handleConfirm = async (id: string) => {
    setConfirmingId(id)
    await confirmIntervention(id)
    setConfirmingId(null)
    fetch()
  }

  const handleReview = async (inv: InterventionWithDetails) => {
    await submitReview(inv.id, inv.technicianId, parseInt(score), comment || undefined)
    setReviewingId(null)
    setScore("5")
    setComment("")
    fetch()
  }

  if (loading) {
    return <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4"><p className="text-muted-foreground">Chargement...</p></div>
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Mes interventions</h1>
        <p className="text-muted-foreground">
          {interventions.length} intervention{interventions.length > 1 ? "s" : ""}
        </p>
      </div>

      {interventions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-16 text-center">
          <IconClipboardList size={48} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Aucune intervention</p>
          <p className="text-xs text-muted-foreground">
            Les interventions des techniciens apparaîtront ici
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {interventions.map((inv) => (
            <Card key={inv.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="text-base">{inv.technicianName}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(inv.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  inv.status === "confirmed"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {statusLabels[inv.status] ?? inv.status}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {inv.notes && (
                  <p className="text-sm text-muted-foreground">{inv.notes}</p>
                )}

                {inv.status === "pending" && (
                  <Button
                    className="w-full"
                    onClick={() => handleConfirm(inv.id)}
                    disabled={confirmingId === inv.id}
                  >
                    <IconCheck size={16} />
                    {confirmingId === inv.id ? "Confirmation..." : "Confirmer l'intervention"}
                  </Button>
                )}

                {inv.status === "confirmed" && !inv.review && (
                  <div className="rounded-lg border p-3">
                    <p className="mb-2 text-sm font-medium">Donner votre avis</p>
                    <div className="mb-2 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setScore(s.toString())}
                          className="cursor-pointer"
                        >
                          <IconStar
                            size={20}
                            className={
                              s <= parseInt(score)
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            }
                          />
                        </button>
                      ))}
                      <span className="ml-1 text-xs text-muted-foreground">{score}/5</span>
                    </div>
                    <Input
                      placeholder="Votre commentaire (optionnel)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="mb-2"
                    />
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleReview(inv)}
                    >
                      Publier l&apos;avis
                    </Button>
                  </div>
                )}

                {inv.review && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }, (_, i) => (
                        <IconStar
                          key={i}
                          size={14}
                          className={i < parseInt(inv.review!.score) ? "fill-current" : "opacity-30"}
                        />
                      ))}
                      <span className="ml-1 text-xs text-muted-foreground">
                        {inv.review!.score}/5
                      </span>
                    </div>
                    {inv.review!.comment && (
                      <p className="mt-1 text-xs text-muted-foreground">{inv.review!.comment}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
