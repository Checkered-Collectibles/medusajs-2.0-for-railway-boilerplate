"use client"

import { useEffect, useTransition } from "react"
import { Button, Heading, Text } from "@medusajs/ui"
import { ExclamationCircleSolid } from "@medusajs/icons"
import Link from "next/link"

export default function ProductError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        console.error("Product Page Error:", error)
    }, [error])

    const handleReset = () => {
        startTransition(() => {
            // Attempts to re-render the segment
            window.location.reload()
            reset()
        })
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-y-4 text-center p-4">
            <ExclamationCircleSolid className="text-ui-fg-error" />

            <Heading level="h2" className="text-xl">
                Error loading product
            </Heading>

            <Text className="text-ui-fg-subtle max-w-[400px]">
                We couldn't load the details for this product. This might be a temporary connection issue.
            </Text>

            <div className="flex items-center gap-x-2 mt-4">
                <Link href="/store">
                    <Button variant="secondary">
                        Back to Store
                    </Button>
                </Link>

                <Button
                    onClick={handleReset}
                    isLoading={isPending}
                >
                    Try Again
                </Button>
            </div>
        </div>
    )
}