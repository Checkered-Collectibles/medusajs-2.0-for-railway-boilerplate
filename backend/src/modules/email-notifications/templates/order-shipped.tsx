import * as React from "react"
import { Text, Section, Hr, Img, Button } from "@react-email/components"
import { Base } from "./base"
import {
  BigNumberValue,
  OrderDTO,
  OrderAddressDTO,
  FulfillmentDTO,
} from "@medusajs/framework/types"

export const ORDER_SHIPPED = "order-shipped"

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

// Update FulfillmentDTO interface to include labels if not already present in the generic type
// (Casting generally handles this in Medusa types, but good to be aware)
export interface OrderShippedTemplateProps {
  order: OrderDTO & {
    display_id: number | string
    summary?: EmailOrderSummary
    items: EmailOrderItem[]
  }
  fulfillment: FulfillmentDTO
  shippingAddress: OrderAddressDTO
  preview?: string
  trackingUrlPrefix?: string
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

export const isOrderShippedTemplateData = (
  data: any
): data is OrderShippedTemplateProps =>
  typeof data?.order === "object" &&
  typeof data?.fulfillment === "object" &&
  typeof data?.shippingAddress === "object"

export const OrderShippedTemplate: React.FC<OrderShippedTemplateProps> & {
  PreviewProps: OrderShippedTemplateProps
} = ({
  order,
  fulfillment,
  shippingAddress,
  preview = "Your order is on the way!",
  trackingUrlPrefix
}) => {
    const summary: EmailOrderSummary = order.summary ?? {
      subtotal: order.subtotal ?? order.item_subtotal ?? 0,
      discount_total: order.discount_total ?? 0,
      shipping_total: order.shipping_total ?? 0,
      tax_total: order.tax_total ?? 0,
      total: order.total ?? 0,
    }

    // Extract Tracking Details from Labels
    const latestLabel =
      (fulfillment as any)?.labels && (fulfillment as any).labels.length > 0
        ? (fulfillment as any).labels[(fulfillment as any).labels.length - 1]
        : undefined

    const trackingNumber = latestLabel?.tracking_number
    const trackingUrl = latestLabel?.tracking_url
    const hasTracking = !!trackingNumber

    const buttonUrl = (hasTracking && trackingUrl)
      ? `${trackingUrl}`
      : `https://checkered.in/account/orders/details/${order.id}`

    // Logic updated to show "Track" text if we have a URL (even without prefix)
    const buttonText = (hasTracking && (trackingUrl || trackingUrlPrefix))
      ? "Track Your Package"
      : "View Order Details"

    return (
      <Base preview={preview}>
        <Section>
          {/* HEADER */}
          <Img
            src="https://checkered.in/images/logo.png"
            alt="Checkered Collectibles"
            className="mx-auto w-28 mb-6"
          />
          <Text
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              textAlign: "center",
              margin: "0 0 30px",
            }}
          >
            Your Order Has Shipped! 🚚
          </Text>

          <Text style={{ margin: "0 0 15px" }}>
            Hi {shippingAddress.first_name},
          </Text>

          <Text style={{ margin: "0 0 20px" }}>
            Good news! We've handed your package over to the carrier. It is now on its way to you.
          </Text>

          {/* TRACKING INFO SECTION */}
          {hasTracking && (
            <Section style={{
              backgroundColor: "#f9f9f9",
              padding: "15px",
              borderRadius: "5px",
              marginBottom: "20px",
              textAlign: "center"
            }}>
              <Text style={{ margin: "0 0 5px", fontWeight: "bold", color: "#666" }}>
                TRACKING NUMBER
              </Text>
              <Text style={{ fontSize: "18px", margin: "0 0 5px", fontWeight: "bold", letterSpacing: "1px" }}>
                {trackingNumber}
              </Text>
              {/* {fulfillment.provider_id && (
                <Text style={{ fontSize: "12px", color: "#888", margin: "0" }}>
                  Carrier: {fulfillment.provider_id.toUpperCase()}
                </Text>
              )} */}
            </Section>
          )}

          {/* CTA BUTTON */}
          <Section style={{ textAlign: "center", margin: "30px 0" }}>
            <Button
              href={buttonUrl}
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
              {buttonText}
            </Button>
          </Section>

          <Hr style={{ margin: "20px 0" }} />

          {/* SHIPPING ADDRESS */}
          <Text
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              margin: "0 0 10px",
            }}
          >
            Destination
          </Text>

          <Text style={{ margin: "0 0 5px" }}>{shippingAddress.address_1}</Text>
          {shippingAddress.address_2 && (
            <Text style={{ margin: "0 0 5px" }}>{shippingAddress.address_2}</Text>
          )}

          <Text style={{ margin: "0 0 5px" }}>
            {shippingAddress.city}
            {shippingAddress.province && `, ${shippingAddress.province}`}{" "}
            {shippingAddress.postal_code}
          </Text>

          <Text style={{ margin: "0 0 20px" }}>
            {shippingAddress.country_code?.toUpperCase()}
          </Text>

          <Hr style={{ margin: "20px 0" }} />

          {/* ORDER ITEMS */}
          <Text
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              margin: "0 0 15px",
            }}
          >
            Shipment Contents
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
          <Text style={{ margin: "10px 0 0" }}>
            If you have any issues with the delivery, please reply to this email.
          </Text>
        </Section>
      </Base>
    )
  }

/* -----------------------
   UPDATED MOCK DATA FOR PREVIEW
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
  // 👇 UPDATED FULFILLMENT STRUCTURE
  fulfillment: {
    id: "ful_01JSNXD",
    provider_id: "delhivery",
    // Simulating the structure needed for `latestLabel` logic
    labels: [
      {
        tracking_number: "123456789012",
        tracking_url: "https://www.delhivery.com/track/package/123456789012",
        label_url: "https://example.com/label.pdf"
      }
    ],
    data: {},
    created_at: new Date()
  }
}

OrderShippedTemplate.PreviewProps = {
  order: mockOrder.order as any,
  fulfillment: mockOrder.fulfillment as any,
  shippingAddress: mockOrder.order.shipping_address as any,
  preview: "Your package is on the way!",
} as OrderShippedTemplateProps

export default OrderShippedTemplate