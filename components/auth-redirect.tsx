"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data, isPending } = authClient.useSession()

  useEffect(() => {
    if (!isPending && data) {
      router.replace("/tableau-de-bord")
    }
  }, [isPending, data, router])

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  if (data) {
    return null
  }

  return <>{children}</>
}
