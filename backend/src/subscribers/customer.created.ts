import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { trackCustomerCreatedWorkflow } from 'src/workflows/track-customer-created'

export default async function customerCreatedHandler({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    await trackCustomerCreatedWorkflow(container).run({
        input: { customer_id: data.id },
    })
}

export const config: SubscriberConfig = {
    event: "customer.created"
}
