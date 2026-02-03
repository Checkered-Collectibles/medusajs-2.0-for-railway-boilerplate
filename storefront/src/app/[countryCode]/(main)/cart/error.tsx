"use client" // Error components must always be Client Components

import { useEffect, useTransition } from "react"
import { deleteCartCompletely } from "@lib/data/cart" // Import your Server Action
import { Button, Heading, Text } from "@medusajs/ui"
import { ExclamationCircleSolid } from "@medusajs/icons"

export default function CartError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        // Optional: Log the error to your analytics (Sentry, etc.)
        console.error("Cart Error Boundary Caught:", error)
    }, [error])

    const handleReset = () => {
        startTransition(async () => {
            // 1. Force delete the corrupted cart from the server/cookies
            await deleteCartCompletely()
            window.location.reload();
            // 2. Tell Next.js to re-render the page (which will now fetch a fresh, empty cart)
            reset()
        })
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-y-4 text-center p-4">
            <ExclamationCircleSolid className="text-ui-fg-error" />

            <Heading level="h2" className="text-xl">
                Something went wrong with your cart
            </Heading>

            <Text className="text-ui-fg-subtle max-w-[400px]">
                We encountered an error loading your items. This usually happens if a product in your cart was updated or removed.
            </Text>

            <Button
                onClick={handleReset}
                variant="secondary"
                isLoading={isPending}
                className="mt-4"
            >
                Reset Cart & Try Again
            </Button>
        </div>
    )
}