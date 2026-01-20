import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { trackOrderDeliveredWorkflow } from '..//workflows/track-order-delivered'

export default async function orderDeliveredHandler({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    await trackOrderDeliveredWorkflow(container).run({
        input: { order_id: data.id },
    })
}

export const config: SubscriberConfig = {
    event: "order.delivered"
}
