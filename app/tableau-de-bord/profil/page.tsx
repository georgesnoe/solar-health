"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { IconEdit, IconDeviceFloppy, IconX, IconMapPin, IconLogout } from "@tabler/icons-react"
import { useRouter } from "next/navigation"

const LocationPicker = dynamic(
  () => import("@/components/location-picker").then((m) => ({ default: m.LocationPicker })),
  { ssr: false }
)

const roleLabels: Record<string, string> = {
  client: "Client",
  technician: "Technicien",
  admin: "Administrateur",
}

export default function ProfilPage() {
  const router = useRouter()
  const { data, refetch } = authClient.useSession()
  const user = data?.user as {
    name: string
    email: string
    role?: string
    phone?: string
    latitude?: string
    longitude?: string
  } | undefined

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name ?? "")
  const [phone, setPhone] = useState(user?.phone ?? "")
  const [latitude, setLatitude] = useState(user?.latitude ?? "")
  const [longitude, setLongitude] = useState(user?.longitude ?? "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [savingLocation, setSavingLocation] = useState(false)

  const hasChanges = name !== user?.name || phone !== (user?.phone ?? "") || currentPassword.length > 0 || newPassword.length > 0
  const locationChanged = latitude !== (user?.latitude ?? "") || longitude !== (user?.longitude ?? "")

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      if (name !== user?.name || phone !== (user?.phone ?? "")) {
        const { error: updateError } = await authClient.updateUser({
          name,
          phone: phone.replace(/[\s+]/g, '') || undefined,
        } as never)
        if (updateError) {
          setError(updateError.message ?? "Erreur lors de la mise à jour du profil")
          setSaving(false)
          return
        }
      }
      if (currentPassword && newPassword) {
        const { error: pwError } = await authClient.changePassword({
          currentPassword,
          newPassword,
        })
        if (pwError) {
          setError(pwError.message ?? "Erreur lors du changement de mot de passe")
          setSaving(false)
          return
        }
      }
      setSuccess("Profil mis à jour avec succès")
      setCurrentPassword("")
      setNewPassword("")
      setEditing(false)
    } catch {
      setError("Une erreur inattendue s'est produite")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setName(user?.name ?? "")
    setPhone(user?.phone ?? "")
    setCurrentPassword("")
    setNewPassword("")
    setError(null)
    setSuccess(null)
    setEditing(false)
  }

  const handleSaveLocation = async () => {
    setSavingLocation(true)
    setError(null)
    setSuccess(null)
    try {
      const { error: updateError } = await authClient.updateUser({
        latitude: latitude || undefined,
        longitude: longitude || undefined,
      } as never)
      if (updateError) {
        setError(updateError.message ?? "Erreur lors de la mise à jour de la localisation")
        setSavingLocation(false)
        return
      }
      setSuccess("Localisation mise à jour avec succès")
      await refetch()
    } catch {
      setError("Une erreur inattendue s'est produite")
    } finally {
      setSavingLocation(false)
    }
  }

  const handleResetLocation = () => {
    setLatitude(user?.latitude ?? "")
    setLongitude(user?.longitude ?? "")
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Profil</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles</p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
          {success}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>Consultez et modifiez vos informations</CardDescription>
          </div>
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <IconEdit size={16} />
              Modifier
            </Button>
          )}
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>Email</Label>
            <div className="rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {user?.email}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Rôle</Label>
            <div className="rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {roleLabels[user?.role ?? ""] ?? "Client"}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Nom complet</Label>
            {editing ? (
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            ) : (
              <div className="rounded-lg border bg-muted/50 px-3 py-2 text-sm">
                {user?.name}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Téléphone</Label>
            {editing ? (
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="22890000000"
              />
            ) : (
              <div className="rounded-lg border bg-muted/50 px-3 py-2 text-sm">
                {user?.phone || "Non renseigné"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Numéro pour les alertes WhatsApp (format international, sans le +)
            </p>
          </div>

          {editing && (
            <>
              <hr className="border-border" />
              <div>
                <h3 className="mb-1 text-sm font-medium">Changer le mot de passe</h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  Laissez vide si vous ne souhaitez pas changer votre mot de passe
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Votre mot de passe actuel"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Votre nouveau mot de passe"
                />
              </div>
            </>
          )}
        </CardContent>
        {editing && (
          <CardFooter className="flex justify-end gap-2 pt-6">
            <Button variant="ghost" onClick={handleCancel} disabled={saving}>
              <IconX size={16} />
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || saving}>
              <IconDeviceFloppy size={16} />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconMapPin size={18} />
            Localisation
          </CardTitle>
          <CardDescription>
            Déplacez le marqueur sur la carte ou utilisez votre position actuelle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LocationPicker
            latitude={latitude || null}
            longitude={longitude || null}
            onChange={(lat, lng) => {
              setLatitude(lat)
              setLongitude(lng)
            }}
          />
        </CardContent>
        {locationChanged && (
          <CardFooter className="flex justify-end gap-2 pt-6">
            <Button variant="ghost" onClick={handleResetLocation} disabled={savingLocation}>
              <IconX size={16} />
              Annuler
            </Button>
            <Button onClick={handleSaveLocation} disabled={savingLocation}>
              <IconDeviceFloppy size={16} />
              {savingLocation ? "Enregistrement..." : "Enregistrer la position"}
            </Button>
          </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <IconLogout size={18} />
            Se déconnecter
          </CardTitle>
          <CardDescription>
            Vous serez redirigé vers la page d&apos;accueil
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            variant="destructive"
            className="w-full"
            onClick={async () => {
              await authClient.signOut()
              window.location.href = "/"
            }}
          >
            <IconLogout size={16} className="mr-1" />
            Se déconnecter
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
