import { notFound } from "next/navigation"
import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  categories,
  sortBy,
  page,
  countryCode,
  inStock, // 👈 1. Accept the new prop
}: {
  categories: HttpTypes.StoreProductCategory[]
  sortBy?: SortOptions
  page?: string
  countryCode: string
  inStock?: string // 👈 2. Define the type (string from URL)
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "-created_at"
  const category = categories[categories.length - 1]
  const parents = categories.slice(0, categories.length - 1)

  if (!category || !countryCode) return notFound()

  // Convert string param to boolean for the UI Checkbox
  const isStockFilterChecked = inStock === "true"

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
      <RefinementList
        sortBy={sort}
        data-testid="sort-by-container"
        inStock={isStockFilterChecked} // 👈 3. Pass boolean to Checkbox
      />

      <div className="w-full">
        <div className="flex flex-row mb-8 text-2xl-semi gap-4">
          {parents && parents.map((parent) => (
            <span key={parent.id} className="text-ui-fg-subtle mr-4">
              {parent.name}
            </span>
          ))}
          <h1 data-testid="category-page-title">{category.name}</h1>
        </div>

        {category.description && (
          <div className="mb-8 text-base-regular">
            <p>{category.description}</p>
          </div>
        )}

        {category && (
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              categoryId={category.id}
              countryCode={countryCode}
              inStock={inStock} // 👈 4. Pass the string param to the Data Fetcher
            />
          </Suspense>
        )}
      </div>
    </div>
  )
}