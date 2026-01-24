import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import Script from "next/script"

import Wrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { enrichLineItems, retrieveCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { getCustomer } from "@lib/data/customer"
import { evaluateHotWheelsRule } from "@modules/cart/components/hw/rule"
import { evaluateOutOfStockRule } from "@modules/cart/components/out-of-stock"

// 👇 Import the tracker
import { CheckoutTracker } from "@modules/checkout/components/checkout-tracker"

// 🔒 SEO STRATEGY: NOINDEX
export const metadata: Metadata = {
  title: "Secure Checkout | Checkered Collectibles",
  description: "Complete your purchase securely.",
  robots: {
    index: false,
    follow: false,
  },
}

const fetchCart = async () => {
  const cart = await retrieveCart()
  if (!cart) {
    return notFound()
  }

  if (cart?.items?.length) {
    const enrichedItems = await enrichLineItems(cart.items, cart.region_id!)
    cart.items = enrichedItems as HttpTypes.StoreCartLineItem[]
  }

  return cart
}

export default async function Checkout() {
  const cart = await fetchCart()

  // 🔐 Enforce rules server-side
  const hotWheelsRule = await evaluateHotWheelsRule(cart as HttpTypes.StoreCart)
  const stockRule = await evaluateOutOfStockRule(cart as HttpTypes.StoreCart)

  const canCheckout = hotWheelsRule.canCheckout && stockRule.canCheckout

  if (!canCheckout) {
    redirect("/cart")
  }

  const customer = await getCustomer()
  if (!customer) redirect("/account?nextPath=/checkout?step=address")

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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Checkout",
        "item": `${baseUrl}/checkout`
      }
    ]
  }

  return (
    <>
      <Script
        id="checkout-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 👇 Add the tracker here */}
      <CheckoutTracker cart={cart as HttpTypes.StoreCart} />

      <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
        <Wrapper cart={cart}>
          <CheckoutForm cart={cart} customer={customer} />
        </Wrapper>
        <CheckoutSummary cart={cart} />
      </div>
    </>
  )
}