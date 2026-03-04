import { Modules } from '@medusajs/framework/utils'
import { SubscriberArgs } from '@medusajs/medusa'
import { EmailTemplates } from '../modules/email-notifications/templates'
import { handleOrderPointsWorkflow } from '../workflows/handle-order-points'
import { trackOrderPlacedWorkflow } from '../workflows/track-order-placed'

export default async function orderPlacedHandler({
  event: { data, name }, // Extract 'name' here
  container,
}: SubscriberArgs<any>) {

  // 1. Run standard order workflows
  await handleOrderPointsWorkflow(container).run({
    input: { order_id: data.id },
  })

  await trackOrderPlacedWorkflow(container).run({
    input: { order_id: data.id },
  })

  // ---------------------------------------------------------
  // 2. QUICK-FIX REVALIDATION: Bust Next.js Cache on Order
  // ---------------------------------------------------------
  const storefrontUrl = process.env.STOREFRONT_URL || "https://checkered.in"
  const secret = process.env.REVALIDATE_SECRET || "super_secret_string_12345"

  try {
    await fetch(`${storefrontUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify({
        type: name || "order.placed",
        data: data,
      }),
    })
    console.log(`Successfully pinged storefront to revalidate for event: ${name || "order.placed"}`)
  } catch (error) {
    console.error("Failed to ping storefront for revalidation on order placement:", error)
  }
  // ---------------------------------------------------------

  // 3. Setup Email Notification
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService = container.resolve(Modules.ORDER)

  // Retrieve order with necessary relations
  const order = await orderModuleService.retrieveOrder(data.id, {
    relations: ['items', 'summary', 'shipping_address']
  })

  // Handle missing shipping address
  const shippingAddress = order.shipping_address || {
    first_name: "Customer",
    last_name: "",
    address_1: "",
    city: "",
    country_code: "",
    postal_code: ""
  }

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
        shippingAddress,
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