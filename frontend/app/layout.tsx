import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CISUC Cybersecurity Transversal Laboratory',
  description: 'Cybersecurity research, education, and practical challenges at CISUC.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
