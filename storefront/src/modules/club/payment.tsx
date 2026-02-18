"use client"

import { useState } from "react"
import { useRazorpay } from "react-razorpay"
import { Button } from "@medusajs/ui"
import { initiateSubscription } from "@lib/data/club"
import { StoreCustomer } from "@medusajs/types"
import { redirect } from "next/navigation"

// 👇 1. Define the correct shape for Subscription Options
interface RazorpaySubscriptionOptions {
    key: string;
    subscription_id: string;
    name: string;
    description?: string;
    image?: string;
    handler: (response: any) => void;
    theme?: { color: string };
    modal?: { ondismiss: () => void };
    // 👇 Prefill is an object type, values are passed later
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
}

type Props = {
    variantId: string
    price: number
    customer: StoreCustomer | null
}

export default function SubscribeButton({ variantId, price, customer }: Props) {
    const [loading, setLoading] = useState(false)
    const { Razorpay } = useRazorpay();

    const handleSubscribe = async () => {
        setLoading(true)
        if (!customer) redirect('/account?nextPath=/club')

        try {
            // 2. Server Action
            const response = await initiateSubscription(variantId)

            if (!response.success || !response.data) {
                throw new Error(response.error)
            }

            const { subscription_id, key_id } = response.data

            // 3. Configure Options (Typed correctly now)
            const options: RazorpaySubscriptionOptions = {
                key: key_id,
                subscription_id: subscription_id,
                name: "Checkered Club",
                description: "Diecast Store Membership Access",
                image: "https://checkered-assets.sgp1.cdn.digitaloceanspaces.com/manual-uploads/logo-notext2.png",

                handler: (response: any) => {
                    // Success: Redirect
                    window.location.href = "/store?inStock=true&club=true"
                },

                theme: {
                    color: "#000000",
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false)
                        console.log("Payment cancelled by user")
                    }
                },
                prefill: {
                    name: customer?.first_name + " " + customer?.last_name,
                    email: customer?.email,
                    contact: customer?.phone || ""
                },

            }

            // 4. Open Modal
            // ⚠️ FIX: Cast to 'any' to bypass the strict 'RazorpayOrderOptions' check
            const rzp = new Razorpay(options as any)
            rzp.open()

        } catch (err: any) {
            // alert(err.message || "Something went wrong")
            console.error(err)
            setLoading(false)
        }
    }

    return (
        <Button
            variant="primary"
            onClick={handleSubscribe}
            isLoading={loading}
            className="w-full"
        >
            {loading ? "Processing..." : `Subscribe Now - ₹${price}`}
        </Button>
    )
}