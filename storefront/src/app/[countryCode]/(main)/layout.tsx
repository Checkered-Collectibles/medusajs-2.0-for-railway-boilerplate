import { Metadata } from "next"

import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import { getBaseURL } from "@lib/util/env"
import Banner from "@modules/layout/templates/banner"
import WhatsappContact from "@modules/layout/templates/whatsapp"

export const metadata: Metadata = {
  metadataBase: new URL("https://checkered.in"),

  // 🧠 OPTIMIZED TITLE
  // Targets: "Hot Wheels Cars" (165k vol), "Hot Wheels India" (8k vol), "Hot Wheels Premium" (6.6k vol)
  title: {
    default: "Buy Hot Wheels Cars Online India | Premium & Mainline | Checkered Collectibles",
    template: "%s | Checkered Collectibles"
  },

  // 📝 OPTIMIZED DESCRIPTION
  // Includes "Price", "JDM", and "Authentic" to build trust and hit keywords
  description:
    "Shop authentic Hot Wheels cars online in India at Checkered Collectibles. Best prices for Premium, JDM, Mainlines, and new 2025 case drops. Fast shipping nationwide.",

  applicationName: "Checkered Collectibles",
  category: "Shopping",

  // 🔑 NEW: KEYWORDS ARRAY (Based on your CSV data)
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

  // 🧭 Canonical URL
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
    locale: 'en_IN', // Important for local SEO
    images: [
      {
        url: "/images/og-image.jpg", // Ensure this image features a POPULAR car (like a GTR or Porsche)
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
  return (
    <>
      <Banner />
      <Nav />
      <WhatsappContact />
      {props.children}
      <Footer />
    </>
  )
}
