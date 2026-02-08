import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { EmailTemplates } from '../modules/email-notifications/templates'
import { trackOrderCanceledWorkflow } from "../workflows/track-order-canceled"

export default async function orderCanceledHandler({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {

    // 1. Run tracking workflow (Standard practice)
    await trackOrderCanceledWorkflow(container).run({
        input: { order_id: data.id },
    }).catch(e => console.error("Tracking workflow failed", e))

    // 2. Resolve Services
    const notificationModuleService = container.resolve(Modules.NOTIFICATION)
    const orderModuleService = container.resolve(Modules.ORDER)

    // Retrieve order with necessary relations
    const order = await orderModuleService.retrieveOrder(data.id, {
        relations: ['items', 'summary', 'shipping_address']
    })

    if (!order) {
        console.error(`Order with id ${data.id} not found.`)
        return
    }

    // 🛑 THE FIX: Handle missing shipping address
    // Test orders often have no address, which causes the Template to crash
    const shippingAddress = order.shipping_address || {
        first_name: "Customer",
        last_name: "",
        address_1: "",
        city: "",
        country_code: "",
        postal_code: ""
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
                    subject: `Order #${order.display_id} Canceled 🛑`
                },
                order,
                shippingAddress, // 👈 Passing the safe, non-null object
                preview: 'Your order has been canceled.'
            }
        })
        console.log(`Canceled email sent to ${order.email}`)
    } catch (error) {
        console.error('Error sending order cancellation notification:', error)
    }
}

export const config: SubscriberConfig = {
    event: "order.canceled",
}