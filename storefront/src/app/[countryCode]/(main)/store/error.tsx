"use client"

import { useEffect, useTransition } from "react"
import { Button, Heading, Text } from "@medusajs/ui"
import { ExclamationCircleSolid } from "@medusajs/icons"

export default function StoreError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        console.error("Store Page Error:", error)
    }, [error])

    const handleReset = () => {
        startTransition(() => {
            // Re-tries rendering the store segment
            window.location.reload()
        })
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-y-4 text-center p-8">
            <ExclamationCircleSolid className="text-ui-fg-error" />

            <div className="space-y-2">
                <Heading level="h2" className="text-xl">
                    Unable to load products
                </Heading>

                <Text className="text-ui-fg-subtle max-w-[400px] mx-auto">
                    We encountered an error while retrieving the product catalog.
                    Please check your connection and try again.
                </Text>
            </div>

            <Button
                onClick={handleReset}
                isLoading={isPending}
                variant="primary"
                size="large"
            >
                Refresh Page
            </Button>
        </div>
    )
}