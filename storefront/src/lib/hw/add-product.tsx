import { getProductsList } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"

import { FANTASY_TAG_ID } from "./rule"

export async function getFantasyProducts(countryCode: string) {
    // Retrieve region so prices are returned correctly
    const region = await getRegion(countryCode)
    if (!region) return []

    const queryParams: HttpTypes.StoreProductListParams = {
        region_id: region.id,
        tag_id: [FANTASY_TAG_ID], // IMPORTANT: tag filter uses tag_id[]
        is_giftcard: false,
        limit: 12, // up to you
    }

    const { response } = await getProductsList({
        queryParams,
        countryCode,
    })

    return response.products || []
}