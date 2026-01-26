// src/modules/cart/lib/hotwheels-rule.ts
import { HttpTypes } from "@medusajs/types"

export const LICENSED_CATEGORY_ID = "pcat_01KC3X8VFE8G7XBNYMVC1RSYEK"
export const FANTASY_CATEGORY_ID = "pcat_01KC3ZZ9RWEQ12WS8B2NZ8MGQ8"
export const PREMIUM_CATEGORY_ID = "pcat_01KD8CKD5Y31RHVWR8FNRVD78J"

export type HotWheelsRuleResult = {
    licensedCount: number
    fantasyCount: number
    premiumCount: number
    totalCount: number
    missingFantasy: number
    missingMainlinesForPremium: number
    canCheckout: boolean
    restrictionMessage: string | null
}

export async function evaluateHotWheelsRule(
    cart: HttpTypes.StoreCart | null
): Promise<HotWheelsRuleResult> {
    const isMainlineRuleEnabled = true
    const isPremiumRuleEnabled = true
    const MAX_ITEMS_ALLOWED = 14

    let licensedCount = 0
    let fantasyCount = 0
    let premiumCount = 0
    let totalCount = 0

    let hasInvalidQuantity = false

    if (cart?.items) {
        for (const item of cart.items) {
            const quantity = item.quantity || 0
            totalCount += quantity

            const categories = (item as any).product?.categories ?? []
            const categoryIds = categories.map((c: any) => c.id)

            const isFantasy = categoryIds.includes(FANTASY_CATEGORY_ID)

            // 🚫 HARD RULE:
            // Non-Fantasy cars cannot have quantity > 1
            if (!isFantasy && quantity > 1) {
                hasInvalidQuantity = true
            }

            if (categoryIds.includes(LICENSED_CATEGORY_ID)) {
                licensedCount += quantity
            }

            if (isFantasy) {
                fantasyCount += quantity
            }

            if (categoryIds.includes(PREMIUM_CATEGORY_ID)) {
                premiumCount += quantity
            }
        }
    }

    // Initialize "waterfall" variables
    let fantasyExtra = fantasyCount

    // Note: Licensed cars are no longer used for Premium rule, so licensedExtra is just licensedCount
    const licensedExtra = licensedCount

    // 🔑 PREMIUM RULE
    // Updated: Now requires 2 FANTASY cars per 1 Premium car
    let missingMainlinesForPremium = 0 // Keeping variable name for compatibility, but tracks Fantasy now

    if (isPremiumRuleEnabled && premiumCount > 0) {
        const requiredFantasyForPremium = premiumCount * 2

        // Calculate missing fantasy specifically for premium rule
        missingMainlinesForPremium = Math.max(
            0,
            requiredFantasyForPremium - fantasyCount
        )

        // Deduct the fantasy cars used by this rule from the "Extra" pool
        // so they aren't double-counted for the Licensed Rule below
        const fantasyUsed = Math.min(fantasyCount, requiredFantasyForPremium)
        fantasyExtra -= fantasyUsed
    }

    // 🔑 MAINLINE RULE (Licensed Rule)
    // Checks remaining fantasy cars against licensed cars
    let missingFantasy = 0
    if (isMainlineRuleEnabled) {
        const requiredFantasy = Math.ceil(licensedExtra / 2)
        missingFantasy = Math.max(0, requiredFantasy - fantasyExtra)
    }

    // 🔑 BULK ORDER RULE
    const isBulkOrder = totalCount > MAX_ITEMS_ALLOWED

    const canCheckout =
        !hasInvalidQuantity &&
        !isBulkOrder &&
        (!isMainlineRuleEnabled || missingFantasy === 0) &&
        (!isPremiumRuleEnabled || missingMainlinesForPremium === 0)

    const messages: string[] = []

    // 1. Bulk Order Message (Highest Priority)
    if (isBulkOrder) {
        messages.push(
            `You have ${totalCount} items. For orders with more than ${MAX_ITEMS_ALLOWED} items, please contact us for bulk orders.`
        )
    }
    // Only show other messages if it's NOT a bulk order
    else {
        if (hasInvalidQuantity) {
            messages.push(
                "Only Fantasy cars can be purchased with quantity more than 1. Please reduce quantity for other items."
            )
        }

        if (isPremiumRuleEnabled && missingMainlinesForPremium > 0) {
            messages.push(
                `Add ${missingMainlinesForPremium} more Fantasy car${missingMainlinesForPremium === 1 ? "" : "s"
                } (2 Fantasy required per Premium car).`
            )
        }

        if (isMainlineRuleEnabled && missingFantasy > 0) {
            messages.push(
                `Add ${missingFantasy} Fantasy car${missingFantasy === 1 ? "" : "s"
                } (1 required per 2 extra Licensed cars).`
            )
        }
    }

    return {
        licensedCount,
        fantasyCount,
        premiumCount,
        totalCount,
        missingFantasy,
        missingMainlinesForPremium,
        canCheckout,
        restrictionMessage: messages.length ? messages.join(" ") : null,
    }
}