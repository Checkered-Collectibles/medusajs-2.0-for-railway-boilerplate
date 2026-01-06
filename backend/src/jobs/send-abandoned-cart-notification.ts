import { MedusaContainer, INotificationModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { EmailTemplates } from "../modules/email-notifications/templates"

function formatMoney(amountMinor: number, currencyCode?: string) {
    if (!currencyCode) return String(amountMinor)
    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: currencyCode.toUpperCase(),
        }).format(amountMinor / 100)
    } catch {
        // fallback (if currency code invalid)
        return `${amountMinor / 100} ${currencyCode}`
    }
}

export default async function abandonedCartJob(container: MedusaContainer) {
    const logger = container.resolve("logger")
    const query = container.resolve("query")

    const notificationModuleService: INotificationModuleService = container.resolve(
        Modules.NOTIFICATION
    )

    // For marking carts as "notified"
    const cartModuleService = container.resolve(Modules.CART)

    const oneDayAgo = new Date()
    // oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    oneDayAgo.setMinutes(oneDayAgo.getMinutes() - 1)

    const STORE_URL = process.env.STOREFRONT_URL || "https://checkered.in"
    const limit = 100
    let offset = 0
    let totalCount = 0
    let sentCount = 0

    do {
        const { data: abandonedCarts, metadata } = await query.graph({
            entity: "cart",
            fields: [
                "id",
                "email",
                "currency_code",
                "items.*",
                "metadata",
                "customer.first_name",
                "customer.last_name",
            ],
            filters: {
                // updated_at: { $lt: oneDayAgo },
                // email: { $ne: null },
                updated_at: { $lt: new Date() },
                email: "shubhankartrivedi@icloud.com",
                completed_at: null,
            },
            pagination: { skip: offset, take: limit },
        })

        totalCount = metadata?.count ?? 0

        const cartsToNotify = abandonedCarts.filter(
            (cart) =>
                (cart.items?.length ?? 0) > 0 &&
                !cart.metadata?.abandoned_notification
        )

        for (const cart of cartsToNotify) {
            try {
                const email = cart.email as string

                const customerName =
                    [cart.customer?.first_name, cart.customer?.last_name]
                        .filter(Boolean)
                        .join(" ") || undefined

                const cartLink = `${STORE_URL}/api/cart/recover/${encodeURIComponent(cart.id)}`

                // Map Medusa cart items -> template items
                const items =
                    (cart.items ?? []).map((it: any) => ({
                        name: it.title || it.variant_title || it.product_title || "Item",
                        quantity: it.quantity,
                        price:
                            typeof it.unit_price === "number"
                                ? formatMoney(it.unit_price, cart.currency_code)
                                : undefined,
                        // If you have thumbnail/product handle in your item data, wire them here:
                        imageUrl: it.thumbnail || it.variant?.product?.thumbnail,
                        productUrl: it.product_handle
                            ? `${STORE_URL}/products/${it.product_handle}`
                            : undefined,
                    })) ?? []

                // Optional: estimate total (sum of unit_price * quantity)
                const totalMinor = (cart.items ?? []).reduce((sum: number, it: any) => {
                    const unit = typeof it.unit_price === "number" ? it.unit_price : 0
                    const qty = typeof it.quantity === "number" ? it.quantity : 0
                    return sum + unit * qty
                }, 0)

                const total = totalMinor
                    ? formatMoney(totalMinor, cart.currency_code)
                    : undefined

                await notificationModuleService.createNotifications({
                    to: email,
                    channel: "email",
                    template: EmailTemplates.CART_ABANDONED,
                    data: {
                        emailOptions: {
                            replyTo: "hello@checkered.in",
                            subject: "You left something in your cart",
                        },
                        cartLink,
                        preview: "Your cart is waiting — complete your purchase.",
                        customerName,
                        items,
                        total,
                        supportEmail: "hello@checkered.in",
                    },
                })

                // Mark as notified (prevents resending)
                await cartModuleService.updateCarts([
                    {
                        id: cart.id,
                        metadata: {
                            ...(cart.metadata ?? {}),
                            abandoned_notification: true,
                            abandoned_notification_sent_at: new Date().toISOString(),
                        },
                    },
                ])

                sentCount += 1
            } catch (error: any) {
                logger.error(
                    `Failed to send abandoned cart notification for cart ${cart.id}: ${error?.message ?? error}`
                )
            }
        }

        offset += limit
    } while (offset < totalCount)

    logger.info(`Sent ${sentCount} abandoned cart notifications`)
}

export const config = {
    name: "abandoned-cart-notification",
    // schedule: "0 0 * * *", // midnight daily
    schedule: "* * * * *",
}