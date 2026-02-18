"use client"

import { useEffect, useState } from "react"
import { Button, Text, Container, clx, Heading } from "@medusajs/ui"
import { getSubscriptionStatus, cancelSubscription } from "@lib/data/club"
import Link from "next/link"
// Define type locally if not exported from lib, or import it
export type SubscriptionStatus = {
    active: boolean
    status: string
    plan_name: string
    next_billing_at: number | null
    current_end: number | null
    short_url?: string
}

export default function MembershipCard() {
    const [sub, setSub] = useState<SubscriptionStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [cancelling, setCancelling] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 1. Fetch Status on Load
    useEffect(() => {
        let isMounted = true
        async function load() {
            try {
                // @ts-ignore - Ignore type issues if your server action return type varies slightly
                const res = await getSubscriptionStatus()

                if (isMounted) {
                    if (res && res.success && res.data) {
                        setSub(res.data)
                    } else {
                        // If success is false, it might just mean no subscription exists
                        setSub(null)
                    }
                }
            } catch (err) {
                console.error("Failed to load subscription:", err)
                if (isMounted) setError("Could not load membership details.")
            } finally {
                if (isMounted) setLoading(false)
            }
        }
        load()
        return () => { isMounted = false }
    }, [])

    // 2. Handle Cancellation
    const handleCancel = async () => {
        if (!confirm("Are you sure you want to stop auto-renewal? You will keep access until your current period ends.")) return

        setCancelling(true)
        try {
            // @ts-ignore
            const res = await cancelSubscription()

            if (res && res.success) {
                // Optimistic UI update or Reload
                alert("Subscription cancelled successfully.")
                window.location.reload()
            } else {
                alert(res?.error || "Could not cancel subscription. Please try again.")
            }
        } catch (err) {
            alert("An error occurred while cancelling.")
        } finally {
            setCancelling(false)
        }
    }

    // ---------------- UI STATES ----------------

    // Loading State
    if (loading) {
        return (
            <div className="w-full h-48 bg-ui-bg-subtle animate-pulse rounded-lg border border-ui-border-base p-6 flex flex-col gap-4">
                <div className="h-6 w-1/3 bg-ui-bg-base rounded" />
                <div className="h-4 w-1/2 bg-ui-bg-base rounded" />
                <div className="mt-auto h-10 w-32 bg-ui-bg-base rounded" />
            </div>
        )
    }

    // Error State
    if (error) {
        return (
            <Container className="p-6 bg-red-50 border-red-200">
                <Text className="text-red-600 mb-2">Error loading membership</Text>
                <Button variant="secondary" onClick={() => window.location.reload()}>Retry</Button>
            </Container>
        )
    }

    // State A: No Active Subscription (or expired)
    if (!sub || (!sub.active && sub.status !== "cancelled")) {
        return (
            <Container className="p-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-ui-bg-subtle border-ui-border-base">
                <div>
                    <Heading level="h2" className="text-xl font-semibold mb-2">Checkered Club</Heading>
                    <Text className="text-ui-fg-subtle">
                        Join the exclusive club for discounts, early access, and free shipping.
                    </Text>
                </div>
                <Link href="/club">
                    <Button variant="primary" className="whitespace-nowrap">
                        Join the Club
                    </Button>
                </Link>
            </Container>
        )
    }

    // Helper variables for logic
    const isActive = sub.status === "active" || sub.status === "authenticated"
    const isCancelled = sub.status === "cancelled" || sub.status === "cancelled_will_expire"

    // Date formatting
    const nextDate = sub.next_billing_at
        ? new Date(sub.next_billing_at).toLocaleDateString(undefined, { dateStyle: 'long' })
        : null

    const endDate = sub.current_end
        ? new Date(sub.current_end).toLocaleDateString(undefined, { dateStyle: 'long' })
        : null

    // State B: Active or Cancelled-but-valid Subscription
    return (
        <Container className={clx(
            "p-6 border rounded-lg transition-colors",
            isActive ? "bg-ui-bg-base border-ui-border-strong" : "bg-ui-bg-subtle border-ui-border-base"
        )}>
            <div className="flex flex-col md:flex-row justify-between gap-6">

                {/* Left Side: Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <Heading level="h3" className="text-lg font-bold text-ui-fg-base">
                            {sub.plan_name || "Club Membership"}
                        </Heading>
                        <span className={clx(
                            "px-2.5 py-0.5 text-xs font-medium rounded-full border",
                            isActive
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-orange-50 text-orange-700 border-orange-200"
                        )}>
                            {isActive ? "Auto-Renewing" : "Cancels Soon"}
                        </span>
                    </div>

                    <div className="space-y-1">
                        <Text className="text-ui-fg-subtle text-sm">
                            Status: <span className="font-medium capitalize text-ui-fg-base">{sub.status.replace(/_/g, " ")}</span>
                        </Text>

                        {isActive && nextDate && (
                            <Text className="text-ui-fg-subtle text-sm">
                                Renews on: <span className="font-medium text-ui-fg-base">{nextDate}</span>
                            </Text>
                        )}

                        {isCancelled && endDate && (
                            <Text className="text-ui-fg-subtle text-sm">
                                Access valid until: <span className="font-medium text-ui-fg-base">{endDate}</span>
                            </Text>
                        )}
                    </div>
                </div>

                {/* Right Side: Actions */}
                <div className="flex items-start gap-3">
                    {isActive ? (
                        <Button
                            variant="danger"
                            size="small"
                            onClick={handleCancel}
                            isLoading={cancelling}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                        >
                            Cancel Membership
                        </Button>
                    ) : (
                        <Link href="/club">
                            <Button
                                variant="secondary"
                                size="small"
                            >
                                Re-activate Plan
                            </Button>
                        </Link>
                    )}

                    {sub.short_url && isActive && (
                        <Link href={sub.short_url}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Button
                                variant="secondary"
                                size="small"
                            >
                                Update Payment Method
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </Container>
    )
}