"use client"

import type { PanelHourlyData } from "@/lib/actions/energy"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { IconSolarPanel } from "@tabler/icons-react"
import Link from "next/link"

const panelChartConfig = {
  production: { label: "Production", color: "hsl(var(--chart-1))" },
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
    </div>
  )
}
