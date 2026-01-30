import {
    createWorkflow,
    createStep,
    StepResponse,
    WorkflowResponse // 👈 1. Import this
} from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

// --- Step: Fetch & Sync ---
const syncCustomersStep = createStep(
    "sync-customers-step",
    async (_, { container }) => {
        const query = container.resolve(ContainerRegistrationKeys.QUERY);
        const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

        const { data: customers } = await query.graph({
            entity: "customer",
            fields: ["email", "first_name", "last_name"],
        });

        logger.info(`Found ${customers.length} customers to sync...`);

        let successCount = 0;
        let failCount = 0;

        const chunkSize = 50;

        for (let i = 0; i < customers.length; i += chunkSize) {
            const chunk = customers.slice(i, i + chunkSize);

            await Promise.all(
                chunk.map(async (customer) => {
                    if (!customer.email) return;

                    try {
                        // Note: Ensure your Resend SDK version matches these keys. 
                        // Older versions use snake_case (audience_id), newer use camelCase (audienceId).
                        await resend.contacts.create({
                            email: customer.email,
                            firstName: customer.first_name,
                            lastName: customer.last_name,
                            audienceId: AUDIENCE_ID as string,
                            unsubscribed: false,
                        });
                        successCount++;
                    } catch (err) {
                        logger.error(`Failed to sync ${customer.email}: ${err.message}`);
                        failCount++;
                    }
                })
            );
        }

        return new StepResponse({ success: successCount, failed: failCount });
    }
);

// --- Workflow Definition ---
export const syncAudienceWorkflow = createWorkflow(
    "sync-audience-workflow",
    () => {
        const stepResult = syncCustomersStep();

        // 👈 2. Wrap the result in WorkflowResponse
        return new WorkflowResponse(stepResult);
    }
);