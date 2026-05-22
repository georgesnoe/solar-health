"use client"

import { useEffect, useState, useCallback } from "react"
import type { HourlyEnergy, DashboardData } from "@/lib/actions/energy"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import {
  IconBolt,
  IconSolarPanel,
  IconTrendingDown,
  IconTrendingUp,
  IconAlertTriangle,
  IconBrandWhatsapp,
} from "@tabler/icons-react"
import { getDashboardData } from "@/lib/actions/energy"

const chartConfig = {
  production: { label: "Production", color: "hsl(var(--chart-1))" },
  consumption: { label: "Consommation", color: "hsl(var(--chart-2))" },
}

export function DashboardClient({
  userName: initialName,
  userPhone: initialPhone,
  panelCount: initialCount,
  hourlyData: initialData,
  currentProduction: initialProd,
  currentExpected: initialExpected,
  totalProduction: initialTotalProd,
  totalConsumption: initialTotalCons,
}: {
  userName: string
  userPhone: string | null
  panelCount: number
  hourlyData: HourlyEnergy[]
  currentProduction: number
  currentExpected: number
  totalProduction: number
  totalConsumption: number
}) {
  const [data, setData] = useState({
    panelCount: initialCount,
    hourlyData: initialData,
    currentProduction: initialProd,
    currentExpected: initialExpected,
    totalProduction: initialTotalProd,
    totalConsumption: initialTotalCons,
  })

  const fetchData = useCallback(async () => {
    try {
      const result = await getDashboardData()
      setData(result)
    } catch {
      // ignore polling errors
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(fetchData, 60_000)
    return () => clearInterval(interval)
  }, [fetchData])

  const totals = data.hourlyData.reduce(
    (acc, d) => ({
      production: acc.production + d.production,
      consumption: acc.consumption + d.consumption,
    }),
    { production: 0, consumption: 0 }
  )

  const net = totals.production - totals.consumption
  const noPhone = !initialPhone

  const isLowProduction =
    data.currentExpected > 0 &&
    data.currentProduction < data.currentExpected * 0.9

  if (data.panelCount === 0) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Bonjour, {initialName}</h1>
          <p className="text-muted-foreground">
            Ajoutez des panneaux pour voir vos données
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-16 text-center">
          <IconSolarPanel size={48} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Aucun panneau solaire configuré
          </p>
          <p className="text-xs text-muted-foreground">
            Rendez-vous dans la section panneaux pour ajouter vos installations
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Bonjour, {initialName}</h1>
        <p className="text-muted-foreground">Voici votre production du jour</p>
      </div>

      {noPhone && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <IconBrandWhatsapp size={20} className="mt-0.5 shrink-0" />
          <div>
            <strong>Activez les alertes WhatsApp</strong>
            <p className="text-blue-700">
              Ajoutez votre numéro de téléphone dans votre{" "}
              <a href="/tableau-de-bord/profil" className="underline underline-offset-2">
                profil
              </a>{" "}
              pour recevoir des alertes en cas de production anormale.
            </p>
          </div>
        </div>
      )}

      {isLowProduction && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <IconAlertTriangle size={20} className="mt-0.5 shrink-0" />
          <div>
            <strong>Production anormalement basse</strong>
            <p className="text-amber-700">
              La production actuelle ({data.currentProduction.toFixed(2)} kWh)
              est inférieure de{" "}
              {Math.round(
                (1 - data.currentProduction / data.currentExpected) * 100
              )}
              % à la production attendue ({data.currentExpected.toFixed(2)} kWh).
              Les panneaux pourraient nécessiter un entretien.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production</CardTitle>
            <IconSolarPanel size={18} className="text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.production.toFixed(1)} kWh
            </div>
            <p className="text-xs text-muted-foreground">Aujourd&apos;hui</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consommation</CardTitle>
            <IconBolt size={18} className="text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.consumption.toFixed(1)} kWh
            </div>
            <p className="text-xs text-muted-foreground">Aujourd&apos;hui</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde</CardTitle>
            {net >= 0 ? (
              <IconTrendingUp size={18} className="text-emerald-500" />
            ) : (
              <IconTrendingDown size={18} className="text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${net >= 0 ? "text-emerald-500" : "text-destructive"}`}
            >
              {net >= 0 ? "+" : ""}
              {net.toFixed(1)} kWh
            </div>
            <p className="text-xs text-muted-foreground">
              {net >= 0
                ? "Excédent d'énergie"
                : "Énergie consommée du réseau"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Production vs Consommation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-72 w-full"
          >
            <AreaChart
              data={data.hourlyData}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="fillProduction"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-production)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-production)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id="fillConsumption"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-consumption)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-consumption)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="production"
                stroke="var(--color-production)"
                fill="url(#fillProduction)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="consumption"
                stroke="var(--color-consumption)"
                fill="url(#fillConsumption)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comparaison par heure</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-72 w-full"
          >
            <BarChart
              data={data.hourlyData}
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
              <Bar
                dataKey="consumption"
                fill="var(--color-consumption)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
