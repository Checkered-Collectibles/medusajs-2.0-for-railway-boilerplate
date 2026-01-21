import { Metadata } from "next"
import Script from "next/script"
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const order = await getOrder(params.id)

  return {
    title: order ? `Order Confirmed #${order.display_id}` : "Order Confirmed",
    description: "Your purchase was successful.",
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function OrderConfirmedPage({ params }: Props) {
  const order = await getOrder(params.id)

  if (!order || !order.items) {
    return notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://checkered.in"

  // 1. PREPARE TRUSTPILOT DATA SERVER-SIDE
  // We map the order items to the format Trustpilot expects
  const trustpilotProducts = order.items.map((item: any) => ({
    sku: item.variant_sku || item.variant?.sku || item.id,
    productUrl: `${baseUrl}/products/${item.product_handle || item.variant?.product?.handle}`,
    imageUrl: item.thumbnail || item.variant?.product?.thumbnail,
    name: item.title, // e.g. "Hot Wheels Ferrari 12Cilindri"
  }))

  const productSkus = trustpilotProducts.map((p) => p.sku)

  // 2. CONSTRUCT THE CONFIG OBJECT
  const invitationData = {
    recipientEmail: order.email,
    recipientName: `${order.shipping_address?.first_name || 'Collector'} ${order.shipping_address?.last_name || ''}`.trim(),
    referenceId: order.display_id, // Use display_id (e.g., #1001) so it matches what the customer sees
    source: 'InvitationScript',
    productSkus: productSkus,
    products: trustpilotProducts
  }

  // 3. JSON-LD SCHEMA (Unchanged)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Order",
    "merchant": {
      "@type": "Organization",
      "name": "Checkered Collectibles"
    },
    "orderNumber": order.display_id,
    "priceCurrency": order.currency_code.toUpperCase(),
    "price": order.total,
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
      {/* Schema Script */}
      <Script
        id="order-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 🚀 TRUSTPILOT SCRIPT 
         We inject the pre-calculated 'invitationData' object directly into the script.
         using JSON.stringify ensures it handles quotes and special characters safely.
      */}
      <Script id="trustpilot-review" strategy="afterInteractive">
        {`
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof tp !== 'undefined') {
                const trustpilot_invitation = ${JSON.stringify(invitationData)};
                tp('createInvitation', trustpilot_invitation);
            } else {
                console.log('Trustpilot TP object not found');
            }
        });
        `}
      </Script>

      <OrderCompletedTemplate order={order} />
    </>
  )
}