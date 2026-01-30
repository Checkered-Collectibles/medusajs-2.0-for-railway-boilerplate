import { Metadata } from "next"
import Script from "next/script" // 1. Import Script

import SearchResultsTemplate from "@modules/search/templates/search-results-template"
import { search } from "@modules/search/actions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Params = {
  params: { query: string; countryCode: string }
  searchParams: {
    sortBy?: SortOptions
    page?: string
    inStock?: string
  }
}

// 2. DYNAMIC METADATA
// We switch from 'export const metadata' to 'generateMetadata' to access the 'query'
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  // Decode the URL (e.g. "nissan%20skyline" -> "nissan skyline")
  const q = decodeURIComponent(params.query)

  return {
    title: `Search results for "${q}" | Checkered Collectibles`,
    description: `Found results for ${q}. Shop authentic Hot Wheels online in India.`,

    // 🛑 CRITICAL SEO RULE:
    // We explicitly tell Google "Do NOT index this page".
    // Search result pages should never be indexed to prevent "Crawl Waste".
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function SearchResults({ params, searchParams }: Params) {
  const { query } = params
  const { sortBy, page, inStock } = searchParams

  const hits = await search(query).then((data) => data)

  // Filter valid IDs
  const ids = hits
    .map((h) => h.objectID || h.id)
    .filter((id): id is string => {
      return typeof id === "string"
    })

  // 3. SEARCH RESULTS SCHEMA (JSON-LD)
  // Even if not indexed, this helps assistive technology understand the page structure.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "name": `Search Results for "${decodeURIComponent(query)}"`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": hits.map((hit: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        // Assuming your hit object has 'handle' and 'title'. 
        // Adjust if your search index uses different keys.
        "url": `${process.env.NEXT_PUBLIC_BASE_URL}/products/${hit.handle}`,
        "name": hit.title || hit.name
      }))
    }
  }

  return (
    <>
      {/* 4. INJECT SCHEMA */}
      <Script
        id="search-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SearchResultsTemplate
        query={query}
        ids={ids}
        sortBy={sortBy}
        page={page}
        countryCode={params.countryCode}
        inStock={inStock}
      />
    </>
  )
}