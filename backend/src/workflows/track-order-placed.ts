import { createWorkflow, createStep } from "@medusajs/framework/workflows-sdk"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { OrderDTO } from "@medusajs/framework/types"

const retrieveOrderDataStep = createStep(
    "retrieve-order-data-manual",
    async ({ id }: { id: string }, { container }) => {
        const query = container.resolve(ContainerRegistrationKeys.QUERY)

        const { data: orders } = await query.graph({
            entity: "order",
            fields: [
                "*",
                "customer.*",
                "items.*",
                "shipping_address.*" // Added for safety if needed later
            ],
            filters: { id },
        })

        return orders[0]
    }
)

type StepInput = {
    order: any // Use any or a custom type if OrderDTO is too strict for query.graph
}

const trackOrderPlacedStep = createStep(
    "track-order-placed-step",
    async ({ order }: StepInput, { container }) => {
        const analyticsModuleService = container.resolve(Modules.ANALYTICS)

        if (!order) return

        await analyticsModuleService.track({
            event: "order_placed",
            actor_id: order.customer_id,
            properties: {
                order_id: order.id,
                total: order.subtotal,
                items: order.items?.map((item: any) => ({
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

export const trackOrderPlacedWorkflow = createWorkflow(
    "track-order-placed-workflow",
    (input: WorkflowInput) => {
        // order here is a Workflow Variable (Proxy)
        const order = retrieveOrderDataStep({ id: input.order_id })

        // Correctly pass the proxy to the next step
        trackOrderPlacedStep({ order })
    }
)