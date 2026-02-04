"use client"

import { useEffect, useTransition } from "react"
import { Button, Heading, Text } from "@medusajs/ui"
import { ExclamationCircleSolid } from "@medusajs/icons"
import Link from "next/link"

export default function CategoryError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        console.error("Category Page Error:", error)
    }, [error])

    const handleReset = () => {
        startTransition(() => {
            // Re-tries rendering the category segment
            window.location.reload()
        })
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-y-4 text-center p-8">
            <ExclamationCircleSolid className="text-ui-fg-error" />

            <div className="space-y-2">
                <Heading level="h2" className="text-xl">
                    Unable to load category
                </Heading>

                <Text className="text-ui-fg-subtle max-w-[400px] mx-auto">
                    We couldn't load the items in this category. It may have been moved or is temporarily unavailable.
                </Text>
            </div>

            <div className="flex items-center gap-x-2 mt-4">
                <Link href="/store">
                    <Button variant="secondary" size="large">
                        View All Products
                    </Button>
                </Link>

                <Button
                    onClick={handleReset}
                    isLoading={isPending}
                    variant="primary"
                    size="large"
                >
                    Try Again
                </Button>
            </div>
        </div>
    )
}