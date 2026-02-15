import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, StatusBadge, Table, Avatar, IconButton, clx } from "@medusajs/ui"
import { TagSolid, BuildingStorefront, Sparkles, Trophy, ChevronLeft, ChevronRight, ArrowUpMini, ArrowDownMini, CashSolid, ChartBar } from "@medusajs/icons"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"
import { useMemo, useState } from "react"

// --- TYPES ---
type ProductVariant = {
    id: string
    title: string
    inventory_quantity: number
}

type Product = {
    id: string
    title: string
    thumbnail: string | null
    totalStock: number
    unitCost: number
    categoryLabel: string
    variants: ProductVariant[]
}

type Bucket = {
    count: number
    stock: number
    value: number // Total COGS Value
    items: Product[]
}

type StatsResponse = {
    stats: {
        Licensed: Bucket
        Fantasy: Bucket
        Premium: Bucket
        Uncategorized: Bucket
    }
}

// --- CONSTANTS ---
const ITEMS_PER_PAGE = 15

const InventoryPage = () => {
    // State for Sorting & Pagination
    const [currentPage, setCurrentPage] = useState(0)
    const [sortKey, setSortKey] = useState<keyof Product | 'categoryLabel'>('totalStock')
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

    // 1. Fetch Data
    const { data, isLoading } = useQuery({
        queryFn: async () => {
            return await sdk.client.fetch<StatsResponse>("/admin/custom/inventory-analytics")
        },
        queryKey: ["inventory-analytics-custom"],
    })

    const stats = data?.stats

    // 2. Global Totals Calculation
    const globalStats = useMemo(() => {
        if (!stats) return { totalValue: 0, totalStock: 0, totalSKUs: 0 }

        const buckets = Object.values(stats)
        return buckets.reduce((acc, bucket) => ({
            totalValue: acc.totalValue + bucket.value,
            totalStock: acc.totalStock + bucket.stock,
            totalSKUs: acc.totalSKUs + bucket.count
        }), { totalValue: 0, totalStock: 0, totalSKUs: 0 })
    }, [stats])

    // 3. Process Data (Flatten -> Sort -> Paginate)
    const { displayedRows, totalPages, flatCount } = useMemo(() => {
        if (!stats) return { displayedRows: [], totalPages: 0, flatCount: 0 }

        const allItems = [
            ...stats.Premium.items,
            ...stats.Licensed.items,
            ...stats.Fantasy.items,
            ...stats.Uncategorized.items
        ]

        const sorted = [...allItems].sort((a, b) => {
            let valA = a[sortKey]
            let valB = b[sortKey]

            if (typeof valA === 'string' && typeof valB === 'string') {
                valA = valA.toLowerCase()
                valB = valB.toLowerCase()
            }

            if (valA < valB) return sortDir === 'asc' ? -1 : 1
            if (valA > valB) return sortDir === 'asc' ? 1 : -1
            return 0
        })

        const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
        const start = currentPage * ITEMS_PER_PAGE
        const end = start + ITEMS_PER_PAGE
        const displayedRows = sorted.slice(start, end)

        return { displayedRows, totalPages, flatCount: sorted.length }

    }, [stats, sortKey, sortDir, currentPage])

    // --- HANDLERS ---
    const handleSort = (key: keyof Product | 'categoryLabel') => {
        if (sortKey === key) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(key)
            setSortDir(key === 'totalStock' ? 'asc' : 'asc')
        }
        setCurrentPage(0)
    }

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    const SortIcon = ({ colKey }: { colKey: string }) => {
        if (sortKey !== colKey) return <div className="w-4 h-4" />
        return sortDir === 'asc' ? <ArrowUpMini className="text-ui-fg-subtle" /> : <ArrowDownMini className="text-ui-fg-subtle" />
    }

    if (isLoading || !stats) {
        return <Container className="h-[400px] animate-pulse bg-ui-bg-subtle" />
    }

    return (
        <Container className="p-0 overflow-hidden flex flex-col min-h-screen bg-ui-bg-subtle">
            {/* Header */}
            <div className="px-8 py-6 border-b border-ui-border-base bg-ui-bg-base flex justify-between items-start">
                <div>
                    <Heading level="h1">Inventory Intelligence</Heading>
                    <Text className="text-ui-fg-subtle">
                        Live valuation and categorization of stock.
                    </Text>
                </div>
                {/* Global Stats Badge */}
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-ui-bg-subtle border border-ui-border-base rounded-md flex flex-col items-end">
                        <Text size="xsmall" className="text-ui-fg-muted uppercase font-semibold">Total Inventory Value</Text>
                        <Heading level="h2" className="text-ui-fg-base">{formatMoney(globalStats.totalValue)}</Heading>
                    </div>
                    <div className="px-4 py-2 bg-ui-bg-subtle border border-ui-border-base rounded-md flex flex-col items-end">
                        <Text size="xsmall" className="text-ui-fg-muted uppercase font-semibold">Total Items</Text>
                        <Heading level="h2" className="text-ui-fg-base">{globalStats.totalStock}</Heading>
                    </div>
                </div>
            </div>

            {/* --- SUMMARY CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                {/* Licensed */}
                <Container className="p-6 flex flex-col gap-4 border-l-4 border-l-blue-500 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-md text-blue-600"><BuildingStorefront /></div>
                            <Heading level="h2">Licensed</Heading>
                        </div>
                        <StatusBadge color="blue">{stats.Licensed.count} SKUs</StatusBadge>
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                        <div className="flex justify-between items-center">
                            <Text size="small" className="text-ui-fg-subtle">Total Stock</Text>
                            <Text weight="plus">{stats.Licensed.stock}</Text>
                        </div>
                        <div className="flex justify-between items-center border-t border-ui-border-base pt-2">
                            <div className="flex items-center gap-1 text-ui-fg-subtle">
                                <CashSolid />
                                <Text size="small">Total Cost (COGS)</Text>
                            </div>
                            <Text weight="plus" className="text-ui-fg-base">{formatMoney(stats.Licensed.value)}</Text>
                        </div>
                    </div>
                </Container>

                {/* Premium */}
                <Container className="p-6 flex flex-col gap-4 border-l-4 border-l-purple-500 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-purple-100 rounded-md text-purple-600"><Trophy /></div>
                            <Heading level="h2">Premium</Heading>
                        </div>
                        <StatusBadge color="purple">{stats.Premium.count} SKUs</StatusBadge>
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                        <div className="flex justify-between items-center">
                            <Text size="small" className="text-ui-fg-subtle">Total Stock</Text>
                            <Text weight="plus">{stats.Premium.stock}</Text>
                        </div>
                        <div className="flex justify-between items-center border-t border-ui-border-base pt-2">
                            <div className="flex items-center gap-1 text-ui-fg-subtle">
                                <CashSolid />
                                <Text size="small">Total Cost (COGS)</Text>
                            </div>
                            <Text weight="plus" className="text-ui-fg-base">{formatMoney(stats.Premium.value)}</Text>
                        </div>
                    </div>
                </Container>

                {/* Fantasy */}
                <Container className="p-6 flex flex-col gap-4 border-l-4 border-l-orange-500 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-orange-100 rounded-md text-orange-600"><Sparkles /></div>
                            <Heading level="h2">Fantasy</Heading>
                        </div>
                        <StatusBadge color="orange">{stats.Fantasy.count} SKUs</StatusBadge>
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                        <div className="flex justify-between items-center">
                            <Text size="small" className="text-ui-fg-subtle">Total Stock</Text>
                            <Text weight="plus">{stats.Fantasy.stock}</Text>
                        </div>
                        <div className="flex justify-between items-center border-t border-ui-border-base pt-2">
                            <div className="flex items-center gap-1 text-ui-fg-subtle">
                                <CashSolid />
                                <Text size="small">Total Cost (COGS)</Text>
                            </div>
                            <Text weight="plus" className="text-ui-fg-base">{formatMoney(stats.Fantasy.value)}</Text>
                        </div>
                    </div>
                </Container>
            </div>

            {/* --- DETAILED TABLE --- */}
            <div className="px-6 pb-6 flex-1 flex flex-col">
                <Container className="p-0 overflow-hidden flex-1 flex flex-col shadow-sm">
                    <div className="overflow-auto flex-1">
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell
                                        className="cursor-pointer hover:bg-ui-bg-base-hover transition-colors"
                                        onClick={() => handleSort('title')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Product
                                            <SortIcon colKey="title" />
                                        </div>
                                    </Table.HeaderCell>

                                    <Table.HeaderCell
                                        className="cursor-pointer hover:bg-ui-bg-base-hover transition-colors"
                                        onClick={() => handleSort('categoryLabel')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Type
                                            <SortIcon colKey="categoryLabel" />
                                        </div>
                                    </Table.HeaderCell>

                                    <Table.HeaderCell
                                        className="text-right cursor-pointer hover:bg-ui-bg-base-hover transition-colors"
                                        onClick={() => handleSort('totalStock')}
                                    >
                                        <div className="flex items-center justify-end gap-1">
                                            Total Stock
                                            <SortIcon colKey="totalStock" />
                                        </div>
                                    </Table.HeaderCell>

                                    <Table.HeaderCell>Variant Breakdown</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {displayedRows.map((item) => {
                                    let badgeColor = "grey"
                                    if (item.categoryLabel === "Licensed") badgeColor = "blue"
                                    if (item.categoryLabel === "Premium") badgeColor = "purple"
                                    if (item.categoryLabel === "Fantasy") badgeColor = "orange"

                                    return (
                                        <Table.Row key={item.id} className="hover:bg-ui-bg-base-hover cursor-pointer" onClick={() => window.location.assign(`/app/products/${item.id}`)}>
                                            <Table.Cell className="flex items-center gap-3">
                                                <Avatar src={item.thumbnail} fallback={item.title.substring(0, 1)} size="small" shape="square" />
                                                <div className="flex flex-col">
                                                    <Text size="small" weight="plus" className="text-ui-fg-base">{item.title}</Text>
                                                    <div className="flex items-center gap-1 text-ui-fg-subtle">
                                                        <ChartBar className="w-3 h-3" />
                                                        <Text size="xsmall">Unit Cost: {formatMoney(item.unitCost)}</Text>
                                                    </div>
                                                </div>
                                            </Table.Cell>

                                            <Table.Cell>
                                                <StatusBadge color={badgeColor as any}>
                                                    {item.categoryLabel}
                                                </StatusBadge>
                                            </Table.Cell>

                                            <Table.Cell className="text-right">
                                                <div className="flex flex-col items-end">
                                                    <Text
                                                        weight="plus"
                                                        className={item.totalStock === 0 ? "text-red-500" : item.totalStock < 5 ? "text-orange-500" : "text-ui-fg-base"}
                                                    >
                                                        {item.totalStock}
                                                    </Text>
                                                    <Text size="xsmall" className="text-ui-fg-subtle">
                                                        Val: {formatMoney(item.totalStock * item.unitCost)}
                                                    </Text>
                                                </div>
                                            </Table.Cell>

                                            <Table.Cell>
                                                <div className="flex flex-wrap gap-1">
                                                    {item.variants.map((v) => (
                                                        <div key={v.id} className="px-1.5 py-0.5 bg-ui-bg-base border border-ui-border-base rounded text-[10px] text-ui-fg-subtle">
                                                            {v.title}: {v.inventory_quantity}
                                                        </div>
                                                    ))}
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    )
                                })}
                            </Table.Body>
                        </Table>
                    </div>

                    {/* Footer / Pagination Controls */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-ui-border-base bg-ui-bg-base">
                        <Text size="small" className="text-ui-fg-subtle">
                            Showing {displayedRows.length > 0 ? currentPage * ITEMS_PER_PAGE + 1 : 0} to {Math.min((currentPage + 1) * ITEMS_PER_PAGE, flatCount)} of {flatCount} products
                        </Text>
                        <div className="flex items-center gap-2">
                            <IconButton
                                size="small"
                                variant="transparent"
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                            >
                                <ChevronLeft />
                            </IconButton>
                            <Text size="small" className="text-ui-fg-base w-12 text-center">
                                {currentPage + 1} / {Math.max(1, totalPages)}
                            </Text>
                            <IconButton
                                size="small"
                                variant="transparent"
                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={currentPage >= totalPages - 1}
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
    label: "Inventory Type",
    icon: TagSolid,
    rank: 1
})

export default InventoryPage