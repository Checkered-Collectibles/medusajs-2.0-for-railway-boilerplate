// src/modules/cart/lib/hotwheels-rule.ts
import { HttpTypes } from "@medusajs/types"

export const LICENSED_CATEGORY_ID = "pcat_01KC3X8VFE8G7XBNYMVC1RSYEK"
export const FANTASY_CATEGORY_ID = "pcat_01KC3ZZ9RWEQ12WS8B2NZ8MGQ8"

export type HotWheelsRuleResult = {
    licensedCount: number
    fantasyCount: number
    missingFantasy: number
    canCheckout: boolean
    restrictionMessage: string | null
}

export function evaluateHotWheelsRule(
    cart: HttpTypes.StoreCart | null
): HotWheelsRuleResult {
    let licensedCount = 0
    let fantasyCount = 0

    if (cart?.items) {
        for (const item of cart.items) {
            const quantity = item.quantity || 0
            // make sure your cart API expands `items.product.categories`
            const categories = (item as any).product?.categories ?? []
            const categoryIds = categories.map((c: any) => c.id)

            if (categoryIds.includes(LICENSED_CATEGORY_ID)) {
                licensedCount += quantity
            }

            if (categoryIds.includes(FANTASY_CATEGORY_ID)) {
                fantasyCount += quantity
            }
        }
    }

    const missingFantasy = Math.max(0, licensedCount - fantasyCount)
    const canCheckout = missingFantasy === 0

    const restrictionMessage =
        missingFantasy > 0
            ? `To help us keep Hot Wheels prices affordable and continue what we do, each Licensed Hot Wheels car needs to be paired with a Fantasy car. You currently have ${licensedCount} Licensed car(s) and ${fantasyCount} Fantasy car(s). Please add ${missingFantasy} more Fantasy car(s) to continue checkout 😄`
            : null

    return {
        licensedCount,
        fantasyCount,
        missingFantasy,
        canCheckout,
        restrictionMessage,
    }
}