import {
    createWorkflow,
    createStep,
    StepResponse,
    WorkflowResponse
} from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { Resend } from "resend";
import WeeklyTrendingEmail from "../modules/email-notifications/templates/weekly-trending";
import { jsx } from "react/jsx-runtime";

// CONFIGURATION
const EXCLUDED_CATEGORY_HANDLE = "mainline-fantasy";
const PRODUCTS_TO_SHOW = 4;
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

        // 1. Fetch a larger pool of products (e.g., 100 most recent)
        // We fetch more than we need so we have a pool to shuffle from.
        const { data: rawProducts } = await query.graph({
            entity: "product",
            fields: [
                "id",
                "title",
                "handle",
                "thumbnail",
                "created_at",
                "categories.handle",
                "variants.inventory_quantity",
                "variants.prices.amount",
                "variants.prices.currency_code",
            ],
            filters: { status: "published" },
            pagination: {
                take: 100,
                order: {
                    created_at: "DESC",
                },
            },
        })

        // 2. Filter: Must be In Stock & Not Fantasy
        const validProducts = rawProducts.filter((product) => {
            const isFantasy = product.categories?.some(
                (c) => c.handle === EXCLUDED_CATEGORY_HANDLE
            );
            const hasStock = product.variants?.some((v) => v.inventory_quantity > 0);
            const hasPrice = product.variants?.[0]?.prices?.[0];

            return !isFantasy && hasStock && hasPrice;
        });

        if (validProducts.length === 0) {
            // Only error if literally NOTHING is in stock
            throw new Error("No valid products found for weekly email.");
        }

        // 3. Split into "Fresh Drops" and "Classics"
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

        // 4. Selection Logic
        let selectedProducts: typeof validProducts = [];

        // A. Add all fresh drops first (up to limit)
        selectedProducts = [...freshDrops.slice(0, PRODUCTS_TO_SHOW)];

        // B. If we still need more, Shuffle the classics and fill the gaps
        if (selectedProducts.length < PRODUCTS_TO_SHOW) {
            const slotsNeeded = PRODUCTS_TO_SHOW - selectedProducts.length;

            // Randomize the older stuff so it's not the same every week
            const shuffledClassics = shuffleArray(classics);

            // Add the random picks
            selectedProducts = [
                ...selectedProducts,
                ...shuffledClassics.slice(0, slotsNeeded)
            ];
        }

        // 5. Dynamic Headline Logic
        // If we have mostly new stuff, say "Fresh Drops". If not, say "Hidden Gems".
        let emailHeadline = "🔥 Fresh Drops for the Weekend!";
        let emailSubhead = "These just landed. Secure yours before they're gone.";

        if (freshDrops.length === 0) {
            emailHeadline = "💎 Collectors' Picks: Hidden Gems";
            emailSubhead = "We dug into the vault to find these favorites. Don't miss out.";
        }

        // 6. Format for Email
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
        const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID_TEST;

        try {
            const { data: resendData, error } = await resend.broadcasts.create({
                segmentId: AUDIENCE_ID as string,
                from: "Checkered Collectibles <hello@checkered.in>",
                subject: data.headline, // Use the dynamic headline as subject too
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