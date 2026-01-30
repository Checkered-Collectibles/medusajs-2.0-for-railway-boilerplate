import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"
import { getRegion } from "./regions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { sortProducts } from "@lib/util/sort-products"

// --- Helper: Filter Out-of-Stock Products ---
const filterInStock = (products: HttpTypes.StoreProduct[]) => {
  return products.filter((p) => {
    if (!p.variants || p.variants.length === 0) return false
    return p.variants.some((v) => {
      if (!v.manage_inventory) return true
      if (v.allow_backorder) return true
      return (v.inventory_quantity || 0) > 0
    })
  })
}

// ... [getProductsById and getProductByHandle remain unchanged] ...

export const getProductsById = cache(async function ({
  ids,
  regionId,
}: {
  ids: string[]
  regionId: string
}) {
  return sdk.store.product
    .list(
      {
        id: ids,
        region_id: regionId,
        fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata",
      },
      { next: { tags: ["products"] } }
    )
    .then(({ products }) => products)
})

export const getProductByHandle = cache(async function (
  handle: string,
  regionId: string
) {
  return sdk.store.product
    .list(
      {
        handle,
        region_id: regionId,
        fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata",
      },
      { next: { tags: ["products"] } }
    )
    .then(({ products }) => products[0])
})


// --- Base Fetcher ---
export const getProductsList = cache(async function ({
  pageParam = 1,
  queryParams,
  countryCode,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> {
  const region = await getRegion(countryCode)

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const limit = Number(queryParams?.limit ?? 12)
  const validPageParam = Math.max(pageParam, 1)
  const offset = (validPageParam - 1) * limit

  const baseQuery: HttpTypes.StoreProductListParams = {
    limit,
    offset,
    region_id: region.id,
    fields:
      "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+metadata,+categories.*",
    ...queryParams,
  }

  if (!baseQuery.order) {
    baseQuery.order = "-updated_at"
  }

  return sdk.store.product
    .list(baseQuery, { next: { tags: ["products"] } })
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? validPageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage,
        queryParams: baseQuery,
      }
    })
})

// --- Sorted & Filtered Fetcher ---
export const getProductsListWithSort = cache(async function ({
  page = 1,
  queryParams,
  sortBy = "-updated_at",
  countryCode,
  inStock = false, // 👈 New Parameter
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
  inStock?: boolean // 👈 New Type Definition
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> {
  const limit = queryParams?.limit || 12

  // 1. Fetch large batch
  const {
    response: { products },
  } = await getProductsList({
    pageParam: 1,
    queryParams: {
      ...queryParams,
      limit: 500,
    },
    countryCode,
  })

  let processedProducts = products

  // 2. INDEPENDENT FILTER: Filter if inStock is true
  if (inStock) {
    processedProducts = filterInStock(processedProducts)
  }

  // 3. Sort: Always sort based on the selected sortBy key
  const sortedProducts = sortProducts(processedProducts, sortBy)

  // 4. Paginate
  const pageParam = (page - 1) * limit
  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  // 5. Return count
  const finalCount = sortedProducts.length
  const nextPage = finalCount > pageParam + limit ? page + 1 : null

  return {
    response: {
      products: paginatedProducts,
      count: finalCount,
    },
    nextPage,
    queryParams,
  }
})