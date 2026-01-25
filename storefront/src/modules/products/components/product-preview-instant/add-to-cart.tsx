"use client"

import { Button } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { useAddToCart } from "@lib/hooks/use-add-to-cart"

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
    // 1. Use the custom hook instead of useTransition
    const { add, isAdding } = useAddToCart()

    // ✅ EXACT same stock logic as ProductActions.tsx
    const isInStock = (() => {
        if (variant && !variant.manage_inventory) {
            return true
        }
        if (variant?.allow_backorder) {
            return true
        }
        if (variant?.manage_inventory && (variant?.inventory_quantity || 0) > 0) {
            return true
        }
        return false
    })()

    const handleAdd = () => {
        if (!variant?.id) return
        if (!isInStock) return

        // 2. Call the centralized 'add' function
        // This handles both the Server Action AND the Pixel Tracking
        add({
            variantId: variant.id,
            quantity: 1,
            countryCode,
            productInfo: {
                productId: productId,
                title: variant.product?.title || variant.title || "Undefined Title",
                value: variant.calculated_price?.calculated_amount || 0,
                currency: "INR"
            }
        })
    }

    // 3. Update loading/disabled state to use 'isAdding' from the hook
    const finalDisabled = !!disabled || isAdding || !variant?.id || !isInStock

    return (
        <Button
            size="small"
            variant="secondary"
            onClick={handleAdd}
            disabled={finalDisabled}
            className={`w-full duration-0 ${!isInStock ? 'bg-white text-black' : 'md:group-hover/item:bg-black md:group-hover/item:text-white md:hover:opacity-80'}`}
            isLoading={isAdding} // 👈 Updated here
            data-testid="quick-add-to-cart"
        >
            {!variant?.id ? "Unavailable" : !isInStock ? "Out of stock" : "Add to cart"}
        </Button>
    )
}