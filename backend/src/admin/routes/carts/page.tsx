// src/admin/routes/carts/page.tsx
import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
    ShoppingCart,
    EllipsisHorizontal,
    PencilSquare,
    Eye,
    ArrowUpDown
} from "@medusajs/icons"
import {
    Container,
    Heading,
    Text,
    DataTable,
    createDataTableColumnHelper,
    createDataTableFilterHelper,
    useDataTable,
    StatusBadge,
    DropdownMenu,
    IconButton,
    toast,
    Tooltip, // 👈 Added Tooltip
    clx,
    Button
} from "@medusajs/ui"
import {
    keepPreviousData,
    useQuery
} from "@tanstack/react-query"
import { useMemo, useState, useEffect } from "react"
import { sdk } from "../../lib/sdk"
import { Link, useNavigate } from "react-router-dom"

// --- Types ---
type AdminCart = {
    id: string
    email: string | null
    total: number | null
    currency_code: string
    created_at: string
    updated_at: string
    completed_at: string | null
}

type AdminCartsResponse = {
    carts: AdminCart[]
    count: number
    limit: number
    offset: number
}

const PAGE_SIZE = 15

// --- HELPER: Relative Time ---
function getRelativeTime(dateString: string) {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return new Date(dateString).toLocaleDateString()
}

// --- HELPER: Full Date Tooltip ---
function formatDateTime(dateString: string) {
    if (!dateString) return ""
    return new Date(dateString).toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "numeric", minute: "numeric"
    })
}

// --- 1. Actions Component (Row Actions) ---
const CartActions = ({ cart }: { cart: AdminCart }) => {
    return (
        <DropdownMenu>
            <DropdownMenu.Trigger asChild>
                <IconButton variant="transparent">
                    <EllipsisHorizontal />
                </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <Link to={`/carts/${cart.id}`}>
                    <DropdownMenu.Item className="gap-x-2">
                        <Eye className="text-ui-fg-subtle" />
                        View Details
                    </DropdownMenu.Item>
                </Link>
                <DropdownMenu.Separator />
                <DropdownMenu.Item
                    className="gap-x-2"
                    onClick={() => {
                        navigator.clipboard.writeText(cart.id)
                        toast.success("Copied Cart ID")
                    }}
                >
                    <PencilSquare className="text-ui-fg-subtle" />
                    Copy ID
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu>
    )
}

// --- 2. Custom Sort Menu ---
const SortMenu = ({
    sorting,
    setSorting
}: {
    sorting: any[],
    setSorting: (s: any[]) => void
}) => {
    // Current sort state
    const currentSort = sorting[0] || { id: "updated_at", desc: true }

    const sortOptions = [
        { label: "Created", id: "created_at" },
        { label: "Updated", id: "updated_at" },
        { label: "Email", id: "email" },
        { label: "Total", id: "total" },
    ]

    const handleSortField = (id: string) => {
        setSorting([{ id, desc: currentSort.desc }])
    }

    const handleSortDir = (desc: boolean) => {
        setSorting([{ id: currentSort.id, desc }])
    }

    return (
        <DropdownMenu>
            <DropdownMenu.Trigger asChild>
                <IconButton variant="secondary" className="h-8 w-8 border">
                    <ArrowUpDown className="text-ui-fg-subtle" />
                </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" className="w-[200px]">
                <DropdownMenu.Group>
                    <DropdownMenu.Label>Sort By</DropdownMenu.Label>
                    {sortOptions.map((opt) => (
                        <DropdownMenu.CheckboxItem
                            key={opt.id}
                            checked={currentSort.id === opt.id}
                            onSelect={(e) => {
                                e.preventDefault()
                                handleSortField(opt.id)
                            }}
                        >
                            {opt.label}
                        </DropdownMenu.CheckboxItem>
                    ))}
                </DropdownMenu.Group>
                <DropdownMenu.Separator />
                <DropdownMenu.Group>
                    <DropdownMenu.Label>Order</DropdownMenu.Label>
                    <DropdownMenu.CheckboxItem
                        checked={!currentSort.desc}
                        onSelect={(e) => {
                            e.preventDefault()
                            handleSortDir(false)
                        }}
                    >
                        Ascending
                    </DropdownMenu.CheckboxItem>
                    <DropdownMenu.CheckboxItem
                        checked={currentSort.desc}
                        onSelect={(e) => {
                            e.preventDefault()
                            handleSortDir(true)
                        }}
                    >
                        Descending
                    </DropdownMenu.CheckboxItem>
                </DropdownMenu.Group>
            </DropdownMenu.Content>
        </DropdownMenu>
    )
}

