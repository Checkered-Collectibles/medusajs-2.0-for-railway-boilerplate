import { createWorkflow, createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ACCOUNT_CREATED } from "../modules/email-notifications/templates/account-created"

// 1. Step to fetch customer details
const fetchCustomerStep = createStep(
    "fetch-customer-details",
    async (input: { customerId: string }, { container }) => {
        const query = container.resolve(ContainerRegistrationKeys.QUERY)

        const { data: customers } = await query.graph({
            entity: "customer",
            fields: ["email", "first_name", "last_name"],
            filters: { id: input.customerId }
        })

        const customer = customers[0]

        if (!customer) {
            throw new Error(`Customer with ID ${input.customerId} not found`)
        }

        return new StepResponse(customer)
    }
)

// 2. Step to send the notification
const sendNotificationStep = createStep(
    "send-welcome-notification",
    async (customer: any, { container }) => {
        const notificationModuleService = container.resolve(Modules.NOTIFICATION)

        await notificationModuleService.createNotifications({
            to: customer.email,
            channel: "email",
            template: ACCOUNT_CREATED, // The key we added to the registry
            data: {
                customer: {
                    first_name: customer.first_name,
                    last_name: customer.last_name,
                    email: customer.email
                }
            }
        })

        return new StepResponse("Email sent")
    }
)

// 3. The Workflow
export const sendWelcomeEmailWorkflow = createWorkflow(
    "send-welcome-email",
    (input: { customerId: string }) => {
        const customer = fetchCustomerStep(input)
        sendNotificationStep(customer)
    }
)