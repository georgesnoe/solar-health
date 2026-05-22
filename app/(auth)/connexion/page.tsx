"use client"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthRedirect } from "@/lib/use-auth-redirect"

const translations: Record<string, string> = {
  "Invalid email or password": "Email ou mot de passe incorrect",
  "Invalid email": "Adresse email invalide",
  "User not found": "Aucun compte trouvé avec cet email",
  "Email and password sign in is not enabled": "La connexion par email n'est pas activée",
}

export default function SigninPage() {
  useAuthRedirect()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const { error: authError } = await authClient.signIn.email({
        email,
        password,
      })
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
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>
            Bon retour sur Solar-Health
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignin}>
          <CardContent className="grid gap-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-6">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </Button>
            <div className="text-center text-sm">
              Pas encore de compte ?{" "}
              <a href="/inscription" className="underline underline-offset-4">
                S&apos;inscrire
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
