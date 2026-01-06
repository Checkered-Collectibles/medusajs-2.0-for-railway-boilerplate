import { HttpTypes } from "@medusajs/types"

export type OutOfStockRuleResult = {
    outOfStockItems: Array<{
        id: string
        title: string
        requestedQuantity: number
        availableQuantity: number
    }>
    canCheckout: boolean
    restrictionMessage: string | null
}

export async function evaluateOutOfStockRule(
    cart: HttpTypes.StoreCart | null
): Promise<OutOfStockRuleResult> {
    const outOfStockItems: OutOfStockRuleResult["outOfStockItems"] = []

    if (cart?.items) {
        for (const item of cart.items) {
            const quantity = item.quantity || 0
            const title =
                item.title ||
                (item as any).product?.title ||
                "Item"

            const variant = (item as any).variant

            // If variant info is missing, be safe and block
            if (!variant) {
                outOfStockItems.push({
                    id: item.id,
                    title,
                    requestedQuantity: quantity,
                    availableQuantity: 0,
                })
                continue
            }

            const inventoryQuantity =
                typeof variant.inventory_quantity === "number"
                    ? variant.inventory_quantity
                    : 0

            const allowBackorder = Boolean(variant.allow_backorder)

            // If backorders allowed, skip stock check
            if (allowBackorder) {
                continue
            }

            // If requested > available → out of stock
            if (quantity > inventoryQuantity) {
                outOfStockItems.push({
                    id: item.id,
                    title,
                    requestedQuantity: quantity,
                    availableQuantity: inventoryQuantity,
                })
            }
        }
    }

    const canCheckout = outOfStockItems.length === 0

    let restrictionMessage: string | null = null

    if (!canCheckout) {
        const names = outOfStockItems.map((i) => `“${i.title}”`).join(", ")

        restrictionMessage =
            outOfStockItems.length === 1
                ? `${names} is out of stock. Please remove it from your cart to continue.`
                : `${names} are out of stock. Please remove them from your cart to continue.`
    }

    return {
        outOfStockItems,
        canCheckout,
        restrictionMessage,
    }
}