import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  // 🧠 SEO TITLE:
  // Targets: "Hot Wheels Cars Prices" (14.8k vol) + "Hot Wheels Catalog" intent
  title: "Hot Wheels Cars Price List & Full Catalog India | Checkered Collectibles",

  // 📝 SEO DESCRIPTION:
  // - Starts with "Browse" to match the shopping mindset.
  // - Explicitly mentions "2025 Price List" to signal freshness.
  // - Lists key categories (Mainlines, Premiums) for keyword density.
  description:
    "Browse the complete 2026 Hot Wheels collection in India. View our up-to-date price list for Premium, Mainline, and JDM die-cast cars. Authentic models, fair market prices, and fast shipping.",

  // 🧭 CANONICAL:
  // Crucial for "All Products" pages to avoid duplicate content issues with pagination or filters
  alternates: {
    canonical: "https://checkered.in/store",
  },
};
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

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
    />
  )
}
