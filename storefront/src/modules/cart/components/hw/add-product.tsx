import { getProductsList } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"

import { FANTASY_CATEGORY_ID, LICENSED_CATEGORY_ID } from "./rule"
import { getCategoryById } from "@lib/data/categories"

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
        console.log("HASSTOCK", product.variants?.[0].inventory_quantity)

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