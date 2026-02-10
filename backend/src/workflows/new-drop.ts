import {
    createWorkflow,
    createStep,
    StepResponse,
    WorkflowResponse
} from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { Resend } from "resend";
import { NewCollectionDropEmail } from "../modules/email-notifications/templates";
// Note: In Next.js/React email, we usually use 'render' or pass the component to the provider.
// If using Resend SDK directly with React, ensure your build supports it.
// Alternatively, render to HTML string if needed.

// --- INPUT TYPE ---
type NewDropWorkflowInput = {
    collection_id: string; // The ID of the Product Collection (e.g., "pcol_...")
    headline: string;
    subHeadline: string;
    audience_id?: string; // Optional override for Resend Audience ID
}

// --- STEP 1: Fetch & Select Products ---
const fetchCollectionDataStep = createStep(
    "fetch-collection-data",
    async (input: NewDropWorkflowInput, { container }) => {
        const query = container.resolve(ContainerRegistrationKeys.QUERY);

        // 1. Fetch Collection & Products
        // We limit to 4 products for the email highlights grid
        const { data: products } = await query.graph({
            entity: "product",
            fields: [
                "id",
                "title",
                "handle",
                "thumbnail",
                "collection_id",
                "variants.calculated_price.*" // Needed if you want to show price
            ],
            filters: {
                collection_id: input.collection_id,
                status: "published"
            },
            pagination: {
                take: 4, // Only need 4 highlights
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
            imageUrl: p.thumbnail || "", // Fallback if missing
            productUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${p.handle}?utm_source=newsletter&utm_medium=email&utm_campaign=new-drop`,
        }));

        // 3. Construct Collection URL
        // Assuming your storefront uses /collections/[id] or /collections/[handle]
        // We will fetch the collection handle to be safe
        const { data: collections } = await query.graph({
            entity: "product_collection",
            fields: ["handle"],
            filters: { id: input.collection_id }
        });

        const collectionHandle = collections[0]?.handle || input.collection_id;
        const collectionUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/collections/${collectionHandle}`;

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

        // Initialize Resend
        const apiKey = process.env.RESEND_API_KEY;
        const fromEmail = process.env.RESEND_FROM || "onboarding@resend.dev";
        const audienceId = data.audience_id || process.env.RESEND_AUDIENCE_ID;

        if (!apiKey || !audienceId) {
            throw new Error("Missing RESEND_API_KEY or RESEND_AUDIENCE_ID");
        }

        const resend = new Resend(apiKey);

        try {
            // 1. Send via Resend Broadcasts API
            // Note: This relies on the Resend 'Broadcasts' feature (Marketing)
            // If you don't have this, you might need to loop through subscribers (batch sending).
            // Here we assume Broadcasts is enabled.

            const emailProps = {
                headline: data.headline,
                subHeadline: data.subHeadline,
                collectionUrl: data.collectionUrl,
                highlights: data.highlights,
                unsubscribeUrl: "{{{RESEND_UNSUBSCRIBE_URL}}}", // Resend magic tag
            };

            const { data: broadcastData, error } = await resend.broadcasts.create({
                name: `Drop: ${data.headline}`,
                from: fromEmail,
                audienceId: audienceId,
                subject: `🚨 ${data.headline}`,
                react: NewCollectionDropEmail(emailProps), // Pass component directly
            });

            if (error) {
                logger.error(`❌ Resend Broadcast Error: ${error.message}`);
                throw new Error(error.message);
            }

            // 2. Send Immediately
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