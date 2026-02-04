"use client"

import { useEffect, useTransition } from "react"
import { Button, Heading, Text } from "@medusajs/ui"
import { ExclamationCircleSolid } from "@medusajs/icons"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        // Log fatal homepage errors
        console.error("Homepage Fatal Error:", error)
    }, [error])

    const handleReset = () => {
        startTransition(() => {
            window.location.reload()
        })
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-y-6 text-center p-8">
            <ExclamationCircleSolid className="text-ui-fg-error" />
            <div className="space-y-2">
                <Heading level="h1" className="text-2xl">
                    Something went wrong
                </Heading>

                <Text className="text-ui-fg-subtle max-w-[500px] mx-auto">
                    We are currently experiencing technical difficulties with our storefront.
                    Please try refreshing the page or come back later.
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

