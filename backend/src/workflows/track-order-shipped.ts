import { createWorkflow, createStep } from "@medusajs/framework/workflows-sdk"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

// 1. Create a CUSTOM step to fetch the fulfillment
// This bypasses the collision caused by useQueryGraphStep
const retrieveFulfillmentDataStep = createStep(
    "retrieve-fulfillment-data-manual",
    async ({ id }: { id: string }, { container }) => {
        const query = container.resolve(ContainerRegistrationKeys.QUERY)

        const { data: fulfillments } = await query.graph({
            entity: "fulfillment",
            fields: [
                "*",
                "order.id",
                "order.customer_id",
                "items.*"
            ],
            filters: {
                id: id,
            },
        })

        return fulfillments[0]
    }
)

// 2. Your tracking step (Unchanged)
const trackOrderShippedStep = createStep(
    "track-order-shipped-step",
    async ({ fulfillment }: any, { container }) => {
        const analytics = container.resolve(Modules.ANALYTICS)

        // Safety check
        if (!fulfillment) return

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

// 3. The Workflow
export const trackOrderShippedWorkflow = createWorkflow(
    "track-order-shipped-workflow", // ✅ Unique ID
    ({ fulfillment_id }: { fulfillment_id: string }) => {

        // Use our manual step instead of useQueryGraphStep
        const fulfillment = retrieveFulfillmentDataStep({ id: fulfillment_id })

        trackOrderShippedStep({ fulfillment })
    }
)