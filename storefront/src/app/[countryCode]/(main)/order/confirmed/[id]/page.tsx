import { Metadata } from "next"
import Script from "next/script" // 1. Import Script
import { notFound } from "next/navigation"

import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { enrichLineItems } from "@lib/data/cart"
import { retrieveOrder } from "@lib/data/orders"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: { id: string }
}

async function getOrder(id: string) {
  const order = await retrieveOrder(id)

  if (!order) {
    return
  }

  const enrichedItems = await enrichLineItems(order.items, order.region_id!)

  return {
    ...order,
    items: enrichedItems,
  } as unknown as HttpTypes.StoreOrder
}

// 2. DYNAMIC METADATA
// We switch to generateMetadata to show the Order ID in the browser tab
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const order = await getOrder(params.id)

  return {
    title: order ? `Order Confirmed #${order.display_id}` : "Order Confirmed",
    description: "Your purchase was successful.",
    // 🛑 CRITICAL: Do not index private order pages
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function OrderConfirmedPage({ params }: Props) {
  const order = await getOrder(params.id)

  if (!order) {
    return notFound()
  }

  // 3. ORDER SCHEMA (For Browser & Email Integration)
  // This helps browsers/extensions identify a successful transaction.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Order",
    "merchant": {
      "@type": "Organization",
      "name": "Checkered Collectibles"
    },
    "orderNumber": order.display_id,
    "priceCurrency": order.currency_code.toUpperCase(),
    "price": order.total, // Ensure this matches your currency format (cents vs dollars)
    "orderStatus": "https://schema.org/OrderProcessing",
    "acceptedOffer": order.items?.map((item) => ({
      "@type": "Offer",
      "itemOffered": {
        "@type": "Product",
        "name": item.title
      },
      "price": item.unit_price,
      "priceCurrency": order.currency_code.toUpperCase(),
      "quantity": item.quantity
    })),
    // Breadcrumb for structure
    "mainEntityOfPage": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Order Confirmed",
          "item": `${baseUrl}/order/confirmed/${order.id}`
        }
      ]
    }
  }

  return (
    <>
      <Script
        id="order-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <OrderCompletedTemplate order={order} />
    </>
  )
}