import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { trackOrderShippedWorkflow } from '../workflows/track-order-shipped'

// {
//   id, // the ID of the fulfillment
//   no_notification, // (boolean) whether to notify the customer
// }

export default async function shipmentCreatedHandler({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    // await trackOrderShippedWorkflow(container).run({
    //     input: { fulfillment_id: data.id },
    // })
}


export const config: SubscriberConfig = {
    event: "shipment.created"
}