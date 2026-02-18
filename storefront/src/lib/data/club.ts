
"use server"

import { sdk } from "@lib/config"
import { getCustomer } from "./customer" // Import your existing customer fetcher
import { getAuthHeaders } from "./cookies"
import { getCustomerGroups } from "./customer";

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