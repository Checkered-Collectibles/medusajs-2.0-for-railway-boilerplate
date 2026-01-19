"use server"

import { HttpTypes } from "@medusajs/types"
import { getProductsList } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { search } from "@modules/search/actions"

// 🚫 BLOCKLIST
// Expanded to include generic descriptors so matches rely on real Brand/Model names
const IGNORED_TERMS = new Set([
    // Brands/Series
    "hot", "wheels", "matchbox", "majorette", "premium", "mainline",
    "diecast", "scale", "1:64", "car", "vehicle", "edition", "series",
    "hw", "mattel", "rlc", "treasure", "hunt", "super", "boulevard",
    "culture", "team", "transport", "replacers", "retro", "entertainment",
    // Generic Adjectives (Crucial to avoid "Custom Ford" matching "Custom Chevy")
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
        [arr[i], arr[j]] = [arr[j], arr[i]];
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

    // Create query for search (e.g., "nissan skyline gtr")
    const query = Array.from(currentTokens).join(" ")

    // -------------------------------------------------------
    // A. FETCH CONTEXT POOL (Same Collection/Category)
    // -------------------------------------------------------
    let poolProducts: HttpTypes.StoreProduct[] = []

    const collectionId = product.collection_id
    const categoryId = product.categories?.[product.categories.length - 1]?.id

    if (collectionId || categoryId) {
        try {
            const { response } = await getProductsList({
                queryParams: {
                    region_id: region.id,
                    collection_id: collectionId ? [collectionId] : undefined,
                    category_id: !collectionId && categoryId ? [categoryId] : undefined,
                    limit: limit * 2, // Fetch enough to find matches, but prioritize search later
                    is_giftcard: false,
                },
                countryCode
            })
            poolProducts = response.products ?? []
        } catch (e) {
            console.error("Related products fetch failed", e)
        }
    }

    // -------------------------------------------------------
    // B. FETCH SEARCH RESULTS (Cross-Collection Brand Matches)
    // -------------------------------------------------------
    // 🔥 CHANGE: We increase search limit to match the requested limit (8).
    // If we find 8 other "Porsches" from different collections, we prefer those
    // over random cars from the current collection.
    let searchProducts: HttpTypes.StoreProduct[] = []

    if (query) {
        const hits = await search(query)
        const poolIds = new Set(poolProducts.map(p => p.id))

        const searchIds = hits
            .map((h: any) => h?.id ?? h?.objectID)
            .filter((id: string) => id && id !== currentId && !poolIds.has(id))
            .slice(0, limit) // Allow filling the ENTIRE list with search results if they are relevant

        if (searchIds.length > 0) {
            const { response } = await getProductsList({
                queryParams: { region_id: region.id, id: searchIds },
                countryCode
            })
            searchProducts = response.products ?? []
        }
    }

    // -------------------------------------------------------
    // C. STRICT PRIORITIZATION LOGIC
    // -------------------------------------------------------

    // Helper: Strong Match Check
    const isBrandMatch = (p: HttpTypes.StoreProduct) => {
        if (p.id === currentId) return false
        const otherTokens = getTitleTokens(p.title)

        // Array conversion to fix iteration error
        const tokenArray = Array.from(currentTokens)

        // If they share ANY core token (e.g. "nissan"), it's a brand match
        for (const token of tokenArray) {
            if (otherTokens.has(token)) return true
        }
        return false
    }

    // 1. Extract "Same Brand" items from the Collection Pool
    const collectionBrandMatches = poolProducts.filter(p => isBrandMatch(p))

    // 2. Search results are inherently "Same Brand" (Meili relevance), so we treat them as Top Tier
    const searchBrandMatches = searchProducts.filter(p => p.id !== currentId)

    // 3. Extract "Random Fillers" (Same Collection, Different Brand)
    const collectionFillers = poolProducts.filter(p => p.id !== currentId && !isBrandMatch(p))

    // -------------------------------------------------------
    // D. FINAL COMPOSITION (Tiered)
    // -------------------------------------------------------

    // Tier 1: ALL Brand Matches (Collection + Search)
    // We shuffle them together so you get a mix of "Same Collection Porsches" and "Other Porsches"
    const tier1 = shuffleArray([...collectionBrandMatches, ...searchBrandMatches])

    // Tier 2: Fillers (Only used if we don't have enough brand matches)
    const tier2 = shuffleArray(collectionFillers)

    // Combine: Fill Tier 1 first, then use Tier 2 to reach the limit
    return [...tier1, ...tier2].slice(0, limit)
}