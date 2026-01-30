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

        logger.info(`🔍 Found ${customers.length} customers to sync...`);

        let successCount = 0;
        let failCount = 0;
        const errors: any[] = [];
        const chunkSize = 50;

        // 3. Sync Loop
        for (let i = 0; i < customers.length; i += chunkSize) {
            const chunk = customers.slice(i, i + chunkSize);

            await Promise.all(
                chunk.map(async (customer) => {
                    if (!customer.email) return;

                    try {
                        // ✅ THE ACTUAL WAY: Create/Update Contact
                        // The Resend SDK uses camelCase for keys (firstName, audienceId)
                        const { error } = await resend.contacts.create({
                            email: customer.email,
                            firstName: customer.first_name || "",
                            lastName: customer.last_name || "",
                            audienceId: AUDIENCE_ID, // 👈 REQUIRED: The ID from your Resend Dashboard URL
                            unsubscribed: false,
                        });

                        if (error) {
                            // Resend often returns { name: 'validation_error', message: '...' }
                            // This ensures we catch it.
                            throw new Error(error.message || "Unknown Resend Error");
                        }

                        successCount++;
                    } catch (err: any) {
                        // Log the specific error to help debug
                        logger.error(`❌ Failed ${customer.email}: ${err.message}`);
                        errors.push({ email: customer.email, error: err.message });
                        failCount++;
                    }
                })
            );
        }

        logger.info(`✅ Sync Complete: ${successCount} added, ${failCount} failed.`);

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