"use client"

import { useState, useEffect, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { IconRefresh } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { getUserLocations } from "@/lib/actions/admin"
import type { UserLocation } from "@/lib/actions/admin"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

function createRoleIcon(color: string, label: string) {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;gap:3px;background:${color};color:#fff;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${label}</div>`,
    iconSize: [60, 24],
    iconAnchor: [30, 12],
  })
}

const clientIcon = createRoleIcon("#dc2626", "Client")
const techIcon = createRoleIcon("#2563eb", "Technicien")
const adminIcon = createRoleIcon("#16a34a", "Admin")

const roleIconMap: Record<string, L.DivIcon> = {
  client: clientIcon,
  technician: techIcon,
  admin: adminIcon,
}

const TOGO_CENTER: [number, number] = [8.6, 0.9]

export default function AdminMapPage() {
  const [locations, setLocations] = useState<UserLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetch = useCallback(async () => {
    try {
      const data = await getUserLocations()
      setLocations(data)
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

  if (!mounted) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <h1 className="text-2xl font-semibold">Carte des utilisateurs</h1>
        <div className="flex h-96 items-center justify-center rounded-lg border bg-muted/30 text-sm text-muted-foreground">
          Chargement de la carte…
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Carte des utilisateurs</h1>
        <Button variant="outline" size="sm" onClick={fetch} disabled={loading}>
          <IconRefresh size={14} className="mr-1" />
          Actualiser
        </Button>
      </div>

      <div className="flex gap-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="inline-block size-3 rounded-full bg-red-600" /> Clients
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-3 rounded-full bg-blue-600" /> Techniciens
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-3 rounded-full bg-green-600" /> Admins
        </span>
        <span className="text-muted-foreground">
          ({locations.length} utilisateur(s) localisé(s))
        </span>
      </div>

      <div className="relative h-[500px] overflow-hidden rounded-lg border">
        <MapContainer
          center={TOGO_CENTER}
          zoom={8}
          minZoom={7}
          maxBounds={[[6.0, -0.5], [11.2, 2.5]]}
          maxBoundsViscosity={1}
          className="z-0 h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map((loc) => (
            <Marker
              key={loc.id}
              position={[parseFloat(loc.latitude), parseFloat(loc.longitude)]}
              icon={roleIconMap[loc.role] ?? clientIcon}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{loc.name}</strong>
                  <br />
                  <span className="text-xs text-muted-foreground capitalize">{loc.role}</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
