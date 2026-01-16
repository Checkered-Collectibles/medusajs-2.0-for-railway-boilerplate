import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreProductCategory, StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getProductsList } from "@lib/data/products"

type Props = {
  params: { category: string[]; countryCode: string }
  searchParams: {
    sortBy?: SortOptions
    page?: string
  }
}

export async function generateStaticParams() {
  const product_categories = await listCategories()

  if (!product_categories) {
    return []
  }

  const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
    regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
  )

  const categoryHandles = product_categories.map(
    (category: any) => category.handle
  )

  const staticParams = countryCodes
    ?.map((countryCode: string | undefined) =>
      categoryHandles.map((handle: any) => ({
        countryCode,
        category: [handle],
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { product_categories } = await getCategoryByHandle(params.category)

    const titleParts = product_categories.map(
      (category: StoreProductCategory) => category.name
    )
    const titleBase = titleParts.join(" | ")
    const deepestCategory = product_categories[product_categories.length - 1]
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL

    const title = `Buy Hot Wheels ${titleBase} Online in India | Checkered Collectibles`
    const description =
      deepestCategory?.description?.trim() ||
      `Shop authentic Hot Wheels ${titleBase} cars and die-cast collectibles at Checkered Collectibles. Explore licensed, fantasy, and premium series with fast shipping and fair prices across India.`

    const toAbsoluteUrl = (url: string) => {
      if (!url) return url
      if (url.startsWith("http")) return url
      if (!baseUrl) return url
      return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`
    }

    // ✅ Fetch product images for OG/Twitter
    const { response } = await getProductsList({
      queryParams: {
        category_id: [deepestCategory.id],
        limit: 6,
      } as any,
      countryCode: params.countryCode,
    })

    const images =
      response?.products
        ?.flatMap((p) => [
          p.thumbnail,
          ...(p.images?.map((img) => img.url) ?? []),
        ])
        .filter((u): u is string => Boolean(u))
        .map(toAbsoluteUrl)
        .slice(0, 6)
        .map((url) => ({
          url,
          width: 1200,
          height: 630,
          alt: `${deepestCategory.name} Hot Wheels product image`,
        })) ?? []

    const canonicalPath = `/${params.category.join("/")}`
    const canonical = baseUrl ? `${baseUrl}${canonicalPath}` : canonicalPath

    return {
      title,
      description,
      alternates: { canonical },

      openGraph: {
        type: "website",
        siteName: "Checkered Collectibles",
        title,
        description,
        url: canonical,
        locale: "en_IN",
        images: images.length ? images : undefined,
      },

      twitter: {
        card: images.length ? "summary_large_image" : "summary",
        title,
        description,
        images: images.length ? images.map((i) => i.url) : undefined,
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
  } catch (error) {
    notFound()
  }
}
export default async function CategoryPage({ params, searchParams }: Props) {
  const { sortBy, page } = searchParams

  const { product_categories } = await getCategoryByHandle(
    params.category
  )

  if (!product_categories) {
    notFound()
  }

  return (
    <CategoryTemplate
      categories={product_categories}
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
    />
  )
}
