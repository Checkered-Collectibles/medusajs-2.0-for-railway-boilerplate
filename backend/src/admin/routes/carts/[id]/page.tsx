// src/admin/routes/carts/[id]/page.tsx
import { Link, useLoaderData, LoaderFunctionArgs, UIMatch } from "react-router-dom"
import { Container, Heading, Table, Text, StatusBadge, Avatar, Copy } from "@medusajs/ui"
import { sdk } from "../../../lib/sdk"

// 1. Define Response Type
type CartResponse = {
    cart: {
        id: string
        currency_code: string
        completed_at: string | null
        total: number
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

const CartDetailsPage = () => {
    // 2. Get data from Loader
    const { cart } = useLoaderData() as CartResponse

    // Helper logic
    const name = cart.customer
        ? `${cart.customer.first_name || ""} ${cart.customer.last_name || ""}`.trim() || cart.customer.email
        : "Guest User"

    const fallbackChar = name.charAt(0).toUpperCase()
    const customerId = cart.customer?.id
    console.log(cart)
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
                <div className="flex gap-1">
                    <StatusBadge color={cart.completed_at ? "green" : "orange"}>
                        {cart.completed_at ? "Completed" : "Active"}
                    </StatusBadge>
                    <StatusBadge color={cart.metadata?.abandoned_notification ? "green" : "orange"}>
                        {cart.metadata?.abandoned_notification ? "Email sent" : "Email not sent"}
                    </StatusBadge>
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
                <div className="flex gap-4 items-center">
                    <Text className="font-semibold text-ui-fg-muted">Total:</Text>
                    <Heading level="h2">
                        {cart.total} {cart.currency_code.toUpperCase()}
                    </Heading>
                </div>
            </Container>
        </div>
    )
}

export default CartDetailsPage

// 3. Define Loader
export async function loader({ params }: LoaderFunctionArgs) {
    const { id } = params
    // Fetch specifically from your custom Admin API route
    const data = await sdk.client.fetch<CartResponse>(`/admin/carts/${id}`)

    return data
}

// 4. Define Breadcrumb Handle
export const handle = {
    breadcrumb: ({ data }: UIMatch<CartResponse>) => {
        return data?.cart ? `${data.cart.id.slice(0, 7)}` : "Cart Details"
    },
}