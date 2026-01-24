// src/api/admin/carts/[id]/route.ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { id } = req.params

    const {
        data: [cart],
    } = await query.graph(
        {
            entity: "cart",
            fields: [
                "id",
                "currency_code",
                // cart-level totals
                "completed_at",
                "total",
                "subtotal",
                "tax_total",
                "discount_total",
                "discount_subtotal",
                "discount_tax_total",
                "original_total",
                "original_tax_total",
                "item_total",
                "item_subtotal",
                "item_tax_total",
                "original_item_total",
                "original_item_subtotal",
                "original_item_tax_total",
                "shipping_total",
                "shipping_subtotal",
                "shipping_tax_total",
                "original_shipping_tax_total",
                "original_shipping_subtotal",
                "original_shipping_total",
                "credit_line_subtotal",
                "credit_line_tax_total",
                "credit_line_total",
                "customer.*",
                // relations
                "items.*",
                "metadata",
                "shipping_methods.*",
                "shipping_address.*",
            ],
            filters: { id },
        },
        {
            throwIfKeyNotFound: true,
        }
    )

    res.json({ cart })
}