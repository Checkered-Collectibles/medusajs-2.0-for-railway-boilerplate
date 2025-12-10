"use client"

import { Button, Heading } from "@medusajs/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
  canCheckout?: boolean
  restrictionMessage?: string | null
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({
  cart,
  canCheckout = true,
  restrictionMessage,
}: SummaryProps) => {
  const step = getCheckoutStep(cart)

  const checkoutButton = (
    <Button
      className="w-full h-10"
      disabled={!canCheckout}
      type="button"
    >
      Go to checkout
    </Button>
  )

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-11">
        Summary
      </Heading>

      <DiscountCode cart={cart} />
      <Divider />

      <CartTotals totals={cart} />

      {/* Show rule warning just above the button */}
      {!canCheckout && restrictionMessage && (
        <p className="text-xs text-red-600">
          {restrictionMessage && "To keep Hot Wheels fun and affordable, Licensed cars ride best with a Fantasy buddy! Add the missing Fantasy car(s) to continue 😊"}
        </p>
      )}

      {canCheckout ? (
        <LocalizedClientLink
          href={"/checkout?step=" + step}
          data-testid="checkout-button"
        >
          {checkoutButton}
        </LocalizedClientLink>
      ) : (
        checkoutButton
      )}
    </div>
  )
}

export default Summary