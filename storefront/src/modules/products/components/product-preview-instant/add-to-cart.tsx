"use client"

import { useTransition } from "react"
import { Button } from "@medusajs/ui"
import { addToCart } from "@lib/data/cart"


type QuickAddToCartButtonProps = {
    productId: string
    variantId?: string
    disabled?: boolean
    countryCode: string
}

/**
 * A small "Add to cart" button that adds 1 qty of the given variant.
 * Assumes you already have an `addToCart` server action or helper.
 */
export default function QuickAddToCartButton({
    productId,
    variantId,
    disabled,
    countryCode
}: QuickAddToCartButtonProps) {
    const [isPending, startTransition] = useTransition()

    const handleAdd = () => {
        if (!variantId) return

        startTransition(async () => {
            try {
                await addToCart({
                    variantId: variantId,
                    quantity: 1,
                    countryCode,
                })
                // Optional: you can show a toast or refresh cart here
            } catch (e) {
                console.error("Failed to add to cart", e)
            }
        })
    }

    return (
        <Button
            size="small"
            variant="secondary"
            onClick={handleAdd}
            disabled={disabled || isPending || !variantId}
            className="w-full"
        >
            {isPending ? "Adding..." : "Add to cart"}
        </Button>
    )
}