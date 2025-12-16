import type { MetadataRoute } from "next"
import { getProductsList } from "@lib/data/products"
import { getCollectionsList } from "@lib/data/collections"
import { getCategoriesList } from "@lib/data/categories"

const BASE_URL = "https://checkered.in"
const DEFAULT_COUNTRY_CODE = "in"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const urls: MetadataRoute.Sitemap = []

    // Static pages
    urls.push(
        { url: `${BASE_URL}`, lastModified: new Date() },
        { url: `${BASE_URL}/store`, lastModified: new Date() }
    )

    // -----------------------
    // Categories
    // -----------------------
    let catOffset = 0
    const catLimit = 100
    while (true) {
        const { product_categories } = await getCategoriesList(catOffset, catLimit)

        for (const cat of product_categories ?? []) {
            if (!cat?.handle) continue

            urls.push({
                url: `${BASE_URL}/categories/${cat.handle}`,
                lastModified: new Date(cat.updated_at ?? cat.created_at ?? Date.now()),
            })
        }

        if (!product_categories || product_categories.length < catLimit) break
        catOffset += catLimit
    }

    // -----------------------
    // Collections
    // -----------------------
    // NOTE: Your getCollectionsList currently uses offset: 0 internally.
    // Fix that function to use the passed offset, otherwise pagination won't work.
    let colOffset = 0
    const colLimit = 100
    while (true) {
        const { collections } = await getCollectionsList(colOffset, colLimit)

        for (const col of collections ?? []) {
            if (!col?.handle) continue

            urls.push({
                url: `${BASE_URL}/collections/${col.handle}`,
                lastModified: new Date(col.updated_at ?? col.created_at ?? Date.now()),
            })
        }

        if (!collections || collections.length < colLimit) break
        colOffset += colLimit
    }

    // -----------------------
    // Products
    // -----------------------
    let page = 1
    while (true) {
        const { response, nextPage } = await getProductsList({
            pageParam: page,
            queryParams: { limit: 100 },
            countryCode: DEFAULT_COUNTRY_CODE,
        })

        for (const product of response.products ?? []) {
            if (!product?.handle) continue

            urls.push({
                url: `${BASE_URL}/products/${product.handle}`,
                lastModified: new Date(
                    product.updated_at ?? product.created_at ?? Date.now()
                ),
            })
        }

        if (!nextPage) break
        page++
    }

    return urls
}