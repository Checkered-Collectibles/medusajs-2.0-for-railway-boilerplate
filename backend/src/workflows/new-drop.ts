import {
    createWorkflow,
    createStep,
    StepResponse,
    WorkflowResponse
} from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys, QueryContext } from "@medusajs/framework/utils"; // 👈 ADDED IMPORT
import { Resend } from "resend";
import { NewCollectionDropEmail } from "../modules/email-notifications/templates/new-drop";

// --- INPUT TYPE ---
type NewDropWorkflowInput = {
    collection_id: string;
    headline: string;
    subHeadline: string;
    audience_id?: string;
}

// --- STEP 1: Fetch & Select Products ---
const fetchCollectionDataStep = createStep(
    "fetch-collection-data",
    async (input: NewDropWorkflowInput, { container }) => {
        const query = container.resolve(ContainerRegistrationKeys.QUERY);

        // 1. Fetch Collection & Products with Pricing Context
        const { data: products } = await query.graph({
            entity: "product",
            fields: [
                "id",
                "title",
                "handle",
                "thumbnail",
                "collection_id",
                "variants.calculated_price.*"
            ],
            filters: {
                collection_id: input.collection_id,
                status: "published"
            },
            // 👇 THIS IS THE FIX: Provide Currency Context
            context: {
                variants: {
                    calculated_price: QueryContext({
                        currency_code: "inr" // Or fetch your region's currency dynamically
                    })
                }
            },
            pagination: {
                take: 2,
                order: { created_at: "DESC" }
            }
        });

        if (!products || products.length === 0) {
            throw new Error(`No published products found for collection: ${input.collection_id}`);
        }

        // 2. Format for Email Template
        const highlights = products.map((p) => ({
            id: p.id,
            name: p.title,
            imageUrl: p.thumbnail || "",
            productUrl: `https://checkered.in/products/${p.handle}?utm_source=newsletter&utm_medium=email&utm_campaign=new-drop`,
        }));

        // 3. Construct Collection URL
        const { data: collections } = await query.graph({
            entity: "product_collection",
            fields: ["handle"],
            filters: { id: input.collection_id }
        });

        const collectionHandle = collections[0]?.handle || input.collection_id;
        const collectionUrl = `https://checkered.in/collections/${collectionHandle}`;

        return new StepResponse({
            highlights,
            collectionUrl,
            ...input
        });
    }
);

// --- STEP 2: Send Broadcast ---
const sendDropBroadcastStep = createStep(
    "send-drop-broadcast",
    async (data: any, { container }) => {
        const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

        const apiKey = process.env.RESEND_API_KEY;
        const fromEmail = process.env.RESEND_FROM || "onboarding@resend.dev";
        const audienceId = data.audience_id || process.env.RESEND_AUDIENCE_ID;

        if (!apiKey || !audienceId) {
            throw new Error("Missing RESEND_API_KEY or RESEND_AUDIENCE_ID");
        }

        const resend = new Resend(apiKey);

        try {
            const emailProps = {
                headline: data.headline,
                subHeadline: data.subHeadline,
                collectionUrl: data.collectionUrl,
                highlights: data.highlights,
                unsubscribeUrl: "{{{RESEND_UNSUBSCRIBE_URL}}}",
            };

            const { data: broadcastData, error } = await resend.broadcasts.create({
                name: `Drop: ${data.headline}`,
                from: fromEmail,
                audienceId: audienceId,
                subject: `🚨 ${data.headline}`,
                react: NewCollectionDropEmail(emailProps),
            });

            if (error) {
                logger.error(`❌ Resend Broadcast Error: ${error.message}`);
                throw new Error(error.message);
            }

            await resend.broadcasts.send(broadcastData.id);

            logger.info(`✅ New Drop Broadcast Sent! ID: ${broadcastData.id}`);

            return new StepResponse({
                success: true,
                broadcast_id: broadcastData.id
            });

        } catch (error: any) {
            logger.error(`❌ Workflow Failed: ${error.message}`);
            throw new Error(error.message);
        }
    }
);

// --- WORKFLOW EXPORT ---
export const newCollectionDropWorkflow = createWorkflow(
    "new-collection-drop-workflow",
    (input: NewDropWorkflowInput) => {
        const formattedData = fetchCollectionDataStep(input);
        const result = sendDropBroadcastStep(formattedData);
        return new WorkflowResponse(result);
    }
);