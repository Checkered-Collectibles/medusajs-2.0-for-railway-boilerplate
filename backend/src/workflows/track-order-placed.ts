import { createWorkflow, createStep } from "@medusajs/framework/workflows-sdk"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { OrderDTO } from "@medusajs/framework/types"

// 1. CUSTOM STEP: Manually fetch the order data
// This avoids conflicts with Medusa's internal useQueryGraphStep for orders
const retrieveOrderDataStep = createStep(
    "retrieve-order-data-manual",
    async ({ id }: { id: string }, { container }) => {
        const query = container.resolve(ContainerRegistrationKeys.QUERY)

        const { data: orders } = await query.graph({
            entity: "order",
            fields: [
                "*",
                "customer.*",
                "items.*"
            ],
            filters: {
                id: id,
            },
        })

        return orders[0]
    }
)

type StepInput = {
    order: OrderDTO
}

// 2. TRACKING STEP (Unchanged logic)
const trackOrderPlacedStep = createStep(
    "track-order-placed-step",
    async ({ order }: StepInput, { container }) => {
        const analyticsModuleService = container.resolve(Modules.ANALYTICS)

        // Safety check
        if (!order) return

        await analyticsModuleService.track({
            event: "order_placed",
            actor_id: order.customer_id,
            properties: {
                order_id: order.id,
                total: order.total,
                items: order.items?.map((item) => ({
                    variant_id: item.variant_id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                })),
                customer_id: order.customer_id,
            },
        })
    }
)

type WorkflowInput = {
    order_id: string
}

// 3. WORKFLOW
export const trackOrderPlacedWorkflow = createWorkflow(
    "track-order-placed-workflow",
    ({ order_id }: WorkflowInput) => {

        // Use the manual step to get data safely
        const order = retrieveOrderDataStep({ id: order_id })

        trackOrderPlacedStep({
            order,
        } as unknown as StepInput)
    }
)