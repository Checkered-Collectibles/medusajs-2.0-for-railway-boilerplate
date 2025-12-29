import { sdk } from "@lib/config"
import { cache } from "react"
import { getProductsList } from "./products"
import { HttpTypes } from "@medusajs/types"

export const retrieveCollection = cache(async function (id: string) {
  return sdk.store.collection
    .retrieve(id, {}, { next: { tags: ["collections"] } })
    .then(({ collection }) => collection)
})

export const getCollectionsList = cache(async function (
  offset: number = 0,
  limit: number = 100
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> {
  return sdk.store.collection
    .list({ limit, offset: 0, order: "-updated_at" }, { next: { tags: ["collections"] } })
    .then(({ collections }) => ({ collections, count: collections.length }))
})

export const getCollectionByHandle = cache(async function (
  handle: string
): Promise<HttpTypes.StoreCollection> {
  return sdk.store.collection
    .list({ handle }, { next: { tags: ["collections"] } })
    .then(({ collections }) => collections[0])
})

export const getCollectionsWithProducts = cache(
  async (countryCode: string): Promise<HttpTypes.StoreCollection[] | null> => {
    const { collections } = await getCollectionsList(0, 3)

    if (!collections || collections.length === 0) {
      return null
    }

    const collectionsWithProducts = await Promise.all(
      collections.map(async (collection) => {
        const { response } = await getProductsList({
          countryCode,
          queryParams: {
            // ensure we scope to this collection only
            collection_id: [collection.id],
            // max 6 products
            limit: 6,
            // make sort explicit, even though getProductsList defaults to this
            order: "-updated_at",
          },
        })

        return {
          ...collection,
          products: response.products,
        } as HttpTypes.StoreCollection
      })
    )

    return collectionsWithProducts
  }
)
