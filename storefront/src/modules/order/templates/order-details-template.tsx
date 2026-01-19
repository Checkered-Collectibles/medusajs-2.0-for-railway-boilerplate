"use client"

import { XMark } from "@medusajs/icons"
import React from "react"

import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import ShippingDetails from "@modules/order/components/shipping-details"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import Link from "next/link"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
}) => {
  return (
    <div className="flex flex-col justify-center gap-y-4">
      <div className="flex gap-2 justify-between items-center">
        <h1 className="text-2xl-semi">Order details</h1>
        <div className="flex flex-col items-center gap-4">
          <LocalizedClientLink
            href="/account/orders"
            className="flex gap-2 items-center text-ui-fg-subtle hover:text-ui-fg-base"
            data-testid="back-to-overview-button"
          >
            <XMark /> Back to overview
          </LocalizedClientLink>
          {/* Trustpilot Widget */}
          <div
            className="trustpilot-widget"
            data-locale="en-US"
            data-template-id="56278e9abfbbba0bdcd568bc"
            data-businessunit-id="696e9f0be5a9d97a72a7e4ab"
            data-style-height="52px" data-style-width="250px"
            data-token="12a2beb7-e6e6-4751-a8d1-d95567350e9a"
          >
            <Link
              href="https://www.trustpilot.com/review/checkered.in"
              target="_blank"
              rel="noopener noreferrer"
            >
              Trustpilot
            </Link>
          </div>

        </div>
      </div>
      <div
        className="flex flex-col gap-4 h-full bg-white w-full"
        data-testid="order-details-container"
      >
        <OrderDetails order={order} showStatus />
        <Items items={order.items} />
        <ShippingDetails order={order} />
        <OrderSummary order={order} />
        <Help />
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
