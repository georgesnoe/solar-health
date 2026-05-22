"use client"

import type { PanelHourlyData } from "@/lib/actions/energy"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { IconSolarPanel, IconPlayerPlay } from "@tabler/icons-react"
import Link from "next/link"
import { useState, useCallback } from "react"
import { updatePanelSimulation, triggerManualEnergyUpdate } from "@/lib/actions/panel"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const panelChartConfig = {
  production: { label: "Production", color: "hsl(var(--chart-1))" },
}

function SimulationCard({
  panelId,
  initialStrategy,
  initialTrigger,
  initialProdPct,
  initialConsPct,
}: {
  panelId: string
  initialStrategy: "automatic" | "manual"
  initialTrigger: "scheduled" | "on_demand"
  initialProdPct: number
  initialConsPct: number
}) {
  const [strategy, setStrategy] = useState<"automatic" | "manual">(initialStrategy)
  const [trigger, setTrigger] = useState<"scheduled" | "on_demand">(initialTrigger)
  const [prodPct, setProdPct] = useState(initialProdPct)
  const [consPct, setConsPct] = useState(initialConsPct)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  const save = useCallback(async () => {
    setSaving(true)
    await updatePanelSimulation(panelId, {
      simulationStrategy: strategy,
      simulationTrigger: trigger,
      manualProductionPct: prodPct,
      manualConsumptionPct: consPct,
    })
    setSaving(false)
  }, [panelId, strategy, trigger, prodPct, consPct])

  const generate = useCallback(async () => {
    setGenerating(true)
    await triggerManualEnergyUpdate(panelId)
    setGenerating(false)
  }, [panelId])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Simulation</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="strategy-switch" className="text-sm">Stratégie</Label>
            <span className={`text-xs ${strategy === "automatic" ? "font-semibold" : "text-muted-foreground"}`}>
              Automatique
            </span>
            <Switch
              id="strategy-switch"
              checked={strategy === "manual"}
              onCheckedChange={(c: boolean) => setStrategy(c ? "manual" : "automatic")}
            />
            <span className={`text-xs ${strategy === "manual" ? "font-semibold" : "text-muted-foreground"}`}>
              Manuel
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Label htmlFor="trigger-switch" className="text-sm">Déclencheur</Label>
            <span className={`text-xs ${trigger === "scheduled" ? "font-semibold" : "text-muted-foreground"}`}>
              Planifié
            </span>
            <Switch
              id="trigger-switch"
              checked={trigger === "on_demand"}
              onCheckedChange={(c: boolean) => setTrigger(c ? "on_demand" : "scheduled")}
            />
            <span className={`text-xs ${trigger === "on_demand" ? "font-semibold" : "text-muted-foreground"}`}>
              À la demande
            </span>
          </div>
        </div>

        {strategy === "manual" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="prod-pct" className="text-sm">
                Production manuelle : {prodPct}%
              </Label>
              <input
                id="prod-pct"
                type="range"
                min={0}
                max={100}
                value={prodPct}
                onChange={(e) => setProdPct(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-teal-600"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cons-pct" className="text-sm">
                Consommation manuelle : {consPct}%
              </Label>
              <input
                id="cons-pct"
                type="range"
                min={0}
                max={100}
                value={consPct}
                onChange={(e) => setConsPct(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-amber-600"
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button onClick={save} disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
          {trigger === "on_demand" && (
            <Button variant="outline" onClick={generate} disabled={generating}>
              <IconPlayerPlay size={16} className="mr-1" />
              {generating ? "Génération..." : "Générer maintenant"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function PanelDetailClient({
  panel,
  hourlyData,
}: {
  panel: {
    id: string
    name: string
    powerRatingWp: string
    status: "active" | "inactive"
    installationDate: string | null
    notes: string | null
    simulationStrategy: "automatic" | "manual"
    simulationTrigger: "scheduled" | "on_demand"
    manualProductionPct: number
    manualConsumptionPct: number
  }
  hourlyData: PanelHourlyData[]
}) {
  const todayProduction = hourlyData.reduce((sum, d) => sum + d.production, 0)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/tableau-de-bord/panneaux"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Mes panneaux
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <IconSolarPanel size={24} className="text-primary" />
          <h1 className="text-2xl font-semibold">{panel.name}</h1>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Puissance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{panel.powerRatingWp} Wc</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {panel.status === "active" ? "Actif" : "Inactif"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Production aujourd&apos;hui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-chart-1">
              {todayProduction.toFixed(2)} kWh
            </div>
          </CardContent>
        </Card>
      </div>

      {panel.installationDate && (
        <p className="text-sm text-muted-foreground">
          Installé le{" "}
          {new Date(panel.installationDate).toLocaleDateString("fr-FR")}
        </p>
      )}
      {panel.notes && (
        <p className="text-sm italic text-muted-foreground">{panel.notes}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Production horaire - {panel.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={panelChartConfig}
            className="aspect-auto h-72 w-full"
          >
            <BarChart
              data={hourlyData}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
              />
              <XAxis
                dataKey="hour"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                unit=" kWh"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="production"
                fill="var(--color-production)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <SimulationCard
        panelId={panel.id}
        initialStrategy={panel.simulationStrategy}
        initialTrigger={panel.simulationTrigger}
        initialProdPct={panel.manualProductionPct}
        initialConsPct={panel.manualConsumptionPct}
      />
    </div>
  )
}
