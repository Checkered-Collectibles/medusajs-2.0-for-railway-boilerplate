import { Metadata } from "next"
import Script from "next/script"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import FeaturedCategories from "@modules/home/components/featured-categories"

export const metadata: Metadata = {
  // 🏆 SEO TITLE: Targets "Hot Wheels Cars" (165k vol) + "Buy Online India" (High Intent)
  title: "Buy Hot Wheels Cars Online India | Premium, Mainline & JDM",

  // 📝 SEO DESCRIPTION:
  description:
    "Shop authentic Hot Wheels cars online in India at Checkered Collectibles. Find fair prices on Premium, Mainline, and JDM imports. Collector-safe packing, fast shipping, and no scalpers.",

  // 🧭 CANONICAL: Tells Google this is the main version of your homepage
  alternates: {
    canonical: "https://checkered.in",
  },

  // 📱 OPEN GRAPH (For sharing on WhatsApp/Instagram)
  openGraph: {
    title: "Buy Hot Wheels Cars Online India | Best Prices",
    description: "Authentic Hot Wheels at fair prices. Shop Premium, Mainline, and JDM collections. Fast shipping across India.",
    url: "https://checkered.in",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Checkered Collectibles - Buy Hot Wheels India",
      },
    ],
  },
}

export default async function Home({
  params: { countryCode },
}: {
  params: { countryCode: string }
}) {
  const collections = await getCollectionsWithProducts(countryCode)
  const region = await getRegion(countryCode)

  if (!collections || !region) {
    return null
  }

  // 🏗️ HOMEPAGE STRUCTURED DATA (JSON-LD)
  // This tells Google you are a legitimate Brand/Organization, not just a random page.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://checkered.in/#organization",
        "name": "Checkered Collectibles",
        "url": "https://checkered.in",
        "logo": {
          "@type": "ImageObject",
          "url": "https://checkered.in/images/logo-notext2.png", // ⚠️ Make sure this file exists!
          "width": 112,
          "height": 112
        },
        "sameAs": [
          "https://www.instagram.com/checkered.in/", // Add your real social links
          "https://www.youtube.com/@CheckeredCollectibles"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "areaServed": "IN",
          "availableLanguage": "en"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://checkered.in/#website",
        "url": "https://checkered.in",
        "name": "Checkered Collectibles",
        "description": "Buy Hot Wheels Cars Online India",
        "publisher": {
          "@id": "https://checkered.in/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://checkered.in/results/{search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  }

  return (
    <>
      {/* ⚡ INJECT SCHEMA FOR HOMEPAGE */}
      <Script
        id="homepage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <Hero />
      <div className="py-12">
        <FeaturedCategories />
      </div>
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  )
}