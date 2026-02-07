import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { EmailTemplates } from '../modules/email-notifications/templates'
import { trackOrderCanceledWorkflow } from "../workflows/track-order-canceled"

export default async function orderCanceledHandler({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {

    // 1. Run tracking workflow
    await trackOrderCanceledWorkflow(container).run({
        input: {
            order_id: data.id,
        },
    })

    // 2. Resolve Services
    const notificationModuleService = container.resolve(Modules.NOTIFICATION)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    // 3. Retrieve Order using Query to get calculated totals
    const { data: orders } = await query.graph({
        entity: "order",
        fields: [
            "id",
            "currency_code",
            "email",
            "display_id",
            "created_at",
            // Totals
            "total",
            "subtotal",
            "tax_total",
            "discount_total",
            "shipping_total",
            // Relations
            "items.*",
            "shipping_address.*",
            "summary.*",
        ],
        filters: {
            id: data.id,
        },
    })

    const order = orders[0]

    if (!order) {
        console.error(`Order with id ${data.id} not found.`)
        return
    }

    // 4. Send Cancellation Email
    try {
        await notificationModuleService.createNotifications({
            to: order.email,
            channel: 'email',
            template: EmailTemplates.ORDER_CANCELED,
            data: {
                emailOptions: {
                    replyTo: 'hello@checkered.in',
                    subject: 'Order Canceled: Your order has been canceled 🛑'
                },
                order,
                shippingAddress: order.shipping_address,
                preview: 'Your order has been canceled.'
            }
        })
    } catch (error) {
        console.error('Error sending order cancellation notification:', error)
    }
}

export const config: SubscriberConfig = {
    event: "order.canceled",
}