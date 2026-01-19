import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { createStep } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"
import { OrderDTO } from "@medusajs/framework/types"

type StepInput = {
    order: OrderDTO
}

const trackOrderCanceledStep = createStep(
    "track-order-canceled-step",
    async ({ order }: StepInput, { container }) => {
        const analyticsModuleService = container.resolve(Modules.ANALYTICS)

        // 1. Calculate negative revenue
        // standard total is 999, so we send -999
        const negativeRevenue = -1 * (order.total as number)

        await analyticsModuleService.track({
            event: "order_canceled", // Distinct event name
            actor_id: order.customer_id, // MUST match the ID used in 'order_placed'
            properties: {
                // 2. The Magic: Negative Revenue
                // PostHog will subtract this from your total
                revenue: negativeRevenue,

                order_id: order.id,
                customer_id: order.customer_id,

                // Optional: helpful for filtering "Why did we lose money?"
                cancel_reason: "customer_request",
            },
        })
    }
)

type WorkflowInput = {
    order_id: string
}

export const trackOrderCanceledWorkflow = createWorkflow(
    "track-order-canceled-workflow",
    ({ order_id }: WorkflowInput) => {
        const { data: orders } = useQueryGraphStep({
            entity: "order",
            fields: [
                "*",
                "customer.*",
                // We don't necessarily need items for a cancellation event, 
                // but you can add them if you want to track "returned items"
            ],
            filters: {
                id: order_id,
            },
        })

        trackOrderCanceledStep({
            order: orders[0],
        } as unknown as StepInput)
    }
)