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

    if (!product_categories || product_categories.length === 0) return notFound()

    // 🎯 SEO STRATEGY: Focus on the specific (deepest) category
    // e.g., if path is "Hot Wheels -> Premium", we focus on "Premium"
    const deepestCategory = product_categories[product_categories.length - 1]
    const categoryName = deepestCategory.name

    // 🧠 SMART TITLE LOGIC
    // 1. Remove "Hot Wheels" from the category name if it exists to avoid stuttering
    // 2. Re-add it cleanly at the start
    const cleanName = categoryName.replace(/hot\s?wheels/i, "").trim()
    const seoTitle = `Hot Wheels ${cleanName}`

    // 🏆 FINAL TITLE
    // Targets: "Buy [Category] India" + "Price List"
    // Example: "Buy Hot Wheels Premium Cars India | Price List & Catalog"
    const title = `Buy ${seoTitle} Cars India | Price List & Catalog`

    // 📝 OPTIMIZED DESCRIPTION
    // Uses the category description if available, otherwise uses a strong SEO template
    const description =
      deepestCategory?.description?.trim() ||
      `Shop authentic ${seoTitle} cars online in India. Browse the 2025 price list for ${cleanName}, view new case drops, and buy with fast shipping at Checkered Collectibles.`

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL

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
          alt: `${seoTitle} - Checkered Collectibles India`,
        })) ?? []

    const canonicalPath = `/${params.category.join("/")}`
    const canonical = baseUrl ? `${baseUrl}${canonicalPath}` : canonicalPath

    return {
      title,
      description,
      // 🔑 DYNAMIC KEYWORDS
      keywords: [
        `${seoTitle} India`,
        `${seoTitle} Price`,
        `Buy ${cleanName} Online`,
        "Hot Wheels India",
        "Diecast Cars India",
        "Checkered Collectibles"
      ],
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
