import { Modules } from '@medusajs/framework/utils'
// import { INotificationModuleService, IOrderModuleService } from '@medusajs/framework/types'
import { SubscriberArgs } from '@medusajs/medusa'
import { EmailTemplates } from '../modules/email-notifications/templates'
import { handleOrderPointsWorkflow } from '../workflows/handle-order-points'
import { trackOrderPlacedWorkflow } from '../workflows/track-order-placed' // Fix path if needed

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {

  // Fix: Pass container inside .run()
  await handleOrderPointsWorkflow(container).run({
    input: { order_id: data.id },
  })

  await trackOrderPlacedWorkflow(container).run({
    input: { order_id: data.id },
  })

  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService = container.resolve(Modules.ORDER)

  // Retrieve order with necessary relations
  const order = await orderModuleService.retrieveOrder(data.id, {
    relations: ['items', 'summary', 'shipping_address']
  })

  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: 'email',
      template: EmailTemplates.ORDER_PLACED,
      data: {
        emailOptions: {
          replyTo: 'hello@checkered.in',
          subject: 'Order Confirmed: We\'ve got your order! ✅'
        },
        order,
        shippingAddress: order.shipping_address,
        preview: 'Our pit crew is getting to work. Sit tight.'
      }
    })
  } catch (error) {
    console.error('Error sending order confirmation notification:', error)
  }
}

export const config = {
  event: 'order.placed'
}