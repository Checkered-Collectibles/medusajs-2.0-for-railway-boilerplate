import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { trackOrderShippedWorkflow } from '../workflows/track-order-shipped'

// {
//   order_id, // The ID of the order
//   fulfillment_id, // The ID of the fulfillment
//   no_notification, // (boolean) Whether to notify the customer
// }

export default async function fulfillmentCreatedHandler({
    event: { data },
    container,
}: SubscriberArgs<{ fulfillment_id: string }>) {
    await trackOrderShippedWorkflow(container).run({
        input: { fulfillment_id: data.fulfillment_id },
    })
}


export const config: SubscriberConfig = {
    event: "order.fulfillment_created"
}
