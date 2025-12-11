import CopyToClipboard from "@lib/util/copy"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import Link from "next/link"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const formatStatus = (str: string) => {
    const formatted = str.split("_").join(" ")
    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  // Get the latest fulfillment (by created_at)
  const latestFulfillment = order.fulfillments?.length
    ? [...order.fulfillments].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]
    : undefined

  // From that fulfillment, get the latest label (if any)
  const latestLabel =
    latestFulfillment?.labels && latestFulfillment.labels.length > 0
      ? latestFulfillment.labels[latestFulfillment.labels.length - 1]
      : undefined

  const trackingNumber = latestLabel?.tracking_number
  const trackingUrl = latestLabel?.tracking_url

  return (
    <div>
      <Text>
        We have sent the order confirmation details to{" "}
        <span
          className="text-ui-fg-medium-plus font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        .
      </Text>

      <Text className="mt-2">
        Order date:{" "}
        <span data-testid="order-date">
          {new Date(order.created_at).toDateString()}
        </span>
      </Text>

      <Text className="mt-2 text-ui-fg-interactive">
        Order number: <span data-testid="order-id">{order.display_id}</span>
      </Text>

      <div className="flex flex-col gap-y-2 text-compact-small mt-4">
        {showStatus && (
          <>
            <Text>
              Order status:{" "}
              <span
                className="text-ui-fg-subtle"
                data-testid="order-status"
              >
                {formatStatus(order.fulfillment_status)}
              </span>
            </Text>

            <Text className="flex flex-wrap gap-1">
              Payment status:{" "}
              <span
                className="text-ui-fg-subtle flex gap-1 items-center"
                data-testid="order-payment-status"
              >
                {formatStatus(order.payment_status)}
              </span>
            </Text>

            {trackingNumber && (
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-ui-fg-subtle">Tracking:</span>
                <span className="font-mono text-ui-fg-base">
                  {trackingNumber}
                </span>

                <CopyToClipboard value={trackingNumber}>
                  Copy
                </CopyToClipboard>

                {trackingUrl && (
                  <Link
                    href={trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-compact-xsmall rounded bg-ui-bg-base text-ui-fg-interactive border border-ui-border-base hover:bg-ui-bg-subtle transition-colors"
                  >
                    Track package
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails