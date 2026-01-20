import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { trackOrderShippedWorkflow } from 'src/workflows/track-order-shipped'

export default async function fulfillmentCreatedHandler({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    await trackOrderShippedWorkflow(container).run({
        input: { fulfillment_id: data.id },
    })
}


export const config: SubscriberConfig = {
    event: "fulfillment.created"
}
