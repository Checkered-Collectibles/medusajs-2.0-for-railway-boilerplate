import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, StatusBadge, Table, clx, Select, IconButton, Checkbox, Label } from "@medusajs/ui"
import { CurrencyDollarSolid, ReceiptPercent, ChevronLeft, ChevronRight, ArrowUpRightMini, ArrowDownRightMini, Meta } from "@medusajs/icons"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"
import { useMemo, useState } from "react"

// --- CONSTANTS ---
const FIXED_COST_CATEGORIES = [
    "pcat_01KC3X8VFE8G7XBNYMVC1RSYEK",
    "pcat_01KC3ZZ9RWEQ12WS8B2NZ8MGQ8"
]
const FIXED_COST_AMOUNT = 167
const ITEMS_PER_PAGE = 15
const DAILY_AD_SPEND = 500

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

// --- HELPERS ---
const getRangeParams = (range: string) => {
    const now = new Date()
    const currentStart = new Date()
    const prevStart = new Date()
    let daysMultiplier = 1

    const setStartOfDay = (d: Date) => d.setHours(0, 0, 0, 0)

    switch (range) {
        case "24hours":
            currentStart.setTime(now.getTime() - (24 * 60 * 60 * 1000))
            prevStart.setTime(currentStart.getTime() - (24 * 60 * 60 * 1000))
            daysMultiplier = 1
            break
        case "today":
            setStartOfDay(currentStart)
            prevStart.setTime(currentStart.getTime() - (24 * 60 * 60 * 1000))
            daysMultiplier = 1
            break
        case "yesterday":
            setStartOfDay(currentStart)
            currentStart.setDate(currentStart.getDate() - 1)
            prevStart.setTime(currentStart.getTime() - (24 * 60 * 60 * 1000))
            daysMultiplier = 1
            break
        case "7days":
            setStartOfDay(currentStart)
            currentStart.setDate(currentStart.getDate() - 7)
            prevStart.setDate(currentStart.getDate() - 7)
            daysMultiplier = 7
            break
        case "30days":
            setStartOfDay(currentStart)
            currentStart.setDate(currentStart.getDate() - 30)
            prevStart.setDate(currentStart.getDate() - 30)
            daysMultiplier = 30
            break
        case "month":
            setStartOfDay(currentStart)
            currentStart.setDate(1)
            prevStart.setMonth(prevStart.getMonth() - 1)
            prevStart.setDate(1)
            prevStart.setHours(0, 0, 0, 0)
            daysMultiplier = new Date().getDate() // Days passed in current month
            break
        case "3months":
            setStartOfDay(currentStart)
            currentStart.setDate(currentStart.getDate() - 90)
            prevStart.setDate(currentStart.getDate() - 90)
            daysMultiplier = 90
            break
        case "quarter":
            setStartOfDay(currentStart)
            const currentQuarter = Math.floor(now.getMonth() / 3)
            const quarterStartMonth = currentQuarter * 3
            currentStart.setMonth(quarterStartMonth)
            currentStart.setDate(1)
            prevStart.setMonth(quarterStartMonth - 3)
            prevStart.setDate(1)
            daysMultiplier = 90 // Approx
            break
        default:
            setStartOfDay(currentStart)
            prevStart.setDate(currentStart.getDate() - 1)
            daysMultiplier = 1
    }

    return {
        currentStart: currentStart.toISOString(),
        prevStart: prevStart.toISOString(),
        daysMultiplier
    }
}

