"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/lib/auth-client"
import {
  IconHome,
  IconAlertTriangle,
  IconSolarPanel,
  IconUser,
  IconUsers,
  IconSettings,
  IconLogout,
  IconClipboardList,
  IconBell,
} from "@tabler/icons-react"
import Link from "next/link"

type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
}

const clientNav: NavItem[] = [
  { label: "Tableau de bord", href: "/tableau-de-bord", icon: <IconHome size={20} /> },
  { label: "Mes alertes", href: "/tableau-de-bord/alertes", icon: <IconBell size={20} /> },
  { label: "Mes panneaux", href: "/tableau-de-bord/panneaux", icon: <IconSolarPanel size={20} /> },
  { label: "Techniciens", href: "/tableau-de-bord/techniciens", icon: <IconUsers size={20} /> },
  { label: "Profil", href: "/tableau-de-bord/profil", icon: <IconUser size={20} /> },
]

const technicianNav: NavItem[] = [
  { label: "Tableau de bord", href: "/tableau-de-bord", icon: <IconHome size={20} /> },
  { label: "Alertes clients", href: "/tableau-de-bord/alertes", icon: <IconAlertTriangle size={20} /> },
  { label: "Mes interventions", href: "/tableau-de-bord/interventions", icon: <IconClipboardList size={20} /> },
  { label: "Profil", href: "/tableau-de-bord/profil", icon: <IconUser size={20} /> },
]

const adminNav: NavItem[] = [
  { label: "Tableau de bord", href: "/tableau-de-bord", icon: <IconHome size={20} /> },
  { label: "Utilisateurs", href: "/tableau-de-bord/utilisateurs", icon: <IconUsers size={20} /> },
  { label: "Alertes", href: "/tableau-de-bord/alertes", icon: <IconAlertTriangle size={20} /> },
  { label: "Paramètres", href: "/tableau-de-bord/parametres", icon: <IconSettings size={20} /> },
]

function getNav(role: string | undefined): NavItem[] {
  switch (role) {
    case "technician":
      return technicianNav
    case "admin":
      return adminNav
    default:
      return clientNav
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data, isPending } = authClient.useSession()
  const user = data?.user as { name: string; role?: string } | undefined
  const role = user?.role
  const nav = getNav(role)

  useEffect(() => {
    if (!isPending && !data) {
      router.replace("/connexion")
    }
  }, [isPending, data, router])

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/connexion")
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-3 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <IconSolarPanel size={22} className="text-primary" />
            <span className="truncate text-base font-semibold group-data-[collapsible=icon]:hidden">
              Solar-Health
            </span>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map((item) => {
                  const isActive =
                    item.href === "/tableau-de-bord"
                      ? pathname === "/tableau-de-bord"
                      : pathname.startsWith(item.href)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        render={<Link href={item.href} />}
                        tooltip={item.label}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    />
                  }
                >
                  <Avatar className="size-8 rounded-xl">
                    <AvatarFallback className="rounded-xl">
                      {initials || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">
                      {user?.name}
                    </span>
                    <span className="truncate text-xs capitalize text-muted-foreground">
                      {role === "technician"
                        ? "Technicien"
                        : role === "admin"
                          ? "Administrateur"
                          : "Client"}
                    </span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--anchor-width) min-w-56"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <IconLogout size={16} className="opacity-60" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <span className="text-sm capitalize text-muted-foreground">
            {nav.find((item) => {
              if (item.href === "/tableau-de-bord") return pathname === "/tableau-de-bord"
              return pathname.startsWith(item.href)
            })?.label || "Tableau de bord"}
          </span>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
