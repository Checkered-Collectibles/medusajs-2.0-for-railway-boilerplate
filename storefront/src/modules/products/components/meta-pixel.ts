"use client"

import { useEffect, useRef } from "react"
import { metaEvent } from "@lib/meta/fpixel"
import { HttpTypes } from "@medusajs/types"

type Props = {
    product: HttpTypes.StoreProduct
    region: HttpTypes.StoreRegion
}

export const ViewContentTracker = ({ product, region }: Props) => {
    const fired = useRef(false)

    useEffect(() => {
        if (product?.id && !fired.current) {
            fired.current = true

            // Get the first variant (default)
            const variant = product.variants?.[0]
            const price = variant?.calculated_price?.calculated_amount || 0
            const currency = variant?.calculated_price?.currency_code?.toUpperCase() || region.currency_code.toUpperCase()

            metaEvent("ViewContent", {
                content_name: product.title,
                // 👇 CHANGE: Strictly use the Variant ID
                content_ids: [variant?.id],
                content_type: "product",
                value: price,
                currency: currency,
            })
        }
    }, [product, region])

    return null
}