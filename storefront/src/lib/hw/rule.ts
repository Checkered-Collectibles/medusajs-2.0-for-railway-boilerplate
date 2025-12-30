// src/modules/cart/lib/hotwheels-rule.ts
import PostHogClient, { getServerSidePostHogDistinctId } from "@lib/posthog/server"
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

    const distinctId = await getServerSidePostHogDistinctId();
    // Feature flags
    const isMainlineRuleEnabled = await PostHogClient.isFeatureEnabled(
        "hw-mainline-rule",
        distinctId ?? ""
    )
    const isPremiumRuleEnabled = await PostHogClient.isFeatureEnabled(
        "hw-premium-rule",
        distinctId ?? ""
    )

    let licensedCount = 0
    let fantasyCount = 0
    let premiumCount = 0

    if (cart?.items) {
        for (const item of cart.items) {
            const quantity = item.quantity || 0
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

    const mainlineCount = licensedCount + fantasyCount

    let missingMainlinesForPremium = 0
    let licensedExtra = licensedCount
    let fantasyExtra = fantasyCount

    // 🔑 PREMIUM RULE (flag: hw-premium-rule)
    // 1 Mainline (Licensed or Fantasy) per Premium
    if (isPremiumRuleEnabled && premiumCount > 0) {
        const requiredMainlinesForPremium = premiumCount * 1

        missingMainlinesForPremium = Math.max(
            0,
            requiredMainlinesForPremium - mainlineCount
        )

        // Allocate mainlines toward premium requirement
        if (requiredMainlinesForPremium > 0 && mainlineCount > 0) {
            const neededForPremium = Math.min(
                requiredMainlinesForPremium,
                mainlineCount
            )

            const licensedUsedForPremium = Math.min(licensedCount, neededForPremium)
            const remainingNeeded = neededForPremium - licensedUsedForPremium
            const fantasyUsedForPremium = Math.min(fantasyCount, remainingNeeded)

            licensedExtra = licensedCount - licensedUsedForPremium
            fantasyExtra = fantasyCount - fantasyUsedForPremium
        }
    }

    // 🔑 MAINLINE RULE (flag: hw-mainline-rule)
    // 1 Fantasy required for every 2 extra Licensed cars
    let missingFantasy = 0
    if (isMainlineRuleEnabled) {
        const requiredFantasy = Math.floor(licensedExtra / 2)
        missingFantasy = Math.max(0, requiredFantasy - fantasyExtra)
    }

    const canCheckout =
        (!isMainlineRuleEnabled || missingFantasy === 0) &&
        (!isPremiumRuleEnabled || missingMainlinesForPremium === 0)

    const messages: string[] = []

    if (isMainlineRuleEnabled && missingFantasy > 0) {
        messages.push(
            `Add ${missingFantasy} Fantasy car${missingFantasy === 1 ? "" : "s"
            } (1 required per 2 extra Licensed cars).`
        )
    }

    if (isPremiumRuleEnabled && missingMainlinesForPremium > 0) {
        messages.push(
            `Add ${missingMainlinesForPremium} more mainline car${missingMainlinesForPremium === 1 ? "" : "s"
            } (1 Licensed/Fantasy mainline required per Premium car).`
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