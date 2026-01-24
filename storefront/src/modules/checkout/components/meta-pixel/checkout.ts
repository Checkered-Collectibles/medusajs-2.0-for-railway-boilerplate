"use client"

import { useEffect } from "react"
import { metaEvent } from "@lib/meta/fpixel"
import { HttpTypes } from "@medusajs/types"

type Props = {
    cart: HttpTypes.StoreCart
}

export const CheckoutTracker = ({ cart }: Props) => {
    useEffect(() => {
        if (cart?.items?.length) {
            // Calculate total value (Medusa amounts are usually in cents)
            const value = cart.total ? cart.total / 100 : 0

            metaEvent("InitiateCheckout", {
                content_ids: cart.items.map((item) => item.variant_id),
                content_type: "product",
                currency: cart.region?.currency_code?.toUpperCase(),
                value: value,
                num_items: cart.items.reduce((acc, item) => acc + item.quantity, 0),
            })
        }
    }, [cart])

    return null // This component renders nothing visually
}