const ComparisonText = ({ current, previous, type = "neutral", prefix = "" }: { current: number, previous: number, type?: "inverse" | "neutral", prefix?: string }) => {
    if (previous === 0) return <Text size="small" className="text-ui-fg-muted mt-1">No previous data</Text>

    const diff = current - previous
    const percentage = previous !== 0 ? (diff / previous) * 100 : 0
    const isPositive = diff > 0
    const isNeutral = diff === 0

    let colorClass = isPositive ? "text-green-600" : "text-red-600"
    let arrowIcon = isPositive ? <ArrowUpRightMini /> : <ArrowUpRightMini className="scale-y-[-1]" />
    let word = isPositive ? "Up" : "Down"

    if (type === "inverse") {
        colorClass = isPositive ? "text-red-600" : "text-green-600"
    }

    if (isNeutral) {
        return <Text size="small" className="text-ui-fg-muted mt-1">Same as previous period</Text>
    }

    const absDiff = Math.abs(diff)
    const displayDiff = prefix ?
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(absDiff) :
        absDiff

    return (
        <div className={clx("flex items-center gap-1 mt-1 font-medium", colorClass)}>
            {arrowIcon}
            <Text size="small" className="leading-none">
                {word} {displayDiff} ({Math.abs(percentage).toFixed(0)}%)
            </Text>
        </div>
    )
}

