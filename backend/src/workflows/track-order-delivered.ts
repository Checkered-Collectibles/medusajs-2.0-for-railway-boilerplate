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
                "id", // Fulfillment ID

                // --- 1. Basic Order Details ---
                "order.id",
                "order.currency_code",
                "order.email", // Important for sending emails
                "order.display_id", // Important for email subject/body

                // --- 2. The Totals (Matched from your snippet) ---
                "order.total",
                "order.subtotal",
                "order.tax_total",
                "order.original_total",
                "order.original_subtotal",
                "order.original_tax_total",
                "order.discount_total",
                "order.discount_tax_total",
                "order.shipping_total",
                "order.shipping_subtotal",
                "order.shipping_tax_total",
                "order.original_shipping_total",
                "order.original_shipping_subtotal",
                "order.original_shipping_tax_total",
                "order.item_total",
                "order.item_tax_total",
                "order.item_subtotal",
                "order.original_item_total",
                "order.original_item_tax_total",
                "order.original_item_subtotal",
                "order.gift_card_total",
                "order.gift_card_tax_total",

                // --- 3. Relations (Matched from your snippet) ---
                "order.customer.*",
                "order.items.*",
                "order.shipping_address.*",

                // --- 4. Extra Relations (Requested in previous steps) ---
                "order.payment_collections.payments.*",
                "order.fulfillments.labels.*"
            ],
            filters: {
                id: fulfillment_id,
            },
        })

        const order = fulfillments[0]?.order

        // Safety: If for some reason totals are strings, Medusa usually handles this,
        // but ensuring the structure is correct for the template.
        return new StepResponse(order)
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
                        subject: 'Finish Line! Your package has arrived 🏁'
                    },
                    order,
                    shippingAddress: order.shipping_address,
                    preview: 'The wait is over. Time to unbox your new legends.'
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