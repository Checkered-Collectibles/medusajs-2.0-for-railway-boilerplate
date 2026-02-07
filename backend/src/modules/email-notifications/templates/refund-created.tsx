import * as React from "react"
import { Text, Section, Hr, Img, Button } from "@react-email/components"
import { Base } from "./base"
import {
    BigNumberValue,
    OrderDTO,
} from "@medusajs/framework/types"

export const REFUND_CREATED = "refund-created"

export interface RefundCreatedTemplateProps {
    order: OrderDTO & {
        display_id: number | string
    }
    refundAmount: BigNumberValue
    currencyCode: string
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

export const isRefundCreatedTemplateData = (
    data: any
): data is RefundCreatedTemplateProps =>
    typeof data?.order === "object" && data?.refundAmount !== undefined

export const RefundCreatedTemplate: React.FC<RefundCreatedTemplateProps> & {
    PreviewProps: RefundCreatedTemplateProps
} = ({ order, refundAmount, currencyCode, preview = "A refund has been issued for your order" }) => {

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
                    }}
                >
                    Refund Processed
                </Text>

                <Text style={{ margin: "0 0 15px" }}>
                    Hi there,
                </Text>

                <Text style={{ margin: "0 0 20px" }}>
                    We wanted to let you know that a refund has been issued for your order <strong>#{order.display_id}</strong>.
                </Text>

                {/* REFUND AMOUNT BOX */}
                <Section style={{
                    backgroundColor: "#f4f4f5",
                    borderRadius: "8px",
                    padding: "20px",
                    textAlign: "center",
                    margin: "30px 0"
                }}>
                    <Text style={{ margin: "0", color: "#666", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                        Total Refunded
                    </Text>
                    <Text style={{ margin: "10px 0 0", fontSize: "32px", fontWeight: "bold", color: "#10b981" }}>
                        {formatMoney(refundAmount, currencyCode)}
                    </Text>
                </Section>

                <Text style={{ margin: "0 0 20px" }}>
                    You should see the funds appear on your statement within <strong>5-10 business days</strong>, depending on your bank's processing times.
                </Text>

                <Hr style={{ margin: "20px 0" }} />

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
                </Section>

                <Text style={{ margin: "20px 0 0", textAlign: "center", color: "#666", fontSize: "12px" }}>
                    If you have any questions or don't see the refund after 10 days, please reply to this email.
                </Text>
            </Section>
        </Base>
    )
}

/* -----------------------
   MOCK PREVIEW
------------------------ */

RefundCreatedTemplate.PreviewProps = {
    order: {
        id: "order_01JSNXDH9BPJWWKVW03B9E9KW8",
        display_id: 1024,
    } as any,
    refundAmount: 25.50,
    currencyCode: "inr",
    preview: "A refund has been issued for your order",
} as RefundCreatedTemplateProps

export default RefundCreatedTemplate