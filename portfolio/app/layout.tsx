import "./globals.css"
import { ThemeProvider } from "../contexts/ThemeContext"

export const metadata = {
  title: "Akshay Poothamkotil",
  description: "Portfolio of Akshay Poothamkotil, Software Development Engineer II at Amazon",
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
