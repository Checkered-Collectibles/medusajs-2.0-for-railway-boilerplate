import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { optInMarketingWorkflow } from '../workflows/opt-in-marketing'
import { trackCustomerCreatedWorkflow } from '../workflows/track-customer-created'
import { sendWelcomeEmailWorkflow } from '../workflows/send-welcome-email'

export default async function customerCreatedHandler({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

    logger.info(`🆕 Handling customer.created for ID: ${data.id}`)

    // Run workflows in PARALLEL
    // We use allSettled so if one crashes, the others still complete.
    const results = await Promise.allSettled([
        // Task 1: Marketing Opt-in
        optInMarketingWorkflow(container).run({
            input: { customer_id: data.id },
        }),
        // Task 2: Internal Tracking
        trackCustomerCreatedWorkflow(container).run({
            input: { customer_id: data.id },
        }),
        // Task 3: Send Welcome Email
        sendWelcomeEmailWorkflow(container).run({
            input: { customerId: data.id },
        })
    ])

    // 👇 UPDATED: Destructure all 3 results
    const [marketingResult, trackingResult, emailResult] = results

    if (marketingResult.status === 'rejected') {
        logger.error(`❌ Marketing Workflow Failed: ${marketingResult.reason}`)
    }

    if (trackingResult.status === 'rejected') {
        logger.error(`❌ Tracking Workflow Failed: ${trackingResult.reason}`)
    }

    // 👇 UPDATED: Check email workflow status
    if (emailResult.status === 'rejected') {
        logger.error(`❌ Welcome Email Workflow Failed: ${emailResult.reason}`)
    }
}

export const config: SubscriberConfig = {
    event: "customer.created"
}