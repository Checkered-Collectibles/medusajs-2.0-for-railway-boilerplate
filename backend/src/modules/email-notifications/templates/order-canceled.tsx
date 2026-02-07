import * as React from "react"
import { Text, Section, Hr, Img, Button } from "@react-email/components"
import { Base } from "./base"
import {
    BigNumberValue,
    OrderDTO,
    OrderAddressDTO,
} from "@medusajs/framework/types"

export const ORDER_CANCELED = "order-canceled"

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

export interface OrderCanceledTemplateProps {
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

export const isOrderCanceledTemplateData = (
    data: any
): data is OrderCanceledTemplateProps =>
    typeof data?.order === "object" && typeof data?.shippingAddress === "object"

export const OrderCanceledTemplate: React.FC<OrderCanceledTemplateProps> & {
    PreviewProps: OrderCanceledTemplateProps
} = ({ order, shippingAddress, preview = "Your order has been canceled" }) => {
    // ✅ 1. Safe extraction of totals
    const summary: EmailOrderSummary = order.summary ?? {
        subtotal: order.subtotal ?? order.item_subtotal ?? 0,
        discount_total: order.discount_total ?? 0,
        shipping_total: order.shipping_total ?? 0,
        tax_total: order.tax_total ?? 0,
        total: order.total ?? 0,
    }

    // Define the Order Details URL (or Contact URL)
    const contactUrl = `https://checkered.in/contact`

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
                        color: "#e11d48", // Red color for cancellation notice
                    }}
                >
                    Order Canceled
                </Text>

                <Text style={{ margin: "0 0 15px" }}>
                    Dear {shippingAddress.first_name} {shippingAddress.last_name},
                </Text>

                <Text style={{ margin: "0 0 20px" }}>
                    This email is to confirm that your order <strong>#{order.display_id}</strong> has been canceled.
                </Text>

                <Text style={{ margin: "0 0 20px" }}>
                    If you have already been charged, a refund has been initiated and should appear on your statement within 5-10 business days.
                </Text>

                {/* CTA BUTTON */}
                <Section style={{ textAlign: "center", margin: "30px 0" }}>
                    <Button
                        href={contactUrl}
                        style={{
                            backgroundColor: "#000000",
                            color: "#ffffff",
                            padding: "12px 24px",
                            borderRadius: "4px",
                            fontSize: "16px",
                            fontWeight: "bold",
                            textDecoration: "none",
                            display: "inline-block",
                        }}
                    >
                        Contact Support
                    </Button>
                </Section>

                {/* ORDER SUMMARY (For Reference) */}
                <Text
                    style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        margin: "0 0 10px",
                    }}
                >
                    Canceled Order Summary
                </Text>

                <Text style={{ margin: "0 0 5px" }}>Order ID: #{order.display_id}</Text>
                <Text style={{ margin: "0 0 5px" }}>
                    Order Date: {new Date(order.created_at).toLocaleDateString()}
                </Text>

                {/* Totals Section */}
                <div style={{ margin: "10px 0 20px" }}>
                    <Text style={{ margin: "0 0 3px" }}>
                        Subtotal: {formatMoney(summary.subtotal, order.currency_code)}
                    </Text>

                    {Number(summary.discount_total) > 0 && (
                        <Text style={{ margin: "0 0 3px" }}>
                            Discount: -
                            {formatMoney(summary.discount_total, order.currency_code)}
                        </Text>
                    )}

                    {Number(summary.shipping_total) > 0 && (
                        <Text style={{ margin: "0 0 3px" }}>
                            Shipping: {formatMoney(summary.shipping_total, order.currency_code)}
                        </Text>
                    )}

                    {Number(summary.tax_total) > 0 && (
                        <Text style={{ margin: "0 0 3px" }}>
                            Tax: {formatMoney(summary.tax_total, order.currency_code)}
                        </Text>
                    )}

                    <Text style={{ margin: "8px 0 0", fontWeight: "bold" }}>
                        Total: {formatMoney(summary.total, order.currency_code)}
                    </Text>
                </div>
                <Hr style={{ margin: "20px 0" }} />

                {/* CANCELED ITEMS */}
                <Text
                    style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        margin: "0 0 15px",
                    }}
                >
                    Items in Canceled Order
                </Text>

                <div
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        border: "1px solid #ddd",
                        margin: "10px 0",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            backgroundColor: "#f2f2f2",
                            padding: "8px",
                            borderBottom: "1px solid #ddd",
                        }}
                    >
                        <Text style={{ fontWeight: "bold", width: "60%" }}>Item</Text>
                        <Text
                            style={{
                                fontWeight: "bold",
                                width: "10%",
                                textAlign: "center",
                            }}
                        >
                            Qty
                        </Text>
                        <Text
                            style={{
                                fontWeight: "bold",
                                width: "30%",
                                textAlign: "right",
                            }}
                        >
                            Total
                        </Text>
                    </div>

                    {order.items.map((item) => {
                        const lineTotal =
                            item.total ??
                            item.item_total ??
                            (typeof item.unit_price === "number"
                                ? item.unit_price * item.quantity
                                : item.unit_price)

                        const hasDiscount = Number(item.discount_total) > 0

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
                                <Text style={{ width: "60%" }}>
                                    {item.product_title} – {item.variant_title}
                                </Text>

                                <Text style={{ width: "10%", textAlign: "center" }}>
                                    {item.quantity}
                                </Text>

                                <Text style={{ width: "30%", textAlign: "right" }}>
                                    {hasDiscount && item.original_total !== undefined ? (
                                        <>
                                            <span
                                                style={{
                                                    textDecoration: "line-through",
                                                    color: "#999",
                                                    marginRight: 6,
                                                }}
                                            >
                                                {formatMoney(item.original_total, order.currency_code)}
                                            </span>
                                            {formatMoney(lineTotal, order.currency_code)}
                                        </>
                                    ) : (
                                        formatMoney(lineTotal, order.currency_code)
                                    )}
                                </Text>
                            </div>
                        )
                    })}
                </div>

                {/* SOCIAL LINKS SECTION */}
                <Section style={{
                    marginTop: "30px",
                    marginBottom: "10px",
                    backgroundColor: "#f9f9f9",
                    padding: "20px",
                    borderRadius: "8px",
                    textAlign: "center"
                }}>
                    <Text style={{ fontSize: "14px", color: "#444", fontWeight: "bold", marginBottom: "15px" }}>
                        Join the Collector's Community 🏎️
                    </Text>

                    {/* Social Icons Container */}
                    <Section>
                        <table align="center" border={0} cellPadding={0} cellSpacing={0}>
                            <tr>
                                <td style={{ padding: "0 10px" }}>
                                    <a href="https://instagram.com/checkered.in" target="_blank">
                                        <Img
                                            src="https://checkered-assets.sgp1.cdn.digitaloceanspaces.com/manual-uploads/instagram-small-circle.png"
                                            alt="Instagram"
                                            width="40"
                                            height="40"
                                        />
                                    </a>
                                </td>
                                <td style={{ padding: "0 10px" }}>
                                    <a href="https://youtube.com/@CheckeredCollectibles" target="_blank">
                                        <Img
                                            src="https://checkered-assets.sgp1.cdn.digitaloceanspaces.com/manual-uploads/youtube-small-circle.png"
                                            alt="YouTube"
                                            width="40"
                                            height="40"
                                        />
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </Section>

                    <Text style={{ fontSize: "12px", color: "#888", marginTop: "15px" }}>
                        Follow us for unboxings, drops & giveaways.
                    </Text>
                </Section>

                <Text style={{ margin: "20px 0 0", textAlign: "center", color: "#666", fontSize: "12px" }}>
                    If you have questions about why this order was canceled, please reply to this email.
                </Text>
            </Section>
        </Base>
    )
}

