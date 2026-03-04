// src/modules/cart/lib/hotwheels-rule.ts
import { HttpTypes } from "@medusajs/types"

export const LICENSED_CATEGORY_ID = "pcat_01KC3X8VFE8G7XBNYMVC1RSYEK"
export const FANTASY_CATEGORY_ID = "pcat_01KC3ZZ9RWEQ12WS8B2NZ8MGQ8"
export const PREMIUM_CATEGORY_ID = "pcat_01KD8CKD5Y31RHVWR8FNRVD78J"
export const SILVER_CATEGORY_ID = "pcat_01KH6BBGRVY2DR3259SDTKW116"
export const ACCESSORIES_CATEGORY_ID = "pcat_01KGMKRAGX1Z6Z78C1T3M1VGYR"

// 🏷️ New Tier Tags
export const TIER_1_TAG_ID = "ptag_01KFWX61AE6Y7JRTZS571Y9ZQ6" // 2 Fantasy required
export const TIER_2_TAG_ID = "ptag_01KFWX6CGNMXH7K0BG849V70MD" // 1 Fantasy required
export const TIER_3_TAG_ID = "ptag_01KFWX79K93QV5ZKG3T6NB8E0T" // 0.5 Fantasy required

export type HotWheelsRuleResult = {
    licensedCount: number
    fantasyCount: number
    premiumCount: number
    silverCount: number
    totalCount: number
    missingFantasy: number
    missingMainlinesForPremium: number
    missingFantasyForSilver: number
    canCheckout: boolean
    restrictionMessage: string | null
}

