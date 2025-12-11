import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderSummaryProps = {
  order: HttpTypes.StoreOrder
}

const OrderSummary = ({ order }: OrderSummaryProps) => {
  const safe = (v?: number | null) => v ?? 0

  // Recompute subtotal (exclude shipping & taxes)
  const computedSubtotal =
    safe(order.total) +
    safe(order.discount_total) -
    safe(order.shipping_total) -
    safe(order.tax_total) +
    safe(order.gift_card_total)

  const getAmount = (amount?: number | null) => {
    if (amount == null) return null
    return convertToLocale({
      amount,
      currency_code: order.currency_code,
    })
  }

  return (
    <div>
      <h2 className="text-base-semi">Order Summary</h2>

      <div className="text-small-regular text-ui-fg-base my-2">

        {/* Subtotal */}
        <div className="flex items-center justify-between text-base-regular text-ui-fg-base mb-2">
          <span>Subtotal</span>
          <span>{getAmount(computedSubtotal)}</span>
        </div>

        <div className="flex flex-col gap-y-1">

          {/* Discount */}
          {order.discount_total > 0 && (
            <div className="flex items-center justify-between">
              <span>Discount</span>
              <span>- {getAmount(order.discount_total)}</span>
            </div>
          )}

          {/* Gift Card */}
          {order.gift_card_total > 0 && (
            <div className="flex items-center justify-between">
              <span>Gift Card</span>
              <span>- {getAmount(order.gift_card_total)}</span>
            </div>
          )}

          {/* Shipping */}
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span>{getAmount(order.shipping_total)}</span>
          </div>

          {/* Taxes */}
          <div className="flex items-center justify-between">
            <span>Taxes</span>
            <span>{getAmount(order.tax_total)}</span>
          </div>
        </div>

        <div className="h-px w-full border-b border-gray-200 border-dashed my-4" />

        {/* Total */}
        <div className="flex items-center justify-between text-base-regular text-ui-fg-base mb-2">
          <span>Total</span>
          <span>{getAmount(order.total)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary