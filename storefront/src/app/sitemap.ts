import type { MetadataRoute } from "next"
import { getProductsList } from "@lib/data/products"
import { getCollectionsList } from "@lib/data/collections"
import { getCategoriesList } from "@lib/data/categories"

const BASE_URL = "https://checkered.in"
const FETCH_CONTEXT_REGION = "in" // Needed only to fetch data, not for URLs

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const urls: MetadataRoute.Sitemap = []

    // 1. Static Pages
    urls.push(
        {
            url: `${BASE_URL}`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0, // Highest Priority
        },
        {
            url: `${BASE_URL}/store`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9, // High Priority (Catalog)
        }
    )

    // 2. Categories
    let catOffset = 0
    const catLimit = 100
    while (true) {
        const { product_categories } = await getCategoriesList(
            catOffset,
            catLimit
        )

        for (const cat of product_categories ?? []) {
            if (!cat?.handle) continue

            urls.push({
                // ✅ CLEAN URL: No country code
                url: `${BASE_URL}/categories/${cat.handle}`,
                lastModified: new Date(
                    cat.updated_at ?? cat.created_at ?? Date.now()
                ),
                changeFrequency: "weekly",
                priority: 0.8,
            })
        }

        if (!product_categories || product_categories.length < catLimit) break
        catOffset += catLimit
    }

    // 3. Collections
    let colOffset = 0
    const colLimit = 100
    while (true) {
        const { collections } = await getCollectionsList(colOffset, colLimit)

        for (const col of collections ?? []) {
            if (!col?.handle) continue

            urls.push({
                // ✅ CLEAN URL: No country code
                url: `${BASE_URL}/collections/${col.handle}`,
                lastModified: new Date(
                    col.updated_at ?? col.created_at ?? Date.now()
                ),
                changeFrequency: "weekly",
                priority: 0.8,
            })
        }

        if (!collections || collections.length < colLimit) break
        colOffset += colLimit
    }

    // 4. Products
    let page = 1
    while (true) {
        // We fetch using 'in' context to ensure we get products valid for India
        const { response, nextPage } = await getProductsList({
            pageParam: page,
            queryParams: { limit: 100 },
            countryCode: FETCH_CONTEXT_REGION,
        })

        for (const product of response.products ?? []) {
            if (!product?.handle) continue

            urls.push({
                // ✅ CLEAN URL: No country code
                url: `${BASE_URL}/products/${product.handle}`,
                lastModified: new Date(
                    product.updated_at ?? product.created_at ?? Date.now()
                ),
                changeFrequency: "weekly",
                priority: 0.6, // Products are lower priority than categories
            })
        }

        if (!nextPage) break
        page++
    }

    return urls
}