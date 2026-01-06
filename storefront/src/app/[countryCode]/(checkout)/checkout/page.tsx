import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import Wrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { enrichLineItems, retrieveCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { getCustomer } from "@lib/data/customer"
import { evaluateHotWheelsRule } from "@modules/cart/components/hw/rule"
import { evaluateOutOfStockRule } from "@modules/cart/components/out-of-stock"

export const metadata: Metadata = {
  title: "Checkout",
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


  // 🔐 Enforce rules server-side for /checkout
  const hotWheelsRule = await evaluateHotWheelsRule(cart as HttpTypes.StoreCart)
  const stockRule = await evaluateOutOfStockRule(cart as HttpTypes.StoreCart)

  const canCheckout = hotWheelsRule.canCheckout && stockRule.canCheckout

  if (!canCheckout) {
    // User tried to bypass rules by going directly to /checkout
    redirect("/cart")
  }
  const customer = await getCustomer()
  if (!customer) redirect("/account?nextPath=/checkout?step=address")

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
      <Wrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
      </Wrapper>
      <CheckoutSummary cart={cart} />
    </div>
  )
}