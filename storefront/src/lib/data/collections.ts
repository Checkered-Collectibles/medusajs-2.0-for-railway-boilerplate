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
        // 👇 UPDATED: Tagged with the specific collection ID
        tags: ["collections:list", `collection:${id}`],
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
      query: { limit, offset: 0, order: "-updated_at" },
      cache: "force-cache",
      // 👇 UPDATED: Base list tag for when you create/delete a whole collection
      tags: ["collections:list"],
    })

    const filteredCollections = data.collections.filter(
      (c) => c.id !== "pcol_01KGMKT09MFDGC6YQEHXYNKV09"
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
        // 👇 UPDATED: Tagged with the specific handle
        tags: ["collections:list", `collection:handle:${handle}`],
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
        // 💡 NOTE: No tag changes needed here! 
        // getProductsList is already utilizing the new dynamic tags we just wrote,
        // meaning this combined fetch automatically inherits `collection:${id}` cache rules.
        const { response } = await getProductsList({
          countryCode,
          queryParams: {
            collection_id: [collection.id],
            limit: 50,
            order: "-updated_at",
          },
        })

        const inStockProducts = response.products.filter((product) => {
          if (!product.variants || product.variants.length === 0) return false

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
          products: inStockProducts.slice(0, 6),
        } as HttpTypes.StoreCollection
      })
    )

    return collectionsWithProducts
  }
)