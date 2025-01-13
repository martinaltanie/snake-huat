import './globals.css'
import type { Metadata } from 'next'
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: 'Snake Huat',
  description: 'A Lunar New Year themed Snake game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}