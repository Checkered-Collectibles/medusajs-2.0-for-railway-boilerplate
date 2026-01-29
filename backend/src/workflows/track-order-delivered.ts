import { createWorkflow, createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { EmailTemplates } from "../modules/email-notifications/templates"

// 1. CUSTOM STEP: Fetch Order via Fulfillment ID
const retrieveOrderFromFulfillmentStep = createStep(
    "retrieve-order-from-fulfillment-manual",
    async ({ fulfillment_id }: { fulfillment_id: string }, { container }) => {
        const query = container.resolve(ContainerRegistrationKeys.QUERY)

        const { data: fulfillments } = await query.graph({
            entity: "fulfillment",
            fields: [
                "id",
                "order.*",
                "order.shipping_address.*",
                // 👇 Added requested fields
                "order.payment_collections.payments.*",
                "order.fulfillments.labels.*"
            ],
            filters: {
                id: fulfillment_id,
            },
        })

        return new StepResponse(fulfillments[0]?.order)
    }
)

// 2. TRACKING STEP
const trackOrderDeliveredStep = createStep(
    "track-order-delivered-step",
    async ({ order }: any, { container }) => {
        if (!order) return new StepResponse(null)

        // Analytics logic here...
        return new StepResponse(true)
    }
)

// 3. NOTIFICATION STEP
const sendDeliveryNotificationStep = createStep(
    "send-delivery-notification-step",
    async ({ order }: { order: any }, { container }) => {
        if (!order || !order.email) {
            console.warn("Skipping delivery notification: No order or email found.")
            return new StepResponse(null)
        }

        const notificationModuleService = container.resolve(Modules.NOTIFICATION)

        try {
            await notificationModuleService.createNotifications({
                to: order.email,
                channel: 'email',
                template: EmailTemplates.ORDER_DELIVERED,
                data: {
                    emailOptions: {
                        replyTo: 'hello@checkered.in',
                        subject: 'Your order has been delivered! 📦'
                    },
                    order,
                    // Pass specific relations if your template needs them
                    shippingAddress: order.shipping_address,
                    preview: 'Your package has arrived.'
                }
            })
            return new StepResponse(true)
        } catch (error) {
            console.error('Error sending delivery notification:', error)
            return new StepResponse(false)
        }
    }
)

// 4. WORKFLOW
export const trackOrderDeliveredWorkflow = createWorkflow(
    "track-order-delivered-workflow",
    ({ fulfillment_id }: { fulfillment_id: string }) => {

        const order = retrieveOrderFromFulfillmentStep({ fulfillment_id })

        trackOrderDeliveredStep({ order })

        sendDeliveryNotificationStep({ order })

        return order
    }
)