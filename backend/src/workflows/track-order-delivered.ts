import { createWorkflow, createStep } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"

const trackOrderDeliveredStep = createStep(
    "track-order-delivered-step",
    async ({ order }: any, { container }) => {
        const analytics = container.resolve(Modules.ANALYTICS)

        await analytics.track({
            event: "order_delivered",
            actor_id: order.customer_id,
            properties: {
                order_id: order.id,
                total: order.total,
                currency: order.currency_code,
                // Time to deliver calculation could be done here if you pull created_at
            }
        })
    }
)

export const trackOrderDeliveredWorkflow = createWorkflow(
    "track-order-delivered-workflow",
    ({ order_id }: { order_id: string }) => {
        const { data: orders } = useQueryGraphStep({
            entity: "order",
            fields: ["*", "customer_id"],
            filters: { id: order_id }
        })
        trackOrderDeliveredStep({ order: orders[0] })
    }
)