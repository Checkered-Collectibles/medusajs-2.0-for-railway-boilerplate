import * as React from "react"
import { Text, Section, Hr, Img, Button } from "@react-email/components"
import { Base } from "./base"
import {
    BigNumberValue,
    OrderDTO,
    OrderAddressDTO,
} from "@medusajs/framework/types"

export const ORDER_DELIVERED = "order-delivered"

interface EmailOrderSummary {
    subtotal: BigNumberValue
    discount_total: BigNumberValue
    shipping_total: BigNumberValue
    tax_total: BigNumberValue
    total: BigNumberValue
}

type EmailOrderItem = OrderDTO["items"][number] & {
    line_total?: BigNumberValue
}

export interface OrderDeliveredTemplateProps {
    order: OrderDTO & {
        display_id: number | string
        summary?: EmailOrderSummary
        items: EmailOrderItem[]
    }
    shippingAddress: OrderAddressDTO
    preview?: string
}

const formatMoney = (
    value: BigNumberValue | undefined | null,
    currency: string
) => {
    if (value === null || value === undefined) return ""

    const formatter = new Intl.NumberFormat([], {
        style: "currency",
        currencyDisplay: "narrowSymbol",
        currency: currency.toUpperCase(),
    })

    if (typeof value === "number") return formatter.format(value)
    if (typeof value === "string") return formatter.format(parseFloat(value))

    return (value as any)?.toString?.() ?? ""
}

export const isOrderDeliveredTemplateData = (
    data: any
): data is OrderDeliveredTemplateProps =>
    typeof data?.order === "object" && typeof data?.shippingAddress === "object"

export const OrderDeliveredTemplate: React.FC<OrderDeliveredTemplateProps> & {
    PreviewProps: OrderDeliveredTemplateProps
} = ({ order, shippingAddress, preview = "Your order has been delivered!" }) => {

    // TRUSTPILOT URL
    const reviewUrl = "https://www.trustpilot.com/evaluate/checkered.in"

    return (
        <Base preview={preview}>
            <Section>
                {/* HEADER */}
                <Img
                    src="https://checkered-assets.sgp1.cdn.digitaloceanspaces.com/manual-uploads/logo-notext2.png"
                    alt="Checkered Collectibles"
                    className="mx-auto w-20 mb-8"
                />
                <Text
                    style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        textAlign: "center",
                        margin: "0 0 30px",
                    }}
                >
                    Your Order Has Arrived! ✅
                </Text>

                <Text style={{ margin: "0 0 15px" }}>
                    Hi {shippingAddress.first_name},
                </Text>

                <Text style={{ margin: "0 0 20px" }}>
                    Our records show that your order has been delivered. We hope your new collectibles arrived safely and look even better in person!
                </Text>

                {/* REVIEW CTA SECTION */}
                <Section style={{
                    textAlign: "center",
                    margin: "30px 0",
                    backgroundColor: "#f9f9f9",
                    padding: "20px",
                    borderRadius: "8px"
                }}>
                    <Text style={{ fontWeight: "bold", margin: "0 0 10px", fontSize: "16px" }}>
                        How did we do?
                    </Text>
                    <Text style={{ margin: "0 0 20px", color: "#666" }}>
                        Your feedback helps other collectors trust us. It only takes a minute!
                    </Text>

                    <Button
                        href={reviewUrl}
                        style={{
                            backgroundColor: "#00b67a", // Trustpilot Green
                            color: "#ffffff",
                            padding: "12px 24px",
                            borderRadius: "4px",
                            fontSize: "16px",
                            fontWeight: "bold",
                            textDecoration: "none",
                            display: "inline-block",
                        }}
                    >
                        ★ Rate Us on Trustpilot
                    </Button>
                </Section>

                <Hr style={{ margin: "20px 0" }} />

                {/* ORDER ITEMS RECAP */}
                <Text
                    style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        margin: "0 0 15px",
                    }}
                >
                    Delivered Items
                </Text>

                <div
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        border: "1px solid #ddd",
                        margin: "10px 0",
                    }}
                >
                    {order.items.map((item) => {
                        return (
                            <div
                                key={item.id}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    padding: "8px",
                                    borderBottom: "1px solid #ddd",
                                }}
                            >
                                <Text style={{ width: "70%" }}>
                                    {item.product_title} – {item.variant_title}
                                </Text>

                                <Text style={{ width: "30%", textAlign: "right" }}>
                                    x {item.quantity}
                                </Text>
                            </div>
                        )
                    })}
                </div>

                <Text style={{ margin: "20px 0 0", fontSize: "12px", color: "#888" }}>
                    Order ID: #{order.display_id}
                </Text>

                <Text style={{ margin: "10px 0 0" }}>
                    Have an issue with the delivery? Just reply to this email and we'll fix it immediately.
                </Text>
            </Section>
        </Base>
    )
}

/* -----------------------
   MOCK DATA FOR PREVIEW
------------------------ */

const mockOrder = {
    order: {
        id: "order_01JSNXDH9BPJWWKVW03B9E9KW8",
        display_id: 1024,
        email: "collector@example.com",
        currency_code: "inr",
        items: [
            {
                id: "item_1",
                product_title: "Hot Wheels Mainline",
                variant_title: "Porsche 911 GT3",
                quantity: 2,
                unit_price: 199,
            },
            {
                id: "item_2",
                product_title: "Hot Wheels Premium",
                variant_title: "Nissan Skyline GT-R",
                quantity: 1,
                unit_price: 549,
            }
        ],
        shipping_address: {
            first_name: "Arjun",
            last_name: "Mehta",
            address_1: "123 Racing Road",
            city: "Mumbai",
            province: "Maharashtra",
            postal_code: "400050",
            country_code: "in",
        },
    },
}

OrderDeliveredTemplate.PreviewProps = {
    order: mockOrder.order as any,
    shippingAddress: mockOrder.order.shipping_address as any,
    preview: "Your package has arrived!",
} as OrderDeliveredTemplateProps

export default OrderDeliveredTemplate