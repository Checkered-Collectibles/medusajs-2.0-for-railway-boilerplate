"use client"

import { useTransition } from "react"
import { Button } from "@medusajs/ui"
import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"

type QuickAddToCartButtonProps = {
    productId: string
    variant: HttpTypes.StoreProductVariant   // 👈 pass the whole variant
    disabled?: boolean
    countryCode: string
}

/**
 * A small "Add to cart" button that adds 1 qty of the given variant.
 * Checks if the variant is in stock before allowing add-to-cart.
 */
export default function QuickAddToCartButton({
    productId,
    variant,
    disabled,
    countryCode,
}: QuickAddToCartButtonProps) {
    const [isPending, startTransition] = useTransition()

    // ----- STOCK CHECK LOGIC -----
    const managesInventory = variant.manage_inventory ?? true
    const quantity = variant.inventory_quantity ?? 0
    const allowBackorder = (variant as any).allow_backorder ?? false

    const isInStock = managesInventory
        ? quantity > 0 || allowBackorder
        : true // if not managing inventory, treat as always available

    const handleAdd = () => {
        if (!variant.id || !isInStock) return

        startTransition(async () => {
            try {
                await addToCart({
                    variantId: variant.id,
                    quantity: 1,
                    countryCode,
                })
                // TODO: toast / cart refresh if you want
            } catch (e) {
                console.error("Failed to add to cart", e)
            }
        })
    }

    const finalDisabled =
        disabled || isPending || !variant.id || !isInStock

    return (
        <Button
            size="small"
            variant="secondary"
            onClick={handleAdd}
            disabled={finalDisabled}
            className="w-full"
        >
            {isPending
                ? "Adding..."
                : !isInStock
                    ? "Out of stock"
                    : "Add to cart"}
        </Button>
    )
}