import { Metadata } from "next"

import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import { getBaseURL } from "@lib/util/env"
import Banner from "@modules/layout/templates/banner"
import WhatsappContact from "@modules/layout/templates/whatsapp"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),

  // 🧠 Strong keyword-rich title for SEO & CTR
  title: "Buy Hot Wheels Online in India | Checkered Collectibles",

  // 📝 Optimized description with keyword placement
  description:
    "Buy authentic Hot Wheels cars online in India at Checkered Collectibles. Discover new case drops, premium die-cast collectibles, and fast nationwide shipping.",

  applicationName: "Checkered Collectibles",
  category: "Shopping",

  // 🧭 Canonical URL — explicit and absolute (important for SEO)
  alternates: {
    canonical: "https://checkered.in/",
  },

  openGraph: {
    type: "website",
    siteName: "Checkered Collectibles",
    title: "Buy Hot Wheels Online in India | Checkered Collectibles",
    description:
      "Shop authentic Hot Wheels cars online in India. Explore rare models, premium collectibles, and exclusive case drops — all with secure packing and fast delivery.",
    url: "https://checkered.in/",
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
    title: "Buy Hot Wheels Online in India | Checkered Collectibles",
    description:
      "Shop Hot Wheels cars and die-cast collectibles online in India. Affordable, authentic, and collector-approved — Checkered Collectibles delivers quality fast.",
    images: ["/images/og-image.jpg"],
  },

  // ✅ Robot directives for full indexing
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

  // 💡 Add structured data for better product discovery
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
