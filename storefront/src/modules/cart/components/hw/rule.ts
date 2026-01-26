// src/modules/cart/lib/hotwheels-rule.ts
import { HttpTypes } from "@medusajs/types"

export const LICENSED_CATEGORY_ID = "pcat_01KC3X8VFE8G7XBNYMVC1RSYEK"
export const FANTASY_CATEGORY_ID = "pcat_01KC3ZZ9RWEQ12WS8B2NZ8MGQ8"
export const PREMIUM_CATEGORY_ID = "pcat_01KD8CKD5Y31RHVWR8FNRVD78J"

// 🏷️ New Tier Tags
export const TIER_1_TAG_ID = "ptag_01KFWX61AE6Y7JRTZS571Y9ZQ6" // 2 Fantasy required
export const TIER_2_TAG_ID = "ptag_01KFWX6CGNMXH7K0BG849V70MD" // 1 Fantasy required
export const TIER_3_TAG_ID = "ptag_01KFWX79K93QV5ZKG3T6NB8E0T" // 0.5 Fantasy required

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

            // 🚫 HARD RULE: Non-Fantasy max quantity = 1
            if (!isFantasy && quantity > 1) {
                hasInvalidQuantity = true
            }

            if (isFantasy) {
                fantasyCount += quantity
            }

            if (categoryIds.includes(PREMIUM_CATEGORY_ID)) {
                premiumCount += quantity
            }

            // 🚗 Licensed Logic with Tiers
            if (categoryIds.includes(LICENSED_CATEGORY_ID)) {
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
    // Requirement: 2 Fantasy per 1 Premium
    let missingMainlinesForPremium = 0

    if (isPremiumRuleEnabled && premiumCount > 0) {
        const requiredFantasyForPremium = premiumCount * 2

        missingMainlinesForPremium = Math.max(
            0,
            requiredFantasyForPremium - fantasyCount
        )

        // Deduct used fantasy cars from the pool
        const fantasyUsed = Math.min(fantasyCount, requiredFantasyForPremium)
        fantasyExtra -= fantasyUsed
    }

    // 🔑 LICENSED TIER RULE (Consumes Remaining Fantasy)
    let missingFantasy = 0

    if (isMainlineRuleEnabled) {
        // Calculate total fantasy needed based on tiers
        const requiredForTier1 = tier1Count * 2
        const requiredForTier2 = tier2Count * 1

        // Tier 3 is 0.5 per car (1 per 2 cars), using Math.round()
        // Note: Math.round(0.5) is 1 in JS. Math.round(1.5) is 2.
        const requiredForTier3 = Math.floor(tier3Count * 0.5)

        const totalFantasyRequiredForLicensed = requiredForTier1 + requiredForTier2 + requiredForTier3

        // Check against remaining fantasy cars (after Premium rule)
        missingFantasy = Math.max(0, totalFantasyRequiredForLicensed - fantasyExtra)
    }

    // 🔑 BULK ORDER RULE
    const isBulkOrder = totalCount > MAX_ITEMS_ALLOWED

    const canCheckout =
        !hasInvalidQuantity &&
        !isBulkOrder &&
        (!isMainlineRuleEnabled || missingFantasy === 0) &&
        (!isPremiumRuleEnabled || missingMainlinesForPremium === 0)

    const messages: string[] = []

    if (isBulkOrder) {
        messages.push(
            `You have ${totalCount} items. For orders with more than ${MAX_ITEMS_ALLOWED} items, please contact us for bulk orders.`
        )
    } else {
        if (hasInvalidQuantity) {
            messages.push(
                "Only Fantasy cars can be purchased with quantity more than 1. Please reduce quantity for other items."
            )
        }

        if (isPremiumRuleEnabled && missingMainlinesForPremium > 0) {
            messages.push(
                `Add ${missingMainlinesForPremium} more Fantasy car${missingMainlinesForPremium === 1 ? "" : "s"
                } for your Premium items (2 Fantasy required per Premium car).`
            )
        }

        if (isMainlineRuleEnabled && missingFantasy > 0) {
            messages.push(
                `Add ${missingFantasy} more Fantasy car${missingFantasy === 1 ? "" : "s"}.`
            )

            if (tier1Count > 0 || tier2Count > 0) {
                messages.push(`(High-demand cars require 1-2 Fantasy cars each)`)
            }
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