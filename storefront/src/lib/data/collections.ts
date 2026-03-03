import { cache } from "react"
import { getProductsList } from "./products"
import { HttpTypes } from "@medusajs/types"
import { medusaFetch } from "@lib/medusa"

export const retrieveCollection = cache(async function (
  id: string
): Promise<HttpTypes.StoreCollection | null> {
  try {
    const data = await medusaFetch<{ collection: HttpTypes.StoreCollection }>(
      `/store/collections/${id}`,
      {
        cache: "force-cache",
        tags: ["collections"],
      }
    )
    return data.collection
  } catch (error) {
    console.error(`Failed to retrieve collection ${id}:`, error)
    return null
  }
})

export const getCollectionsList = cache(async function (
  offset: number = 0,
  limit: number = 100
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> {
  try {
    const data = await medusaFetch<{
      collections: HttpTypes.StoreCollection[]
      count: number
    }>("/store/collections", {
      query: { limit, offset: 0, order: "-updated_at" }, // Kept your hardcoded offset: 0
      cache: "force-cache",
      tags: ["collections"],
    })

    // 👇 Filter out the specific collection here
    const filteredCollections = data.collections.filter(
      (c) => c.id !== "pcol_01KGMKT09MFDGC6YQEHXYNKV09" // ACCESSORY COLLECTION ID
    )

    return {
      collections: filteredCollections,
      count: filteredCollections.length,
    }
  } catch (error) {
    console.error("Failed to fetch collections list:", error)
    return { collections: [], count: 0 }
  }
})

export const getCollectionByHandle = cache(async function (
  handle: string
): Promise<HttpTypes.StoreCollection | null> {
  try {
    const data = await medusaFetch<{ collections: HttpTypes.StoreCollection[] }>(
      "/store/collections",
      {
        query: { handle },
        cache: "force-cache",
        tags: ["collections"],
      }
    )
    return data.collections[0] || null
  } catch (error) {
    console.error(`Failed to fetch collection by handle ${handle}:`, error)
    return null
  }
})

export const getCollectionsWithProducts = cache(
  async (countryCode: string): Promise<HttpTypes.StoreCollection[] | null> => {
    const { collections } = await getCollectionsList(0, 3)

    if (!collections || collections.length === 0) {
      return null
    }

    const collectionsWithProducts = await Promise.all(
      collections.map(async (collection) => {
        // getProductsList is already utilizing the stateless fetch now!
        const { response } = await getProductsList({
          countryCode,
          queryParams: {
            // ensure we scope to this collection only
            collection_id: [collection.id],
            // Fetch a larger buffer so we have enough items left after filtering out-of-stock ones
            limit: 50,
            order: "-updated_at",
          },
        })

        // Filter products to only include those in stock
        const inStockProducts = response.products.filter((product) => {
          if (!product.variants || product.variants.length === 0) return false

          // A product is considered in stock if AT LEAST ONE of its variants is available
          return product.variants.some((variant: any) => {
            return (
              variant.manage_inventory === false ||
              variant.allow_backorder === true ||
              (variant.inventory_quantity && variant.inventory_quantity > 0)
            )
          })
        })

        return {
          ...collection,
          // Enforce the max limit of 6 products after the filter
          products: inStockProducts.slice(0, 6),
        } as HttpTypes.StoreCollection
      })
    )

    return collectionsWithProducts
  }
)