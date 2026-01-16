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
      limit: 6, // fetch more to get good images
    } as any,
    countryCode: params.countryCode,
  })

  // ✅ Collect multiple product images for OG/Twitter cards
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
        alt: `${collection.title} product image`,
      })) ?? []

  // 🧠 Improved SEO title & description with keywords and context
  const title = `Buy ${collection.title} Online in India | Checkered Collectibles`
  const description = `Shop ${collection.title} at Checkered Collectibles. Explore authentic Hot Wheels and die-cast collectibles with fair prices, secure checkout, and fast delivery across India.`

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  const canonical = baseUrl
    ? `${baseUrl}/${params.countryCode}/collections/${params.handle}`
    : undefined

  return {
    title,
    description,
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

    // 💡 Optional: basic robots directives for SEO control
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
