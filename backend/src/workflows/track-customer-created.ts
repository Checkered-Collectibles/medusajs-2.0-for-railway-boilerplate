import { createWorkflow, createStep } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"

const trackCustomerCreatedStep = createStep(
    "track-customer-created-step",
    async ({ customer }: any, { container }) => {
        const analytics = container.resolve(Modules.ANALYTICS)

        await analytics.track({
            event: "customer_created",
            actor_id: customer.id,
            properties: {
                email: customer.email,
                first_name: customer.first_name,
                has_account: customer.has_account,
                created_at: customer.created_at,
                $set: { // Updates user profile in PostHog
                    email: customer.email,
                    first_name: customer.first_name,
                    last_name: customer.last_name,
                }
            }
        })
    }
)

export const trackCustomerCreatedWorkflow = createWorkflow(
    "track-customer-created-workflow",
    ({ customer_id }: { customer_id: string }) => {
        const { data: customers } = useQueryGraphStep({
            entity: "customer",
            fields: ["*", "email"],
            filters: { id: customer_id }
        })
        trackCustomerCreatedStep({ customer: customers[0] })
    }
)