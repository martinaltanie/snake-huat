import './globals.css'
import type { Metadata } from 'next'

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
      <body>{children}</body>
    </html>
  )
}