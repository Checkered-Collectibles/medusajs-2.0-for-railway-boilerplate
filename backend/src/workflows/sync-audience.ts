import {
    createWorkflow,
    createStep,
    StepResponse,
    WorkflowResponse
} from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

// Helper to pause execution (Rate Limiter)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const syncCustomersStep = createStep(
    "sync-customers-step",
    async (_, { container }) => {
        const query = container.resolve(ContainerRegistrationKeys.QUERY);
        const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

        // 1. Validation
        if (!process.env.RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY");
        if (!AUDIENCE_ID) throw new Error("Missing RESEND_AUDIENCE_ID");

        // 2. Fetch Customers
        const { data: customers } = await query.graph({
            entity: "customer",
            fields: ["email", "first_name", "last_name"],
        });

        logger.info(`🔍 Found ${customers.length} customers. Starting rate-limited sync...`);

        let successCount = 0;
        let failCount = 0;
        const errors: any[] = [];

        // 3. Rate Limit Settings
        // Resend Limit: 10 requests / second.
        // We will do batches of 5, then wait 1 second to be safe.
        const BATCH_SIZE = 5;
        const DELAY_MS = 1100; // 1.1 seconds

        for (let i = 0; i < customers.length; i += BATCH_SIZE) {
            const chunk = customers.slice(i, i + BATCH_SIZE);

            // Process the current batch in parallel
            await Promise.all(
                chunk.map(async (customer) => {
                    if (!customer.email) return;

                    try {
                        // Resend 'create' will UPDATE the contact if they already exist.
                        // It will NOT create a duplicate.
                        const { error } = await resend.contacts.create({
                            email: customer.email,
                            firstName: customer.first_name || "",
                            lastName: customer.last_name || "",
                            segments: [{ id: AUDIENCE_ID }],
                            unsubscribed: false,
                        });

                        if (error) {
                            // Ignore "already exists" errors if they happen (though usually it just updates)
                            logger.warn(`⚠️ Issue with ${customer.email}: ${error.message}`);
                            errors.push({ email: customer.email, error: error.message });
                            failCount++;
                        } else {
                            successCount++;
                        }
                    } catch (err: any) {
                        logger.error(`❌ Error ${customer.email}: ${err.message}`);
                        errors.push({ email: customer.email, error: err.message });
                        failCount++;
                    }
                })
            );

            // Log progress
            logger.info(`Synced ${Math.min(i + BATCH_SIZE, customers.length)} / ${customers.length} customers...`);

            // 4. WAIT before next batch to respect rate limits
            if (i + BATCH_SIZE < customers.length) {
                await sleep(DELAY_MS);
            }
        }

        logger.info(`✅ Sync Complete: ${successCount} updated/added, ${failCount} failed.`);

        return new StepResponse({ success: successCount, failed: failCount, errors });
    }
);

export const syncAudienceWorkflow = createWorkflow(
    "sync-audience-workflow",
    () => {
        const stepResult = syncCustomersStep();
        return new WorkflowResponse(stepResult);
    }
);