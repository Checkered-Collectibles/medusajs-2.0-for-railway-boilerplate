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
            pagination: { // 👈 CHANGED from 'pagination' to 'options'
                take: 1,
                order: {
                    created_at: "DESC"
                },
            },
        });
        const salesChannelId = salesChannels[0]?.id;

        if (!salesChannelId) {
            throw new Error("No Sales Channel found! Cannot check inventory.");
        }

        // 2. Fetch Products
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
                "variants.prices.amount",        // Fetch amount
                "variants.prices.currency_code", // Fetch currency
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

        // 3. Bulk Availability Check
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

            // B. Price Check
            const hasPrice = product.variants?.some(v => v.prices?.length > 0);
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

        // 5. Freshness Logic (Last 7 Days)
        const ONE_WEEK_AGO = new Date();
        ONE_WEEK_AGO.setDate(ONE_WEEK_AGO.getDate() - 7);

        const freshDrops: typeof validProducts = [];
        const classics: typeof validProducts = [];

        validProducts.forEach(p => {
            const createdDate = new Date(p.created_at);
            if (createdDate > ONE_WEEK_AGO) freshDrops.push(p);
            else classics.push(p);
        });

        // 6. Selection Logic (Fresh first, then Random Classics)
        let selectedProducts = [...freshDrops.slice(0, PRODUCTS_TO_SHOW)];

        if (selectedProducts.length < PRODUCTS_TO_SHOW) {
            const slotsNeeded = PRODUCTS_TO_SHOW - selectedProducts.length;
            const shuffledClassics = shuffleArray(classics);
            selectedProducts = [...selectedProducts, ...shuffledClassics.slice(0, slotsNeeded)];
        }

        // 7. Dynamic Headlines
        let emailHeadline = "🔥 Fresh Drops for the Weekend!";
        let emailSubhead = "These just landed. Secure yours before they're gone.";

        if (freshDrops.length === 0) {
            emailHeadline = "💎 Collectors' Picks: Hidden Gems";
            emailSubhead = "We dug into the vault to find these favorites. Don't miss out.";
        }

        // 8. Formatting (With Discount Logic)
        const formattedProducts = selectedProducts.map((p) => {
            const variant = p.variants[0];
            const prices = variant.prices;

            // Find the main currency (e.g. INR)
            const currencyCode = prices[0]?.currency_code || 'INR';

            // Filter prices to ensure we only compare same currency
            const relevantPrices = prices.filter(pr => pr.currency_code === currencyCode);

            // Find lowest (Sale) and highest (Original)
            const minPrice = Math.min(...relevantPrices.map(pr => pr.amount));
            const maxPrice = Math.max(...relevantPrices.map(pr => pr.amount));

            // Format Currency
            const formatMoney = (amount: number) => new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 0
            }).format(amount);

            let displayPrice = formatMoney(minPrice);

            // If there is a discount (e.g. Sale Price exists)
            if (minPrice < maxPrice) {
                // Returns string like: "₹999 (Was ₹1,299)"
                displayPrice = `${formatMoney(minPrice)} (Was ${formatMoney(maxPrice)})`;
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