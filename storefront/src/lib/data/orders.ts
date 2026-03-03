"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { cache } from "react"
import { getSafeAuthHeaders } from "@lib/util/safeheaders"
import { getCustomer } from "./customer"

export const retrieveOrder = cache(async function (id: string) {
  // 1. Get headers and the current customer's ID
  const headers = await getSafeAuthHeaders()

  // 2. Retrieve the order
  const order = await sdk.store.order
    .retrieve(
      id,
      {
        fields: [
          // core identifiers
          "id",
          "display_id",
          "status",
          "payment_status",
          "fulfillment_status",
          "created_at",
          "updated_at",

          // customer & channel
          "customer_id",
          "email",
          "region_id",
          "sales_channel_id",
          "currency_code",

          // addresses
          "*shipping_address",
          "*billing_address",

          // line items
          "*items",
          // or more granular:
          // "*items.variant",
          // "*items.adjustments",

          // shipping
          "*shipping_methods",

          // totals
          "total",
          "subtotal",
          "tax_total",
          "discount_total",
          "discount_tax_total",
          "shipping_total",
          "shipping_subtotal",
          "shipping_tax_total",
          "gift_card_total",
          "gift_card_tax_total",
          "original_total",
          "original_subtotal",
          "original_tax_total",
          "original_item_total",
          "original_item_subtotal",
          "original_item_tax_total",
          "original_shipping_total",
          "original_shipping_subtotal",
          "original_shipping_tax_total",
          "item_total",
          "item_subtotal",
          "item_tax_total",
          "item_discount_total",
          "shipping_discount_total",
          "credit_line_total",

          // summary
          "summary.*",

          // payments & fulfillments (your existing ones)
          "*payment_collections.payments",
          "*fulfillments.labels",
        ].join(","),
      },
      { next: { tags: ["order"] }, ...headers }
    )
    .then(({ order }) => order)
    .catch((err) => medusaError(err))
  // 3. SECURE CHECK: Fetch the current customer to compare IDs
  const customer = await getCustomer()
  if (!customer) return null;

  // 4. Validate ownership
  // If the order exists but the customer_id doesn't match, block access
  if (order && order.customer_id !== customer.id) {
    return null // Or throw a 403 Unauthorized error
  }

  return order
})

export const listOrders = cache(async function (
  limit: number = 10,
  offset: number = 0
) {
  return sdk.store.order
    .list({ limit, offset, order: "-created_at" }, { next: { tags: ["order"] }, ...(await getSafeAuthHeaders()) })
    .then(({ orders }) => orders)
    .catch((err) => medusaError(err))
})