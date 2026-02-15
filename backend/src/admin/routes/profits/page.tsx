import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, StatusBadge, Table, Button, clx, Select, IconButton } from "@medusajs/ui"
import { CurrencyDollarSolid, ReceiptPercent, ChevronLeft, ChevronRight } from "@medusajs/icons"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk" // Adjust path if needed
import { useMemo, useState } from "react"

// --- CONSTANTS ---
const FIXED_COST_CATEGORIES = [
    "pcat_01KC3X8VFE8G7XBNYMVC1RSYEK",
    "pcat_01KC3ZZ9RWEQ12WS8B2NZ8MGQ8"
]
const FIXED_COST_AMOUNT = 167
const ITEMS_PER_PAGE = 15

// --- TYPES ---
type OrderItem = {
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
}

type Order = {
    id: string
    display_id: number
    created_at: string
    currency_code: string
    total: number
    items: OrderItem[]
    payment_status: string
}

// --- DATE HELPER ---
const getDateRange = (range: string) => {
    const now = new Date()
    const start = new Date()

    // Default: Reset to start of day for clean comparisons
    start.setHours(0, 0, 0, 0)

    switch (range) {
        case "24hours":
            // Exact 24h rolling window
            return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        case "today":
            return start.toISOString()
        case "7days":
            start.setDate(now.getDate() - 7)
            return start.toISOString()
        case "30days":
            start.setDate(now.getDate() - 30)
            return start.toISOString()
        case "month":
            start.setDate(1) // 1st of current month
            return start.toISOString()
        case "3months":
            start.setDate(now.getDate() - 90)
            return start.toISOString()
        case "quarter":
            // Calculate previous full quarter
            const currentQuarter = Math.floor(now.getMonth() / 3)
            const prevQuarterStartMonth = (currentQuarter - 1) * 3

            // Handle Q1 -> Prev Year Q4
            if (prevQuarterStartMonth < 0) {
                start.setFullYear(now.getFullYear() - 1)
                start.setMonth(9) // October
                start.setDate(1)
            } else {
                start.setMonth(prevQuarterStartMonth)
                start.setDate(1)
            }
            return start.toISOString()
        default:
            return start.toISOString()
    }
}

