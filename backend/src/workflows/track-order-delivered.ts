import { createWorkflow, createStep } from "@medusajs/framework/workflows-sdk"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

// 1. CUSTOM STEP: Fetch Order via Fulfillment ID
const retrieveOrderFromFulfillmentStep = createStep(
    "retrieve-order-from-fulfillment-manual",
    async ({ fulfillment_id }: { fulfillment_id: string }, { container }) => {
        const query = container.resolve(ContainerRegistrationKeys.QUERY)

        // We query the ORDER entity, but filter by the connected fulfillment ID
        const { data: orders } = await query.graph({
            entity: "order",
            fields: [
                "*",
                "customer_id",
                "currency_code",
                "total"
            ],
            filters: {
                fulfillments: {
                    id: fulfillment_id,
                },
            },
        })

        return orders[0]
    }
)

// 2. TRACKING STEP (Unchanged logic, just receives order)
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
    // Update Input to accept fulfillment_id
    ({ fulfillment_id }: { fulfillment_id: string }) => {

        // Use the new step to resolve the order from the fulfillment ID
        const order = retrieveOrderFromFulfillmentStep({ fulfillment_id })

        trackOrderDeliveredStep({ order })
    }
)