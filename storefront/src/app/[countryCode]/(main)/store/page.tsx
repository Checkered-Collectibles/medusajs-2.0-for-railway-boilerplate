import { Metadata } from "next"
import Script from "next/script" // 1. Import Script for JSON-LD

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
import { getProductsList } from "@lib/data/products" // 2. Import fetching logic

export const metadata: Metadata = {
  // 🧠 SEO TITLE:
  title: "Hot Wheels Cars Price List & Full Catalog India | Checkered Collectibles",

  // 📝 SEO DESCRIPTION:
  description:
    "Browse the complete 2026 Hot Wheels collection in India. View our up-to-date price list for Premium, Mainline, and JDM die-cast cars. Authentic models, fair market prices, and fast shipping.",

  // 🧭 CANONICAL:
  alternates: {
    canonical: "https://checkered.in/store",
  },
}

type Params = {
  searchParams: {
    sortBy?: SortOptions
    page?: string
  }
  params: {
    countryCode: string
  }
}

export default async function StorePage({ searchParams, params }: Params) {
  const { sortBy, page } = searchParams

  // 3. FETCH DATA FOR SCHEMA
  // We fetch the first 12 items to tell Google "These are the products on this page"
  // Next.js automatically deduplicates this request if StoreTemplate uses the same fetch.
  const pageNumber = page ? parseInt(page) : 1
  const limit = 12

  const { response } = await getProductsList({
    queryParams: {
      limit: limit,
      offset: (pageNumber - 1) * limit,
    },
    countryCode: params.countryCode,
  })

  // 4. BUILD JSON-LD SCHEMA
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      // A. BREADCRUMB LIST (Essential for "Home > Store" structure in Google)
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": process.env.NEXT_PUBLIC_BASE_URL
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Store",
            "item": `${process.env.NEXT_PUBLIC_BASE_URL}/store`
          }
        ]
      },
      // B. COLLECTION PAGE (Tells Google this is a Product List)
      {
        "@type": "CollectionPage",
        "name": "Hot Wheels Catalog - Checkered Collectibles",
        "url": `${process.env.NEXT_PUBLIC_BASE_URL}/store`,
        "description": "Browse our full inventory of Hot Wheels die-cast cars available in India.",
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": response.products.map((product, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `${process.env.NEXT_PUBLIC_BASE_URL}/products/${product.handle}`,
            "name": product.title
          }))
        }
      }
    ]
  }

  return (
    <>
      {/* 5. INJECT SCHEMA */}
      <Script
        id="store-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <StoreTemplate
        sortBy={sortBy}
        page={page}
        countryCode={params.countryCode}
      />
    </>
  )
}