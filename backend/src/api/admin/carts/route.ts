import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    // 1. Extract params
    const {
        q,
        limit = "15",
        offset = "0",
        order,
        ...filters
    } = req.query

    const limitInt = parseInt(limit as string)
    const offsetInt = parseInt(offset as string)

    // 2. Build Filter Object
    const queryFilters: any = { ...filters }

    // Handle "Search" (q) -> Search in Email or ID
    if (q) {
        queryFilters.$or = [
            { email: { $ilike: `%${q}%` } },
            { id: { $ilike: `%${q}%` } },
        ]
    }

    // 3. Build Sort Object
    // ⚡ CHANGED: Default sort is now 'updated_at' DESC (Most recently active first)
    let orderObj: Record<string, "ASC" | "DESC"> = { updated_at: "DESC" }

    if (order && typeof order === "string") {
        if (order.startsWith("-")) {
            orderObj = { [order.substring(1)]: "DESC" }
        } else {
            orderObj = { [order]: "ASC" }
        }
    }

    // 4. Fetch Data
    const { data: carts, metadata } = await query.graph({
        entity: "cart",
        fields: [
            "id",
            "email",
            "total",
            "currency_code",
            "created_at", // Required for frontend date display
            "updated_at", // Required for frontend date display
            "items.*",
            "items.product.*",
            "shipping_address.*",
            "completed_at",
            "metadata"
        ],
        filters: queryFilters,
        pagination: {
            skip: offsetInt,
            take: limitInt,
            order: orderObj,
        },
    })

    res.json({
        carts,
        count: metadata?.count || 0,
        limit: limitInt,
        offset: offsetInt
    })
}