import { Metadata } from "next"
import { notFound } from "next/navigation"
import Script from "next/script"

import {
  getCollectionByHandle,
  getCollectionsList,
} from "@lib/data/collections"
import { getRegion, listRegions } from "@lib/data/regions"
import { StoreCollection, StoreRegion } from "@medusajs/types"
import CollectionTemplate from "@modules/collections/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getProductsList } from "@lib/data/products"

type Props = {
  params: { handle: string; countryCode: string }
  searchParams: {
    page?: string
    sortBy?: SortOptions
    inStock?: string
  }
}

export const PRODUCT_LIMIT = 12

export async function generateStaticParams() {
  const { collections } = await getCollectionsList()

  if (!collections) {
    return []
  }

  const countryCodes = await listRegions().then(
    (regions: StoreRegion[]) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )

  const collectionHandles = collections.map(
    (collection: StoreCollection) => collection.handle
  )

  const staticParams = countryCodes
    ?.map((countryCode: string) =>
      collectionHandles.map((handle: string | undefined) => ({
        countryCode,
        handle,
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const collection = await getCollectionByHandle(params.handle)
  if (!collection) notFound()

  // 🧠 SMART TITLE LOGIC
  const seoTitleRaw = collection.title.toLowerCase().includes('hot wheels')
    ? collection.title
    : `Hot Wheels ${collection.title}`;
  const seoTitle = seoTitleRaw.replace(/\b\w/g, l => l.toUpperCase());

  // 🚀 SEO TITLE
  const title = `Buy ${seoTitle} Online India | Prices & Catalog`

  // 📝 SEO DESCRIPTION
  const description = `Shop authentic ${seoTitle} online in India. Browse the 2026 price list, rare die-cast models, and new drops. Fast shipping and fair prices at Checkered Collectibles.`

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  // ✅ FIX: Include countryCode in canonical to match actual URL structure
  const canonical = baseUrl
    ? `${baseUrl}/${params.countryCode}/collections/${params.handle}`
    : undefined

  return {
    title,
    description,
    keywords: [
      `${seoTitle} India`,
      `${seoTitle} Price`,
      `Buy ${seoTitle} Online`,
      "Hot Wheels India",
      "Diecast Collectors India",
      "Checkered Collectibles"
    ],
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      type: "website",
      siteName: "Checkered Collectibles",
      title,
      description,
      url: canonical,
      locale: "en_IN",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  }
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { sortBy, page, inStock } = searchParams

  // 1. Fetch Collection & Region Data
  const collection = await getCollectionByHandle(params.handle)
  const region = await getRegion(params.countryCode) // ✅ Fetch Region for Currency Code

  if (!collection || !region) notFound()

  // 2. Fetch Products for Schema (Rich Snippets)
  const pageNumber = page ? parseInt(page) : 1
  const { response } = await getProductsList({
    page: pageNumber,
    queryParams: {
      collection_id: [collection.id],
      limit: PRODUCT_LIMIT,
      offset: (pageNumber - 1) * PRODUCT_LIMIT,
    },
    countryCode: params.countryCode,
  })

  // 3. BUILD JSON-LD STRUCTURED DATA
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  // ✅ FIX: URLs must include country code (e.g., /in/collections/...)
  const collectionUrl = `${baseUrl}/collections/${collection.handle}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      // A. BREADCRUMB LIST
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Collections",
            "item": `${baseUrl}/store`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": collection.title,
            "item": collectionUrl
          }
        ]
      },
      // B. COLLECTION PAGE (The Rich Snippet)
      {
        "@type": "CollectionPage",
        "name": `${collection.title} - Checkered Collectibles`,
        "url": collectionUrl,
        "description": `Buy authentic ${collection.title} in India.`,
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": response?.products.map((product, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `${baseUrl}/products/${product.handle}`,
            "name": product.title,
            // ✅ PRICE INJECTION: Now we show prices in search results
            "offers": {
              "@type": "Offer",
              "price": product.variants?.[0]?.calculated_price?.calculated_amount,
              "priceCurrency": region.currency_code.toUpperCase()
            }
          }))
        }
      }
    ]
  }

  return (
    <>
      {/* 4. INJECT SCHEMA */}
      <Script
        id={`collection-schema-${params.handle}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <CollectionTemplate
        collection={collection}
        page={page}
        sortBy={sortBy}
        countryCode={params.countryCode}
        inStock={inStock}
      />
    </>
  )
}