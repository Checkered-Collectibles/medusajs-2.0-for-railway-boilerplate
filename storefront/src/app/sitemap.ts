import type { MetadataRoute } from "next"
import { getProductsList } from "@lib/data/products"
import { getCollectionsList } from "@lib/data/collections"
import { getCategoriesList } from "@lib/data/categories"

const BASE_URL = "https://checkered.in"
const FETCH_CONTEXT_REGION = "in"

// ⚡ CONFIGURATION: High Priority Categories
// Products in these categories will be flagged as "Important" to Google.
// Replace these strings with your actual Category IDs (e.g., "pcat_01H...")
const HIGH_PRIORITY_CATEGORY_IDS = [
    "pcat_01KC3X8VFE8G7XBNYMVC1RSYEK",      // HW Mainline Licensed
    "pcat_01KD8CKD5Y31RHVWR8FNRVD78J",  // HW Premium
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const urls: MetadataRoute.Sitemap = []

    // 1. Static Pages
    urls.push(
        {
            url: `${BASE_URL}`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/store`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        }
    )

    // 2. Categories (High Priority by default)
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

    // 4. Products (With Smart Category Logic)
    let page = 1
    while (true) {
        const { response, nextPage } = await getProductsList({
            pageParam: page,
            queryParams: {
                limit: 1000,
            },
            countryCode: FETCH_CONTEXT_REGION,
        })

        for (const product of response.products ?? []) {
            if (!product?.handle) continue

            // 🧠 LOGIC: Check if product is in a "High Priority" category
            // We use .some() to check if ANY of the product's categories match our list
            const isHighPriority = product.categories?.some((cat) =>
                HIGH_PRIORITY_CATEGORY_IDS.includes(cat.id)
            )

            // If High Priority (Premium/JDM), give 0.9. Otherwise, standard 0.6.
            const productPriority = isHighPriority ? 0.9 : 0.6

            urls.push({
                url: `${BASE_URL}/products/${product.handle}`,
                lastModified: new Date(
                    product.updated_at ?? product.created_at ?? Date.now()
                ),
                changeFrequency: "weekly",
                priority: productPriority,
            })
        }

        if (!nextPage) break
        page++
    }

    return urls
}