import { getProductsList } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"

import { FANTASY_CATEGORY_ID } from "./rule"
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

    const category = await getCategoryById([FANTASY_CATEGORY_ID])
    const categoryHandle = category.product_categories[0]?.handle

    return {
        products: filteredProducts,
        categoryHandle,
    }
}