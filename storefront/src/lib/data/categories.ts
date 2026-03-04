import { cache } from "react"
import { HttpTypes } from "@medusajs/types"
import { medusaFetch } from "@lib/medusa"

// --- Fetch all categories with children ---
export const listCategories = cache(async function (): Promise<
  HttpTypes.StoreProductCategory[]
> {
  try {
    const data = await medusaFetch<{
      product_categories: HttpTypes.StoreProductCategory[]
    }>("/store/product-categories", {
      query: { fields: "+category_children" },
      cache: "force-cache",
      // 👇 UPDATED: Base list tag
      tags: ["categories:list"],
    })
    return data.product_categories
  } catch (error) {
    console.error("Failed to list categories:", error)
    return []
  }
})

// --- Fetch paginated list of categories ---
export const getCategoriesList = cache(async function (
  offset: number = 0,
  limit: number = 100
): Promise<{
  product_categories: HttpTypes.StoreProductCategory[]
  count: number
  offset: number
  limit: number
}> {
  try {
    const data = await medusaFetch<{
      product_categories: HttpTypes.StoreProductCategory[]
      count: number
      offset: number
      limit: number
    }>("/store/product-categories", {
      query: { limit, offset },
      cache: "force-cache",
      // 👇 UPDATED: Base list tag
      tags: ["categories:list"],
    })
    return data
  } catch (error) {
    console.error("Failed to fetch categories list:", error)
    return { product_categories: [], count: 0, offset, limit }
  }
})

// --- Fetch categories by an array of handles ---
export const getCategoryByHandle = cache(async function (
  categoryHandle: string[]
): Promise<{
  product_categories: HttpTypes.StoreProductCategory[]
  count: number
  offset: number
  limit: number
}> {
  try {
    // 👇 DYNAMIC TAGS: Map every handle in the array to its own cache tag
    const fetchTags = [
      "categories:list",
      ...categoryHandle.map((h) => `category:handle:${h}`),
    ]

    const data = await medusaFetch<{
      product_categories: HttpTypes.StoreProductCategory[]
      count: number
      offset: number
      limit: number
    }>("/store/product-categories", {
      query: { handle: categoryHandle },
      cache: "force-cache",
      tags: fetchTags, // 👈 UPDATED
    })
    return data
  } catch (error) {
    console.error(`Failed to fetch categories by handles ${categoryHandle}:`, error)
    return { product_categories: [], count: 0, offset: 0, limit: 0 }
  }
})

// --- Fetch categories by an array of IDs ---
export const getCategoryById = cache(async function (
  categoryId: string[]
): Promise<{
  product_categories: HttpTypes.StoreProductCategory[]
  count: number
  offset: number
  limit: number
}> {
  try {
    // 👇 DYNAMIC TAGS: Map every ID in the array to its own cache tag
    const fetchTags = [
      "categories:list",
      ...categoryId.map((id) => `category:${id}`),
    ]

    const data = await medusaFetch<{
      product_categories: HttpTypes.StoreProductCategory[]
      count: number
      offset: number
      limit: number
    }>("/store/product-categories", {
      query: { id: categoryId },
      cache: "force-cache",
      tags: fetchTags, // 👈 UPDATED
    })
    return data
  } catch (error) {
    console.error(`Failed to fetch categories by IDs ${categoryId}:`, error)
    return { product_categories: [], count: 0, offset: 0, limit: 0 }
  }
})