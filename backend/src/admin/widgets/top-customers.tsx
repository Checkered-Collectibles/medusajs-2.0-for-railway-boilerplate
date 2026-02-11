import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Table, Text, Avatar, clx } from "@medusajs/ui"
import { Trophy } from "@medusajs/icons"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"

// --- TYPES ---
type Order = {
    id: string
    total: number
    currency_code: string
    customer: {
        id: string
        first_name: string
        last_name: string
        email: string
    }
}

type AggregatedCustomer = {
    id: string
    name: string
    email: string
    totalSpent: number
    orderCount: number
    currency: string
}

const TopCustomersWidget = () => {

    // 1. Fetch Orders (Filtered by "Shipped")
    const { data, isLoading } = useQuery({
        queryFn: async () => {
            const { orders } = await sdk.client.fetch<{ orders: any[] }>("/admin/orders", {
                query: {
                    limit: 200,
                    fields:
                        "total,currency_code,customer.first_name,customer.last_name,customer.email,customer.id,fulfillment_status",
                    order: "-created_at",
                    // status: "completed",
                    // payment_status: "captured",
                },
            })

            const deliveredOrders = orders.filter(
                (o) => o.fulfillment_status === "delivered"
            )

            return deliveredOrders
        },
        queryKey: ["top-customers-delivered"],
    })

    // 2. Group & Aggregate
    const customersMap: Record<string, AggregatedCustomer> = {}
    const orders = data || []

    orders.forEach((order) => {
        if (!order.customer) return

        const customerId = order.customer.id

        if (!customersMap[customerId]) {
            customersMap[customerId] = {
                id: customerId,
                name: order.customer.first_name
                    ? `${order.customer.first_name} ${order.customer.last_name || ""}`
                    : "Guest",
                email: order.customer.email,
                totalSpent: 0,
                orderCount: 0,
                currency: order.currency_code?.toUpperCase() || "INR"
            }
        }

        customersMap[customerId].totalSpent += order.total
        customersMap[customerId].orderCount += 1
    })

    // 3. Sort by Spend & Take Top 5
    const rankedCustomers = Object.values(customersMap)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5)

    return (
        <Container className="p-0 overflow-hidden mb-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base bg-ui-bg-subtle">
                <div className="flex items-center gap-2">
                    <Trophy className="text-amber-500" />
                    <Heading level="h2">Top Spenders</Heading>
                </div>
                <Text size="small" className="text-ui-fg-muted">
                    Based on delivered orders
                </Text>
            </div>

            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>#</Table.HeaderCell>
                        <Table.HeaderCell>Customer</Table.HeaderCell>
                        <Table.HeaderCell>Delivered</Table.HeaderCell>
                        <Table.HeaderCell className="text-right">Total Spent</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <Table.Row key={i}>
                                <Table.Cell colSpan={4}>
                                    <div className="h-5 w-full bg-ui-bg-subtle animate-pulse rounded" />
                                </Table.Cell>
                            </Table.Row>
                        ))
                    ) : rankedCustomers.length === 0 ? (
                        <Table.Row>
                            <Table.Cell colSpan={4} className="text-center py-6 text-ui-fg-subtle">
                                No delivered orders found.
                            </Table.Cell>
                        </Table.Row>
                    ) : (
                        rankedCustomers.map((customer, index) => (
                            <Table.Row
                                key={customer.id}
                                className="cursor-pointer hover:bg-ui-bg-base-hover group"
                                onClick={() => window.location.assign(`/app/customers/${customer.id}`)}
                            >
                                {/* Rank */}
                                <Table.Cell className="w-[50px]">
                                    <div className={clx(
                                        "flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold",
                                        index === 0 ? "bg-amber-100 text-amber-700" :
                                            index === 1 ? "bg-ui-bg-base-pressed text-ui-fg-base" :
                                                index === 2 ? "bg-orange-50 text-orange-700" :
                                                    "bg-ui-bg-subtle text-ui-fg-subtle"
                                    )}>
                                        {index + 1}
                                    </div>
                                </Table.Cell>

                                {/* Name & Email */}
                                <Table.Cell>
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            fallback={(customer.name?.[0] || customer.email?.[0] || "U").toUpperCase()}
                                            size="xsmall"
                                        />
                                        <div className="flex flex-col">
                                            <Text size="small" weight="plus" className="text-ui-fg-base">
                                                {customer.name}
                                            </Text>
                                            <Text size="xsmall" className="text-ui-fg-subtle">
                                                {customer.email}
                                            </Text>
                                        </div>
                                    </div>
                                </Table.Cell>

                                {/* Order Count */}
                                <Table.Cell>
                                    <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-xs border border-green-200">
                                        {customer.orderCount} orders
                                    </div>
                                </Table.Cell>

                                {/* Total Spent */}
                                <Table.Cell className="text-right">
                                    <Text weight="plus" className="font-mono">
                                        {customer.totalSpent.toLocaleString()} {customer.currency}
                                    </Text>
                                </Table.Cell>
                            </Table.Row>
                        ))
                    )}
                </Table.Body>
            </Table>
        </Container>
    )
}

// --- CONFIGURATION ---
export const config = defineWidgetConfig({
    zone: "customer.list.after",
})

export default TopCustomersWidget