import { Geist, Geist_Mono, Manrope } from "next/font/google"

import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" })

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
    <html lang="fr" className={cn("antialiased", fontMono.variable, "font-sans", manrope.variable)}>
      <body>
        <TooltipProvider delay={0}>{children}</TooltipProvider>
      </body>
    </html>
  )
}
