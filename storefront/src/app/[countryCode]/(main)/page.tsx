import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  // 🏆 SEO TITLE: Targets "Hot Wheels Cars" (165k vol) + "Buy Online India" (High Intent)
  title: "Buy Hot Wheels Cars Online India | Premium, Mainline & JDM",

  // 📝 SEO DESCRIPTION:
  // - Starts with "Shop authentic Hot Wheels cars" for CTR.
  // - Mentions "Premium, Mainline, JDM" to catch specific collector searches.
  // - Retains your "Fair prices" and "No scalpers" trust signals.
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
        url: "/images/og-image.jpg", // Make sure this image shows a pile of desirable cars!
        width: 1200,
        height: 630,
        alt: "Checkered Collectibles - Buy Hot Wheels India",
      },
    ],
  },
};

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

  return (
    <>
      <Hero />
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  )
}
