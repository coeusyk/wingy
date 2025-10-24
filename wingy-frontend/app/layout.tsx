import type React from "react"
import type { Metadata } from "next"

import "./globals.css"
import {
  Manrope as V0_Font_Manrope,
  Source_Code_Pro as V0_Font_Source_Code_Pro,
  Source_Serif_4 as V0_Font_Source_Serif_4,
} from "next/font/google"
import { GameProvider } from "@/contexts/game-context"

// Initialize fonts
const _manrope = V0_Font_Manrope({ subsets: ["latin"], weight: ["200", "300", "400", "500", "600", "700", "800"] })
const _sourceCodePro = V0_Font_Source_Code_Pro({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
})
const _sourceSerif_4 = V0_Font_Source_Serif_4({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "Wingy - AI Gaming Assistant",
  description: "Your intelligent guide to gaming excellence. Get personalized strategies, tips, tutorials, and advice powered by AI.",
  generator: "wingy",
  icons: {
    icon: [
      {
        url: "/wingy-logo-transparent.png",
        type: "image/png",
      },
    ],
    apple: "/wingy-logo-transparent.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/wingy-logo-transparent.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/wingy-logo-transparent.png" />
      </head>
      <body className={`font-sans antialiased w-screen h-screen overflow-hidden`}>
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  )
}
