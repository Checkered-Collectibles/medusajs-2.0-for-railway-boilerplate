// src/admin/routes/carts/[id]/page.tsx
import { Link, useLoaderData, LoaderFunctionArgs, UIMatch } from "react-router-dom"
import { Container, Heading, Table, Text, StatusBadge, Avatar, Copy, Tooltip } from "@medusajs/ui"
import { sdk } from "../../../lib/sdk"

// 1. Update Type to include dates
type CartResponse = {
    cart: {
        id: string
        currency_code: string
        completed_at: string | null
        created_at: string // 👈 Added
        updated_at: string // 👈 Added
        total: number
        subtotal: number
        shipping_total: number
        customer?: {
            id: string
            first_name: string
            last_name: string
            avatar?: string
            email: string
        }
        items: Array<{
            id: string
            product_title: string
            title: string
            quantity: number
            unit_price: number
            thumbnail?: string
        }>,
        metadata: {
            abandoned_notification: boolean
        }
    }
}

// Helper for "3 minutes ago" style formatting
function getRelativeTime(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return new Date(dateString).toLocaleDateString()
}

// Helper for "Feb 12, 2026, 1:44 PM"
function formatDateTime(dateString: string) {
    return new Date(dateString).toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "numeric", minute: "numeric"
    })
}

const CartDetailsPage = () => {
    const { cart } = useLoaderData() as CartResponse

    // Helper logic
    const name = cart.customer
        ? `${cart.customer.first_name || ""} ${cart.customer.last_name || ""}`.trim() || cart.customer.email
        : "Guest User"

    const fallbackChar = name.charAt(0).toUpperCase()
    const customerId = cart.customer?.id

    // Calculate subtotal manually if needed
    const calculatedSubtotal = cart.items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0)

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <Container className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* AVATAR + NAME LINK */}
                    {customerId ? (
                        <Link
                            to={`/customers/${customerId}`}
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                            <Avatar src={cart.customer?.avatar} fallback={fallbackChar} />
                            <div>
                                <Heading level="h2" className="text-ui-fg-base">
                                    {name}
                                </Heading>
                                <Text className="text-ui-fg-subtle text-small">
                                    Customer
                                </Text>
                            </div>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Avatar fallback="G" />
                            <div>
                                <Heading level="h2" className="text-ui-fg-base">
                                    Guest User
                                </Heading>
                            </div>
                        </div>
                    )}

                    {/* Cart ID */}
                    <div className="h-8 w-px bg-ui-border-base mx-2 hidden sm:block" />
                    <Text className="text-ui-fg-subtle text-small font-mono sm:block flex items-center gap-1">
                        #{cart.id} <Copy content={cart.id} className="inline-block" />
                    </Text>
                </div>

                {/* Right Side: Status + Dates */}
                <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-1">
                        <StatusBadge color={cart.completed_at ? "green" : "orange"}>
                            {cart.completed_at ? "Ordered" : "Active"}
                        </StatusBadge>
                        <StatusBadge color={cart.metadata?.abandoned_notification ? "green" : "orange"}>
                            {cart.metadata?.abandoned_notification ? "Email sent" : "Email not sent"}
                        </StatusBadge>
                    </div>

                    {/* 🕒 Date Display */}
                    <div className="flex flex-col items-end">
                        <Tooltip content={formatDateTime(cart.created_at)}>
                            <Text size="small" className="text-ui-fg-subtle cursor-default">
                                Created: {getRelativeTime(cart.created_at)}
                            </Text>
                        </Tooltip>
                        <Tooltip content={formatDateTime(cart.updated_at)}>
                            <Text size="small" className="text-ui-fg-subtle cursor-default">
                                Updated: {getRelativeTime(cart.updated_at)}
                            </Text>
                        </Tooltip>
                    </div>
                </div>
            </Container>

            {/* Line Items */}
            <Container className="p-0 overflow-hidden">
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Product</Table.HeaderCell>
                            <Table.HeaderCell>Quantity</Table.HeaderCell>
                            <Table.HeaderCell className="text-right">Price</Table.HeaderCell>
                            <Table.HeaderCell className="text-right">Total</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {cart.items?.map((item) => (
                            <Table.Row key={item.id}>
                                <Table.Cell>{item.product_title || item.title}</Table.Cell>
                                <Table.Cell>{item.quantity}</Table.Cell>
                                <Table.Cell className="text-right">
                                    {item.unit_price} {cart.currency_code.toUpperCase()}
                                </Table.Cell>
                                <Table.Cell className="text-right">
                                    {item.unit_price * item.quantity} {cart.currency_code.toUpperCase()}
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </Container>

            {/* Summary Footer */}
            <Container className="p-4 flex justify-end">
                <div className="flex flex-col gap-2 w-full max-w-[300px]">
                    {/* Subtotal */}
                    <div className="flex justify-between items-center">
                        <Text className="text-ui-fg-subtle">Subtotal</Text>
                        <Text>
                            {calculatedSubtotal} {cart.currency_code.toUpperCase()}
                        </Text>
                    </div>

                    {/* Shipping */}
                    <div className="flex justify-between items-center">
                        <Text className="text-ui-fg-subtle">Shipping</Text>
                        <Text>
                            {cart.shipping_total || 0} {cart.currency_code.toUpperCase()}
                        </Text>
                    </div>

                    {/* Divider */}
                    <div className="h-px w-full bg-ui-border-base my-1" />

                    {/* Total */}
                    <div className="flex justify-between items-center">
                        <Heading level="h2" className="text-ui-fg-base">Total</Heading>
                        <Heading level="h2">
                            {cart.total} {cart.currency_code.toUpperCase()}
                        </Heading>
                    </div>
                </div>
            </Container>
        </div>
    )
}

export default CartDetailsPage

export async function loader({ params }: LoaderFunctionArgs) {
    const { id } = params
    const data = await sdk.client.fetch<CartResponse>(`/admin/carts/${id}`)
    return data
}

export const handle = {
    breadcrumb: ({ data }: UIMatch<CartResponse>) => {
        return data?.cart ? `${data.cart.id.slice(0, 7)}` : "Cart Details"
    },
}