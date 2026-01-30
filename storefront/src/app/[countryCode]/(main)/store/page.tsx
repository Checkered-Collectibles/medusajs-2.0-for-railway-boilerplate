import { Metadata } from "next"
import Script from "next/script"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
import { getProductsList } from "@lib/data/products"

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    inStock?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

// 1. SWITCH TO DYNAMIC METADATA GENERATION
export async function generateMetadata({ searchParams, params }: Params): Promise<Metadata> {
  const { countryCode } = await params
  const { page } = await searchParams

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://checkered.in"

  // Construct the correct regional path
  const cleanPath = `${baseUrl}/store`

  // 🧠 SMART CANONICAL LOGIC:
  // - If Page > 1: Canonical must match the specific page (content is unique)
  // - If Page 1 (or just sorting): Point to the clean root URL to consolidate SEO power
  let canonicalUrl = cleanPath
  if (page && parseInt(page) > 1) {
    canonicalUrl = `${cleanPath}?page=${page}`
  }

  return {
    title: "Hot Wheels Cars Price List & Full Catalog India | Checkered Collectibles",
    description: "Browse the complete 2026 Hot Wheels collection in India. View our up-to-date price list for Premium, Mainline, and JDM die-cast cars.",
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

export default async function StorePage({ searchParams, params }: Params) {
  const { sortBy, page, inStock } = await searchParams
  const { countryCode } = await params

  const pageNumber = page ? parseInt(page) : 1
  const limit = 12

  const { response } = await getProductsList({
    queryParams: {
      limit: limit,
      offset: (pageNumber - 1) * limit,
    },
    countryCode: countryCode,
  })

  // 2. UPDATE SCHEMA TO MATCH DYNAMIC URLS
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const currentUrl = `${baseUrl}/${countryCode}/store`

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `${baseUrl}/${countryCode}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Store",
            "item": currentUrl
          }
        ]
      },
      {
        "@type": "CollectionPage",
        "name": "Hot Wheels Catalog - Checkered Collectibles",
        "url": currentUrl,
        "description": "Browse our full inventory of Hot Wheels die-cast cars available in India.",
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": response.products.map((product, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `${baseUrl}/${countryCode}/products/${product.handle}`,
            "name": product.title
          }))
        }
      }
    ]
  }

  return (
    <>
      <Script
        id="store-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StoreTemplate
        sortBy={sortBy}
        page={page}
        countryCode={countryCode}
        inStock={inStock}
      />
    </>
  )
}