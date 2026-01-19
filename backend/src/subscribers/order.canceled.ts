import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { trackOrderCanceledWorkflow } from "../workflows/track-order-canceled" // Import your new workflow

export default async function orderCanceledHandler({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {

    await trackOrderCanceledWorkflow(container).run({
        input: {
            order_id: data.id,
        },
    })
}

export const config: SubscriberConfig = {
    event: "order.canceled",
}