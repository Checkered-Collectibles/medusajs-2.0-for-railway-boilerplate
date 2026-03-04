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
export const filterInStock = (products: HttpTypes.StoreProduct[]) => {
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
    // Dynamically tag every ID requested
    const tags = ["products:list", ...ids.map((id) => `product:${id}`)]

    const data = await medusaFetch<{ products: HttpTypes.StoreProduct[] }>(
      "/store/products",
      {
        query: {
          region_id: regionId,
          id: ids,
          fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata",
        },
        cache: "force-cache",
        tags: tags, // 👈 Updated
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
        tags: ["products:list", `product:handle:${handle}`], // 👈 Updated
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
  queryParams,
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
  const region = await getRegion(countryCode)
  if (!region) return { response: { products: [], count: 0 }, nextPage: null }

  const limit = Number(queryParams?.limit ?? 12)
  const offset = (Math.max(pageParam, 1) - 1) * limit

  const query: any = {
    region_id: region.id,
    limit,
    offset,
    fields: "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+metadata,+categories.*",
    order: queryParams?.order || "-updated_at",
  }

  // 👇 DYNAMIC TAG BUILDER
  const fetchTags = ["products:list"]

  if (queryParams?.category_id) {
    query.category_id = Array.isArray(queryParams.category_id)
      ? queryParams.category_id
      : [queryParams.category_id]

    // Add a tag for every category in this query
    query.category_id.forEach((id: string) => fetchTags.push(`category:${id}`))
  }

  if (queryParams?.collection_id) {
    query.collection_id = Array.isArray(queryParams.collection_id)
      ? queryParams.collection_id
      : [queryParams.collection_id]

    // Add a tag for every collection in this query
    query.collection_id.forEach((id: string) => fetchTags.push(`collection:${id}`))
  }

  if (queryParams?.q) {
    query.q = queryParams.q
  }

  try {
    const data = await medusaFetch<{
      products: HttpTypes.StoreProduct[]
      count: number
    }>("/store/products", {
      query,
      cache: "force-cache",
      tags: fetchTags, // 👈 Updated to use the dynamic array
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

  // 💡 Note: No changes needed here! 
  // Because this calls getProductsList(), it automatically inherits 
  // the dynamic category/collection tags generated above.
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

  if (inStock) {
    processedProducts = filterInStock(processedProducts)
  }

  const sortedProducts = sortProducts(processedProducts, sortBy)
  const pageParam = (page - 1) * limit
  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)
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