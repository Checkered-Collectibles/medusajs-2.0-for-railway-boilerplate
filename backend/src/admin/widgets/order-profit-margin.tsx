import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Table, Text, StatusBadge, clx, Tooltip } from "@medusajs/ui"
import { CurrencyRupee, InformationCircle } from "@medusajs/icons"
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
type OrderData = {
    currency_code: string
    items: Array<{
        id: string
        unit_price: number
        quantity: number
        variant?: {
            product?: {
                id: string
                title: string
                metadata: Record<string, any>
                categories?: Array<{ id: string }>
            }
        }
    }>
}

const OrderProfitWidget = ({ data: orderData }: { data: { id: string } }) => {

    // 1. Fetch Order with Deep Relations
    // We need product categories and metadata to calculate COGS
    const { data, isLoading } = useQuery({
        queryFn: async () => {
            const { order } = await sdk.admin.order.retrieve(orderData.id, {
                fields: "+items.variant.product.categories.id,+items.variant.product.metadata,+items.variant.product.title"
            })
            return order as unknown as OrderData
        },
        queryKey: ["order-profit", orderData.id],
    })

    // 2. Calculation Logic
    const financials = useMemo(() => {
        if (!data?.items) return null

        let totalRevenue = 0
        let totalCost = 0

        const breakdown = data.items.map((item) => {
            const product = item.variant?.product
            const categories = product?.categories || []
            const metadata = product?.metadata || {}

            const quantity = item.quantity
            const revenue = item.unit_price * quantity

            // --- COGS LOGIC ---
            let unitCost = 0
            let costSource = "Unknown"

            // Rule 1: Check Fixed Cost Categories
            const isFixedCost = categories.some(cat => FIXED_COST_CATEGORIES.includes(cat.id))

            if (isFixedCost) {
                unitCost = FIXED_COST_AMOUNT
                costSource = "Category Rule"
            }
            // Rule 2: Check Metadata
            else if (metadata.cogs) {
                unitCost = Number(metadata.cogs) || 0
                costSource = "Metadata"
            }

            const totalItemCost = unitCost * quantity
            const profit = revenue - totalItemCost
            const margin = revenue > 0 ? (profit / revenue) * 100 : 0

            totalRevenue += revenue
            totalCost += totalItemCost

            return {
                ...item,
                productTitle: product?.title || "Unknown Item",
                revenue,
                totalItemCost,
                profit,
                margin,
                costSource,
                unitCost
            }
        })

        const totalProfit = totalRevenue - totalCost
        const totalMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

        return {
            totalRevenue,
            totalCost,
            totalProfit,
            totalMargin,
            breakdown
        }
    }, [data])

    // --- RENDER HELPERS ---
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: data?.currency_code?.toUpperCase() || 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    if (isLoading || !financials) {
        return (
            <Container className="h-[200px] animate-pulse bg-ui-bg-subtle" />
        )
    }

    return (
        <Container className="p-0 overflow-hidden">
            {/* Header / Summary */}
            <div className="grid grid-cols-3 divide-x divide-ui-border-base border-b border-ui-border-base bg-ui-bg-subtle">
                <div className="p-4 flex flex-col gap-1">
                    <Text size="xsmall" className="text-ui-fg-subtle uppercase font-medium">Total Revenue</Text>
                    <Text size="large" weight="plus" className="text-ui-fg-base">
                        {formatMoney(financials.totalRevenue)}
                    </Text>
                </div>

                <div className="p-4 flex flex-col gap-1">
                    <Text size="xsmall" className="text-ui-fg-subtle uppercase font-medium">Total Cost (COGS)</Text>
                    <Text size="large" className="text-ui-fg-subtle">
                        {formatMoney(financials.totalCost)}
                    </Text>
                </div>

                <div className="p-4 flex flex-col gap-1 bg-ui-bg-base">
                    <div className="flex items-center gap-2">
                        <Text size="xsmall" className="text-ui-fg-subtle uppercase font-medium">Net Profit</Text>
                        <Tooltip content={`Margin: ${financials.totalMargin.toFixed(1)}%`}>
                            <StatusBadge color={financials.totalProfit > 0 ? "green" : "red"}>
                                {financials.totalMargin.toFixed(0)}%
                            </StatusBadge>
                        </Tooltip>
                    </div>
                    <Text
                        size="large"
                        weight="plus"
                        className={financials.totalProfit > 0 ? "text-green-600" : "text-red-600"}
                    >
                        {formatMoney(financials.totalProfit)}
                    </Text>
                </div>
            </div>

            {/* Breakdown Table */}
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Item</Table.HeaderCell>
                        <Table.HeaderCell className="text-right">Unit Cost</Table.HeaderCell>
                        <Table.HeaderCell className="text-right">Profit</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {financials.breakdown.map((item) => (
                        <Table.Row key={item.id} className="hover:bg-ui-bg-base-hover">
                            <Table.Cell>
                                <div className="flex flex-col">
                                    <Text size="small" weight="plus" className="text-ui-fg-base">
                                        {item.productTitle}
                                    </Text>
                                    <div className="flex items-center gap-1">
                                        <Text size="xsmall" className="text-ui-fg-subtle">
                                            x{item.quantity}
                                        </Text>
                                        <span className="text-ui-fg-muted text-[10px]">•</span>
                                        <Text size="xsmall" className="text-ui-fg-subtle italic">
                                            {item.costSource}
                                        </Text>
                                    </div>
                                </div>
                            </Table.Cell>

                            <Table.Cell className="text-right">
                                <Text size="small" className="text-ui-fg-subtle">
                                    {formatMoney(item.unitCost)}
                                </Text>
                            </Table.Cell>

                            <Table.Cell className="text-right">
                                <div className="flex flex-col items-end">
                                    <Text
                                        size="small"
                                        weight="plus"
                                        className={item.profit > 0 ? "text-green-600" : "text-red-600"}
                                    >
                                        {formatMoney(item.profit)}
                                    </Text>
                                    <Text size="xsmall" className="text-ui-fg-muted">
                                        {item.margin.toFixed(1)}%
                                    </Text>
                                </div>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "order.details.side.after", // Displays on the sidebar for quick glance
})

export default OrderProfitWidget