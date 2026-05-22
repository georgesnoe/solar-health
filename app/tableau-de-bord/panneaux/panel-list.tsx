"use client"

import { deletePanel } from "@/lib/actions/panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconTrash, IconSolarPanel, IconChartBar } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

type Panel = {
  id: string
  name: string
  powerRatingWp: string
  installationDate: Date | null
  status: "active" | "inactive"
  notes: string | null
  createdAt: Date
}

export function PanelList({ panels }: { panels: Panel[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  if (panels.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-12 text-center">
        <IconSolarPanel size={40} className="text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Aucun panneau pour le moment</p>
        <p className="text-xs text-muted-foreground">
          Utilisez le formulaire ci-dessus pour ajouter votre premier panneau
        </p>
      </div>
    )
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await deletePanel(id)
    setDeleting(null)
    router.refresh()
  }

  return (
    <div className="grid gap-3">
      {panels.map((panel) => (
        <Link key={panel.id} href={`/tableau-de-bord/panneaux/${panel.id}`}>
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="flex items-center gap-2">
                <IconSolarPanel size={20} className="text-primary" />
                <CardTitle className="text-base">{panel.name}</CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <IconChartBar size={16} className="text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={deleting === panel.id}
                  onClick={(e) => {
                    e.preventDefault()
                    handleDelete(panel.id)
                  }}
                >
                  <IconTrash size={16} className="text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Puissance :</span>{" "}
                {panel.powerRatingWp} Wc
              </div>
              <div>
                <span className="text-muted-foreground">Statut :</span>{" "}
                {panel.status === "active" ? "Actif" : "Inactif"}
              </div>
              {panel.installationDate && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Installé le :</span>{" "}
                  {new Date(panel.installationDate).toLocaleDateString("fr-FR")}
                </div>
              )}
              {panel.notes && (
                <div className="col-span-2 text-muted-foreground italic">
                  {panel.notes}
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
