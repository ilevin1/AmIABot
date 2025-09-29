import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AmIABot - Turing Test Game',
  description: 'Test your ability to distinguish between humans and AI in real-time conversations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}

