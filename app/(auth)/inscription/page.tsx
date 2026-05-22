"use client"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconUser, IconTool } from "@tabler/icons-react"
import { useAuthRedirect } from "@/lib/use-auth-redirect"

type Role = "client" | "technician"

const translations: Record<string, string> = {
  "User already exists with this email": "Un compte existe déjà avec cet email",
  "Invalid email": "Adresse email invalide",
  "Password is too short": "Le mot de passe est trop court",
  "Password is too long": "Le mot de passe est trop long",
  "Email and password sign up is not enabled": "L'inscription par email n'est pas activée",
  "Failed to create user": "Échec de la création du compte",
}

export default function SignupPage() {
  useAuthRedirect()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<Role>("client")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const { error: authError } = await authClient.signUp.email({
        email,
        password,
        name,
        role,
        phone: phone.replace(/[\s+]/g, '') || undefined,
        callbackURL: "/tableau-de-bord",
      } as never)
      if (authError) {
        setError(translations[authError.message ?? ""] ?? authError.message ?? "Une erreur s'est produite")
      } else {
        router.push("/tableau-de-bord")
      }
    } catch {
      setError("Une erreur inattendue s'est produite")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <CardDescription>
            Saisissez vos informations pour commencer avec Solar-Health
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="grid gap-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label>Je suis</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("client")}
                  className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-colors ${
                    role === "client"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  }`}
                >
                  <IconUser size={24} />
                  Propriétaire
                </button>
                <button
                  type="button"
                  onClick={() => setRole("technician")}
                  className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-colors ${
                    role === "technician"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  }`}
                >
                  <IconTool size={24} />
                  Technicien
                </button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jean Dupont"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Téléphone (optionnel)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="22890000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Pour recevoir les alertes WhatsApp en cas de production anormale
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-6">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Création en cours..." : "Créer un compte"}
            </Button>
            <div className="text-center text-sm">
              Déjà un compte ?{" "}
              <a href="/connexion" className="underline underline-offset-4">
                Se connecter
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
