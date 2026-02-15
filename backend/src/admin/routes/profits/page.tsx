import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, StatusBadge, Table, clx, Select, IconButton, Checkbox, Label, Input } from "@medusajs/ui"
import { CurrencyDollarSolid, ChevronLeft, ChevronRight, ArrowUpRightMini, ArrowDownRightMini, Meta } from "@medusajs/icons"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"
import { useMemo, useState } from "react"

// --- CONSTANTS ---
const ITEMS_PER_PAGE = 15
const DAILY_AD_SPEND = 500

// --- HELPERS ---
// This function stays outside the component
const getRangeParams = (range: string, customStart?: string, customEnd?: string) => {
    const now = new Date()
    const currentStart = new Date()
    const currentEnd = new Date()
    const prevStart = new Date()
    let daysMultiplier = 1

    const setStartOfDay = (d: Date) => d.setHours(0, 0, 0, 0)
    const setEndOfDay = (d: Date) => d.setHours(23, 59, 59, 999)

    switch (range) {
        case "24hours":
            currentStart.setTime(now.getTime() - (24 * 60 * 60 * 1000))
            prevStart.setTime(currentStart.getTime() - (24 * 60 * 60 * 1000))
            break
        case "today":
            setStartOfDay(currentStart)
            prevStart.setTime(currentStart.getTime() - (24 * 60 * 60 * 1000))
            break
        case "yesterday":
            setStartOfDay(currentStart)
            currentStart.setDate(currentStart.getDate() - 1)
            currentEnd.setTime(currentStart.getTime())
            setEndOfDay(currentEnd)
            prevStart.setTime(currentStart.getTime() - (24 * 60 * 60 * 1000))
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
            daysMultiplier = new Date().getDate()
            break
        case "quarter":
            setStartOfDay(currentStart)
            const currentQuarter = Math.floor(now.getMonth() / 3)
            const quarterStartMonth = currentQuarter * 3
            currentStart.setMonth(quarterStartMonth)
            currentStart.setDate(1)
            prevStart.setMonth(quarterStartMonth - 3)
            prevStart.setDate(1)
            daysMultiplier = 90
            break
        case "custom":
            if (customStart && customEnd) {
                const start = new Date(customStart)
                const end = new Date(customEnd)
                setStartOfDay(start)
                setEndOfDay(end)
                currentStart.setTime(start.getTime())
                currentEnd.setTime(end.getTime())
                const diffTime = Math.abs(end.getTime() - start.getTime())
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                daysMultiplier = diffDays || 1
                prevStart.setTime(start.getTime() - (diffDays * 24 * 60 * 60 * 1000))
            }
            break
        default:
            setStartOfDay(currentStart)
            prevStart.setDate(currentStart.getDate() - 1)
    }

    return {
        currentStart: currentStart.toISOString(),
        currentEnd: range === 'custom' || range === 'yesterday' ? currentEnd.toISOString() : now.toISOString(),
        prevStart: prevStart.toISOString(),
        daysMultiplier
    }
}

const ComparisonText = ({ current, previous, type = "neutral", prefix = "" }: { current: number, previous: number, type?: "inverse" | "neutral", prefix?: string }) => {
    if (previous === 0) return <Text size="small" className="text-ui-fg-muted mt-1">No prev. data</Text>
    const diff = current - previous
    const percentage = previous !== 0 ? (diff / previous) * 100 : 0
    const isPositive = diff > 0
    let colorClass = isPositive ? "text-green-600" : "text-red-600"
    let arrowIcon = isPositive ? <ArrowUpRightMini /> : <ArrowDownRightMini />
    let word = isPositive ? "Up" : "Down"
    if (type === "inverse") colorClass = isPositive ? "text-red-600" : "text-green-600"
    if (diff === 0) return <Text size="small" className="text-ui-fg-muted mt-1">Same as prev.</Text>

    const displayDiff = prefix ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.abs(diff)) : Math.abs(diff)

    return (
        <div className={clx("flex items-center gap-1 mt-1 font-medium", colorClass)}>
            {arrowIcon}
            <Text size="small" className="leading-none">{word} {displayDiff} ({Math.abs(percentage).toFixed(0)}%)</Text>
        </div>
    )
}

