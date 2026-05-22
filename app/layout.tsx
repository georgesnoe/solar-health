import { Geist, Geist_Mono, Outfit } from "next/font/google"

import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={cn("antialiased", fontMono.variable, "font-sans", outfit.variable)}>
      <body>
        <TooltipProvider delay={0}>{children}</TooltipProvider>
      </body>
    </html>
  )
}
