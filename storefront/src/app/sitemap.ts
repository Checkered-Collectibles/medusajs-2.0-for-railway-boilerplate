import type { MetadataRoute } from "next"
import { getProductsList } from "@lib/data/products"

const BASE_URL = "https://checkered.in"
const DEFAULT_COUNTRY_CODE =
    process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const urls: MetadataRoute.Sitemap = []

    // Static pages (no country code)
    urls.push(
        { url: `${BASE_URL}`, lastModified: new Date() },
        { url: `${BASE_URL}/store`, lastModified: new Date() }
    )

    // Fetch ALL products (paginated)
    let page = 1
    let hasMore = true

    while (hasMore) {
        const { response, nextPage } = await getProductsList({
            pageParam: page,
            queryParams: { limit: 100 },
            countryCode: DEFAULT_COUNTRY_CODE,
        })

        response.products.forEach((product) => {
            urls.push({
                // IMPORTANT: sitemap URLs should be canonical (no country prefix)
                url: `${BASE_URL}/products/${product.handle}`,
                lastModified: new Date(
                    product.updated_at ?? product.created_at ?? Date.now()
                ),
            })
        })

        hasMore = Boolean(nextPage)
        page++
    }

    return urls
}