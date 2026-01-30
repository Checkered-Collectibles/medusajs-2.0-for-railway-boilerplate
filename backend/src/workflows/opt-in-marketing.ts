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

// 1. UNIQUE STEP NAME: "retrieve-customer-marketing"
const retrieveCustomerMarketingStep = createStep(
    "retrieve-customer-marketing", // 👈 Must be unique
    async ({ customer_id }: { customer_id: string }, { container }) => {
        const query = container.resolve(ContainerRegistrationKeys.QUERY);

        const { data: customers } = await query.graph({
            entity: "customer",
            fields: ["email", "first_name", "last_name", "metadata"],
            filters: { id: customer_id },
        });

        const customer = customers[0];

        if (!customer) {
            throw new Error(`Customer with ID ${customer_id} not found`);
        }

        return new StepResponse(customer);
    }
);

// 2. UNIQUE STEP NAME: "sync-resend-marketing"
const addCustomerToResendStep = createStep(
    "sync-resend-marketing", // 👈 Must be unique
    async ({ customer }: { customer: any }, { container }) => {
        const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

        if (!process.env.RESEND_API_KEY || !AUDIENCE_ID) {
            return new StepResponse(false);
        }

        if (!customer.email) return new StepResponse(false);

        // Check Opt-in
        const hasOptedIn = customer.metadata?.marketing_opt_in === true;

        if (!hasOptedIn) {
            logger.info(`ℹ️ Customer ${customer.email} did not opt-in. Skipping.`);
            return new StepResponse(false);
        }

        try {
            const { error } = await resend.contacts.create({
                email: customer.email,
                firstName: customer.first_name || "",
                lastName: customer.last_name || "",
                segments: [{ id: AUDIENCE_ID }],
                unsubscribed: false,
            });

            if (error) throw new Error(error.message);

            logger.info(`✅ [Marketing] Added ${customer.email} to Resend.`);
            return new StepResponse(true);

        } catch (err: any) {
            logger.error(`❌ [Marketing] Failed to sync ${customer.email}: ${err.message}`);
            return new StepResponse(false);
        }
    }
);

export const optInMarketingWorkflow = createWorkflow(
    "opt-in-marketing-workflow",
    ({ customer_id }: { customer_id: string }) => {
        const customer = retrieveCustomerMarketingStep({ customer_id });
        addCustomerToResendStep({ customer });
        return new WorkflowResponse(customer);
    }
);