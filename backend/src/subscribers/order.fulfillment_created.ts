import { Modules } from '@medusajs/framework/utils'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { EmailTemplates } from '../modules/email-notifications/templates'
import { trackOrderShippedWorkflow } from '../workflows/track-order-shipped'

export default async function fulfillmentCreatedHandler({
    event: { data },
    container,
}: SubscriberArgs<{ order_id: string, fulfillment_id: string, no_notification?: boolean }>) {

    // 1. Run Analytics Workflow
    await trackOrderShippedWorkflow(container).run({
        input: { fulfillment_id: data.fulfillment_id },
    })

    // // 2. Check if notifications are disabled for this event
    // if (data.no_notification) {
    //     return
    // }

    // // 3. Resolve Services
    // const notificationModuleService = container.resolve(Modules.NOTIFICATION)
    // const orderModuleService = container.resolve(Modules.ORDER)
    // const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    // // 4. Retrieve Fulfillment (Needed for Tracking Numbers/Labels)
    // // We fetch 'labels' to get the tracking URL and number
    // const fulfillment = await fulfillmentModuleService.retrieveFulfillment(data.fulfillment_id, {
    //     relations: ['labels', 'provider', 'items']
    // })

    // // 5. Retrieve Order (Needed for Customer Email & Address)
    // const order = await orderModuleService.retrieveOrder(data.order_id, {
    //     relations: ['items', 'summary', 'shipping_address']
    // })

    // // 6. Send Notification
    // try {
    //     await notificationModuleService.createNotifications({
    //         to: order.email,
    //         channel: 'email',
    //         template: EmailTemplates.ORDER_SHIPPED,
    //         data: {
    //             emailOptions: {
    //                 replyTo: 'hello@checkered.in',
    //                 subject: 'Your order is on the way! 🚚'
    //             },
    //             order,
    //             fulfillment, // Pass the full fulfillment object
    //             shippingAddress: order.shipping_address,
    //             preview: 'Track your package now.'
    //         }
    //     })
    // } catch (error) {
    //     console.error('Error sending order shipped notification:', error)
    // }
}

export const config: SubscriberConfig = {
    event: "order.fulfillment_created"
}