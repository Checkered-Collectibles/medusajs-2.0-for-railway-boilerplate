"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"
import { getRegion } from "./regions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { sortProducts } from "@lib/util/sort-products"
import { getAuthHeaders } from "./cookies"
import { getSafeAuthHeaders } from "@lib/util/safeheaders"
import { medusaFetch } from "@lib/medusa"



// --- Helper: Filter Out-of-Stock Products ---
const filterInStock = (products: HttpTypes.StoreProduct[]) => {
  return products.filter((p) => {
    if (!p.variants || p.variants.length === 0) return false
    return p.variants.some((v) => {
      // @ts-ignore
      if (!v.manage_inventory) return true
      // @ts-ignore
      if (v.allow_backorder) return true
      // @ts-ignore
      return (v.inventory_quantity || 0) > 0
    })
  })
}

// --- Fetch Product(s) by IDs ---
export const getProductsById = cache(async function ({
  ids,
  regionId,
}: {
  ids: string[]
  regionId: string
}): Promise<HttpTypes.StoreProduct[]> {
  try {
    const data = await medusaFetch<{ products: HttpTypes.StoreProduct[] }>(
      "/store/products",
      {
        query: {
          region_id: regionId,
          id: ids, // medusaFetch automatically converts this to id[]=1&id[]=2
          fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata",
        },
        cache: "force-cache",
        tags: ["products"],
      }
    )
    return data.products
  } catch (error) {
    console.error("Failed to fetch products by IDs:", error)
    return []
  }
})

// --- Fetch Product by Handle ---
export const getProductByHandle = cache(async function (
  handle: string,
  regionId: string
): Promise<HttpTypes.StoreProduct | null> {
  try {
    const data = await medusaFetch<{ products: HttpTypes.StoreProduct[] }>(
      "/store/products",
      {
        query: {
          region_id: regionId,
          handle: handle,
          fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata",
        },
        cache: "force-cache",
        tags: ["products"],
      }
    )
    return data.products[0] || null
  } catch (error) {
    console.error(`Failed to fetch product with handle ${handle}:`, error)
    return null
  }
})


// --- Base Fetcher (List) ---
export async function getProductsList({
  pageParam = 1,
  queryParams, // This receives the query params from the URL or server context
  countryCode,
}: {
  pageParam?: number
  queryParams?: HttpTypes.StoreProductListParams
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.StoreProductListParams
}> {
  // 1. Get the Region
  const region = await getRegion(countryCode)
  if (!region) return { response: { products: [], count: 0 }, nextPage: null }

  // 2. Setup Pagination
  const limit = Number(queryParams?.limit ?? 12)
  const offset = (Math.max(pageParam, 1) - 1) * limit

  // 3. Prepare Query Object
  const query: any = {
    region_id: region.id,
    limit,
    offset,
    fields: "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+metadata,+categories.*",
    order: queryParams?.order || "-updated_at",
  }

  // Handle category_id array
  if (queryParams?.category_id) {
    query.category_id = Array.isArray(queryParams.category_id)
      ? queryParams.category_id
      : [queryParams.category_id]
  }

  // 👇 ADDED: Handle collection_id array correctly
  if (queryParams?.collection_id) {
    query.collection_id = Array.isArray(queryParams.collection_id)
      ? queryParams.collection_id
      : [queryParams.collection_id]
  }

  // Also pass through any other search parameters if needed (like 'q' for search)
  if (queryParams?.q) {
    query.q = queryParams.q
  }

  try {
    // 4. Clean, type-safe, perfectly cached fetch!
    const data = await medusaFetch<{
      products: HttpTypes.StoreProduct[]
      count: number
    }>("/store/products", {
      query,
      cache: "force-cache", // Forces Next.js 15 to cache it globally
      tags: ["products"],
    })

    const nextPage = data.count > offset + limit ? pageParam + 1 : null

    return {
      response: { products: data.products, count: data.count },
      nextPage,
      queryParams,
    }
  } catch (error) {
    console.error("Failed to fetch products list:", error)
    return { response: { products: [], count: 0 }, nextPage: null }
  }
}

// --- Sorted & Filtered Fetcher ---
export const getProductsListWithSort = cache(async function ({
  page = 1,
  queryParams,
  sortBy = "-created_at",
  countryCode,
  inStock = true,
}: {
  page?: number
  queryParams?: HttpTypes.StoreProductListParams
  sortBy?: SortOptions
  countryCode: string
  inStock?: boolean
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.StoreProductListParams
}> {
  const limit = queryParams?.limit || 12

  // 1. Fetch large batch (Auth handled via safe wrapper inside getProductsList)
  const {
    response: { products },
  } = await getProductsList({
    pageParam: 1,
    queryParams: {
      ...queryParams,
      limit: 1000,
    },
    countryCode,
  })

  let processedProducts = products

  // 2. INDEPENDENT FILTER: Filter if inStock is true
  if (inStock) {
    processedProducts = filterInStock(processedProducts)
  }

  // 3. Sort
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