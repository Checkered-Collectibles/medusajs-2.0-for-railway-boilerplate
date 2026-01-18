import { Metadata } from "next"
import Script from "next/script" // Import Script

import CartTemplate from "@modules/cart/templates"
import { enrichLineItems, retrieveCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { getCustomer } from "@lib/data/customer"

// 🔒 SEO STRATEGY: NOINDEX
export const metadata: Metadata = {
  title: "Your Shopping Cart | Checkered Collectibles",
  description: "Review your selected Hot Wheels cars and proceed to checkout.",
  // 🛑 CRITICAL: Tell Google to ignore this page
  robots: {
    index: false,
    follow: false,
  },
}

type Props = {
  params: { countryCode: string; handle: string }
}

const fetchCart = async () => {
  const cart = await retrieveCart()

  if (!cart) {
    return null
  }

  if (cart?.items?.length) {
    const enrichedItems = await enrichLineItems(cart?.items, cart?.region_id!)
    cart.items = enrichedItems as HttpTypes.StoreCartLineItem[]
  }

  return cart
}

export default async function Cart({ params }: Props) {
  const countryCode = params.countryCode;
  const cart = await fetchCart()
  const customer = await getCustomer()

  // 🍞 BREADCRUMB SCHEMA
  // Even though it's noindex, this helps assistive tech understand site structure.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const jsonLd = {
    "@context": "https://schema.org",
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
        "name": "Cart",
        "item": `${baseUrl}/cart`
      }
    ]
  }

  return (
    <>
      <Script
        id="cart-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <CartTemplate cart={cart} customer={customer} countryCode={countryCode} />
    </>
  )
}