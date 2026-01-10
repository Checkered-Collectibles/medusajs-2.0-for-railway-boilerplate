"use client"

import { useTransition } from "react"
import { Button } from "@medusajs/ui"
import { deleteCartCompletely } from "@lib/data/cart"


export function ResetCartButton() {
    const [isPending, startTransition] = useTransition()

    const handleResetCart = () => {
        startTransition(async () => {
            await deleteCartCompletely()
        })
    }

    return (
        <Button
            variant="secondary"
            className="h-10"
            onClick={handleResetCart}
            isLoading={isPending}
            data-testid="reset-cart-button"
        >
            {isPending ? "Resetting..." : "Reset cart"}
        </Button>
    )
}