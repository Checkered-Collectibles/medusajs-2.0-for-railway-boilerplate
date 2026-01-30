import {
    createWorkflow,
    createStep,
    StepResponse,
} from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys, QueryContext } from "@medusajs/framework/utils";
import { getVariantAvailability } from "@medusajs/framework/utils";
import { Resend } from "resend";
import { jsx } from "react/jsx-runtime";
import WeeklyTrendingEmail from "../modules/email-notifications/templates/weekly-trending";

// CONFIGURATION
const INCLUDED_CATEGORY_IDS = [
    "pcat_01KC3X8VFE8G7XBNYMVC1RSYEK", // Premium
    "pcat_01KD8CKD5Y31RHVWR8FNRVD78J"  // Hot
];
const PRODUCTS_TO_SHOW = 6;
const STORE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://checkered.in";

// Helper: Fisher-Yates Shuffle
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

        // 1. Get Default Sales Channel
        const { data: salesChannels } = await query.graph({
            entity: "sales_channel",
            fields: ["id"],
            pagination: { take: 1 },
        });
        const salesChannelId = salesChannels[0]?.id;

        if (!salesChannelId) {
            throw new Error("No Sales Channel found! Cannot check inventory.");
        }

        // 2. Fetch Products with Calculated Prices
        const { data: rawProducts } = await query.graph({
            entity: "product",
            fields: [
                "id",
                "title",
                "handle",
                "thumbnail",
                "created_at",
                "categories.id",
                "variants.id",
                "variants.manage_inventory",
                "variants.allow_backorder",
                "variants.calculated_price.*" // 👈 Fetch calculated price fields
            ],
            filters: { status: "published" },
            context: {
                variants: {
                    calculated_price: QueryContext({
                        region_id: "reg_01KC28ZR0B4MT6JQZR94589866", // Set your specific Region ID
                        currency_code: "inr",                        // Set your specific Currency
                    }),
                },
            },
            pagination: {
                take: 100,
                order: {
                    created_at: "DESC"
                },
            },
        });

        logger.info(`🔍 Fetched ${rawProducts.length} raw products. Calculating inventory availability...`);

        // 3. Bulk Inventory Check
        const allVariantIds = rawProducts.flatMap(p => p.variants.map(v => v.id));

        const availabilityMap = await getVariantAvailability(query, {
            variant_ids: allVariantIds,
            sales_channel_id: salesChannelId,
        });

        // 4. Robust Filtering
        const validProducts = rawProducts.filter((product) => {
            // A. Category Check
            const isIncluded = product.categories?.some((c) =>
                INCLUDED_CATEGORY_IDS.includes(c.id)
            );
            if (!isIncluded) return false;

            // B. Price Check – must have a calculated_amount (Effective Price)
            // We check if ANY variant has a valid price for this region
            const hasPrice = product.variants?.some(
                (v) => !!v.calculated_price?.calculated_amount
            );
            if (!hasPrice) return false;

            // C. Stock Check
            const hasStock = product.variants?.some((v) => {
                if (!v.manage_inventory || v.allow_backorder) return true;
                const stockInfo = availabilityMap[v.id];
                return (stockInfo?.availability || 0) > 0;
            });

            if (!hasStock) return false;

            return true;
        });

        if (validProducts.length === 0) {
            throw new Error("No valid products found for weekly email.");
        }

        // 5. Freshness Logic
        const ONE_WEEK_AGO = new Date();
        ONE_WEEK_AGO.setDate(ONE_WEEK_AGO.getDate() - 7);

        const freshDrops: typeof validProducts = [];
        const classics: typeof validProducts = [];

        validProducts.forEach(p => {
            const createdDate = new Date(p.created_at);
            if (createdDate > ONE_WEEK_AGO) freshDrops.push(p);
            else classics.push(p);
        });

        // 6. Selection Logic
        let selectedProducts = [...freshDrops.slice(0, PRODUCTS_TO_SHOW)];

        if (selectedProducts.length < PRODUCTS_TO_SHOW) {
            const slotsNeeded = PRODUCTS_TO_SHOW - selectedProducts.length;
            const shuffledClassics = shuffleArray(classics);
            selectedProducts = [...selectedProducts, ...shuffledClassics.slice(0, slotsNeeded)];
        }

        // 7. Headlines
        let emailHeadline = "🔥 Fresh Drops for the Weekend!";
        let emailSubhead = "These just landed. Secure yours before they're gone.";

        if (freshDrops.length === 0) {
            emailHeadline = "💎 Collectors' Picks: Hidden Gems";
            emailSubhead = "We dug into the vault to find these favorites. Don't miss out.";
        }

        // 8. Formatting using Calculated Price
        const formattedProducts = selectedProducts.map((p) => {
            // Find the first variant with a valid price
            const variant = p.variants.find(v => !!v.calculated_price?.calculated_amount) || p.variants[0];
            const cp = variant.calculated_price;

            // Helpers
            const formatMoney = (amount: number) => new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0
            }).format(amount);

            let displayPrice = "N/A";

            if (cp) {
                const currentPrice = cp.calculated_amount; // The price they pay (Sale)
                const originalPrice = cp.original_amount;   // The original price (List)

                displayPrice = formatMoney(currentPrice);

                // Check for Discount: Is the original price higher than what they pay?
                // Also ensures we don't show "Was 0" or equal prices
                if (originalPrice && originalPrice > currentPrice) {
                    displayPrice = `${formatMoney(currentPrice)} (Was ${formatMoney(originalPrice)})`;
                }
            }

            return {
                id: p.id,
                name: p.title,
                price: displayPrice,
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
        const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID_TEST || process.env.RESEND_AUDIENCE_ID;

        if (!process.env.RESEND_FROM) throw new Error("Missing RESEND_FROM in .env");

        try {
            const { data: resendData, error } = await resend.broadcasts.create({
                name: `Weekly Drop - ${new Date().toLocaleDateString()}`,
                replyTo: 'hello@checkered.in',
                segmentId: AUDIENCE_ID as string,
                from: process.env.RESEND_FROM,
                subject: data.headline,
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

export const weeklyBroadcastWorkflow = createWorkflow(
    "weekly-broadcast-workflow",
    () => {
        const data = fetchIntelligentProductsStep();
        sendWeeklyBroadcastStep({ data });
    }
);