/* -----------------------
   MOCK ORDER FOR PREVIEW
------------------------ */

const mockOrder = {
    order: {
        id: "order_01JSNXDH9BPJWWKVW03B9E9KW8",
        display_id: 1,
        email: "afsaf@gmail.com",
        currency_code: "eur",
        total: 20,
        subtotal: 20,
        discount_total: 0,
        shipping_total: 10,
        tax_total: 0,
        item_subtotal: 10,
        item_total: 10,
        item_tax_total: 0,
        customer_id: "cus_01JSNXD6VQC1YH56E4TGC81NWX",
        items: [
            {
                id: "ordli_01JSNXDH9C47KZ43WQ3TBFXZA9",
                title: "L",
                subtitle: "Medusa Sweatshirt",
                thumbnail:
                    "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
                variant_id: "variant_01JSNXAQCZ5X81A3NRSVFJ3ZHQ",
                product_id: "prod_01JSNXAQBQ6MFV5VHKN420NXQW",
                product_title: "Medusa Sweatshirt",
                product_description:
                    "Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.",
                product_subtitle: null,
                product_type: null,
                product_type_id: null,
                product_collection: null,
                product_handle: "sweatshirt",
                variant_sku: "SWEATSHIRT-L",
                variant_barcode: null,
                variant_title: "L",
                variant_option_values: null,
                requires_shipping: true,
                is_giftcard: false,
                is_discountable: true,
                is_tax_inclusive: false,
                is_custom_price: false,
                metadata: {},
                raw_compare_at_unit_price: null,
                raw_unit_price: {
                    value: "10",
                    precision: 20,
                },
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null,
                tax_lines: [],
                adjustments: [],
                compare_at_unit_price: null,
                unit_price: 10,
                quantity: 1,
                raw_quantity: {
                    value: "1",
                    precision: 20,
                },
                detail: {
                    id: "orditem_01JSNXDH9DK1XMESEZPADYFWKY",
                    version: 1,
                    metadata: null,
                    order_id: "order_01JSNXDH9BPJWWKVW03B9E9KW8",
                    raw_unit_price: null,
                    raw_compare_at_unit_price: null,
                    raw_quantity: {
                        value: "1",
                        precision: 20,
                    },
                    raw_fulfilled_quantity: {
                        value: "0",
                        precision: 20,
                    },
                    raw_delivered_quantity: {
                        value: "0",
                        precision: 20,
                    },
                    raw_shipped_quantity: {
                        value: "0",
                        precision: 20,
                    },
                    raw_return_requested_quantity: {
                        value: "0",
                        precision: 20,
                    },
                    raw_return_received_quantity: {
                        value: "0",
                        precision: 20,
                    },
                    raw_return_dismissed_quantity: {
                        value: "0",
                        precision: 20,
                    },
                    raw_written_off_quantity: {
                        value: "0",
                        precision: 20,
                    },
                    created_at: new Date(),
                    updated_at: new Date(),
                    deleted_at: null,
                    item_id: "ordli_01JSNXDH9C47KZ43WQ3TBFXZA9",
                    unit_price: null,
                    compare_at_unit_price: null,
                    quantity: 1,
                    fulfilled_quantity: 0,
                    delivered_quantity: 0,
                    shipped_quantity: 0,
                    return_requested_quantity: 0,
                    return_received_quantity: 0,
                    return_dismissed_quantity: 0,
                    written_off_quantity: 0,
                },
                subtotal: 10,
                total: 10,
                original_total: 10,
                discount_total: 0,
                discount_subtotal: 0,
                discount_tax_total: 0,
                tax_total: 0,
                original_tax_total: 0,
                refundable_total_per_unit: 10,
                refundable_total: 10,
                fulfilled_total: 0,
                shipped_total: 0,
                return_requested_total: 0,
                return_received_total: 0,
                return_dismissed_total: 0,
                write_off_total: 0,
                raw_subtotal: {
                    value: "10",
                    precision: 20,
                },
                raw_total: {
                    value: "10",
                    precision: 20,
                },
                raw_original_total: {
                    value: "10",
                    precision: 20,
                },
                raw_discount_total: {
                    value: "0",
                    precision: 20,
                },
                raw_discount_subtotal: {
                    value: "0",
                    precision: 20,
                },
                raw_discount_tax_total: {
                    value: "0",
                    precision: 20,
                },
                raw_tax_total: {
                    value: "0",
                    precision: 20,
                },
                raw_original_tax_total: {
                    value: "0",
                    precision: 20,
                },
                raw_refundable_total_per_unit: {
                    value: "10",
                    precision: 20,
                },
                raw_refundable_total: {
                    value: "10",
                    precision: 20,
                },
                raw_fulfilled_total: {
                    value: "0",
                    precision: 20,
                },
                raw_shipped_total: {
                    value: "0",
                    precision: 20,
                },
                raw_return_requested_total: {
                    value: "0",
                    precision: 20,
                },
                raw_return_received_total: {
                    value: "0",
                    precision: 20,
                },
                raw_return_dismissed_total: {
                    value: "0",
                    precision: 20,
                },
                raw_write_off_total: {
                    value: "0",
                    precision: 20,
                },
            },
        ],
        shipping_address: {
            id: "caaddr_01JSNXD6W0TGPH2JQD18K97B25",
            customer_id: null,
            company: "",
            first_name: "safasf",
            last_name: "asfaf",
            address_1: "asfasf",
            address_2: "",
            city: "asfasf",
            country_code: "dk",
            province: "",
            postal_code: "asfasf",
            phone: "",
            metadata: null,
            created_at: "2025-04-25T07:25:48.801Z",
            updated_at: "2025-04-25T07:25:48.801Z",
            deleted_at: null,
        },
        billing_address: {
            id: "caaddr_01JSNXD6W0V7RNZH63CPG26K5W",
            customer_id: null,
            company: "",
            first_name: "safasf",
            last_name: "asfaf",
            address_1: "asfasf",
            address_2: "",
            city: "asfasf",
            country_code: "dk",
            province: "",
            postal_code: "asfasf",
            phone: "",
            metadata: null,
            created_at: "2025-04-25T07:25:48.801Z",
            updated_at: "2025-04-25T07:25:48.801Z",
            deleted_at: null,
        },
        shipping_methods: [
            {
                id: "ordsm_01JSNXDH9B9DDRQXJT5J5AE5V1",
                name: "Standard Shipping",
                description: null,
                is_tax_inclusive: false,
                is_custom_amount: false,
                shipping_option_id: "so_01JSNXAQA64APG6BNHGCMCTN6V",
                data: {},
                metadata: null,
                raw_amount: {
                    value: "10",
                    precision: 20,
                },
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null,
                tax_lines: [],
                adjustments: [],
                amount: 10,
                order_id: "order_01JSNXDH9BPJWWKVW03B9E9KW8",
                detail: {
                    id: "ordspmv_01JSNXDH9B5RAF4FH3M1HH3TEA",
                    version: 1,
                    order_id: "order_01JSNXDH9BPJWWKVW03B9E9KW8",
                    return_id: null,
                    exchange_id: null,
                    claim_id: null,
                    created_at: new Date(),
                    updated_at: new Date(),
                    deleted_at: null,
                    shipping_method_id: "ordsm_01JSNXDH9B9DDRQXJT5J5AE5V1",
                },
                subtotal: 10,
                total: 10,
                original_total: 10,
                discount_total: 0,
                discount_subtotal: 0,
                discount_tax_total: 0,
                tax_total: 0,
                original_tax_total: 0,
                raw_subtotal: {
                    value: "10",
                    precision: 20,
                },
                raw_total: {
                    value: "10",
                    precision: 20,
                },
                raw_original_total: {
                    value: "10",
                    precision: 20,
                },
                raw_discount_total: {
                    value: "0",
                    precision: 20,
                },
                raw_discount_subtotal: {
                    value: "0",
                    precision: 20,
                },
                raw_discount_tax_total: {
                    value: "0",
                    precision: 20,
                },
                raw_tax_total: {
                    value: "0",
                    precision: 20,
                },
                raw_original_tax_total: {
                    value: "0",
                    precision: 20,
                },
            },
        ],
        customer: {
            id: "cus_01JSNXD6VQC1YH56E4TGC81NWX",
            company_name: null,
            first_name: null,
            last_name: null,
            email: "afsaf@gmail.com",
            phone: null,
            has_account: false,
            metadata: null,
            created_by: null,
            created_at: "2025-04-25T07:25:48.791Z",
            updated_at: "2025-04-25T07:25:48.791Z",
            deleted_at: null,
        },
        created_at: new Date(),
        updated_at: new Date(),
    },
}

OrderCanceledTemplate.PreviewProps = {
    order: mockOrder.order as any,
    shippingAddress: mockOrder.order.shipping_address as any,
    preview: "Your order has been canceled",
} as OrderCanceledTemplateProps

export default OrderCanceledTemplate