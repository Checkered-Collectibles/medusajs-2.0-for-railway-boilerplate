"use client"

import { useEffect, useRef } from "react"
import { usePostHog } from "posthog-js/react"
import type { HttpTypes } from "@medusajs/types"

type Props = {
    customer: HttpTypes.StoreCustomer | null
    registerProps?: Record<string, any>
    debug?: boolean
}

export default function PostHogCustomerIdentityClient({
    customer,
    registerProps,
    debug = false,
}: Props) {
    const posthog = usePostHog()
    const lastIdentifiedIdRef = useRef<string | null>(null)
    const resetOnceRef = useRef(false)

    useEffect(() => {
        if (!posthog) return
        if (debug) posthog.debug()

        // Super properties (optional)
        if (registerProps && Object.keys(registerProps).length > 0) {
            posthog.register(registerProps)
        }

        const customerId = customer?.id ? String(customer.id) : null

        if (customerId) {
            // Alias anon -> known once (merge pre-login events)
            const currentDistinctId = posthog.get_distinct_id?.()
            if (
                currentDistinctId &&
                currentDistinctId !== customerId &&
                lastIdentifiedIdRef.current !== customerId
            ) {
                try {
                    // Important: alias BEFORE identify
                    posthog.alias(customerId)
                } catch {
                    /* no-op */
                }
            }

            // Identify user
            posthog.identify(customerId, {
                email: customer?.email ?? undefined,
                first_name: (customer as any)?.first_name ?? undefined,
                last_name: (customer as any)?.last_name ?? undefined,
                phone: (customer as any)?.phone ?? undefined,
            })

            lastIdentifiedIdRef.current = customerId
            resetOnceRef.current = false
        } else {
            // Signed out
            if (!resetOnceRef.current) {
                posthog.reset()
                lastIdentifiedIdRef.current = null
                resetOnceRef.current = true
            }
        }
    }, [posthog, customer, debug, registerProps])

    return null
}