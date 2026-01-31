"use client"

import { Button, Heading } from "@medusajs/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import ShippingCountdown from "@modules/checkout/templates/shipping-countdown"

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
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        Summary
      </Heading>

      <DiscountCode cart={cart} />
      <Divider />

      <CartTotals totals={cart} />

      {/* Show rule warning just above the button */}
      {!canCheckout && restrictionMessage && (
        <p className="text-xs text-red-600">
          {restrictionMessage}
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
      {(() => {
        const threshold = 2000
        const cartTotal = cart?.total - cart.shipping_subtotal || 0
        const remaining = Math.max(0, threshold - cartTotal)

        if (remaining === 0) {
          return (
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm border border-emerald-200 shadow text-center">
              🎉 You’ve unlocked Free Shipping!
            </div>
          )
        }

        return (
          <div className="p-2 bg-amber-50 text-amber-700 border-amber-200 rounded-xl text-sm border shadow text-center">
            Add items worth ₹{remaining} more to get free shipping
          </div>
        )
      })()}
      <ShippingCountdown className="mt-0" />
    </div>
  )
}

export default Summary