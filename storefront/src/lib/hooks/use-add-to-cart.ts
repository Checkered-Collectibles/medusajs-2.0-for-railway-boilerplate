"use client"

import { addToCart } from "@lib/data/cart"
import { metaEvent } from "@lib/meta/fpixel"
import { useState } from "react"

export const useAddToCart = () => {
    const [isAdding, setIsAdding] = useState(false)

    const handleAddToCart = async ({
        variantId,
        quantity,
        countryCode,
        productInfo
    }: {
        variantId: string
        quantity: number
        countryCode: string
        productInfo?: {
            title: string
            value: number
            currency: string
            productId: string // 👈 ADD THIS: We need the parent ID
        }
    }) => {
        setIsAdding(true)

        try {
            await addToCart({ variantId, quantity, countryCode })

            if (productInfo) {
                metaEvent("AddToCart", {
                    content_name: productInfo.title,
                    // 👇 CHANGE: Prioritize Parent ID for catalog matching
                    content_ids: [productInfo.productId],
                    content_type: "product",
                    value: productInfo.value,
                    currency: productInfo.currency,
                    num_items: quantity
                })
            } else {
                // Fallback using variantId (better than nothing)
                metaEvent("AddToCart", { content_ids: [variantId] })
            }

        } catch (e) {
            console.error("Failed to add to cart", e)
        } finally {
            setIsAdding(false)
        }
    }

    return { add: handleAddToCart, isAdding }
}