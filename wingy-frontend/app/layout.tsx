import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
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
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <GameProvider>
          {children}
          <Analytics />
        </GameProvider>
      </body>
    </html>
  )
}
