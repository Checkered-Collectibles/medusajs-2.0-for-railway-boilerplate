"use server"

import { HttpTypes } from "@medusajs/types"
import { getRegion } from "@lib/data/regions"
import { search } from "@modules/search/actions"
import { filterInStock } from "@lib/data/products"
import { medusaFetch } from "@lib/medusa"

// 🚫 BLOCKLIST
const IGNORED_TERMS = new Set([
    // Brands/Series
    "hot", "wheels", "matchbox", "majorette", "premium", "mainline",
    "diecast", "scale", "1:64", "car", "vehicle", "edition", "series",
    "hw", "mattel", "rlc", "treasure", "hunt", "super", "boulevard",
    "culture", "team", "transport", "replacers", "retro", "entertainment",
    // Generic Adjectives
    "custom", "concept", "factory", "tuned", "race", "racing", "spec",
    "mod", "modern", "classics", "vintage", "exotic", "sport", "gran",
    "turismo", "forza", "fast", "furious", "long", "short", "card",
    "imported"
])

// Helper: Fisher-Yates Shuffle
function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

// Helper: Extract meaningful tokens
function getTitleTokens(title: string | undefined) {
    if (!title) return new Set<string>()

    return new Set(
        title.toLowerCase()
            .split(/[\s-]+/)
            .map(w => w.replace(/[^a-z0-9]/g, ""))
            .filter(w => w.length >= 2)
            .filter(w => !IGNORED_TERMS.has(w))
    )
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

    const currentId = product.id
    const currentTokens = getTitleTokens(product.title)
    const query = Array.from(currentTokens).join(" ")

    let poolProducts: HttpTypes.StoreProduct[] = []
    const collectionId = product.collection_id
    const categoryId = product.categories?.[product.categories.length - 1]?.id

    // -------------------------------------------------------
    // A. FETCH CONTEXT POOL (Same Collection/Category)
    // -------------------------------------------------------
    if (collectionId || categoryId) {
        try {
            const queryParams: any = {
                region_id: region.id,
                limit: limit * 4, // Higher fetch to account for out-of-stock items being removed
                is_giftcard: false,
                fields: "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+metadata,+categories.*",
            }

            if (collectionId) {
                queryParams.collection_id = [collectionId]
            } else if (categoryId) {
                queryParams.category_id = [categoryId]
            }

            const data = await medusaFetch<{ products: HttpTypes.StoreProduct[] }>(
                "/store/products",
                {
                    query: queryParams,
                    cache: "force-cache",
                    tags: ["products"],
                }
            )

            // Immediately filter to ensure only in-stock items are added to the pool
            poolProducts = filterInStock(data.products ?? [])
        } catch (e) {
            console.error("Related products fetch failed", e)
        }
    }

    // -------------------------------------------------------
    // B. FETCH SEARCH RESULTS (Cross-Collection Matches via Meilisearch)
    // -------------------------------------------------------
    let searchProducts: HttpTypes.StoreProduct[] = []

    if (query) {
        try {
            const hits = await search(query)
            const poolIds = new Set(poolProducts.map(p => p.id))

            const searchIds = hits
                .map((h: any) => h?.id ?? h?.objectID)
                .filter((id: string) => id && id !== currentId && !poolIds.has(id))
                .slice(0, limit * 4) // Fetch a wide buffer

            if (searchIds.length > 0) {
                const data = await medusaFetch<{ products: HttpTypes.StoreProduct[] }>(
                    "/store/products",
                    {
                        query: {
                            region_id: region.id,
                            id: searchIds,
                            fields: "*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+metadata,+categories.*",
                        },
                        cache: "force-cache",
                        tags: ["products"],
                    }
                )
                // Immediately filter to ensure only in-stock items
                searchProducts = filterInStock(data.products ?? [])
            }
        } catch (e) {
            console.error("Related products search/fetch failed", e)
        }
    }

    // -------------------------------------------------------
    // C. STRICT PRIORITIZATION LOGIC
    // -------------------------------------------------------
    const isBrandMatch = (p: HttpTypes.StoreProduct) => {
        if (p.id === currentId) return false
        const otherTokens = getTitleTokens(p.title)
        const tokenArray = Array.from(currentTokens)

        // Strong brand check
        for (const token of tokenArray) {
            if (otherTokens.has(token)) return true
        }
        return false
    }

    // 1. Extract "Same Brand" items from the Collection Pool
    const collectionBrandMatches = poolProducts.filter(p => isBrandMatch(p))

    // 2. Extract "Same Brand" items from the Search Pool
    const searchBrandMatches = searchProducts.filter(p => isBrandMatch(p))

    // 3. Extract "Random Fillers" (Same Collection, Different Brand)
    const collectionFillers = poolProducts.filter(p => p.id !== currentId && !isBrandMatch(p))

    // -------------------------------------------------------
    // D. FINAL COMPOSITION (Tiered)
    // -------------------------------------------------------

    // Tier 1: ALL Brand Matches (Collection + Search)
    const tier1 = shuffleArray([...collectionBrandMatches, ...searchBrandMatches])

    // Tier 2: Fillers 
    const tier2 = shuffleArray(collectionFillers)

    return [...tier1, ...tier2].slice(0, limit)
}