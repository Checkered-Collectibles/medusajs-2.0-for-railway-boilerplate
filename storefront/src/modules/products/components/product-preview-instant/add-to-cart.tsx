"use client"

import { useTransition } from "react"
import { Button } from "@medusajs/ui"
import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"

type QuickAddToCartButtonProps = {
    productId: string
    variant: HttpTypes.StoreProductVariant
    disabled?: boolean
    countryCode: string
}

export default function QuickAddToCartButton({
    productId,
    variant,
    disabled,
    countryCode,
}: QuickAddToCartButtonProps) {
    const [isPending, startTransition] = useTransition()

    // ✅ EXACT same stock logic as ProductActions.tsx
    const isInStock = (() => {
        // If we don't manage inventory, we can always add to cart
        if (variant && !variant.manage_inventory) {
            return true
        }

        // If we allow back orders on the variant, we can add to cart
        if (variant?.allow_backorder) {
            return true
        }

        // If there is inventory available, we can add to cart
        if (variant?.manage_inventory && (variant?.inventory_quantity || 0) > 0) {
            return true
        }
        console.log("VARIANT", variant.inventory_quantity)
        // Otherwise, we can't add to cart
        return false
    })()

    const handleAdd = () => {
        if (!variant?.id) return
        if (!isInStock) return

        startTransition(async () => {
            try {
                await addToCart({
                    variantId: variant.id,
                    quantity: 1,
                    countryCode,
                })
            } catch (e) {
                console.error("Failed to add to cart", e)
            }
        })
    }

    const finalDisabled = !!disabled || isPending || !variant?.id || !isInStock

    return (
        <Button
            size="small"
            variant="secondary"
            onClick={handleAdd}
            disabled={finalDisabled}
            className={`w-full`}
            isLoading={isPending}
            data-testid="quick-add-to-cart"
        >
            {!variant?.id ? "Unavailable" : !isInStock ? "Out of stock" : "Add to cart"}
        </Button>
    )
}