import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://notakshayp.in/sitemap.xml",
    host: "https://notakshayp.in",
  }
}
