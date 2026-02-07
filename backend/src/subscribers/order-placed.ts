import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { SubscriberArgs } from '@medusajs/medusa'
import { EmailTemplates } from '../modules/email-notifications/templates'
import { handleOrderPointsWorkflow } from '../workflows/handle-order-points'
import { trackOrderPlacedWorkflow } from '../workflows/track-order-placed'

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {

  // 1. Run workflows
  await handleOrderPointsWorkflow(container).run({
    input: { order_id: data.id },
  })

  await trackOrderPlacedWorkflow(container).run({
    input: { order_id: data.id },
  })

  // 2. Resolve Services
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  // 3. Retrieve Order using Query to get calculated totals
  // The 'fields' array must explicitly request the computed total fields
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
      "summary.*", // Fallback if totals are stored here in your version
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

  // 4. Send Notification
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