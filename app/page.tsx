"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  IconSolarPanel,
  IconBell,
  IconUsers,
  IconSettings,
  IconChartBar,
  IconDeviceMobile,
  IconTool,
  IconShieldCheck,
} from "@tabler/icons-react"
import { useAuthRedirect } from "@/lib/use-auth-redirect"

const features = [
  {
    title: "Monitoring en temps réel",
    description:
      "Suivez la production et la consommation de vos panneaux solaires en temps réel avec des graphiques détaillés et des statistiques journalières.",
    icon: IconChartBar,
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80",
    color: "bg-teal-600",
  },
  {
    title: "Alertes WhatsApp instantanées",
    description:
      "Recevez des notifications WhatsApp dès qu'une anomalie de production est détectée. Restez informé où que vous soyez.",
    icon: IconDeviceMobile,
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80",
    color: "bg-emerald-600",
  },
  {
    title: "Interventions techniques",
    description:
      "Les techniciens peuvent voir les alertes clients, planifier des interventions et suivre leur état. Les clients peuvent confirmer et noter les interventions.",
    icon: IconTool,
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
    color: "bg-blue-600",
  },
  {
    title: "Gestion des utilisateurs",
    description:
      "Les administrateurs gèrent l'ensemble des comptes, des rôles et des permissions. Visualisez la carte de tous les utilisateurs et suivez l'activité globale.",
    icon: IconShieldCheck,
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
    color: "bg-indigo-600",
  },
]

const stats = [
  { label: "Panneaux suivis", value: "+50" },
  { label: "Alertes traitées", value: "+200" },
  { label: "Techniciens actifs", value: "+15" },
  { label: "Clients satisfaits", value: "98%" },
]

export default function LandingPage() {
  const { data, isPending } = useAuthRedirect()

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  if (data) return null

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <IconSolarPanel size={22} className="text-teal-600" />
            <span className="text-base font-semibold">Solar-Health</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/connexion"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Connexion
            </Link>
            <Link href="/inscription">
              <Button size="sm">S&apos;inscrire</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-b from-teal-50 to-white py-20">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Surveillez votre production solaire en temps réel
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Solar-Health vous permet de suivre la performance de vos panneaux photovoltaïques,
              de recevoir des alertes WhatsApp et de coordonner les interventions techniques.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/inscription">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                  Commencer gratuitement
                </Button>
              </Link>
              <Link href="/connexion">
                <Button size="lg" variant="outline">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-bold text-teal-600">{s.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {features.map((feature, i) => (
          <section key={feature.title} className={`py-16 ${i % 2 === 1 ? "bg-gray-50" : "bg-white"}`}>
            <div className={`mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
              <div className="flex-1">
                <div className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl ${feature.color} text-white`}>
                  <feature.icon size={24} />
                </div>
                <h2 className="text-2xl font-semibold">{feature.title}</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div className="flex-1">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="rounded-xl border shadow-sm"
                />
              </div>
            </div>
          </section>
        ))}

        <section className="bg-teal-600 py-16 text-white">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-2xl font-semibold">Prêt à optimiser votre production solaire ?</h2>
            <p className="mt-3 text-teal-100">
              Rejoignez Solar-Health et prenez le contrôle de votre énergie.
            </p>
            <div className="mt-6">
              <Link href="/inscription">
                <Button size="lg" variant="secondary">
                  Créer un compte gratuit
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconSolarPanel size={18} className="text-teal-600" />
              <span>Solar-Health &copy; {new Date().getFullYear()}</span>
            </div>
            <nav className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/connexion" className="hover:text-foreground">Connexion</Link>
              <Link href="/inscription" className="hover:text-foreground">Inscription</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
