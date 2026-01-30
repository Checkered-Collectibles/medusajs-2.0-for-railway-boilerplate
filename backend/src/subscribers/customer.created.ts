import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { optInMarketingWorkflow } from '../workflows/opt-in-marketing'
import { trackCustomerCreatedWorkflow } from '../workflows/track-customer-created'

export default async function customerCreatedHandler({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

    logger.info(`🆕 Handling customer.created for ID: ${data.id}`)

    // Run workflows in PARALLEL
    // We use allSettled so if one crashes (e.g. Resend is down), the other still completes.
    const results = await Promise.allSettled([
        // Task 1: Marketing Opt-in
        optInMarketingWorkflow(container).run({
            input: { customer_id: data.id },
        }),
        // Task 2: Internal Tracking
        trackCustomerCreatedWorkflow(container).run({
            input: { customer_id: data.id },
        })
    ])

    // Optional: Log specific failures without crashing the subscriber
    const [marketingResult, trackingResult] = results

    if (marketingResult.status === 'rejected') {
        logger.error(`❌ Marketing Workflow Failed: ${marketingResult.reason}`)
    }

    if (trackingResult.status === 'rejected') {
        logger.error(`❌ Tracking Workflow Failed: ${trackingResult.reason}`)
    }
}

export const config: SubscriberConfig = {
    event: "customer.created"
}