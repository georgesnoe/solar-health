"use client"

import { useEffect, useState, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from "react-leaflet"
import { Button } from "@/components/ui/button"
import { IconCurrentLocation, IconMapPin } from "@tabler/icons-react"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

const togoBounds: L.LatLngBoundsExpression = [[6.0, -0.5], [11.2, 2.5]]

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = defaultIcon

const TOGO_CENTER: [number, number] = [8.6, 0.9]

function MapEvents({
  onDrag,
}: {
  onDrag: (lat: number, lng: number) => void
}) {
  useMapEvents({
    dragend(e) {
      const center = e.target.getCenter()
      onDrag(center.lat, center.lng)
    },
  })
  return null
}

function FlyTo({
  center,
}: {
  center: [number, number]
}) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 0.8 })
  }, [center, map])
  return null
}

export function LocationPicker({
  latitude,
  longitude,
  onChange,
}: {
  latitude: string | null
  longitude: string | null
  onChange: (lat: string, lng: string) => void
}) {
  const initLat = latitude ? parseFloat(latitude) : TOGO_CENTER[0]
  const initLng = longitude ? parseFloat(longitude) : TOGO_CENTER[1]
  const [position, setPosition] = useState<[number, number]>([initLat, initLng])
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null)
  const [detecting, setDetecting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDetect = useCallback(() => {
    if (!navigator.geolocation) return
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setPosition([lat, lng])
        setFlyTo([lat, lng])
        onChange(lat.toFixed(6), lng.toFixed(6))
        setDetecting(false)
      },
      () => setDetecting(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [onChange])

  if (!mounted) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-muted/30 text-sm text-muted-foreground">
        Chargement de la carte…
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <IconMapPin size={14} />
        <span>
          {position[0].toFixed(4)}, {position[1].toFixed(4)}
        </span>
      </div>
      <div className="relative h-64 overflow-hidden rounded-lg border">
        <MapContainer
          center={position}
          zoom={8}
          minZoom={7}
          maxBounds={togoBounds}
          maxBoundsViscosity={1}
          className="z-0 h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            draggable={true}
            position={position}
            icon={defaultIcon}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target
                const latLng = marker.getLatLng()
                const lat = Math.max(6.0, Math.min(11.2, latLng.lat))
                const lng = Math.max(-0.5, Math.min(2.5, latLng.lng))
                setPosition([lat, lng])
                onChange(lat.toFixed(6), lng.toFixed(6))
              },
            }}
          />
          <MapEvents onDrag={(lat, lng) => setPosition([lat, lng])} />
          {flyTo && <FlyTo center={flyTo} />}
        </MapContainer>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDetect}
        disabled={detecting}
        className="w-full"
      >
        <IconCurrentLocation
          size={16}
          className={detecting ? "animate-spin" : ""}
        />
        {detecting ? "Détection..." : "Utiliser ma position actuelle"}
      </Button>
    </div>
  )
}

export function StaticMap({
  latitude,
  longitude,
}: {
  latitude: string
  longitude: string
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-muted/30 text-sm text-muted-foreground">
        Chargement de la carte…
      </div>
    )
  }

  const pos: [number, number] = [parseFloat(latitude), parseFloat(longitude)]

  return (
    <div className="relative h-64 overflow-hidden rounded-lg border">
      <MapContainer
        center={pos}
        zoom={10}
        minZoom={7}
        maxBounds={togoBounds}
        maxBoundsViscosity={1}
        className="z-0 h-full w-full"
        scrollWheelZoom={true}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={pos} icon={defaultIcon} />
      </MapContainer>
    </div>
  )
}

const techIcon = L.divIcon({
  className: "",
  html: `<div style="display:flex;align-items:center;gap:4px;background:#2563eb;color:#fff;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3)"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2"/></svg>Moi</div>`,
  iconSize: [80, 28],
  iconAnchor: [40, 14],
})

const clientIcon = L.divIcon({
  className: "",
  html: `<div style="display:flex;align-items:center;gap:4px;background:#dc2626;color:#fff;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3)"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>Lieu d'intervention</div>`,
  iconSize: [140, 28],
  iconAnchor: [70, 14],
})

function RouteLine({ points }: { points: [number, number][] }) {
  const map = useMap()
  const [coords, setCoords] = useState<[number, number][] | null>(null)

  useEffect(() => {
    async function fetchRoute() {
      if (points.length < 2) return
      const [from, to] = points
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?geometries=geojson&overview=full`
        )
        const data = await res.json()
        if (data.routes?.[0]?.geometry?.coordinates) {
          setCoords(data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]))
        }
      } catch {
        setCoords(points)
      }
    }
    fetchRoute()
  }, [points])

  useEffect(() => {
    if (coords && coords.length > 0) {
      const bounds = L.latLngBounds(coords.map((c) => L.latLng(c[0], c[1])))
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [coords, map])

  if (!coords) return null

  return (
    <Polyline positions={coords} pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.7 }} />
  )
}

export function RouteMap({
  technicianLatitude,
  technicianLongitude,
  clientLatitude,
  clientLongitude,
}: {
  technicianLatitude: string
  technicianLongitude: string
  clientLatitude: string
  clientLongitude: string
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-muted/30 text-sm text-muted-foreground">
        Chargement de la carte…
      </div>
    )
  }

  const techPos: [number, number] = [parseFloat(technicianLatitude), parseFloat(technicianLongitude)]
  const clientPos: [number, number] = [parseFloat(clientLatitude), parseFloat(clientLongitude)]

  return (
    <div className="relative h-72 overflow-hidden rounded-lg border">
      <MapContainer
        center={techPos}
        zoom={10}
        minZoom={7}
        maxBounds={togoBounds}
        maxBoundsViscosity={1}
        className="z-0 h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={techPos} icon={techIcon} />
        <Marker position={clientPos} icon={clientIcon} />
        <RouteLine points={[techPos, clientPos]} />
      </MapContainer>
    </div>
  )
}
