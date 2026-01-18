import { Metadata } from "next"
import { notFound } from "next/navigation"
import Script from "next/script" // 1. Import Script

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { getRegion, listRegions } from "@lib/data/regions"
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

    const deepestCategory = product_categories[product_categories.length - 1]
    const categoryName = deepestCategory.name

    // 🧠 SMART TITLE LOGIC
    const cleanName = categoryName.replace(/hot\s?wheels/i, "").trim()
    const seoTitle = `Hot Wheels ${cleanName}`

    // 🏆 FINAL TITLE
    const title = `Buy ${seoTitle} Cars India | Price List & Catalog`

    // 📝 OPTIMIZED DESCRIPTION
    const description =
      deepestCategory?.description?.trim() ||
      `Shop authentic ${seoTitle} cars online in India. Browse the 2026 price list for ${cleanName}, view new case drops, and buy with fast shipping at Checkered Collectibles.`

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    const canonicalPath = params.category.join("/")
    // ✅ Fix: Include country code in canonical
    const canonical = baseUrl ? `${baseUrl}/${params.countryCode}/categories/${canonicalPath}` : canonicalPath

    return {
      title,
      description,
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
      },
      robots: {
        index: true,
        follow: true,
      }
    }
  } catch (error) {
    notFound()
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { sortBy, page } = searchParams

  // 1. Fetch Categories & Region
  const { product_categories } = await getCategoryByHandle(params.category)
  const region = await getRegion(params.countryCode)

  if (!product_categories || !region) {
    notFound()
  }

  const deepestCategory = product_categories[product_categories.length - 1]

  // 2. Fetch Products for Schema
  const pageNumber = page ? parseInt(page) : 1
  const limit = 12
  const { response } = await getProductsList({
    page: pageNumber,
    queryParams: {
      category_id: [deepestCategory.id],
      limit: limit,
      offset: (pageNumber - 1) * limit,
    },
    countryCode: params.countryCode,
  })

  // 3. BUILD JSON-LD SCHEMA
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const categoryPath = params.category.join("/")
  const currentUrl = `${baseUrl}/${params.countryCode}/categories/${categoryPath}`

  // A. Dynamic Breadcrumbs construction
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": baseUrl
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Categories",
      "item": `${baseUrl}/${params.countryCode}/store` // Fallback to store
    }
  ]

  // Add each level of the category hierarchy to breadcrumbs
  product_categories.forEach((cat: any, index: number) => {
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": index + 3,
      "name": cat.name,
      // Construct cumulative URL path
      "item": `${baseUrl}/${params.countryCode}/categories/${product_categories.slice(0, index + 1).map((c: any) => c.handle).join("/")}`
    })
  })

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      // Schema 1: Breadcrumbs
      {
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbItems
      },
      // Schema 2: Category Page (Product List)
      {
        "@type": "CollectionPage",
        "name": `${deepestCategory.name} - Checkered Collectibles`,
        "url": currentUrl,
        "description": deepestCategory.description || `Buy authentic ${deepestCategory.name} cars in India.`,
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": response?.products.map((product, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `${baseUrl}/${params.countryCode}/products/${product.handle}`,
            "name": product.title,
            // ✅ Price Injection
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
        id={`category-schema-${deepestCategory.handle}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <CategoryTemplate
        categories={product_categories}
        sortBy={sortBy}
        page={page}
        countryCode={params.countryCode}
      />
    </>
  )
}