import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, StatusBadge, Tooltip, clx } from "@medusajs/ui"
import { CurrencyDollarSolid, ArrowUpRightMini } from "@medusajs/icons"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"
import { useMemo } from "react"

// --- CONSTANTS ---
const FIXED_COST_CATEGORIES = [
    "pcat_01KC3X8VFE8G7XBNYMVC1RSYEK",
    "pcat_01KC3ZZ9RWEQ12WS8B2NZ8MGQ8"
]
const FIXED_COST_AMOUNT = 167

// --- TYPES ---
type OrderItem = {
    unit_price: number
    quantity: number
    variant?: {
        product?: {
            id: string
            metadata: Record<string, any>
            categories?: Array<{ id: string }>
        }
    }
}

type Order = {
    id: string
    currency_code: string
    total: number
    items: OrderItem[]
}

const DailyProfitWidget = () => {

    // 1. Get "Start of Today" ISO string
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startDate = today.toISOString()

    // 2. Fetch Today's Orders
    const { data, isLoading } = useQuery({
        queryFn: async () => {
            const { orders } = await sdk.client.fetch<{ orders: Order[] }>("/admin/orders", {
                query: {
                    created_at: { $gt: startDate },
                    limit: 100,
                    fields:
                        "total,currency_code,items.unit_price,items.quantity,items.variant.product.categories.id,items.variant.product.metadata,payment_status",
                },
            })

            // Filter only captured orders from the result
            return orders.filter((o) => o.payment_status === "captured")
        },
        queryKey: ["daily-profit", startDate],
    })

    // 3. Calculate Financials
    const stats = useMemo(() => {
        if (!data) return { revenue: 0, cogs: 0, profit: 0, margin: 0, count: 0 }

        let revenue = 0
        let cogs = 0

        data.forEach(order => {
            revenue += order.total

            order.items.forEach(item => {
                const product = item.variant?.product
                const categories = product?.categories || []
                const metadata = product?.metadata || {}
                const qty = item.quantity

                // COGS Logic
                let unitCost = 0
                const isFixedCost = categories.some(cat => FIXED_COST_CATEGORIES.includes(cat.id))

                if (isFixedCost) {
                    unitCost = FIXED_COST_AMOUNT
                } else if (metadata.cogs) {
                    unitCost = Number(metadata.cogs) || 0
                }

                cogs += unitCost * qty
            })
        })

        const profit = revenue - cogs
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0

        return { revenue, cogs, profit, margin, count: data.length }
    }, [data])

    // Helper to format currency
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    if (isLoading) {
        return <Container className="h-[120px] animate-pulse bg-ui-bg-subtle mb-4" />
    }

    return (
        <Container className="p-0 overflow-hidden mb-4 border-ui-border-strong">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-ui-border-base bg-ui-bg-subtle">
                <div className="flex items-center gap-2">
                    <CurrencyDollarSolid className="text-ui-fg-subtle" />
                    <Heading level="h2">Today's Performance</Heading>
                    <StatusBadge color="blue" className="ml-2">
                        {stats.count} Orders
                    </StatusBadge>
                </div>
                <Text size="small" className="text-ui-fg-muted">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                </Text>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 divide-x divide-ui-border-base">
                {/* Revenue */}
                <div className="p-5 flex flex-col gap-1">
                    <Text size="xsmall" className="text-ui-fg-subtle uppercase font-medium tracking-wide">
                        Revenue
                    </Text>
                    <div className="flex items-baseline gap-1">
                        <Text size="xlarge" weight="plus" className="text-ui-fg-base">
                            {formatMoney(stats.revenue)}
                        </Text>
                    </div>
                </div>

                {/* COGS */}
                <div className="p-5 flex flex-col gap-1">
                    <Text size="xsmall" className="text-ui-fg-subtle uppercase font-medium tracking-wide">
                        Est. Cost (COGS)
                    </Text>
                    <Text size="xlarge" className="text-ui-fg-subtle">
                        {formatMoney(stats.cogs)}
                    </Text>
                </div>

                {/* Profit */}
                <div className={clx(
                    "p-5 flex flex-col gap-1",
                    stats.profit > 0 ? "bg-green-800/20" : "bg-ui-bg-base"
                )}>
                    <div className="flex items-center justify-between">
                        <Text size="xsmall" className="text-ui-fg-subtle uppercase font-medium tracking-wide">
                            Net Profit
                        </Text>
                        {stats.revenue > 0 && (
                            <Tooltip content={`Profit Margin: ${stats.margin.toFixed(1)}%`}>
                                <StatusBadge color={stats.margin > 20 ? "green" : stats.margin > 0 ? "orange" : "red"}>
                                    {stats.margin.toFixed(0)}% Margin
                                </StatusBadge>
                            </Tooltip>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Text
                            size="xlarge"
                            weight="plus"
                            className={stats.profit >= 0 ? "text-green-600" : "text-red-600"}
                        >
                            {formatMoney(stats.profit)}
                        </Text>

                        {/* FIX: Use rotated TrendingUp for the down arrow */}
                        {stats.profit > 0 ? (
                            <ArrowUpRightMini className="text-green-500" />
                        ) : (
                            <ArrowUpRightMini className="text-red-500 transform rotate-180" />
                        )}
                    </div>
                </div>
            </div>
        </Container>
    )
}

// export const config = defineWidgetConfig({
//     zone: "order.list.before",
// })

export default DailyProfitWidget