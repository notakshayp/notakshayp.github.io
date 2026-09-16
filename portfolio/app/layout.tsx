import "./globals.css"
import { ThemeProvider } from "../contexts/ThemeContext"
import { AccentWords } from "../components/AccentWords"

export const metadata = {
  metadataBase: new URL("https://notakshayp.in"),
  title: "Akshay Poothamkotil — Backend Engineer",
  description: "The technical field notes of Akshay Poothamkotil: backend engineer building systems that ship.",
  alternates: { canonical: "https://notakshayp.in" },
  authors: [{ name: "Akshay Poothamkotil", url: "https://notakshayp.in" }],
  creator: "Akshay Poothamkotil",
  publisher: "Akshay Poothamkotil",
  category: "technology",
  robots: { index: true, follow: true, "max-image-preview": "large" },
  keywords: [
    "Akshay Poothamkotil", "Akshay P", "Akshay SDE", "Akshay Amazon", "Akshay Amazon Business",
    "Akshay backend engineer", "Akshay software engineer", "Akshay AI engineer", "Akshay tech lead",
    "Akshay FDE", "Akshay distributed systems", "Akshay AWS engineer", "Akshay RAG engineer",
    "Akshay Python engineer", "Akshay Java engineer", "Akshay Hyderabad",
  ],
  openGraph: {
    title: "Akshay Poothamkotil — I build systems that ship.",
    description: "Backend engineer building systems that ship.",
    url: "https://notakshayp.in",
    siteName: "Akshay Poothamkotil",
    type: "profile",
    locale: "en_IN",
    images: [{ url: "/og.png", width: 1733, height: 908, alt: "Akshay Poothamkotil — I build systems that ship." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Akshay Poothamkotil — I build systems that ship.",
    description: "Backend engineer building systems that ship.",
    images: ["/og.png"],
    creator: "@notakshayp",
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
        <ThemeProvider>
          <AccentWords />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            "name": "Akshay Poothamkotil — Software Engineer",
            "url": "https://notakshayp.in",
            "mainEntity": {
              "@type": "Person",
              "name": "Akshay Poothamkotil",
              "alternateName": ["Akshay P", "Akshay SDE", "Akshay Amazon"],
              "jobTitle": ["Backend Engineer", "Software Engineer", "AI Engineer", "Tech Lead", "Founding Engineer"],
              "description": "Software engineer building backend systems, AI workflows, distributed services, and developer-facing products.",
              "address": { "@type": "PostalAddress", "addressLocality": "Hyderabad", "addressCountry": "IN" },
              "worksFor": [
                { "@type": "Organization", "name": "Amazon", "department": "Amazon Business" },
                { "@type": "Organization", "name": "Cisco" }
              ],
              "knowsAbout": ["Backend engineering", "AWS", "GCP", "Distributed systems", "RAG", "Vector databases", "Python", "Java", "Flask", "React", "AI agents"],
              "image": "https://notakshayp.in/og.png",
              "email": "notakshayp@gmail.com",
              "knowsLanguage": ["en", "te", "hi"],
              "sameAs": ["https://github.com/notakshayp", "https://linkedin.com/in/notakshayp", "https://notakshayp.in"]
            }
          }) }} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
