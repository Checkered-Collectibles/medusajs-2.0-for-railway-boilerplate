import { getProductsList } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"

import { ACCESSORIES_CATEGORY_ID, FANTASY_CATEGORY_ID, LICENSED_CATEGORY_ID, PREMIUM_CATEGORY_ID } from "./rule"
import { getCategoryById } from "@lib/data/categories"
import { getRelatedProducts } from "@modules/products/components/related-products/actions"

export async function getAccessoryProducts(
    cart: HttpTypes.StoreCart | null,
    countryCode: string,
): Promise<{
    products: HttpTypes.StoreProduct[]
    categoryHandle?: string
}> {
    const region = await getRegion(countryCode)
    if (!region) return { products: [], categoryHandle: undefined }

    const queryParams: HttpTypes.StoreProductListParams = {
        region_id: region.id,
        category_id: [ACCESSORIES_CATEGORY_ID],
        is_giftcard: false,
        // Fetch slightly more than needed to account for cart filtering
        limit: 12,
    }

    const { response } = await getProductsList({
        queryParams,
        countryCode,
    })

    const products = response.products || []

    // ✅ Collect product IDs already in cart
    const cartProductIds = new Set(
        cart?.items?.map((item) => item.product_id).filter(Boolean)
    )

    // ✅ Filter: Must not be in cart AND Must be In Stock
    const filteredProducts = products.filter((product) => {
        // 1. Skip if in cart
        if (cartProductIds.has(product.id)) return false

        // 2. Check Stock
        const hasStock = product.variants?.some((v) => {
            if (!v.manage_inventory) return true
            if (v.allow_backorder) return true
            return (v.inventory_quantity || 0) > 0
        })

        return hasStock
    })

    const category = await getCategoryById([ACCESSORIES_CATEGORY_ID])
    const categoryHandle = category.product_categories[0]?.handle

    return {
        products: filteredProducts,
        categoryHandle,
    }
}

export async function getFantasyProducts(
    cart: HttpTypes.StoreCart | null,
    countryCode: string,
): Promise<{
    products: HttpTypes.StoreProduct[]
    categoryHandle?: string
}> {
    const region = await getRegion(countryCode)
    if (!region) return { products: [], categoryHandle: undefined }

    const queryParams: HttpTypes.StoreProductListParams = {
        region_id: region.id,
        category_id: [FANTASY_CATEGORY_ID],
        is_giftcard: false,
        limit: 24, // 1. Fetch more to account for OOS items filtering
    }

    const { response } = await getProductsList({
        queryParams,
        countryCode,
    })

    const products = response.products || []

    // ✅ Collect product IDs already in cart
    const cartProductIds = new Set(
        cart?.items?.map((item) => item.product_id).filter(Boolean)
    )

    // ✅ Filter: Must not be in cart AND Must be In Stock
    const filteredProducts = products.filter((product) => {
        // 1. Skip if in cart
        if (cartProductIds.has(product.id)) return false

        // 2. Check Stock: At least one variant must be buyable
        // (Inventory > 0 OR Backorders allowed OR Inventory not managed)
        const hasStock = product.variants?.some((v) => {
            if (!v.manage_inventory) return true
            if (v.allow_backorder) return true
            return (v.inventory_quantity || 0) > 0
        })

        return hasStock
    })

    const category = await getCategoryById([FANTASY_CATEGORY_ID])
    const categoryHandle = category.product_categories[0]?.handle

    return {
        // 3. Return only the top 6 available
        products: filteredProducts.slice(0, 6),
        categoryHandle,
    }
}


export async function getLicensedProducts(
    cart: HttpTypes.StoreCart | null,
    countryCode: string,
): Promise<{
    products: HttpTypes.StoreProduct[]
    categoryHandle?: string
}> {
    const region = await getRegion(countryCode)
    if (!region) return { products: [], categoryHandle: undefined }

    const queryParams: HttpTypes.StoreProductListParams = {
        region_id: region.id,
        category_id: [LICENSED_CATEGORY_ID],
        is_giftcard: false,
        limit: 6,
    }

    const { response } = await getProductsList({
        queryParams,
        countryCode,
    })

    const products = response.products || []

    // ✅ Collect product IDs already in cart
    const cartProductIds = new Set(
        cart?.items?.map((item) => item.product_id).filter(Boolean)
    )

    // ✅ Filter out products already in cart
    const filteredProducts = products.filter(
        (product) => !cartProductIds.has(product.id)
    )

    const category = await getCategoryById([LICENSED_CATEGORY_ID])
    const categoryHandle = category.product_categories[0]?.handle

    return {
        products: filteredProducts,
        categoryHandle,
    }
}

