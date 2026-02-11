import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
    Container,
    Heading,
    Table,
    StatusBadge,
    Text,
    Tooltip,
} from "@medusajs/ui"
import { ShoppingCart } from "@medusajs/icons"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { sdk } from "../lib/sdk"

// --- TYPES ---
type AdminCart = {
    id: string
    currency_code: string
    total: number
    created_at: string
    updated_at: string
    completed_at: string | null
    items: any[]
}

type CartsResponse = {
    carts: AdminCart[]
    count: number
}

// --- HELPER: Strictly Relative Time ---
// Updated to handle months and years so it never falls back to full date string
function getRelativeTime(dateString: string) {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago` // Up to 30 days
    if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago` // Up to 1 year
    return `${Math.floor(diff / 31536000)}y ago` // Years
}

// --- WIDGET COMPONENT ---
const CustomerCartsWidget = ({ data: customer }: { data: { id: string } }) => {
    const navigate = useNavigate()

    const { data, isLoading } = useQuery<CartsResponse>({
        queryFn: () => sdk.client.fetch(`/admin/carts`, {
            query: {
                customer_id: customer.id,
                limit: 5,
                order: "-updated_at"
            }
        }),
        queryKey: ["customer-carts", customer.id],
    })

    const carts = data?.carts || []

    return (
        <Container className="p-0 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="text-ui-fg-subtle" />
                    <Heading level="h2">Recent Carts</Heading>
                </div>
            </div>

            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Cart ID</Table.HeaderCell>
                        <Table.HeaderCell>Last Active</Table.HeaderCell>
                        <Table.HeaderCell>Items</Table.HeaderCell>
                        <Table.HeaderCell className="text-right">Total</Table.HeaderCell>
                        <Table.HeaderCell className="text-right">Status</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <Table.Row key={i}>
                                <Table.Cell colSpan={5}>
                                    <div className="h-5 w-full bg-ui-bg-subtle animate-pulse rounded" />
                                </Table.Cell>
                            </Table.Row>
                        ))
                    ) : carts.length === 0 ? (
                        <Table.Row>
                            <Table.Cell colSpan={5} className="text-center py-8 text-ui-fg-subtle">
                                No carts found for this customer.
                            </Table.Cell>
                        </Table.Row>
                    ) : (
                        carts.map((cart) => (
                            <Table.Row
                                key={cart.id}
                                className="cursor-pointer hover:bg-ui-bg-base-hover"
                                onClick={() => navigate(`/carts/${cart.id}`)}
                            >
                                <Table.Cell>
                                    <Text className="font-mono text-xs text-ui-fg-subtle">
                                        {cart.id.slice(0, 8)}...
                                    </Text>
                                </Table.Cell>

                                {/* 👇 Relative Time Logic Applied Here */}
                                <Table.Cell>
                                    <Tooltip content={new Date(cart.updated_at).toLocaleString()}>
                                        <Text size="small" className="text-ui-fg-subtle">
                                            {getRelativeTime(cart.updated_at)}
                                        </Text>
                                    </Tooltip>
                                </Table.Cell>

                                <Table.Cell>
                                    <Text size="small">{cart.items?.length || 0}</Text>
                                </Table.Cell>

                                <Table.Cell className="text-right">
                                    <Text size="small">
                                        {cart.total != null ? `${cart.total} ${cart.currency_code.toUpperCase()}` : "-"}
                                    </Text>
                                </Table.Cell>

                                <Table.Cell className="text-right">
                                    <StatusBadge color={cart.completed_at ? "green" : "orange"}>
                                        {cart.completed_at ? "Ordered" : "Active"}
                                    </StatusBadge>
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
    // ⚠️ NOTE: Tables are too wide for the sidebar ("side.after"). 
    // Using "details.after" places it at the bottom of the main content area.
    zone: "customer.details.side.after",
})

export default CustomerCartsWidget