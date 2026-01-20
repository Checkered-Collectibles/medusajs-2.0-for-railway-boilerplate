import { createWorkflow, createStep } from "@medusajs/framework/workflows-sdk"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { OrderDTO } from "@medusajs/framework/types"

// 1. CUSTOM STEP: Manually fetch order data for cancellation
const retrieveOrderCanceledDataStep = createStep(
    "retrieve-order-canceled-data-manual",
    async ({ id }: { id: string }, { container }) => {
        const query = container.resolve(ContainerRegistrationKeys.QUERY)

        const { data: orders } = await query.graph({
            entity: "order",
            fields: [
                "id",
                "currency_code",
                "total",
                "subtotal",
                "tax_total",
                "original_total",
                "original_subtotal",
                "original_tax_total",
                "discount_total",
                "discount_tax_total",
                "shipping_total",
                "shipping_subtotal",
                "shipping_tax_total",
                "original_shipping_total",
                "original_shipping_subtotal",
                "original_shipping_tax_total",
                "item_total",
                "item_tax_total",
                "item_subtotal",
                "original_item_total",
                "original_item_tax_total",
                "original_item_subtotal",
                "gift_card_total",
                "gift_card_tax_total",
                "customer.*",
            ],
            filters: {
                id,
            },
        })

        return orders[0]
    }
)

type StepInput = {
    order: OrderDTO
}

// 2. TRACKING STEP (Unchanged logic)
const trackOrderCanceledStep = createStep(
    "track-order-canceled-step",
    async ({ order }: StepInput, { container }) => {
        const analyticsModuleService = container.resolve(Modules.ANALYTICS)

        // Safety check
        if (!order) return

        // Calculate negative revenue for PostHog
        const negativeRevenue = -1 * (order.total as number)

        await analyticsModuleService.track({
            event: "order_canceled",
            actor_id: order.customer_id,
            properties: {
                revenue: negativeRevenue,
                order_id: order.id,
                customer_id: order.customer_id,
                cancel_reason: "customer_request",
            },
        })
    }
)

type WorkflowInput = {
    order_id: string
}

// 3. WORKFLOW
export const trackOrderCanceledWorkflow = createWorkflow(
    "track-order-canceled-workflow",
    ({ order_id }: WorkflowInput) => {

        // Use manual step to get data safely
        const order = retrieveOrderCanceledDataStep({ id: order_id })

        trackOrderCanceledStep({
            order,
        } as unknown as StepInput)
    }
)