export async function getRelatedProductsForCart(
    cart: HttpTypes.StoreCart | null,
    countryCode: string,
): Promise<HttpTypes.StoreProduct[]> {
    const TARGET_COUNT = 6 // We want exactly this many
    if (!cart?.items?.length) return []

    // 0. Pre-calculate Cart Set for fast lookups
    const cartProductIds = new Set(
        cart.items.map((item) => item.product_id).filter(Boolean)
    )

    // --- PHASE 1: SEED SELECTION ---
    // Identify "Seed Products" (Last 3 unique LICENSED or PREMIUM items)
    const cartItemsReversed = [...cart.items].reverse()
    const uniqueSeeds: HttpTypes.StoreProduct[] = []
    const seenSeedIds = new Set<string>()

    for (const item of cartItemsReversed) {
        const product = (item as any).product as HttpTypes.StoreProduct
        if (!product || seenSeedIds.has(product.id)) continue

        const categoryIds = product.categories?.map(c => c.id) || []
        const isValidSeed =
            categoryIds.includes(LICENSED_CATEGORY_ID) ||
            categoryIds.includes(PREMIUM_CATEGORY_ID)

        if (isValidSeed) {
            uniqueSeeds.push(product)
            seenSeedIds.add(product.id)
        }
        if (uniqueSeeds.length >= 3) break
    }

    let candidates: HttpTypes.StoreProduct[] = []

    // --- PHASE 2: SEMANTIC SEARCH (If seeds exist) ---
    if (uniqueSeeds.length > 0) {
        // Fetch MANY candidates (12 per seed) to survive the strict filtering
        const promises = uniqueSeeds.map(seed =>
            getRelatedProducts({
                product: seed,
                countryCode,
                limit: 12
            })
        )

        const results = await Promise.all(promises)

        // Flatten & Deduplicate (Round-robin mixing)
        const candidateMap = new Map<string, HttpTypes.StoreProduct>()
        const maxLength = Math.max(...results.map(r => r.length))
        for (let i = 0; i < maxLength; i++) {
            for (const batch of results) {
                if (batch[i]) candidateMap.set(batch[i].id, batch[i])
            }
        }
        candidates = Array.from(candidateMap.values())
    }

    // --- PHASE 3: STRICT FILTERING ---
    const isValidProduct = (p: HttpTypes.StoreProduct) => {
        // A. Not in Cart
        if (cartProductIds.has(p.id)) return false

        // B. In Stock
        const hasStock = p.variants?.some((v) => {
            if (!v.manage_inventory) return true
            if (v.allow_backorder) return true
            return (v.inventory_quantity || 0) > 0
        })
        if (!hasStock) return false

        // C. Correct Category (Must be Licensed or Premium)
        const cIds = p.categories?.map(c => c.id) || []
        return cIds.includes(LICENSED_CATEGORY_ID) || cIds.includes(PREMIUM_CATEGORY_ID)
    }

    let finalResults = candidates.filter(isValidProduct)

    // --- PHASE 4: ROBUST FALLBACK (Fill gaps if < 6) ---
    if (finalResults.length < TARGET_COUNT) {
        const region = await getRegion(countryCode)

        if (region) {
            // Fetch popular "Licensed" items as safe fillers
            const { response } = await getProductsList({
                queryParams: {
                    region_id: region.id,
                    category_id: [LICENSED_CATEGORY_ID], // Safest bet for mainlines
                    limit: 24, // Fetch a large batch to filter from
                    is_giftcard: false,
                },
                countryCode
            })

            const fillers = response.products || []

            // Append fillers until we hit target count
            for (const p of fillers) {
                if (finalResults.length >= TARGET_COUNT) break

                // Avoid duplicates (both in result list AND in cart)
                const alreadyIncluded = finalResults.some(r => r.id === p.id)
                if (!alreadyIncluded && isValidProduct(p)) {
                    finalResults.push(p)
                }
            }
        }
    }

    return finalResults.slice(0, TARGET_COUNT)
}