import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { trackOrderShippedWorkflow } from '../workflows/track-order-shipped'
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { EmailTemplates } from "../modules/email-notifications/templates" // Adjust path if needed

export default async function shipmentCreatedHandler({
    event: { data },
    container,
}: SubscriberArgs<{ id: string, no_notification: boolean }>) {

    // 1. Run Tracking Workflow (Analytics/Logic)
    await trackOrderShippedWorkflow(container).run({
        input: { fulfillment_id: data.id },
    })

    // 2. Check if notification is suppressed
    if (data.no_notification) {
        return
    }

    // 3. Resolve Query Service
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    // 4. Fetch Fulfillment AND Order Relations using Query Graph
    // This fetches the fulfillment and "joins" the order data to it
    const { data: fulfillments } = await query.graph({
        entity: "fulfillment",
        fields: [
            // Fulfillment Details
            "id",
            "provider_id",
            "tracking_numbers",
            "data",
            "packed_at",
            "shipped_at",

            // Relations
            "labels.*",
            "items.*",

            // Linked Order Details
            "order.*",
            "order.email",
            "order.currency_code",
            "order.shipping_address.*",
            "order.items.*", // Useful if email lists items
        ],
        filters: {
            id: data.id,
        },
    })

    const fulfillment = fulfillments[0]
    const order = fulfillment?.order

    // Safety check
    if (!fulfillment || !order) {
        console.warn(`Shipment Subscriber: Could not find fulfillment or order for ID ${data.id}`)
        return
    }

    // 5. Send Notification
    const notificationModuleService = container.resolve(Modules.NOTIFICATION)

    try {
        await notificationModuleService.createNotifications({
            to: order.email,
            channel: 'email',
            template: EmailTemplates.ORDER_SHIPPED,
            data: {
                emailOptions: {
                    replyTo: 'hello@checkered.in',
                    subject: 'Your order is on the way! 🚚'
                },
                order,
                fulfillment, // Pass full fulfillment object (contains tracking/labels now)
                shippingAddress: order.shipping_address,
                preview: 'Track your package now.'
            }
        })
    } catch (error) {
        console.error('Error sending order shipped notification:', error)
    }
}

export const config: SubscriberConfig = {
    event: "shipment.created"
}