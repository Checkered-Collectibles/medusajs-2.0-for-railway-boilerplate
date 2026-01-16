import { Metadata } from "next"
import { notFound } from "next/navigation"

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

  const region = await getRegion(params.countryCode)

  const { response } = await getProductsList({
    queryParams: {
      collection_id: [collection.id],
      region_id: region?.id,
      limit: 6,
    } as any,
    countryCode: params.countryCode,
  })

  // ✅ Keep your existing excellent image logic
  const images =
    response?.products
      ?.flatMap((product) => [
        product.thumbnail,
        ...(product.images?.map((img) => img.url) ?? []),
      ])
      .filter((url): url is string => Boolean(url))
      .slice(0, 6)
      .map((url) => ({
        url,
        width: 1200,
        height: 630,
        alt: `${collection.title} - Checkered Collectibles India`,
      })) ?? []

  // 🧠 SMART TITLE LOGIC
  // If collection name is "Premium", this becomes "Hot Wheels Premium"
  // If collection name is "Hot Wheels JDM", it stays "Hot Wheels JDM" (no duplication)
  const seoTitleRaw = collection.title.toLowerCase().includes('hot wheels')
    ? collection.title
    : `Hot Wheels ${collection.title}`;

  // Capitalize first letters for display
  const seoTitle = seoTitleRaw.replace(/\b\w/g, l => l.toUpperCase());

  // 🚀 SEO TITLE: Targets "Buy [Type]" + "India" + "Prices" (High Volume)
  const title = `Buy ${seoTitle} Online India | Prices & Catalog`

  // 📝 SEO DESCRIPTION: 
  // hits "Authentic", "Price List", and "India" explicitly.
  const description = `Shop authentic ${seoTitle} online in India. Browse the 2025 price list, rare die-cast models, and new drops. Fast shipping and fair prices at Checkered Collectibles.`

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  const canonical = baseUrl
    ? `${baseUrl}/${params.countryCode}/collections/${params.handle}`
    : undefined

  return {
    title,
    description,
    // 🔑 NEW: Dynamic Keywords for this specific collection
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
      images: images.length ? images : undefined,
      locale: "en_IN",
    },

    twitter: {
      card: images.length ? "summary_large_image" : "summary",
      title,
      description,
      images: images.map((img) => img.url),
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
  const { sortBy, page } = searchParams

  const collection = await getCollectionByHandle(params.handle).then(
    (collection: StoreCollection) => collection
  )

  if (!collection) {
    notFound()
  }

  return (
    <CollectionTemplate
      collection={collection}
      page={page}
      sortBy={sortBy}
      countryCode={params.countryCode}
    />
  )
}
