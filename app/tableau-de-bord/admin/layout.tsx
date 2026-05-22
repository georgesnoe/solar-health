"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data, isPending } = authClient.useSession()
  const user = data?.user as { role?: string } | undefined

  useEffect(() => {
    if (!isPending && (!data || user?.role !== "admin")) {
      router.replace("/tableau-de-bord")
    }
  }, [isPending, data, user, router])

  if (isPending) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  if (!data || user?.role !== "admin") {
    return null
  }

  return <>{children}</>
}
