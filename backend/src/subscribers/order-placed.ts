import { Modules } from '@medusajs/framework/utils'
import { INotificationModuleService, IOrderModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { EmailTemplates } from '../modules/email-notifications/templates'
import { handleOrderPointsWorkflow } from '../workflows/handle-order-points'
import { trackOrderPlacedWorkflow } from 'src/workflows/track-order-placed'

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {

  // Fix: Pass container inside .run()
  await handleOrderPointsWorkflow.run({
    input: { order_id: data.id },
    container: container
  })

  await trackOrderPlacedWorkflow.run({
    input: { order_id: data.id },
    container: container
  })

  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)

  // In v2, many address fields are available directly in the order object if fetched correctly
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
          subject: 'Your order has been placed'
        },
        order,
        shippingAddress: order.shipping_address, // Use the resolved relation directly
        preview: 'Thank you for your order!'
      }
    })
  } catch (error) {
    console.error('Error sending order confirmation notification:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed'
}