import { Metadata } from "next"
import Script from "next/script" // 1. Import Script

import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import { getBaseURL } from "@lib/util/env"
import Banner from "@modules/layout/templates/banner"
import WhatsappContact from "@modules/layout/templates/whatsapp"
import FacebookPixel from "@lib/meta/facebook-pixel"

export const metadata: Metadata = {
  metadataBase: new URL("https://checkered.in"),

  // 🧠 OPTIMIZED TITLE
  title: {
    template: "%s | Checkered Collectibles", // ✅ Un-commented this so sub-pages work automatically
    default: "Buy Hot Wheels Cars Online India | Checkered Collectibles", // Fallback title
  },

  // 📝 OPTIMIZED DESCRIPTION
  description:
    "Shop authentic Hot Wheels cars online in India at Checkered Collectibles. Best prices for Premium, JDM, Mainlines, and new 2026 case drops. Fast shipping nationwide.",

  applicationName: "Checkered Collectibles",
  category: "Shopping",

  // 🔑 KEYWORDS
  keywords: [
    "Hot Wheels India",
    "Buy Hot Wheels Online",
    "Hot Wheels Cars",
    "Hot Wheels Premium",
    "Hot Wheels Price List",
    "Diecast Cars India",
    "Hot Wheels Collectors",
    "JDM Hot Wheels",
    "Matchbox India",
    "Majorette India"
  ],

  // Compass
  alternates: {
    canonical: "https://checkered.in",
  },

  openGraph: {
    type: "website",
    siteName: "Checkered Collectibles",
    title: "Buy Hot Wheels Cars Online in India | Best Prices",
    description:
      "Shop authentic Hot Wheels cars online in India. Explore rare JDM models, Premium sets, and exclusive case drops. Secure packing & fast delivery.",
    url: "https://checkered.in/",
    locale: 'en_IN',
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Buy Hot Wheels Online in India - Checkered Collectibles",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Buy Hot Wheels Cars Online in India | Checkered Collectibles",
    description:
      "Shop Hot Wheels cars and die-cast collectibles online in India. Affordable, authentic, and collector-approved.",
    images: ["/images/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  other: {
    "theme-color": "#ffffff",
  },
};

export default async function PageLayout(props: { children: React.ReactNode }) {
  // 🔍 WEBSITE SCHEMA
  // This helps Google understand your site structure and adds the Search Box in SERPs
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Checkered Collectibles",
    "url": "https://checkered.in",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://checkered.in/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <>
      {/* 💉 Inject Schema */}
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Banner />
      <Nav />
      <WhatsappContact />
      {props.children}
      <Footer />
      <FacebookPixel />
    </>
  )
}