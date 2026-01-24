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
        // Add extra data needed for Pixel that the Server Action doesn't need
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
            // 1. Call the Server Action
            await addToCart({ variantId, quantity, countryCode })

            // 2. If successful, Track the Event on Client
            // We check productInfo exists to prevent errors
            if (productInfo) {
                metaEvent("AddToCart", {
                    content_name: productInfo.title,
                    content_ids: [variantId],
                    content_type: "product",
                    value: productInfo.value,
                    currency: productInfo.currency,
                    num_items: quantity
                })
            } else {
                // Fallback if you don't pass full details (Basic Tracking)
                metaEvent("AddToCart", { content_ids: [variantId] })
            }

        } catch (e) {
            console.error("Failed to add to cart", e)
            // Optional: Add toast error here
        } finally {
            setIsAdding(false)
        }
    }

    return { add: handleAddToCart, isAdding }
}