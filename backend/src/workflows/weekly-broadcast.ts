import {
    createWorkflow,
    createStep,
    StepResponse,
    WorkflowResponse
} from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { getVariantAvailability } from "@medusajs/framework/utils";
import { Resend } from "resend";
import { jsx } from "react/jsx-runtime";
import WeeklyTrendingEmail from "../modules/email-notifications/templates/weekly-trending";

// CONFIGURATION
// Only products in these categories will be shown
const INCLUDED_CATEGORY_IDS = [
    "pcat_01KC3X8VFE8G7XBNYMVC1RSYEK", // Premium
    "pcat_01KD8CKD5Y31RHVWR8FNRVD78J"  // Hot
];
const PRODUCTS_TO_SHOW = 6;
const STORE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://checkered.in";

// Helper: Fisher-Yates Shuffle to randomize array
function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- STEP 1: Fetch Intelligent Selection ---
const fetchIntelligentProductsStep = createStep(
    "fetch-intelligent-products",
    async (_, { container }) => {
        const query = container.resolve(ContainerRegistrationKeys.QUERY);
        const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

        // 1. Get Default Sales Channel (Required for availability check)
        const { data: salesChannels } = await query.graph({
            entity: "sales_channel",
            fields: ["id"],
            pagination: { // 👈 CHANGED from 'pagination' to 'options'
                take: 1,
            },
        });
        const salesChannelId = salesChannels[0]?.id;

        if (!salesChannelId) {
            throw new Error("No Sales Channel found! Cannot check inventory.");
        }

        // 2. Fetch a larger pool of products (e.g., 100 most recent)
        // We fetch more than we need so we have a pool to shuffle from.
        const { data: rawProducts } = await query.graph({
            entity: "product",
            fields: [
                "id",
                "title",
                "handle",
                "thumbnail",
                "created_at",
                "categories.id",
                "categories.handle",
                "variants.id",               // Needed for availability check
                "variants.manage_inventory",
                "variants.allow_backorder",
                "variants.prices.amount",
                "variants.prices.currency_code",
            ],
            filters: { status: "published" },
            pagination: { // 👈 CHANGED from 'pagination' to 'options'
                take: 100,
                order: {
                    created_at: "DESC"
                },
            },
        });

        logger.info(`🔍 Fetched ${rawProducts.length} raw products. Calculating availability...`);

        // 3. Collect all Variant IDs for bulk availability check
        const allVariantIds = rawProducts.flatMap(p => p.variants.map(v => v.id));

        // 4. Calculate TRUE Availability (Handles reservations & stock locations)
        const availabilityMap = await getVariantAvailability(query, {
            variant_ids: allVariantIds,
            sales_channel_id: salesChannelId,
        });

        // 5. Robust Filtering
        const validProducts = rawProducts.filter((product) => {
            // A. Category Check
            const isIncluded = product.categories?.some((c) =>
                INCLUDED_CATEGORY_IDS.includes(c.id)
            );
            if (!isIncluded) return false;

            // B. Price Check
            const hasPrice = product.variants?.some(
                (v) => v.prices && v.prices.length > 0
            );
            if (!hasPrice) {
                // logger.warn(`Skipping ${product.title}: No Price`);
                return false;
            }

            // C. Robust Stock Check using Availability Map
            const hasStock = product.variants?.some((v) => {
                // If inventory is not managed or backorders allowed, it's available
                if (!v.manage_inventory || v.allow_backorder) return true;

                // Check calculated availability
                const stockInfo = availabilityMap[v.id];
                return (stockInfo?.availability || 0) > 0;
            });

            if (!hasStock) {
                // logger.warn(`Skipping ${product.title}: Out of Stock`);
                return false;
            }

            return true;
        });

        logger.info(`✅ Found ${validProducts.length} valid products after filtering.`);

        if (validProducts.length === 0) {
            throw new Error("No valid products found for weekly email.");
        }

        // 6. Split into "Fresh Drops" and "Classics"
        const ONE_WEEK_AGO = new Date();
        ONE_WEEK_AGO.setDate(ONE_WEEK_AGO.getDate() - 7);

        const freshDrops: typeof validProducts = [];
        const classics: typeof validProducts = [];

        validProducts.forEach(p => {
            const createdDate = new Date(p.created_at);
            if (createdDate > ONE_WEEK_AGO) {
                freshDrops.push(p);
            } else {
                classics.push(p);
            }
        });

        // 7. Selection Logic
        let selectedProducts: typeof validProducts = [];

        // A. Add all fresh drops first (up to limit)
        selectedProducts = [...freshDrops.slice(0, PRODUCTS_TO_SHOW)];

        // B. If we still need more, Shuffle the classics and fill the gaps
        if (selectedProducts.length < PRODUCTS_TO_SHOW) {
            const slotsNeeded = PRODUCTS_TO_SHOW - selectedProducts.length;
            const shuffledClassics = shuffleArray(classics);
            selectedProducts = [
                ...selectedProducts,
                ...shuffledClassics.slice(0, slotsNeeded)
            ];
        }

        // 8. Dynamic Headline Logic
        let emailHeadline = "🔥 Fresh Drops for the Weekend!";
        let emailSubhead = "These just landed. Secure yours before they're gone.";

        if (freshDrops.length === 0) {
            emailHeadline = "💎 Collectors' Picks: Hidden Gems";
            emailSubhead = "We dug into the vault to find these favorites. Don't miss out.";
        }

        // 9. Format for Email
        const formattedProducts = selectedProducts.map((p) => {
            const priceObj = p.variants[0].prices[0];
            const formattedPrice = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: priceObj.currency_code || 'INR',
                minimumFractionDigits: 0
            }).format(priceObj.amount);

            return {
                id: p.id,
                name: p.title,
                price: formattedPrice,
                imageUrl: p.thumbnail,
                productUrl: `${STORE_URL}/products/${p.handle}`,
            };
        });

        return new StepResponse({
            products: formattedProducts,
            headline: emailHeadline,
            subHeadline: emailSubhead
        });
    }
);

