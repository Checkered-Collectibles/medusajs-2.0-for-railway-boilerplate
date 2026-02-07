import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { EmailTemplates } from '../modules/email-notifications/templates'

export default async function refundCreatedHandler({
    event: { data },
    container,
}: SubscriberArgs<{ id: string, order_id: string, refund_id: string }>) { // Data shape usually contains refund_id

    const notificationModuleService = container.resolve(Modules.NOTIFICATION)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    // 1. Fetch Refund & Order Details
    // We need the specific refund to get the exact amount refunded
    const { data: refunds } = await query.graph({
        entity: "refund",
        fields: [
            "amount",
            "order.email",
            "order.display_id",
            "order.currency_code",
            "order.id"
        ],
        filters: {
            id: data.refund_id || data.id, // Depending on event payload structure (usually id is refund_id)
        },
    })

    const refund = refunds[0]

    if (!refund || !refund.order) {
        console.error(`Refund or Order not found for event data:`, data)
        return
    }

    // 2. Send Email
    try {
        await notificationModuleService.createNotifications({
            to: refund.order.email,
            channel: 'email',
            template: EmailTemplates.REFUND_CREATED,
            data: {
                emailOptions: {
                    replyTo: 'hello@checkered.in',
                    subject: `Refund Issued for Order #${refund.order.display_id} 💸`
                },
                order: refund.order,
                refundAmount: refund.amount,
                currencyCode: refund.order.currency_code,
                preview: 'A refund has been processed for your order.'
            }
        })
    } catch (error) {
        console.error('Error sending refund notification:', error)
    }
}

export const config: SubscriberConfig = {
    event: "refund.created",
}