// src/modules/cart/lib/hotwheels-rule.ts
import { HttpTypes } from "@medusajs/types"

export const LICENSED_CATEGORY_ID = "pcat_01KC3X8VFE8G7XBNYMVC1RSYEK"
export const FANTASY_CATEGORY_ID = "pcat_01KC3ZZ9RWEQ12WS8B2NZ8MGQ8"
export const PREMIUM_CATEGORY_ID = "pcat_01KD8CKD5Y31RHVWR8FNRVD78J"

export type HotWheelsRuleResult = {
    licensedCount: number
    fantasyCount: number
    premiumCount: number
    missingFantasy: number
    missingMainlinesForPremium: number
    canCheckout: boolean
    restrictionMessage: string | null
}

export function evaluateHotWheelsRule(
    cart: HttpTypes.StoreCart | null
): HotWheelsRuleResult {
    let licensedCount = 0
    let fantasyCount = 0
    let premiumCount = 0

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

            if (categoryIds.includes(PREMIUM_CATEGORY_ID)) {
                premiumCount += quantity
            }
        }
    }

    // 🔑 Rule 1: 1 Fantasy required for every 2 Licensed cars
    const requiredFantasy = Math.floor(licensedCount / 2)
    const missingFantasy = Math.max(0, requiredFantasy - fantasyCount)

    // 🔑 Rule 2: 2 Mainlines (Licensed or Fantasy) per 1 Premium
    const mainlineCount = licensedCount + fantasyCount
    const requiredMainlinesForPremium = premiumCount * 2
    const missingMainlinesForPremium = Math.max(
        0,
        requiredMainlinesForPremium - mainlineCount
    )

    const canCheckout =
        missingFantasy === 0 && missingMainlinesForPremium === 0

    let restrictionMessage: string | null = null
    const messages: string[] = []

    if (missingFantasy > 0) {
        messages.push(
            `Add ${missingFantasy} Fantasy car${missingFantasy === 1 ? "" : "s"
            } (1 required per 2 Licensed cars).`
        )
    }

    if (missingMainlinesForPremium > 0) {
        messages.push(
            `Add ${missingMainlinesForPremium} more mainline car${missingMainlinesForPremium === 1 ? "" : "s"
            } (2 Licensed/Fantasy mainlines required per Premium car).`
        )
    }

    if (messages.length > 0) {
        restrictionMessage = messages.join(" ")
    }

    return {
        licensedCount,
        fantasyCount,
        premiumCount,
        missingFantasy,
        missingMainlinesForPremium,
        canCheckout,
        restrictionMessage,
    }
}