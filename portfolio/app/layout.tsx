import "./globals.css"
import { ThemeProvider } from "../contexts/ThemeContext"
import { AccentWords } from "../components/AccentWords"

export const metadata = {
  metadataBase: new URL("https://notakshayp.in"),
  title: "Akshay Poothamkotil — Backend Engineer",
  description: "The technical field notes of Akshay Poothamkotil: backend engineer building systems that ship.",
  openGraph: {
    title: "Akshay Poothamkotil — I build systems that ship.",
    description: "Backend engineer building systems that ship.",
    url: "https://notakshayp.in",
    siteName: "Akshay Poothamkotil",
    images: [{ url: "/og.png", width: 1733, height: 908, alt: "Akshay Poothamkotil — I build systems that ship." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Akshay Poothamkotil — I build systems that ship.",
    description: "Backend engineer building systems that ship.",
    images: ["/og.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head />
      <body className="bg-white dark:bg-gray-950 text-black dark:text-white transition-colors duration-300 font-sans antialiased">
        <ThemeProvider><AccentWords />{children}</ThemeProvider>
      </body>
    </html>
  )
}
