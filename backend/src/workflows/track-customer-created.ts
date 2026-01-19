import { createWorkflow, createStep } from "@medusajs/framework/workflows-sdk"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

// 1. CUSTOM STEP: Manually fetch customer data
// This avoids registry collisions with Medusa's core customer workflows
const retrieveCustomerDataStep = createStep(
    "retrieve-customer-data-manual",
    async ({ id }: { id: string }, { container }) => {
        const query = container.resolve(ContainerRegistrationKeys.QUERY)

        const { data: customers } = await query.graph({
            entity: "customer",
            fields: [
                "*",
                "email"
            ],
            filters: {
                id: id,
            },
        })

        return customers[0]
    }
)

// 2. TRACKING STEP (Unchanged logic)
const trackCustomerCreatedStep = createStep(
    "track-customer-created-step",
    async ({ customer }: any, { container }) => {
        const analytics = container.resolve(Modules.ANALYTICS)

        // Safety check
        if (!customer) return

        await analytics.track({
            event: "customer_created",
            actor_id: customer.id,
            properties: {
                email: customer.email,
                first_name: customer.first_name,
                has_account: customer.has_account,
                created_at: customer.created_at,
                // Updates user profile in PostHog
                $set: {
                    email: customer.email,
                    first_name: customer.first_name,
                    last_name: customer.last_name,
                }
            }
        })
    }
)

// 3. WORKFLOW
export const trackCustomerCreatedWorkflow = createWorkflow(
    "track-customer-created-workflow",
    ({ customer_id }: { customer_id: string }) => {

        // Use manual step to get data safely
        const customer = retrieveCustomerDataStep({ id: customer_id })

        trackCustomerCreatedStep({ customer })
    }
)