const ProfitsPage = () => {
    const [range, setRange] = useState("today")
    const [currentPage, setCurrentPage] = useState(0) // 0-indexed

    const startDate = getDateRange(range)

    // Reset pagination when range changes
    useMemo(() => {
        setCurrentPage(0)
    }, [range])

    // 1. Fetch Orders
    const { data: orders, isLoading } = useQuery({
        queryFn: async () => {
            const { orders } = await sdk.client.fetch<{ orders: Order[] }>("/admin/orders", {
                query: {
                    created_at: { $gt: startDate },
                    limit: 1000, // Fetch up to 1000 items for the summary stats
                    fields: "id,display_id,created_at,total,currency_code,items.unit_price,items.quantity,items.variant.product.title,items.variant.product.categories.id,items.variant.product.metadata,payment_status",
                },
            })
            // Strict Filter: Only captured payments
            return orders.filter((o) => o.payment_status === "captured")
        },
        queryKey: ["profits-page", range],
    })

    // 2. Calculate Financials & Prepare Rows
    const financials = useMemo(() => {
        if (!orders) return { revenue: 0, cogs: 0, profit: 0, margin: 0, count: 0, rows: [] }

        let totalRevenue = 0
        let totalCogs = 0

        const rows = orders.map(order => {
            let orderRevenue = order.total
            let orderCogs = 0

            order.items.forEach(item => {
                const product = item.variant?.product
                const categories = product?.categories || []
                const metadata = product?.metadata || {}
                const qty = item.quantity

                let unitCost = 0
                const isFixedCost = categories.some(cat => FIXED_COST_CATEGORIES.includes(cat.id))

                if (isFixedCost) {
                    unitCost = FIXED_COST_AMOUNT
                } else if (metadata.cogs) {
                    unitCost = Number(metadata.cogs) || 0
                }

                orderCogs += unitCost * qty
            })

            const orderProfit = orderRevenue - orderCogs
            const orderMargin = orderRevenue > 0 ? (orderProfit / orderRevenue) * 100 : 0

            totalRevenue += orderRevenue
            totalCogs += orderCogs

            return {
                ...order,
                cogs: orderCogs,
                profit: orderProfit,
                margin: orderMargin
            }
        })

        // Sort by newest first
        rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        const totalProfit = totalRevenue - totalCogs
        const totalMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

        return {
            revenue: totalRevenue,
            cogs: totalCogs,
            profit: totalProfit,
            margin: totalMargin,
            count: orders.length,
            rows
        }
    }, [orders])

    // 3. Handle Pagination
    const pageCount = Math.ceil(financials.rows.length / ITEMS_PER_PAGE)
    const paginatedRows = financials.rows.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
    )

    const canNext = currentPage < pageCount - 1
    const canPrev = currentPage > 0

    // Helper
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    return (
        <Container className="p-0 overflow-hidden min-h-[calc(100vh-100px)] flex flex-col">
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-ui-border-base bg-ui-bg-subtle">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <CurrencyDollarSolid />
                        <Heading level="h1">Profit Analytics</Heading>
                    </div>
                    <Text size="small" className="text-ui-fg-muted">
                        Real-time margin analysis for paid orders.
                    </Text>
                </div>

                <div className="w-[200px]">
                    <Select value={range} onValueChange={setRange} disabled={isLoading}>
                        <Select.Trigger>
                            <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Item value="24hours">Last 24 Hours</Select.Item>
                            <Select.Item value="today">Today</Select.Item>
                            <Select.Item value="7days">Last 7 Days</Select.Item>
                            <Select.Item value="30days">Last 30 Days</Select.Item>
                            <Select.Item value="month">This Month (MTD)</Select.Item>
                            <Select.Item value="3months">Last 3 Months</Select.Item>
                            <Select.Item value="quarter">Last Quarter</Select.Item>
                        </Select.Content>
                    </Select>
                </div>
            </div>

            {/* --- SUMMARY CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-ui-border-base border-b border-ui-border-base bg-ui-bg-base">
                {/* Orders */}
                <div className="p-6 flex flex-col gap-2 h-[100px] justify-center">
                    <Text size="small" weight="plus" className="text-ui-fg-subtle uppercase">Orders</Text>
                    {isLoading ? (
                        <div className="h-7 w-16 bg-ui-bg-subtle animate-pulse rounded" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <ReceiptPercent className="text-ui-fg-muted" />
                            <Heading level="h2">{financials.count}</Heading>
                        </div>
                    )}
                </div>

                {/* Revenue */}
                <div className="p-6 flex flex-col gap-2 h-[100px] justify-center">
                    <Text size="small" weight="plus" className="text-ui-fg-subtle uppercase">Revenue</Text>
                    {isLoading ? (
                        <div className="h-7 w-24 bg-ui-bg-subtle animate-pulse rounded" />
                    ) : (
                        <Heading level="h2">{formatMoney(financials.revenue)}</Heading>
                    )}
                </div>

                {/* COGS */}
                <div className="p-6 flex flex-col gap-2 h-[100px] justify-center">
                    <Text size="small" weight="plus" className="text-ui-fg-subtle uppercase">Total Cost</Text>
                    {isLoading ? (
                        <div className="h-7 w-24 bg-ui-bg-subtle animate-pulse rounded" />
                    ) : (
                        <Heading level="h2" className="text-ui-fg-muted">{formatMoney(financials.cogs)}</Heading>
                    )}
                </div>

                {/* Profit */}
                <div className={clx(
                    "p-6 flex flex-col gap-2 h-[100px] justify-center",
                    !isLoading && financials.profit > 0 ? "bg-green-50/10" : ""
                )}>
                    <Text size="small" weight="plus" className="text-ui-fg-subtle uppercase">Net Profit</Text>
                    {isLoading ? (
                        <div className="flex gap-2">
                            <div className="h-7 w-24 bg-ui-bg-subtle animate-pulse rounded" />
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Heading level="h2" className={financials.profit >= 0 ? "text-green-600" : "text-red-600"}>
                                {formatMoney(financials.profit)}
                            </Heading>
                            <StatusBadge color={financials.profit > 0 ? "green" : "red"}>
                                {financials.margin.toFixed(1)}%
                            </StatusBadge>
                        </div>
                    )}
                </div>
            </div>

            {/* --- TABLE & PAGINATION --- */}
            <div className="flex-1 flex flex-col overflow-hidden bg-ui-bg-subtle p-6">
                <Container className="p-0 overflow-hidden shadow-sm flex flex-col flex-1">
                    <div className="flex-1 overflow-auto">
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Order</Table.HeaderCell>
                                    <Table.HeaderCell>Date</Table.HeaderCell>
                                    <Table.HeaderCell className="text-right">Revenue</Table.HeaderCell>
                                    <Table.HeaderCell className="text-right">Cost</Table.HeaderCell>
                                    <Table.HeaderCell className="text-right">Profit</Table.HeaderCell>
                                    <Table.HeaderCell className="text-right">Margin</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {isLoading ? (
                                    Array.from({ length: 8 }).map((_, i) => (
                                        <Table.Row key={i}>
                                            <Table.Cell><div className="h-5 w-16 bg-ui-bg-subtle animate-pulse rounded" /></Table.Cell>
                                            <Table.Cell><div className="h-5 w-24 bg-ui-bg-subtle animate-pulse rounded" /></Table.Cell>
                                            <Table.Cell className="text-right"><div className="h-5 w-20 bg-ui-bg-subtle animate-pulse rounded ml-auto" /></Table.Cell>
                                            <Table.Cell className="text-right"><div className="h-5 w-20 bg-ui-bg-subtle animate-pulse rounded ml-auto" /></Table.Cell>
                                            <Table.Cell className="text-right"><div className="h-5 w-20 bg-ui-bg-subtle animate-pulse rounded ml-auto" /></Table.Cell>
                                            <Table.Cell className="text-right"><div className="h-5 w-12 bg-ui-bg-subtle animate-pulse rounded ml-auto" /></Table.Cell>
                                        </Table.Row>
                                    ))
                                ) : paginatedRows.length === 0 ? (
                                    <Table.Row>
                                        <Table.Cell colSpan={6} className="h-24 text-center text-ui-fg-subtle">
                                            No paid orders found in this period.
                                        </Table.Cell>
                                    </Table.Row>
                                ) : (
                                    paginatedRows.map((row) => (
                                        <Table.Row key={row.id} className="cursor-pointer hover:bg-ui-bg-base-hover" onClick={() => window.location.assign(`/app/orders/${row.id}`)}>
                                            <Table.Cell><Text weight="plus" size="small">#{row.display_id}</Text></Table.Cell>
                                            <Table.Cell><Text size="small" className="text-ui-fg-subtle">{new Date(row.created_at).toLocaleString()}</Text></Table.Cell>
                                            <Table.Cell className="text-right">{formatMoney(row.total)}</Table.Cell>
                                            <Table.Cell className="text-right text-ui-fg-subtle">{formatMoney(row.cogs)}</Table.Cell>
                                            <Table.Cell className="text-right"><Text weight="plus" className={row.profit >= 0 ? "text-green-600" : "text-red-600"}>{formatMoney(row.profit)}</Text></Table.Cell>
                                            <Table.Cell className="text-right"><StatusBadge color={row.margin > 20 ? "green" : row.margin > 0 ? "orange" : "red"}>{row.margin.toFixed(0)}%</StatusBadge></Table.Cell>
                                        </Table.Row>
                                    ))
                                )}
                            </Table.Body>
                        </Table>
                    </div>

                    {/* Footer / Pagination Controls */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-ui-border-base bg-ui-bg-base">
                        <Text size="small" className="text-ui-fg-subtle">
                            Showing {Math.min(paginatedRows.length, ITEMS_PER_PAGE)} of {financials.rows.length} orders
                        </Text>
                        <div className="flex items-center gap-2">
                            <IconButton
                                size="small"
                                variant="transparent"
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={!canPrev}
                            >
                                <ChevronLeft />
                            </IconButton>
                            <Text size="small" className="text-ui-fg-base w-12 text-center">
                                {currentPage + 1} / {Math.max(1, pageCount)}
                            </Text>
                            <IconButton
                                size="small"
                                variant="transparent"
                                onClick={() => setCurrentPage(p => Math.min(pageCount - 1, p + 1))}
                                disabled={!canNext}
                            >
                                <ChevronRight />
                            </IconButton>
                        </div>
                    </div>
                </Container>
            </div>
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Profits",
    icon: CurrencyDollarSolid,
    rank: 0,
})

export default ProfitsPage