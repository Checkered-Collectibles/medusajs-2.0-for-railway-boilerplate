// medusa/src/api/store/universal-products/route.ts

import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

type StockStatus = "in" | "out" | "all" | undefined

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const productService = req.scope.resolve("productService") as any

    const {
        limit = 12,
        offset = 0,
        stock_status = "all",
        ...rawFilters
    } = req.query as {
        limit?: string
        offset?: string
        stock_status?: StockStatus
        // plus all other filters as strings/arrays (collection_id, category_id, tag_id, id, etc.)
    }

    const take = Math.min(Number(limit) || 12, 100)
    const skip = Math.max(Number(offset) || 0, 0)

    const filters: any = {}

        // copy over supported filters (optional: be stricter here)
        ;[
            "collection_id",
            "category_id",
            "id",
            "tag_id",
            "handle",
            "q",
            "is_giftcard",
            "status",
            "type_id",
            "created_at",
            "updated_at",
            "deleted_at",
            "sales_channel_id",
        ].forEach((key) => {
            const value = (rawFilters as any)[key]
            if (typeof value !== "undefined") {
                filters[key] = value
            }
        })

    // 1) get products with variants
    const [products, totalCount] = await productService.listAndCount(filters, {
        skip,
        take,
        relations: ["variants"],
    })

    const status = (stock_status ?? "all") as StockStatus

    if (status === "all") {
        return res.json({
            products,
            count: totalCount,
        })
    }

    // 2) stock filter logic
    const isProductInStock = (p: any) => {
        const variants = p.variants || []

        return variants.some((v: any) => {
            const managesInventory = v.manage_inventory ?? true
            const qty = v.inventory_quantity ?? 0

            // if we don't manage inventory, treat as in stock
            return managesInventory ? qty > 0 : true
        })
    }

    const filtered = products.filter((p: any) => {
        const inStock = isProductInStock(p)
        return status === "in" ? inStock : !inStock
    })

    return res.json({
        products: filtered,
        count: filtered.length,
    })
}