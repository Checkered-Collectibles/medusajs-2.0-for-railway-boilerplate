"use client"

import { addToCart } from "@lib/data/cart"
import { metaEvent } from "@lib/meta/fpixel"
import { useState } from "react"

export const useAddToCart = () => {
    const [isAdding, setIsAdding] = useState(false)

    const handleAddToCart = async ({
        variantId, // 👈 This is the ID we want!
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
        }
    }) => {
        setIsAdding(true)

        try {
            await addToCart({ variantId, quantity, countryCode })

            if (productInfo) {
                metaEvent("AddToCart", {
                    content_name: productInfo.title,
                    // 👇 CHANGE: Strictly use variantId
                    content_ids: [variantId],
                    content_type: "product",
                    value: productInfo.value,
                    currency: productInfo.currency,
                    num_items: quantity
                })
            } else {
                // Fallback
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