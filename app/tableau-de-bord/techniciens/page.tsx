"use client"

import { useEffect, useState, useCallback } from "react"
import { getVisibleTechnicians } from "@/lib/actions/technicians"
import { getTechnicianReviews, getTechnicianScore } from "@/lib/actions/intervention"
import type { VisibleTechnician } from "@/lib/actions/technicians"
import type { TechnicianReviews, TechnicianScore } from "@/lib/actions/intervention"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconBrandWhatsapp, IconMapPin, IconUser, IconWifiOff, IconStar, IconX } from "@tabler/icons-react"

function ReviewsModal({
  technician,
  onClose,
}: {
  technician: VisibleTechnician
  onClose: () => void
}) {
  const [reviews, setReviews] = useState<TechnicianReviews[]>([])
  const [score, setScore] = useState<TechnicianScore>({ average: null, count: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [revs, sc] = await Promise.all([
        getTechnicianReviews(technician.id),
        getTechnicianScore(technician.id),
      ])
      setReviews(revs)
      setScore(sc)
      setLoading(false)
    }
    load()
  }, [technician.id])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-t-xl bg-background sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-lg font-semibold">{technician.name}</h2>
            <p className="text-xs text-muted-foreground">
              {score.count > 0
                ? `${score.average}/5 — ${score.count} avis`
                : "Aucun avis pour le moment"}
            </p>
          </div>
          <button onClick={onClose} className="cursor-pointer p-1 text-muted-foreground hover:text-foreground">
            <IconX size={20} />
          </button>
        </div>
        <div className="overflow-y-auto p-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement...</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun avis pour le moment</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }, (_, j) => (
                        <IconStar
                          key={j}
                          size={14}
                          className={j < parseInt(r.score) ? "fill-current" : "opacity-30"}
                        />
                      ))}
                      <span className="ml-1 text-xs text-muted-foreground">{r.score}/5</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">— {r.clientName}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TechniciensPage() {
  const [technicians, setTechnicians] = useState<VisibleTechnician[]>([])
  const [scores, setScores] = useState<Record<string, TechnicianScore>>({})
  const [loading, setLoading] = useState(true)
  const [reviewTarget, setReviewTarget] = useState<VisibleTechnician | null>(null)

  const fetch = useCallback(async () => {
    try {
      const result = await getVisibleTechnicians()
      setTechnicians(result)
      const scoreMap: Record<string, TechnicianScore> = {}
      for (const t of result) {
        scoreMap[t.id] = await getTechnicianScore(t.id)
      }
      setScores(scoreMap)
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
        {technicians.map((t) => {
          const sc = scores[t.id]
          return (
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
                {sc && sc.count > 0 && (
                  <button
                    onClick={() => setReviewTarget(t)}
                    className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
                  >
                    <IconStar size={12} className="fill-amber-400 text-amber-400" />
                    {sc.average} ({sc.count})
                  </button>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {sc && sc.count === 0 && (
                  <p className="text-xs text-muted-foreground">Aucun avis pour le moment</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    render={
                      <a
                        href={`https://wa.me/${t.phone!}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <IconBrandWhatsapp size={16} />
                    WhatsApp
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => setReviewTarget(t)}
                    disabled={!sc || sc.count === 0}
                  >
                    <IconStar size={16} />
                    Avis ({sc?.count ?? 0})
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {reviewTarget && (
        <ReviewsModal
          technician={reviewTarget}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </div>
  )
}
