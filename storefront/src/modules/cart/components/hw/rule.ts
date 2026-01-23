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

export async function evaluateHotWheelsRule(
    cart: HttpTypes.StoreCart | null
): Promise<HotWheelsRuleResult> {
    const isMainlineRuleEnabled = true
    const isPremiumRuleEnabled = true

    let licensedCount = 0
    let fantasyCount = 0
    let premiumCount = 0

    let hasInvalidQuantity = false

    if (cart?.items) {
        for (const item of cart.items) {
            const quantity = item.quantity || 0
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

    const mainlineCount = licensedCount + fantasyCount

    let missingMainlinesForPremium = 0
    let licensedExtra = licensedCount
    let fantasyExtra = fantasyCount

    // 🔑 PREMIUM RULE
    if (isPremiumRuleEnabled && premiumCount > 0) {
        const requiredMainlinesForPremium = premiumCount

        missingMainlinesForPremium = Math.max(
            0,
            requiredMainlinesForPremium - mainlineCount
        )

        if (requiredMainlinesForPremium > 0 && mainlineCount > 0) {
            const neededForPremium = Math.min(
                requiredMainlinesForPremium,
                mainlineCount
            )

            const licensedUsed = Math.min(licensedCount, neededForPremium)
            const fantasyUsed = Math.min(
                fantasyCount,
                neededForPremium - licensedUsed
            )

            licensedExtra -= licensedUsed
            fantasyExtra -= fantasyUsed
        }
    }

    // 🔑 MAINLINE RULE
    let missingFantasy = 0
    if (isMainlineRuleEnabled) {
        // 👇 CHANGED FROM FLOOR TO CEIL
        // Logic: 1 Licensed / 2 = 0.5 -> ceil(0.5) = 1 Fantasy Required
        // Logic: 2 Licensed / 2 = 1.0 -> ceil(1.0) = 1 Fantasy Required
        const requiredFantasy = Math.ceil(licensedExtra / 2)

        missingFantasy = Math.max(0, requiredFantasy - fantasyExtra)
    }

    const canCheckout =
        !hasInvalidQuantity &&
        (!isMainlineRuleEnabled || missingFantasy === 0) &&
        (!isPremiumRuleEnabled || missingMainlinesForPremium === 0)

    const messages: string[] = []

    if (hasInvalidQuantity) {
        messages.push(
            "Only Fantasy cars can be purchased with quantity more than 1. Please reduce quantity for other items."
        )
    }

    if (isMainlineRuleEnabled && missingFantasy > 0) {
        messages.push(
            `Add ${missingFantasy} Fantasy car${missingFantasy === 1 ? "" : "s"
            } (1 required per 2 extra Licensed cars).`
        )
    }

    if (isPremiumRuleEnabled && missingMainlinesForPremium > 0) {
        messages.push(
            `Add ${missingMainlinesForPremium} more mainline car${missingMainlinesForPremium === 1 ? "" : "s"
            } (1 Licensed/Fantasy required per Premium car).`
        )
    }

    return {
        licensedCount,
        fantasyCount,
        premiumCount,
        missingFantasy,
        missingMainlinesForPremium,
        canCheckout,
        restrictionMessage: messages.length ? messages.join(" ") : null,
    }
}