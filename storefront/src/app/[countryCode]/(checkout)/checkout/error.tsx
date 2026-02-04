"use client"

import { useEffect, useTransition } from "react"
import { Button, Heading, Text } from "@medusajs/ui"
import { ExclamationCircleSolid } from "@medusajs/icons"
import Link from "next/link"

export default function CheckoutError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        console.error("Checkout Error:", error)
    }, [error])

    const handleReset = () => {
        startTransition(() => {
            window.location.reload()
        })
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-y-4 text-center p-4">
            <ExclamationCircleSolid className="text-ui-fg-error" />

            <Heading level="h2" className="text-xl">
                Unable to load checkout
            </Heading>

            <Text className="text-ui-fg-subtle max-w-[400px]">
                We encountered an issue preparing your checkout. Please try again or go back to your cart.
            </Text>

            <div className="flex items-center gap-x-2 mt-4">
                <Link href="/cart">
                    <Button variant="secondary">
                        Back to Cart
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