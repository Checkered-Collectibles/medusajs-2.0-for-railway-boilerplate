import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
  inStock, // 👈 1. Receive the prop (from searchParams)
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  inStock?: string // 👈 2. Define type (URL params are strings)
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "-created_at"

  // Convert string "true" to boolean for UI components
  const isStockFilterChecked = inStock === "true"

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
      {/* 3. Pass boolean to RefinementList so the Checkbox is checked */}
      {/* You may need to update RefinementList to accept this prop if you haven't yet */}
      <RefinementList sortBy={sort} inStock={isStockFilterChecked} />

      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <h1 data-testid="store-page-title">All products</h1>
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
            inStock={inStock} // 4. Pass the string value to the data fetcher
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate