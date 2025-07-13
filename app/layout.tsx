import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CalcPro',
  description: 'A powerful calculator app',
  keywords: 'calculator, math, arithmetic, scientific calculator',
  authors: [{ name: 'Denie Rose Bon'}],
  creator: 'Denie Rose Bon',
  icons: {
    icon: '/calculator-logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
