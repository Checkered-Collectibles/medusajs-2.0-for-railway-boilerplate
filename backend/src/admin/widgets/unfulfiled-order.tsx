import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, StatusBadge, Table, Button, clx, Tooltip } from "@medusajs/ui"
import { TruckFast, CheckCircle } from "@medusajs/icons"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"

// --- TYPES ---
type Order = {
    id: string
    display_id: number
    created_at: string
    total: number
    currency_code: string
    items: any[]
    payment_status: string
    fulfillment_status: string
    shipping_address?: {
        city: string
        country_code: string
    }
}

// --- HELPER: Relative Time ---
function getRelativeTime(dateString: string) {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`

    // For older dates, show concise format like "Feb 12"
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// --- COMPONENT ---
const UnfulfilledOrdersWidget = () => {

    // 1. Fetch "Ready to Ship" Orders
    const { data, isLoading } = useQuery({
        queryFn: async () => {
            const { orders } = await sdk.client.fetch<{ orders: Order[] }>("/admin/orders", {
                query: {
                    limit: 200,
                    order: "created_at",
                    fields: "id,display_id,created_at,total,currency_code,items.quantity,shipping_address.city,shipping_address.country_code,payment_status,fulfillment_status",
                },
            })

            // Filter client-side for "Paid" AND ("Not Shipped" OR "Partially Shipped")
            return orders.filter(
                (o) =>
                    o.payment_status === "captured" &&
                    o.fulfillment_status !== "delivered" &&
                    o.fulfillment_status !== "shipped"
            )
        },
        queryKey: ["orders-unfulfilled"],
    })

    const orders = data || []
    const count = orders.length
    const hasBacklog = count > 0

    return (
        <Container className="p-0 overflow-hidden mb-4 border-ui-border-strong">
            {/* Header */}
            <div className={clx(
                "flex items-center justify-between px-6 py-4 border-b border-ui-border-base",
                hasBacklog ? "bg-orange-50/10" : "bg-ui-bg-subtle"
            )}>
                <div className="flex items-center gap-2">
                    {hasBacklog ? (
                        <TruckFast className="text-orange-500" />
                    ) : (
                        <CheckCircle className="text-green-500" />
                    )}
                    <Heading level="h2">
                        {hasBacklog ? "Ready to Fulfill" : "All Caught Up"}
                    </Heading>
                    {hasBacklog && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs font-medium text-white">
                            {count}
                        </span>
                    )}
                </div>
                <Text size="small" className="text-ui-fg-muted">
                    Paid orders waiting for packing
                </Text>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="p-6 space-y-2">
                    <div className="h-5 w-full bg-ui-bg-subtle animate-pulse rounded" />
                    <div className="h-5 w-3/4 bg-ui-bg-subtle animate-pulse rounded" />
                </div>
            ) : !hasBacklog ? (
                // Empty State
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Text className="text-ui-fg-subtle">No pending orders. Great job! 🎉</Text>
                </div>
            ) : (
                // Table of Orders
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Order #</Table.HeaderCell>
                            <Table.HeaderCell>Created</Table.HeaderCell>
                            <Table.HeaderCell>Destination</Table.HeaderCell>
                            <Table.HeaderCell>Items</Table.HeaderCell>
                            <Table.HeaderCell className="text-right">Action</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {orders.slice(0, 5).map((order) => (
                            <Table.Row
                                key={order.id}
                                className="cursor-pointer hover:bg-ui-bg-base-hover group"
                                onClick={() => window.location.assign(`/app/orders/${order.id}`)}
                            >
                                <Table.Cell>
                                    <Text weight="plus" className="text-ui-fg-base">
                                        #{order.display_id}
                                    </Text>
                                </Table.Cell>

                                {/* ⚡ UPDATED DATE CELL */}
                                <Table.Cell>
                                    <Tooltip content={new Date(order.created_at).toLocaleString()}>
                                        <Text size="small" className="text-ui-fg-subtle cursor-default w-fit">
                                            {getRelativeTime(order.created_at)}
                                        </Text>
                                    </Tooltip>
                                </Table.Cell>

                                <Table.Cell>
                                    <div className="flex items-center gap-1">
                                        <Text size="small">
                                            {order.shipping_address?.city || "-"},
                                        </Text>
                                        <Text size="small" className="text-ui-fg-subtle">
                                            {order.shipping_address?.country_code?.toUpperCase()}
                                        </Text>
                                    </div>
                                </Table.Cell>

                                <Table.Cell>
                                    <StatusBadge color="blue" className="inline-flex">
                                        {order.items?.reduce((acc: number, i: any) => acc + i.quantity, 0)} items
                                    </StatusBadge>
                                </Table.Cell>

                                <Table.Cell className="text-right">
                                    <Button size="small" variant="secondary">
                                        View
                                    </Button>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                        {count > 5 && (
                            <Table.Row>
                                <Table.Cell colSpan={5} className="text-center py-3">
                                    <Text size="small" className="text-ui-fg-muted">
                                        And {count - 5} more...
                                    </Text>
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table>
            )}
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "order.list.before",
})

export default UnfulfilledOrdersWidget