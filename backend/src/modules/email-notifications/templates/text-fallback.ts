import { MedusaError } from "@medusajs/framework/utils"
import type { OrderDTO, OrderAddressDTO } from "@medusajs/framework/types"

type OrderPlacedData = {
    order: OrderDTO & {
        display_id: string
        summary: { raw_current_order_total: { value: number } }
    }
    shippingAddress: OrderAddressDTO
}

function formatMoney(amount: number, currency: string) {
    // raw values may be in minor units in some setups; adapt if needed.
    return `${amount} ${currency?.toUpperCase?.() ?? currency}`
}

function safeDate(input: any) {
    const d = new Date(input)
    return isNaN(d.getTime()) ? String(input ?? "") : d.toLocaleDateString()
}

function lines(...xs: Array<string | undefined | null | false>) {
    return xs.filter(Boolean).join("\n")
}

export function buildTextFallback(template: string, data: any) {
    if (template === "password-reset") {
        const resetLink = data?.resetLink
        if (typeof resetLink !== "string") {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "password-reset template requires resetLink (string)"
            )
        }

        return lines(
            "Reset your password for Checkered Collectibles",
            "",
            "We received a request to reset your password.",
            "Use the link below:",
            "",
            resetLink,
            "",
            "If you didn’t request this, you can ignore this email."
        )
    }

    if (template === "order-placed") {
        const order: OrderPlacedData["order"] | undefined = data?.order
        const shipping: OrderPlacedData["shippingAddress"] | undefined = data?.shippingAddress

        if (!order || !shipping) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "order-placed template requires order and shippingAddress objects"
            )
        }

        const itemsText =
            Array.isArray(order.items) && order.items.length
                ? order.items
                    .map((i) => {
                        const title = [i?.title, i?.product_title].filter(Boolean).join(" - ")
                        return `- ${title} | qty ${i?.quantity} | ${i?.unit_price} ${order.currency_code}`
                    })
                    .join("\n")
                : "- (No items)"

        return lines(
            "Order Confirmation — Checkered Collectibles",
            "",
            `Hi ${shipping.first_name ?? ""} ${shipping.last_name ?? ""}`.trim(),
            "",
            "Thanks for your order! Here are your details:",
            "",
            `Order ID: ${order.display_id ?? order.id ?? ""}`,
            `Order Date: ${safeDate(order.created_at)}`,
            `Total: ${formatMoney(order.summary?.raw_current_order_total?.value ?? 0, order.currency_code)}`,
            "",
            "Shipping Address:",
            `${shipping.address_1 ?? ""}`,
            `${shipping.city ?? ""}${shipping.province ? ", " + shipping.province : ""} ${shipping.postal_code ?? ""}`.trim(),
            `${shipping.country_code ?? ""}`.toUpperCase(),
            "",
            "Items:",
            itemsText,
            "",
            "If you have any questions, reply to this email."
        )
    }

    // Generic fallback
    return "Notification from Checkered Collectibles."
}