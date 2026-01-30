import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  inStock, // 👈 1. Accept the new prop
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  inStock?: string // 👈 2. Define type (comes as string from URL)
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "-created_at"

  // Convert string param to boolean for the UI Checkbox
  const isStockFilterChecked = inStock === "true"

  return (
    <div className="flex flex-col small:flex-row small:items-start py-6 content-container">
      {/* 3. Pass boolean to RefinementList to sync the checkbox */}
      <RefinementList sortBy={sort} inStock={isStockFilterChecked} />

      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <h1>{collection.title}</h1>
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          {/* 4. Pass string param to PaginatedProducts for data fetching */}
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            collectionId={collection.id}
            countryCode={countryCode}
            inStock={inStock}
          />
        </Suspense>
      </div>
    </div>
  )
}