// --- STEP 2: Render & Broadcast ---
const sendWeeklyBroadcastStep = createStep(
    "send-weekly-broadcast",
    async ({ data }: { data: any }, { container }) => {
        const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
        const resend = new Resend(process.env.RESEND_API_KEY);
        // Use TEST ID if available for safety, else Prod
        const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID_TEST || process.env.RESEND_AUDIENCE_ID;

        if (!process.env.RESEND_FROM) {
            throw new Error("Missing RESEND_FROM in .env");
        }

        try {
            const { data: resendData, error } = await resend.broadcasts.create({
                name: `Weekly Drop - ${new Date().toLocaleDateString()}`,
                replyTo: 'hello@checkered.in',
                // Use 'segmentId' for Resend v4+
                segmentId: AUDIENCE_ID as string,
                from: process.env.RESEND_FROM,
                subject: data.headline,
                // Using 'react' property lets Resend handle the HTML generation
                react: jsx(WeeklyTrendingEmail, {
                    products: data.products,
                    headline: data.headline,
                    subHeadline: data.subHeadline,
                    shopAllLink: `${STORE_URL}/store`,
                    unsubscribeUrl: "{{ unsubscribe_url }}",
                }),
            });

            if (error) throw new Error(error.message);
            logger.info(`✅ Weekly Broadcast Sent! ID: ${resendData?.id}`);
            return new StepResponse(resendData);

        } catch (err: any) {
            logger.error(`❌ Broadcast Failed: ${err.message}`);
            throw new Error(err.message);
        }
    }
);

// --- WORKFLOW DEFINITION ---
export const weeklyBroadcastWorkflow = createWorkflow(
    "weekly-broadcast-workflow",
    () => {
        const data = fetchIntelligentProductsStep();
        sendWeeklyBroadcastStep({ data });
    }
);