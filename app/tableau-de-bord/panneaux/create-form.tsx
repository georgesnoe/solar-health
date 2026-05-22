"use client"

import { createPanel } from "@/lib/actions/panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconPlus } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function CreatePanelForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [powerRatingWp, setPowerRatingWp] = useState("")
  const [installationDate, setInstallationDate] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await createPanel({ name, powerRatingWp, installationDate: installationDate || undefined, notes: notes || undefined })
      setName("")
      setPowerRatingWp("")
      setInstallationDate("")
      setNotes("")
      setOpen(false)
      router.refresh()
    } catch {
      setError("Erreur lors de la création du panneau")
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button className="w-full" variant="outline" onClick={() => setOpen(true)}>
        <IconPlus size={16} />
        Ajouter un panneau
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Nouveau panneau</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="name">Nom du panneau</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Panneau toit sud" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="power">Puissance (Wc)</Label>
            <Input id="power" type="number" value={powerRatingWp} onChange={(e) => setPowerRatingWp(e.target.value)} placeholder="400" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Date d'installation</Label>
            <Input id="date" type="date" value={installationDate} onChange={(e) => setInstallationDate(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Orientation sud, inclinaison 30°" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer"}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  )
}
