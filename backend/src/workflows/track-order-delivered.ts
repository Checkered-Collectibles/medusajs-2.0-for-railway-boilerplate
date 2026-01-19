import { createWorkflow, createStep } from "@medusajs/framework/workflows-sdk"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

// 1. CUSTOM STEP: Manually fetch order data
// This avoids conflicts with Medusa's internal query steps
const retrieveOrderDeliveredDataStep = createStep(
    "retrieve-order-delivered-data-manual",
    async ({ id }: { id: string }, { container }) => {
        const query = container.resolve(ContainerRegistrationKeys.QUERY)

        const { data: orders } = await query.graph({
            entity: "order",
            fields: [
                "*",
                "customer_id"
            ],
            filters: {
                id: id,
            },
        })

        return orders[0]
    }
)

// 2. TRACKING STEP
const trackOrderDeliveredStep = createStep(
    "track-order-delivered-step",
    async ({ order }: any, { container }) => {
        const analytics = container.resolve(Modules.ANALYTICS)

        // Safety check
        if (!order) return

        await analytics.track({
            event: "order_delivered",
            actor_id: order.customer_id,
            properties: {
                order_id: order.id,
                total: order.total,
                currency: order.currency_code,
            }
        })
    }
)

// 3. WORKFLOW
export const trackOrderDeliveredWorkflow = createWorkflow(
    "track-order-delivered-workflow",
    ({ order_id }: { order_id: string }) => {

        // Use the manual step to get data safely
        const order = retrieveOrderDeliveredDataStep({ id: order_id })

        trackOrderDeliveredStep({ order })
    }
)