// --- 3. Columns Hook ---
const columnHelper = createDataTableColumnHelper<AdminCart>()
const useColumns = () => {
    return useMemo(() => [
        columnHelper.accessor("id", {
            header: "Cart ID",
            sortable: true,
            cell: ({ getValue }) => (
                <Text className="truncate max-w-[160px] font-mono text-xs text-ui-fg-subtle">
                    {getValue()}
                </Text>
            ),
        }),
        columnHelper.accessor("email", {
            header: "Customer",
            sortable: true,
            cell: ({ getValue }) => (
                <Text className="truncate max-w-[200px]">
                    {getValue() || "-"}
                </Text>
            ),
        }),
        // 👇 UPDATED: Uses Relative Time + Tooltip
        columnHelper.accessor("created_at", {
            header: "Date",
            sortable: true,
            cell: ({ getValue }) => {
                const dateStr = getValue()
                return (
                    <Tooltip content={formatDateTime(dateStr)}>
                        <Text className="cursor-default text-ui-fg-subtle">
                            {getRelativeTime(dateStr)}
                        </Text>
                    </Tooltip>
                )
            },
        }),
        columnHelper.accessor("completed_at", {
            header: "Status",
            cell: ({ getValue }) => {
                const isCompleted = !!getValue()
                return (
                    <StatusBadge color={isCompleted ? "green" : "orange"}>
                        {isCompleted ? "Ordered" : "Active"}
                    </StatusBadge>
                )
            },
        }),
        columnHelper.accessor("total", {
            header: "Total",
            sortable: true,
            cell: ({ row }) => {
                const amount = row.original.total
                const currency = row.original.currency_code?.toUpperCase()
                return (
                    <Text className="text-right">
                        {amount != null ? `${amount} ${currency}` : "-"}
                    </Text>
                )
            },
        }),
        columnHelper.display({
            id: "actions",
            cell: ({ row }) => <CartActions cart={row.original} />,
        }),
    ], [])
}

// --- 4. Filters Hook ---
const filterHelper = createDataTableFilterHelper<AdminCart>()
const useFilters = () => {
    return useMemo(() => [
        filterHelper.accessor("id", {
            type: "string",
            label: "Cart ID"
        }),
        filterHelper.accessor("email", {
            type: "string",
            label: "Email"
        }),
        filterHelper.accessor("created_at", {
            type: "date",
            label: "Created Date"
        }),
        filterHelper.accessor("updated_at", {
            type: "date",
            label: "Updated Date"
        }),
    ], [])
}

// --- 5. Main Component ---
const CartListTable = () => {
    const columns = useColumns()
    const filters = useFilters()
    const navigate = useNavigate()

    // State
    const [pagination, setPagination] = useState({
        pageSize: PAGE_SIZE,
        pageIndex: 0,
    })

    const [searchValue, setSearchValue] = useState<string>("")
    const [debouncedSearch, setDebouncedSearch] = useState<string>("")

    // ⚡ CHANGED: Default sort to 'updated_at' DESC
    const [sorting, setSorting] = useState([{ id: "updated_at", desc: true }])
    const [filtering, setFiltering] = useState({})

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchValue)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchValue])

    const offset = useMemo(() => pagination.pageIndex * PAGE_SIZE, [pagination])

    const order = useMemo(() => {
        if (!sorting.length) return undefined
        const { id, desc } = sorting[0]
        return desc ? `-${id}` : id
    }, [sorting])

    // Fetch
    const { data, isLoading, isError, error } = useQuery<AdminCartsResponse>({
        queryFn: () =>
            sdk.client.fetch("/admin/carts", {
                method: "GET",
                query: {
                    limit: PAGE_SIZE,
                    offset,
                    q: debouncedSearch,
                    order,
                    ...filtering
                },
            }),
        queryKey: ["carts", PAGE_SIZE, offset, debouncedSearch, order, filtering],
        placeholderData: keepPreviousData,
    })

    const carts = data?.carts || []
    const count = data?.count || 0

    if (isError) throw error

    const table = useDataTable({
        data: carts,
        columns,
        getRowId: (row) => row.id,
        rowCount: count,
        isLoading,
        filters,
        search: true,
        pagination: {
            state: pagination,
            onPaginationChange: setPagination,
        },
        sorting: {
            state: sorting,
            onSortingChange: setSorting,
        },
        filtering: {
            state: filtering,
            onFilteringChange: setFiltering,
        },
        onRowClick: (e, row) => {
            // Prevent navigation if clicking actions
            if ((e.target as HTMLElement).closest("button, a")) return
            navigate(`/carts/${row.id}`)
        }
    })

    return (
        <Container className="divide-y p-0 h-full flex flex-col overflow-hidden">
            <DataTable instance={table}>
                {/* TOOLBAR */}
                <div className="flex items-center justify-between px-6 py-4">

                    {/* LEFT */}
                    <div className="flex items-center gap-2">
                        <Heading>Carts</Heading>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-2">
                        <DataTable.Search
                            placeholder="Search..."
                            onChange={(e) => setSearchValue(e.target.value)}
                            value={searchValue}
                        />
                        {/* Custom Sort Menu */}
                        <SortMenu sorting={sorting} setSorting={setSorting} />
                    </div>
                </div>

                {/* Table */}
                <DataTable.Table className="text-ui-fg-subtle" />

                {/* Pagination */}
                <DataTable.Pagination />
            </DataTable>
        </Container>
    )
}

const CartsPage = () => {
    return <CartListTable />
}

export const config = defineRouteConfig({
    label: "Carts",
    icon: ShoppingCart,
})

export default CartsPage

export const handle = {
    breadcrumb: () => "Carts",
}