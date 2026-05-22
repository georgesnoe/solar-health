"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export function useAuthRedirect() {
  const router = useRouter()
  const { data, isPending } = authClient.useSession()

  useEffect(() => {
    if (!isPending && data) {
      router.replace("/tableau-de-bord")
    }
  }, [isPending, data, router])

  return { data, isPending }
}
