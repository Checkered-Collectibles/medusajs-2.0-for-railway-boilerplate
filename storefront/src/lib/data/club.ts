
"use server"

import { sdk } from "@lib/config"
import { getCustomer } from "./customer" // Import your existing customer fetcher
import { getAuthHeaders } from "./cookies"
import { getCustomerGroups } from "./customer";

// Define the shape of the status response
export type SubscriptionStatus = {
    active: boolean
    status: string // 'active' | 'authenticated' | 'cancelled' | 'halted' | 'expired'
    plan_name: string
    next_billing_at: number | null
    current_end: number | null
    short_url?: string
    subscription_id?: string
}

const CLUB_GROUP_ID = "cusgroup_01KHQVQYE2RX2JNZFZ4PYY6RPJ"

export const checkClubMember = async (): Promise<boolean> => {
    const customerGroups = await getCustomerGroups().catch(() => null)
    return !!customerGroups && customerGroups.some((g) => g.id === CLUB_GROUP_ID)
}

export async function initiateSubscription(variantId: string) {
    try {
        // 1. Ensure User is Logged In
        const customer = await getCustomer()

        if (!customer) {
            return { success: false, error: "You must be logged in to subscribe." }
        }

        // 2. Call your Custom Backend Route
        // We pass the variant_id so the backend knows which Plan ID to map to
        const result = await sdk.client.fetch<{
            subscription_id: string
            key_id: string
        }>("/store/custom/club/subscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(), // Pass auth headers just in case
            },
            body: {
                customer_id: customer.id,
                variant_id: variantId,
            },
        })

        return { success: true, data: result }

    } catch (error: any) {
        console.error("Subscription Error:", error)
        return {
            success: false,
            error: error.message || "Failed to initiate subscription. Please try again."
        }
    }
}

/**
 * Fetches the current subscription status for the logged-in user.
 */
export async function getSubscriptionStatus() {
    try {
        const customer = await getCustomer()

        if (!customer) {
            return { success: false, error: "Not logged in" }
        }

        // Call our custom API route
        const status = await sdk.client.fetch<SubscriptionStatus>(
            `/store/custom/club/status?customer_id=${customer.id}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
            }
        )

        return { success: true, data: status }
    } catch (error: any) {
        console.error("Fetch Status Error:", error)
        return {
            success: false,
            error: "Could not fetch subscription details."
        }
    }
}

/**
 * Cancels the active subscription for the logged-in user.
 * This stops auto-renewal immediately.
 */
export async function cancelSubscription() {
    try {
        const customer = await getCustomer()

        if (!customer) {
            return { success: false, error: "Not logged in" }
        }

        const result = await sdk.client.fetch<{ success: boolean; message: string }>(
            "/store/custom/club/cancel",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
                body: {
                    customer_id: customer.id,
                },
            }
        )

        return { success: true, message: result.message }

    } catch (error: any) {
        console.error("Cancel Error:", error)
        return {
            success: false,
            error: error.message || "Failed to cancel subscription."
        }
    }
}