import { createWorkflow, createStep } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"

const trackOrderShippedStep = createStep(
    "track-order-shipped-step",
    async ({ fulfillment }: any, { container }) => {
        const analytics = container.resolve(Modules.ANALYTICS)
        // Order ID is needed to link to the customer
        const orderId = fulfillment.order?.id

        await analytics.track({
            event: "order_shipped",
            actor_id: fulfillment.order?.customer_id,
            properties: {
                order_id: orderId,
                fulfillment_id: fulfillment.id,
                tracking_number: fulfillment.tracking_numbers?.[0],
                provider_id: fulfillment.provider_id,
                item_count: fulfillment.items?.length,
            }
        })
    }
)

export const trackOrderShippedWorkflow = createWorkflow(
    "track-order-shipped-workflow",
    ({ fulfillment_id }: { fulfillment_id: string }) => {
        const { data: fulfillments } = useQueryGraphStep({
            entity: "fulfillment",
            fields: ["*", "order.id", "order.customer_id", "items.*"],
            filters: { id: fulfillment_id }
        })
        trackOrderShippedStep({ fulfillment: fulfillments[0] })
    }
)