export async function evaluateHotWheelsRule(
    cart: HttpTypes.StoreCart | null
): Promise<HotWheelsRuleResult> {
    const isMainlineRuleEnabled = true
    const isPremiumRuleEnabled = false
    const isSilverRuleEnabled = true

    // ⚙️ QUANTITY LIMITS
    const MAX_ITEMS_ALLOWED = 100
    const MIN_ITEMS_ALLOWED = 0 // 🆕 Minimum items required to checkout

    let licensedCount = 0
    let fantasyCount = 0
    let premiumCount = 0
    let silverCount = 0
    let totalCount = 0

    // 📊 Tier Counters
    let tier1Count = 0
    let tier2Count = 0
    let tier3Count = 0

    let hasInvalidQuantity = false

    if (cart?.items) {
        for (const item of cart.items) {
            const quantity = item.quantity || 0
            totalCount += quantity

            const product = (item as any).product
            const categories = product?.categories ?? []
            const categoryIds = categories.map((c: any) => c.id)

            // Get Tags safely
            const tags = product?.tags ?? []
            const tagIds = tags.map((t: any) => t.id)

            const isFantasy = categoryIds.includes(FANTASY_CATEGORY_ID)
            const isLicensed = categoryIds.includes(LICENSED_CATEGORY_ID)
            const isSilver = categoryIds.includes(SILVER_CATEGORY_ID)

            // 🚫 HARD RULE: Only Licensed cars are strictly limited to Qty 1
            if (isLicensed && quantity > 1) {
                hasInvalidQuantity = true
            }

            if (isFantasy) {
                fantasyCount += quantity
            }

            if (categoryIds.includes(PREMIUM_CATEGORY_ID)) {
                premiumCount += quantity
            }

            if (isSilver) {
                silverCount += quantity
            }

            // 🚗 Licensed Logic with Tiers
            if (isLicensed) {
                licensedCount += quantity

                if (tagIds.includes(TIER_1_TAG_ID)) {
                    tier1Count += quantity
                } else if (tagIds.includes(TIER_2_TAG_ID)) {
                    tier2Count += quantity
                } else if (tagIds.includes(TIER_3_TAG_ID)) {
                    tier3Count += quantity
                } else {
                    // Fallback: If Licensed but no Tag, treat as Tier 3 (Standard)
                    tier3Count += quantity
                }
            }
        }
    }

    // Initialize "waterfall" variables
    let fantasyExtra = fantasyCount

    // 🔑 PREMIUM RULE (Consumes Fantasy First)
    let missingMainlinesForPremium = 0

    if (isPremiumRuleEnabled && premiumCount > 0) {
        const requiredFantasyForPremium = premiumCount * 2

        missingMainlinesForPremium = Math.max(
            0,
            requiredFantasyForPremium - fantasyCount
        )

        const fantasyUsed = Math.min(fantasyCount, requiredFantasyForPremium)
        fantasyExtra -= fantasyUsed
    }

    // 🔑 SILVER RULE (Consumes Fantasy Next)
    let missingFantasyForSilver = 0

    if (isSilverRuleEnabled && silverCount > 0) {
        const requiredFantasyForSilver = Math.ceil(silverCount * 1)

        missingFantasyForSilver = Math.max(
            0,
            requiredFantasyForSilver - fantasyExtra
        )

        const fantasyUsedForSilver = Math.min(fantasyExtra, requiredFantasyForSilver)
        fantasyExtra -= fantasyUsedForSilver
    }

    // 🔑 LICENSED TIER RULE (Consumes Remaining Fantasy)
    let missingFantasy = 0

    if (isMainlineRuleEnabled) {
        const requiredForTier1 = tier1Count * 1
        const requiredForTier2 = Math.floor(tier2Count * 0.5)
        const requiredForTier3 = Math.floor(tier3Count * 0)

        const totalFantasyRequiredForLicensed = requiredForTier1 + requiredForTier2 + requiredForTier3

        missingFantasy = Math.max(0, totalFantasyRequiredForLicensed - fantasyExtra)
    }

    // 🔑 QUANTITY RULES
    const isBulkOrder = totalCount > MAX_ITEMS_ALLOWED
    const isBelowMinimum = totalCount < MIN_ITEMS_ALLOWED // 🆕 Check minimum

    const canCheckout =
        !hasInvalidQuantity &&
        !isBulkOrder &&
        !isBelowMinimum && // 🆕 Added validation
        (!isMainlineRuleEnabled || missingFantasy === 0) &&
        (!isPremiumRuleEnabled || missingMainlinesForPremium === 0) &&
        (!isSilverRuleEnabled || missingFantasyForSilver === 0)

    const messages: string[] = []

    if (isBulkOrder) {
        messages.push(
            `You have ${totalCount} items. For orders with more than ${MAX_ITEMS_ALLOWED} items, please contact us for bulk orders.`
        )
    } else if (isBelowMinimum) { // 🆕 Message
        messages.push(
            `Minimum order quantity is ${MIN_ITEMS_ALLOWED} items. Please add ${MIN_ITEMS_ALLOWED - totalCount} more item(s) to checkout.`
        )
    } else {
        if (hasInvalidQuantity) {
            messages.push(
                "Licensed cars are limited to 1 per item. Please reduce quantity for these items."
            )
        }

        if (isPremiumRuleEnabled && missingMainlinesForPremium > 0) {
            messages.push(
                `Add ${missingMainlinesForPremium} more Fantasy car${missingMainlinesForPremium === 1 ? "" : "s"
                } for your Premium items.`
            )
        }

        if (isSilverRuleEnabled && missingFantasyForSilver > 0) {
            messages.push(
                `Add ${missingFantasyForSilver} more Fantasy car${missingFantasyForSilver === 1 ? "" : "s"
                } for your Silver Series items.`
            )
        }

        if (isMainlineRuleEnabled && missingFantasy > 0) {
            messages.push(
                `Add ${missingFantasy} more Fantasy car${missingFantasy === 1 ? "" : "s"} for your Licensed Mainlines.`
            )
        }
    }

    return {
        licensedCount,
        fantasyCount,
        premiumCount,
        silverCount,
        totalCount,
        missingFantasy,
        missingMainlinesForPremium,
        missingFantasyForSilver,
        canCheckout,
        restrictionMessage: messages.length ? messages.join(" ") : null,
    }
}