const ProfitsPage = () => {
    const [range, setRange] = useState("today")
    const [includeAds, setIncludeAds] = useState(true) // <--- STATE FOR CHECKBOX
    const [currentPage, setCurrentPage] = useState(0)

    const { currentStart, prevStart, daysMultiplier } = getRangeParams(range)

    useMemo(() => {
        setCurrentPage(0)
    }, [range])

    // 1. Fetch Orders
    const { data: allOrders, isLoading } = useQuery({
        queryFn: async () => {
            const { orders } = await sdk.client.fetch<{ orders: Order[] }>("/admin/orders", {
                query: {
                    created_at: { $gt: prevStart },
                    limit: 2000,
                    fields: "id,display_id,created_at,total,currency_code,items.unit_price,items.quantity,items.variant.product.title,items.variant.product.categories.id,items.variant.product.metadata,payment_status",
                },
            })
            return orders.filter((o) => o.payment_status === "captured")
        },
        queryKey: ["profits-page", range, prevStart],
    })

    // 2. Process Data
    const { currentStats, prevStats, rows } = useMemo(() => {
        const emptyStats = { revenue: 0, cogs: 0, profit: 0, margin: 0, count: 0, adSpend: 0 }
        if (!allOrders) return { currentStats: emptyStats, prevStats: emptyStats, rows: [] }

        const thresholdDate = new Date(currentStart).getTime()
        const currentPeriodOrders: Order[] = []
        const prevPeriodOrders: Order[] = []

        allOrders.forEach(order => {
            const orderTime = new Date(order.created_at).getTime()

            if (range === "yesterday") {
                const today00 = new Date().setHours(0, 0, 0, 0)
                if (orderTime >= thresholdDate && orderTime < today00) {
                    currentPeriodOrders.push(order)
                } else if (orderTime >= new Date(prevStart).getTime() && orderTime < thresholdDate) {
                    prevPeriodOrders.push(order)
                }
            } else {
                if (orderTime >= thresholdDate) {
                    currentPeriodOrders.push(order)
                } else {
                    prevPeriodOrders.push(order)
                }
            }
        })

        const calculateStats = (orders: Order[]) => {
            let rev = 0, cost = 0

            const processedRows = orders.map(order => {
                let orderRev = 0
                let orderCost = 0

                order.items.forEach(item => {
                    const qty = item.quantity
                    orderRev += item.unit_price * qty

                    const cats = item.variant?.product?.categories || []
                    const meta = item.variant?.product?.metadata || {}
                    let unitCost = 0
                    if (cats.some(c => FIXED_COST_CATEGORIES.includes(c.id))) {
                        unitCost = FIXED_COST_AMOUNT
                    } else {
                        unitCost = Number(meta.cogs) || 0
                    }
                    orderCost += unitCost * qty
                })
                rev += orderRev
                cost += orderCost

                return {
                    ...order,
                    itemRevenue: orderRev,
                    cogs: orderCost,
                    profit: orderRev - orderCost,
                    margin: orderRev > 0 ? ((orderRev - orderCost) / orderRev) * 100 : 0
                }
            })

            // --- DYNAMIC AD SPEND LOGIC ---
            // Only calculate if Checkbox is TRUE
            const totalAdSpend = includeAds ? (daysMultiplier * DAILY_AD_SPEND) : 0

            // Deduct Ad Spend from Profit
            const profit = rev - cost - totalAdSpend

            const margin = rev > 0 ? (profit / rev) * 100 : 0

            return {
                stats: { revenue: rev, cogs: cost, profit, margin, count: orders.length, adSpend: totalAdSpend },
                rows: processedRows
            }
        }

        const curr = calculateStats(currentPeriodOrders)
        const prev = calculateStats(prevPeriodOrders)
        curr.rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        return { currentStats: curr.stats, prevStats: prev.stats, rows: curr.rows }
    }, [allOrders, range, currentStart, prevStart, daysMultiplier, includeAds]) // Added includeAds to dependencies

    // 3. Pagination
    const pageCount = Math.ceil(rows.length / ITEMS_PER_PAGE)
    const paginatedRows = rows.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)
    const canNext = currentPage < pageCount - 1
    const canPrev = currentPage > 0

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
                        Real-time margin analysis (Excl. Shipping).
                    </Text>
                </div>

                <div className="flex items-center gap-6">
                    {/* CHECKBOX for Ads */}
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="ads-toggle"
                            checked={includeAds}
                            onCheckedChange={(val) => setIncludeAds(val === true)}
                        />
                        <Label htmlFor="ads-toggle" className="text-small text-ui-fg-subtle cursor-pointer select-none">
                            Include Ads Spend
                        </Label>
                    </div>

                    {/* Range Select */}
                    <div className="w-[200px]">
                        <Select value={range} onValueChange={setRange} disabled={isLoading}>
                            <Select.Trigger>
                                <Select.Value />
                            </Select.Trigger>
                            <Select.Content>
                                <Select.Item value="24hours">Last 24 Hours</Select.Item>
                                <Select.Item value="today">Today</Select.Item>
                                <Select.Item value="yesterday">Yesterday</Select.Item>
                                <Select.Item value="7days">Last 7 Days</Select.Item>
                                <Select.Item value="30days">Last 30 Days</Select.Item>
                                <Select.Item value="month">This Month (MTD)</Select.Item>
                                <Select.Item value="3months">Last 3 Months</Select.Item>
                                <Select.Item value="quarter">Last Quarter</Select.Item>
                            </Select.Content>
                        </Select>
                    </div>
                </div>
            </div>

            {/* --- SUMMARY CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-ui-border-base border-b border-ui-border-base bg-ui-bg-base">
                {/* Orders */}
                <div className="p-6 flex flex-col justify-center h-[120px]">
                    <Text size="small" weight="plus" className="text-ui-fg-subtle uppercase mb-1">Orders</Text>
                    {isLoading ? <div className="h-6 w-16 bg-ui-bg-subtle animate-pulse rounded" /> : (
                        <>
                            <Heading level="h2">{currentStats.count}</Heading>
                            <ComparisonText current={currentStats.count} previous={prevStats.count} />
                        </>
                    )}
                </div>

                {/* Revenue */}
                <div className="p-6 flex flex-col justify-center h-[120px]">
                    <Text size="small" weight="plus" className="text-ui-fg-subtle uppercase mb-1">Item Revenue</Text>
                    {isLoading ? <div className="h-6 w-24 bg-ui-bg-subtle animate-pulse rounded" /> : (
                        <>
                            <Heading level="h2">{formatMoney(currentStats.revenue)}</Heading>
                            <ComparisonText current={currentStats.revenue} previous={prevStats.revenue} prefix="₹" />
                        </>
                    )}
                </div>

                {/* COGS */}
                <div className="p-6 flex flex-col justify-center h-[120px]">
                    <Text size="small" weight="plus" className="text-ui-fg-subtle uppercase mb-1">COGS (Product)</Text>
                    {isLoading ? <div className="h-6 w-24 bg-ui-bg-subtle animate-pulse rounded" /> : (
                        <>
                            <Heading level="h2" className="text-ui-fg-muted">{formatMoney(currentStats.cogs)}</Heading>
                            <ComparisonText current={currentStats.cogs} previous={prevStats.cogs} type="inverse" prefix="₹" />
                        </>
                    )}
                </div>

                {/* Ads Spend */}
                <div className="p-6 flex flex-col justify-center h-[120px]">
                    <div className="flex items-center gap-1 mb-1">
                        <Meta className="text-ui-fg-subtle" />
                        <Text size="small" weight="plus" className="text-ui-fg-subtle uppercase">Ads Spend</Text>
                    </div>
                    {isLoading ? <div className="h-6 w-24 bg-ui-bg-subtle animate-pulse rounded" /> : (
                        <>
                            {includeAds ? (
                                <>
                                    <Heading level="h2" className="text-ui-fg-muted">{formatMoney(currentStats.adSpend)}</Heading>
                                    <Text size="xsmall" className="text-ui-fg-muted mt-1">
                                        Fixed @ ₹{DAILY_AD_SPEND}/day
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Heading level="h2" className="text-ui-fg-subtle/50">Excluded</Heading>
                                    <Text size="xsmall" className="text-ui-fg-subtle/50 mt-1">
                                        Enable to calculate
                                    </Text>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Net Profit */}
                <div className={clx(
                    "p-6 flex flex-col justify-center h-[120px]",
                    !isLoading && currentStats.profit > 0 ? "bg-green-50/10" : "bg-red-50/10"
                )}>
                    <Text size="small" weight="plus" className="text-ui-fg-subtle uppercase mb-1">Net Profit</Text>
                    {isLoading ? <div className="h-6 w-24 bg-ui-bg-subtle animate-pulse rounded" /> : (
                        <>
                            <div className="flex items-center gap-3">
                                <Heading level="h2" className={currentStats.profit >= 0 ? "text-green-600" : "text-red-600"}>
                                    {formatMoney(currentStats.profit)}
                                </Heading>
                                <StatusBadge color={currentStats.profit > 0 ? "green" : "red"}>
                                    {currentStats.margin.toFixed(0)}%
                                </StatusBadge>
                            </div>
                            <ComparisonText current={currentStats.profit} previous={prevStats.profit} prefix="₹" />
                        </>
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
                                    <Table.HeaderCell className="text-right">Item Revenue</Table.HeaderCell>
                                    <Table.HeaderCell className="text-right">Product Cost</Table.HeaderCell>
                                    <Table.HeaderCell className="text-right">Order Profit</Table.HeaderCell>
                                    <Table.HeaderCell className="text-right">Order Margin</Table.HeaderCell>
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
                                            <Table.Cell className="text-right">{formatMoney(row.itemRevenue)}</Table.Cell>
                                            <Table.Cell className="text-right text-ui-fg-subtle">{formatMoney(row.cogs)}</Table.Cell>
                                            <Table.Cell className="text-right"><Text weight="plus" className={row.profit >= 0 ? "text-green-600" : "text-red-600"}>{formatMoney(row.profit)}</Text></Table.Cell>
                                            <Table.Cell className="text-right"><StatusBadge color={row.margin > 20 ? "green" : row.margin > 0 ? "orange" : "red"}>{row.margin.toFixed(0)}%</StatusBadge></Table.Cell>
                                        </Table.Row>
                                    ))
                                )}
                            </Table.Body>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between px-4 py-3 border-t border-ui-border-base bg-ui-bg-base">
                        <Text size="small" className="text-ui-fg-subtle">
                            Showing {Math.min(paginatedRows.length, ITEMS_PER_PAGE)} of {rows.length} orders
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
    rank: 2,
})

export default ProfitsPage