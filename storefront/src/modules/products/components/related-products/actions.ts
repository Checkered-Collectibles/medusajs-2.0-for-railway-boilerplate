"use server"

import { HttpTypes } from "@medusajs/types"
import { getProductsList } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { search } from "@modules/search/actions"

function buildRelatedQuery(product: HttpTypes.StoreProduct) {
    const title = product.title ?? ""
    const tagWords =
        product.tags?.map((t) => t.value).filter(Boolean) ?? []

    // Keep it short so Meili doesn’t get noisy
    const titleWords = title
        .split(/\s+/)
        .map((w) => w.trim())
        .filter((w) => w.length >= 3)
        .slice(0, 6)

    // Example query: "hot wheels skyline jdm premium"
    const combined = [...titleWords, ...tagWords].join(" ").trim()

    return combined || title
}

export async function getRelatedProducts({
    product,
    countryCode,
    limit = 8,
}: {
    product: HttpTypes.StoreProduct
    countryCode: string
    limit?: number
}) {
    const region = await getRegion(countryCode)
    if (!region) return []

    // 1) Search Meili for similar items
    const q = buildRelatedQuery(product)
    const hits = await search(q)

    // Extract IDs from hits (support both id and objectID)
    const ids = hits
        .map((h: any) => h?.id ?? h?.objectID)
        .filter(Boolean)
        .filter((id: string) => id !== product.id)
        .slice(0, limit)

    if (!ids.length) return []

    // 2) Fetch actual product data from Medusa by IDs
    // Medusa StoreProductListParams supports filtering by id in many setups.
    // If your version uses a different param name, see note below.
    const queryParams: HttpTypes.StoreProductListParams = {
        region_id: region.id,
        id: ids as any, // id: string[] (some typings may not include it; runtime usually supports it)
        is_giftcard: false,
    }

    const res = await getProductsList({ queryParams, countryCode })
    const products = res.response.products ?? []

    // 3) Keep order same as Meili ranking
    const byId = new Map(products.map((p) => [p.id, p]))
    const ordered = ids.map((id) => byId.get(id)).filter(Boolean) as HttpTypes.StoreProduct[]

    return ordered
}