import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

// --- CONSTANTS ---
const FIXED_COST_CATEGORIES = [
    "pcat_01KC3X8VFE8G7XBNYMVC1RSYEK",
    "pcat_01KC3ZZ9RWEQ12WS8B2NZ8MGQ8"
]
const FIXED_COST_AMOUNT = 167

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: "startDate and endDate are required" });
    }

    // 1. Fetch Orders with Payment Collections
    const { data: orders } = await query.graph({
        entity: "order",
        fields: [
            "id",
            "display_id",
            "created_at",
            "currency_code",
            "payment_collections.status",
            "items.unit_price",
            "items.quantity",
            "items.variant.product.id",
            "items.variant.product.metadata",
            "items.variant.product.categories.id"
        ],
        filters: {
            created_at: {
                $gt: startDate,
                $lte: endDate
            },
        },
        pagination: {
            take: 5000
        }
    });

    // 2. Perform Calculations
    let totalRevenue = 0;
    let totalCogs = 0;
    let totalQuantity = 0; // 🆕 Added counter
    let count = 0;

    const rows = [];

    for (const order of orders) {
        const isPaid = order.payment_collections?.some((pc: any) =>
            pc.status === "captured" || pc.status === "completed"
        );

        if (!isPaid) continue;

        count++;
        let orderRevenue = 0;
        let orderCogs = 0;

        if (order.items) {
            for (const item of order.items) {
                const qty = item.quantity;
                const unitPrice = item.unit_price;

                // 🆕 Track Quantity
                totalQuantity += qty;

                orderRevenue += unitPrice * qty;

                let unitCost = 0;
                if (item.variant?.product) {
                    const product = item.variant.product;
                    const categories = product.categories || [];
                    const metadata = product.metadata || {};

                    const isFixed = categories.some((c: any) => FIXED_COST_CATEGORIES.includes(c.id));

                    if (isFixed) {
                        unitCost = FIXED_COST_AMOUNT;
                    } else {
                        unitCost = Number(metadata.cogs) || 0;
                    }
                }

                orderCogs += unitCost * qty;
            }
        }

        totalRevenue += orderRevenue;
        totalCogs += orderCogs;

        const orderProfit = orderRevenue - orderCogs;
        const orderMargin = orderRevenue > 0 ? (orderProfit / orderRevenue) * 100 : 0;

        rows.push({
            id: order.id,
            display_id: order.display_id,
            created_at: order.created_at,
            itemRevenue: orderRevenue,
            cogs: orderCogs,
            profit: orderProfit,
            margin: orderMargin
        });
    }

    // Sort Descending
    rows.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({
        stats: {
            revenue: totalRevenue,
            cogs: totalCogs,
            count: count,
            quantity: totalQuantity, // 🆕 Return in response
        },
        rows: rows
    });
}