const ProfitsPage = () => {
    const [range, setRange] = useState("today")
    const [includeAds, setIncludeAds] = useState(true)
    const [currentPage, setCurrentPage] = useState(0)
    const [customStart, setCustomStart] = useState<string>("")
    const [customEnd, setCustomEnd] = useState<string>("")

    // --- CRITICAL FIX: MEMOIZE DATES ---
    // This ensures 'now' is only calculated ONCE when 'range' changes.
    // Without this, 'now' updates every milliseconds on every render, causing infinite refetch loops.
    const { currentStart, currentEnd, prevStart, daysMultiplier } = useMemo(() => {
        return getRangeParams(range, customStart, customEnd)
    }, [range, customStart, customEnd])

    useMemo(() => { setCurrentPage(0) }, [range])

    // 1. Fetch CURRENT Period Data
    const { data: currentData, isLoading: isLoadingCurrent } = useQuery({
        queryFn: async () => {
            return await sdk.client.fetch<any>("/admin/custom/profit-analytics", {
                query: { startDate: currentStart, endDate: currentEnd }
            })
        },
        queryKey: ["profit-analytics", currentStart, currentEnd], // Stable keys now
        enabled: range !== "custom" || (!!customStart && !!customEnd)
    })

    // 2. Fetch PREVIOUS Period Data
    const { data: prevData, isLoading: isLoadingPrev } = useQuery({
        queryFn: async () => {
            return await sdk.client.fetch<any>("/admin/custom/profit-analytics", {
                query: { startDate: prevStart, endDate: currentStart }
            })
        },
        queryKey: ["profit-analytics-prev", prevStart, currentStart], // Stable keys now
        enabled: range !== "custom" || (!!customStart && !!customEnd)
    })

    const isLoading = isLoadingCurrent || isLoadingPrev;

    // 3. Merge & Calculate
    const finalStats = useMemo(() => {
        const curr = currentData?.stats || { revenue: 0, cogs: 0, count: 0 };
        const prev = prevData?.stats || { revenue: 0, cogs: 0, count: 0 };
        const rows = currentData?.rows || [];

        const totalAdSpend = includeAds ? (daysMultiplier * DAILY_AD_SPEND) : 0;
        const prevAdSpend = includeAds ? (daysMultiplier * DAILY_AD_SPEND) : 0;

        const currProfit = curr.revenue - curr.cogs - totalAdSpend;
        const prevProfit = prev.revenue - prev.cogs - prevAdSpend;
        const currMargin = curr.revenue > 0 ? (currProfit / curr.revenue) * 100 : 0;

        return {
            current: { ...curr, profit: currProfit, margin: currMargin, adSpend: totalAdSpend },
            prev: { ...prev, profit: prevProfit },
            rows
        }
    }, [currentData, prevData, includeAds, daysMultiplier])

    // 4. Pagination
    const pageCount = Math.ceil(finalStats.rows.length / ITEMS_PER_PAGE)
    const paginatedRows = finalStats.rows.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)
    const canNext = currentPage < pageCount - 1
    const canPrev = currentPage > 0

    const formatMoney = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

    return (
        <Container className="p-0 overflow-hidden min-h-[calc(100vh-100px)] flex flex-col">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between px-8 py-6 border-b border-ui-border-base bg-ui-bg-subtle gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <CurrencyDollarSolid />
                        <Heading level="h1">Profit Analytics</Heading>
                    </div>
                    <Text size="small" className="text-ui-fg-muted">Real-time margin analysis.</Text>
                </div>
                <div className="flex flex-col md:flex-row items-end md:items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-2">
                        <Checkbox id="ads-toggle" checked={includeAds} onCheckedChange={(val) => setIncludeAds(val === true)} />
                        <Label htmlFor="ads-toggle" className="text-small text-ui-fg-subtle cursor-pointer select-none">Include Ads Spend</Label>
                    </div>
                    {range === "custom" && (
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col"><Label size="xsmall" className="text-ui-fg-muted">From</Label><Input type="date" size="small" value={customStart} onChange={(e) => setCustomStart(e.target.value)} /></div>
                            <div className="flex flex-col"><Label size="xsmall" className="text-ui-fg-muted">To</Label><Input type="date" size="small" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} /></div>
                        </div>
                    )}
                    <div className="w-[180px]">
                        <Select value={range} onValueChange={setRange} disabled={isLoading && range !== "custom"}>
                            <Select.Trigger><Select.Value /></Select.Trigger>
                            <Select.Content>
                                <Select.Item value="today">Today</Select.Item>
                                <Select.Item value="yesterday">Yesterday</Select.Item>
                                <Select.Item value="7days">Last 7 Days</Select.Item>
                                <Select.Item value="30days">Last 30 Days</Select.Item>
                                <Select.Item value="month">This Month</Select.Item>
                                <Select.Item value="quarter">Last Quarter</Select.Item>
                                <Select.Item value="custom">Custom Range</Select.Item>
                            </Select.Content>
                        </Select>
                    </div>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-ui-border-base border-b border-ui-border-base bg-ui-bg-base">
                <div className="p-6 flex flex-col justify-center h-[120px]">
                    <Text size="small" weight="plus" className="text-ui-fg-subtle uppercase mb-1">Orders</Text>
                    {isLoading ? <div className="h-6 w-16 bg-ui-bg-subtle animate-pulse rounded" /> : (
                        <>
                            <Heading level="h2">{finalStats.current.count}</Heading>
                            <ComparisonText current={finalStats.current.count} previous={finalStats.prev.count} />
                        </>
                    )}
                </div>
                <div className="p-6 flex flex-col justify-center h-[120px]">
                    <Text size="small" weight="plus" className="text-ui-fg-subtle uppercase mb-1">Item Revenue</Text>
                    {isLoading ? <div className="h-6 w-24 bg-ui-bg-subtle animate-pulse rounded" /> : (
                        <>
                            <Heading level="h2">{formatMoney(finalStats.current.revenue)}</Heading>
                            <ComparisonText current={finalStats.current.revenue} previous={finalStats.prev.revenue} prefix="₹" />
                        </>
                    )}
                </div>
                <div className="p-6 flex flex-col justify-center h-[120px]">
                    <Text size="small" weight="plus" className="text-ui-fg-subtle uppercase mb-1">COGS</Text>
                    {isLoading ? <div className="h-6 w-24 bg-ui-bg-subtle animate-pulse rounded" /> : (
                        <>
                            <Heading level="h2" className="text-ui-fg-muted">{formatMoney(finalStats.current.cogs)}</Heading>
                            <ComparisonText current={finalStats.current.cogs} previous={finalStats.prev.cogs} type="inverse" prefix="₹" />
                        </>
                    )}
                </div>
                <div className="p-6 flex flex-col justify-center h-[120px]">
                    <div className="flex items-center gap-1 mb-1"><Meta className="text-ui-fg-subtle" /><Text size="small" weight="plus" className="text-ui-fg-subtle uppercase">Ads Spend</Text></div>
                    {isLoading ? <div className="h-6 w-24 bg-ui-bg-subtle animate-pulse rounded" /> : (
                        <>
                            <Heading level="h2" className={includeAds ? "text-ui-fg-muted" : "text-ui-fg-subtle/50"}>{includeAds ? formatMoney(finalStats.current.adSpend) : "Excluded"}</Heading>
                            {includeAds && <Text size="xsmall" className="text-ui-fg-muted mt-1">{daysMultiplier} Days x ₹{DAILY_AD_SPEND}</Text>}
                        </>
                    )}
                </div>
                <div className={clx("p-6 flex flex-col justify-center h-[120px]", !isLoading && finalStats.current.profit > 0 ? "bg-green-50/10" : "bg-red-50/10")}>
                    <Text size="small" weight="plus" className="text-ui-fg-subtle uppercase mb-1">Net Profit</Text>
                    {isLoading ? <div className="h-6 w-24 bg-ui-bg-subtle animate-pulse rounded" /> : (
                        <>
                            <div className="flex items-center gap-3">
                                <Heading level="h2" className={finalStats.current.profit >= 0 ? "text-green-600" : "text-red-600"}>{formatMoney(finalStats.current.profit)}</Heading>
                                <StatusBadge color={finalStats.current.profit > 0 ? "green" : "red"}>{finalStats.current.margin.toFixed(0)}%</StatusBadge>
                            </div>
                            <ComparisonText current={finalStats.current.profit} previous={finalStats.prev.profit} prefix="₹" />
                        </>
                    )}
                </div>
            </div>

            {/* TABLE */}
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
                                    <Table.Row><Table.Cell colSpan={6} className="h-24 text-center text-ui-fg-subtle">No paid orders found in this period.</Table.Cell></Table.Row>
                                ) : (
                                    paginatedRows.map((row: any) => (
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
                        <Text size="small" className="text-ui-fg-subtle">Showing {Math.min(paginatedRows.length, ITEMS_PER_PAGE)} of {finalStats.rows.length} orders</Text>
                        <div className="flex items-center gap-2">
                            <IconButton size="small" variant="transparent" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={!canPrev}><ChevronLeft /></IconButton>
                            <Text size="small" className="text-ui-fg-base w-12 text-center">{currentPage + 1} / {Math.max(1, pageCount)}</Text>
                            <IconButton size="small" variant="transparent" onClick={() => setCurrentPage(p => Math.min(pageCount - 1, p + 1))} disabled={!canNext}><ChevronRight /></IconButton>
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