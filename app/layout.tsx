import { Press_Start_2P } from "next/font/google"
import "./globals.css"
import type React from "react"
import "katex/dist/katex.min.css"
import { AuthProvider } from "@/components/auth-provider"

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={pixelFont.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
