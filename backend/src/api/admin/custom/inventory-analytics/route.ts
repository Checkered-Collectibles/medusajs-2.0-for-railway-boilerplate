import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { getVariantAvailability } from "@medusajs/utils";

// --- CONSTANTS ---
const FIXED_COST_CATEGORIES = [
    "pcat_01KC3X8VFE8G7XBNYMVC1RSYEK",
    "pcat_01KC3ZZ9RWEQ12WS8B2NZ8MGQ8"
]
const FIXED_COST_AMOUNT = 167

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    // 1. Define Categories
    const CATEGORY_MAP: Record<string, string> = {
        "pcat_01KC3X8VFE8G7XBNYMVC1RSYEK": "Licensed",
        "pcat_01KC3ZZ9RWEQ12WS8B2NZ8MGQ8": "Fantasy",
        "pcat_01KD8CKD5Y31RHVWR8FNRVD78J": "Premium"
    };
    const targetCategoryIds = Object.keys(CATEGORY_MAP);

    // 2. Fetch Products
    const { data: products } = await query.graph({
        entity: "product",
        fields: [
            "id",
            "title",
            "thumbnail",
            "metadata", // Needed for fallback COGS
            "categories.id",
            "categories.name",
            "variants.id",
            "variants.title",
            "variants.sku"
        ],
        filters: {
            categories: {
                id: targetCategoryIds,
            },
        },
        pagination: {
            take: 2000
        }
    });

    // 3. Fetch Sales Channel
    const { data: salesChannels } = await query.graph({
        entity: "sales_channel",
        fields: ["id"],
        pagination: { take: 1 }
    });

    const defaultSalesChannelId = salesChannels[0]?.id;

    if (!defaultSalesChannelId) {
        return res.status(500).json({ error: "No Sales Channel found." });
    }

    // 4. Extract Variant IDs & Calculate Availability
    const allVariantIds = products.flatMap((p: any) =>
        (p.variants || []).map((v: any) => v.id)
    );

    let availabilityMap: Record<string, any> = {};
    if (allVariantIds.length > 0) {
        availabilityMap = await getVariantAvailability(query, {
            variant_ids: allVariantIds,
            sales_channel_id: defaultSalesChannelId,
        });
    }

    // 5. Bucketing & COGS Logic
    const buckets = {
        Licensed: { count: 0, stock: 0, value: 0, items: [] as any[] },
        Fantasy: { count: 0, stock: 0, value: 0, items: [] as any[] },
        Premium: { count: 0, stock: 0, value: 0, items: [] as any[] },
        Uncategorized: { count: 0, stock: 0, value: 0, items: [] as any[] }
    };

    products.forEach((product: any) => {
        // A. Determine Category Bucket
        let categoryKey = "Uncategorized";
        // We check if ANY of the product's categories match our target map
        const matchedCat = product.categories?.find((c: any) => CATEGORY_MAP[c.id]);
        if (matchedCat) {
            categoryKey = CATEGORY_MAP[matchedCat.id];
        }

        // B. Calculate Stock
        let totalStock = 0;
        const variantsData = (product.variants || []).map((v: any) => {
            const variantInfo = availabilityMap[v.id];
            const quantity = variantInfo ? variantInfo.availability : 0;
            totalStock += quantity;
            return {
                id: v.id,
                title: v.title,
                inventory_quantity: quantity
            };
        });

        // C. Calculate Unit Cost (COGS)
        let unitCost = 0;
        const isFixedCost = product.categories?.some((c: any) => FIXED_COST_CATEGORIES.includes(c.id));

        if (isFixedCost) {
            unitCost = FIXED_COST_AMOUNT;
        } else {
            unitCost = Number(product.metadata?.cogs) || 0;
        }

        // Total Value for this Product
        const totalValue = totalStock * unitCost;

        // D. Add to Bucket
        // @ts-ignore
        if (buckets[categoryKey]) {
            // @ts-ignore
            buckets[categoryKey].count += 1;
            // @ts-ignore
            buckets[categoryKey].stock += totalStock;
            // @ts-ignore
            buckets[categoryKey].value += totalValue; // Add Value to Bucket
            // @ts-ignore
            buckets[categoryKey].items.push({
                id: product.id,
                title: product.title,
                thumbnail: product.thumbnail,
                categoryLabel: categoryKey,
                totalStock,
                unitCost, // Send this to frontend for transparency
                variants: variantsData
            });
        }
    });

    // Sort buckets
    Object.values(buckets).forEach((b: any) => {
        b.items.sort((a: any, b: any) => a.totalStock - b.totalStock);
    });

    res.json({ stats: buckets });
}