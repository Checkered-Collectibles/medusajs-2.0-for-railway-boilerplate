import { getProductsListWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  inStock
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  inStock?: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "-created_at") {
    queryParams["order"] = "-created_at"
  }

  if (sortBy === "-updated_at") {
    queryParams["order"] = "-updated_at"
  }
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // Convert string query param to boolean
  const isStockFilterEnabled = (inStock ?? "true") === "true"
  const {
    response: { products, count },
  } = await getProductsListWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
    inStock: isStockFilterEnabled, // 👈 Pass boolean to fetcher
  })
  const totalPages = Math.ceil(count / PRODUCT_LIMIT)
  if (products.length > 0) return (
    <>
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-6"
        data-testid="products-list"
      >
        {products.map((p) => {
          return (
            <li key={p.id}>
              <ProductPreview product={p} region={region} />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
  else return (
    <div className="w-full flex flex-col items-center justify-center py-24 px-4 text-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
      <div className="text-5xl mb-4 grayscale opacity-50">
        🏁
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        The Pegs are Empty!
      </h3>
      <p className="text-gray-500 max-w-md mb-6 text-sm leading-relaxed">
        Faster collectors beat you to the finish line. Every model in this lineup has been snatched up. We're currently in the pit lane hunting for restocks.
      </p>
    </div>
  )
}
