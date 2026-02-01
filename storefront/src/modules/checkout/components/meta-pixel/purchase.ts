"use client"

import { useEffect, useRef } from "react"
import { metaEvent } from "@lib/meta/fpixel"
import { HttpTypes } from "@medusajs/types"

type Props = {
    order: HttpTypes.StoreOrder
}

export const PurchaseTracker = ({ order }: Props) => {
    const fired = useRef(false)

    useEffect(() => {
        if (order?.id && !fired.current) {
            fired.current = true // 🛡️ Prevent double-firing in React Strict Mode

            // Medusa amounts are in cents (e.g., 1000 = 10.00), Pixel needs float
            const value = order.total

            metaEvent("Purchase", {
                content_ids: order.items?.map((item) => item.variant_id) || [],
                content_type: "product",
                currency: order.currency_code?.toUpperCase(),
                value: value,
                num_items: order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0,
                order_id: order.id, // Helpful for deduplication matching
                event_id: order.id
            })
        }
    }, [order])

    return null
}