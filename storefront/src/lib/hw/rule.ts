// src/modules/cart/lib/hotwheels-rule.ts
import { HttpTypes } from "@medusajs/types"

export const LICENSED_TAG_ID = "ptag_01KC2HBR0N82R38FWK0B0SFEKQ"
export const FANTASY_TAG_ID = "ptag_01KC3X7MZ45VZ98K6NX71A88D0"

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
            console.log("TAGS", item.product?.tags)
            const quantity = item.quantity || 0
            // make sure your cart API expands `items.product.categories`
            const tags = (item as any).product?.tags ?? []
            const tagsIds = tags.map((c: any) => c.id)

            if (tagsIds.includes(LICENSED_TAG_ID)) {
                licensedCount += quantity
            }

            if (tagsIds.includes(FANTASY_TAG_ID)) {
                fantasyCount += quantity
            }
        }
    }

    const missingFantasy = Math.max(0, licensedCount - fantasyCount)
    const canCheckout = missingFantasy === 0

    const restrictionMessage =
        missingFantasy > 0
            ? `You have ${licensedCount} licensed car(s), but only ${fantasyCount} fantasy car(s). Please add ${missingFantasy} more "Hot Wheels Mainline Fantasy" car(s) to checkout.`
            : null

    return {
        licensedCount,
        fantasyCount,
        missingFantasy,
        canCheckout,
        restrictionMessage,
    }
}