import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Akshay - AI Fullstack Engineer',
  description: 'Portfolio of Akshay, a Freelance AI Fullstack Engineer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-black`}>{children}</body>
    </html>
  )
}
