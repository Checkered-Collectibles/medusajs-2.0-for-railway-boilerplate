import { Metadata } from "next"

import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import { getBaseURL } from "@lib/util/env"
import Banner from "@modules/layout/templates/banner"
import WhatsappContact from "@modules/layout/templates/whatsapp"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),

  title: "Checkered Collectibles | Hot Wheels Without the Hype",

  description:
    "Authentic Hot Wheels and die-cast collectibles at honest prices. New case drops, collector-safe packing, and fast shipping across India.",

  applicationName: "Checkered Collectibles",
  category: "shopping",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    siteName: "Checkered Collectibles",
    title: "Checkered Collectibles | Hot Wheels Without the Hype",
    description:
      "Authentic Hot Wheels and die-cast collectibles at honest prices. New case drops, collector-safe packing, and fast shipping across India.",
    url: "/",
    images: [
      {
        url: "/images/og-image.jpg", // ✅ put this file in /public/og.jpg (or change path)
        width: 1200,
        height: 630,
        alt: "Checkered Collectibles - Hot Wheels Without the Hype",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Checkered Collectibles | Hot Wheels Without the Hype",
    description:
      "Authentic Hot Wheels and die-cast collectibles at honest prices. New case drops, collector-safe packing, and fast shipping across India.",
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
}

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
