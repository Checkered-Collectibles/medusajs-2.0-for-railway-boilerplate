import { Button, Link, Section, Text, Img, Hr } from "@react-email/components"
import { Base } from "./base"

/**
 * The key for the CartAbandonedEmail template, used to identify it
 */
export const CART_ABANDONED = "cart-abandoned"

/**
 * Props for the CartAbandonedEmail template
 */
export interface CartAbandonedEmailProps {
    /**
     * Link back to the customer's cart (or checkout)
     */
    cartLink: string

    /**
     * Optional preview text (email preheader)
     */
    preview?: string

    /**
     * Optional customer name for personalization
     */
    customerName?: string

    /**
     * Optional list of cart items to show in the email
     */
    items?: Array<{
        name: string
        quantity?: number
        price?: string
        imageUrl?: string
        productUrl?: string
    }>

    /**
     * Optional cart total string (e.g. "₹2,499")
     */
    total?: string

    /**
     * Optional support email shown in footer
     */
    supportEmail?: string
}

/**
 * Type guard for checking if the data is of type CartAbandonedEmailProps
 */
export const isCartAbandonedData = (data: any): data is CartAbandonedEmailProps =>
    typeof data?.cartLink === "string" &&
    (typeof data?.preview === "string" || !data?.preview) &&
    (typeof data?.customerName === "string" || !data?.customerName) &&
    (typeof data?.total === "string" || !data?.total) &&
    (typeof data?.supportEmail === "string" || !data?.supportEmail) &&
    (Array.isArray(data?.items) || !data?.items)

/**
 * Cart Abandoned email template component built with react-email
 */
export const CartAbandonedEmail = ({
    cartLink,
    preview = "You left something in your cart — complete your purchase",
    customerName,
    items = [],
    total,
    supportEmail = "hello@checkered.in",
}: CartAbandonedEmailProps) => {
    return (
        <Base preview={preview}>
            <Section className="mt-[32px]">
                <Img
                    src="https://checkered.in/images/logo.png"
                    alt="Checkered Collectibles"
                    className="mx-auto w-28"
                />
            </Section>

            <Section className="text-center">
                <Text className="text-black text-[14px] leading-[24px]">
                    {customerName ? (
                        <>
                            Hey <strong>{customerName}</strong>, you left a few items in your cart.
                        </>
                    ) : (
                        <>
                            You left a few items in your <strong>Checkered Collectibles</strong> cart.
                        </>
                    )}
                </Text>

                <Text className="text-black text-[14px] leading-[24px]">
                    They’re still waiting for you — complete your purchase before they’re gone.
                </Text>

                <Section className="mt-4 mb-[28px]">
                    <Button
                        className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline px-5 py-3"
                        href={cartLink}
                    >
                        Return to Cart
                    </Button>
                </Section>
            </Section>

            {items.length > 0 && (
                <Section className="mt-[6px] mb-[6px]">
                    <Hr className="border border-solid border-[#eaeaea] my-[18px] mx-0 w-full" />

                    <Text className="text-black text-[14px] leading-[24px] font-semibold">
                        Items in your cart
                    </Text>

                    {items.slice(0, 6).map((item, idx) => (
                        <Section key={`${item.name}-${idx}`} className="mt-[10px]">
                            <Section className="flex items-start">
                                {item.imageUrl ? (
                                    <Img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-16 h-16 rounded mr-3"
                                    />
                                ) : null}

                                <Section>
                                    <Text className="text-black text-[14px] leading-[22px] m-0">
                                        {item.productUrl ? (
                                            <Link
                                                href={item.productUrl}
                                                className="text-black no-underline font-semibold"
                                            >
                                                {item.name}
                                            </Link>
                                        ) : (
                                            <strong>{item.name}</strong>
                                        )}
                                    </Text>

                                    <Text className="text-[#666666] text-[12px] leading-[20px] m-0">
                                        {typeof item.quantity === "number" ? `Qty: ${item.quantity}` : null}
                                        {typeof item.quantity === "number" && item.price ? " • " : null}
                                        {item.price ? `Price: ${item.price}` : null}
                                    </Text>
                                </Section>
                            </Section>
                        </Section>
                    ))}

                    {total ? (
                        <Text className="text-black text-[14px] leading-[24px] mt-[18px]">
                            <strong>Estimated total:</strong> {total}
                        </Text>
                    ) : null}

                    <Hr className="border border-solid border-[#eaeaea] my-[18px] mx-0 w-full" />
                </Section>
            )}

            <Section className="text-center">
                <Text className="text-black text-[14px] leading-[24px]">
                    Or copy and paste this URL into your browser:
                </Text>

                <Text
                    style={{
                        maxWidth: "100%",
                        wordBreak: "break-all",
                        overflowWrap: "break-word",
                    }}
                >
                    <Link href={cartLink} className="text-blue-600 no-underline">
                        {cartLink}
                    </Link>
                </Text>
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Text className="text-[#666666] text-[12px] leading-[20px]">
                Need help? Email us at{" "}
                <Link href={`mailto:${supportEmail}`} className="text-blue-600 no-underline">
                    {supportEmail}
                </Link>
                .
            </Text>

            <Text className="text-[#666666] text-[12px] leading-[20px]">
                If you already completed your purchase, you can ignore this email.
            </Text>
        </Base>
    )
}

CartAbandonedEmail.PreviewProps = {
    cartLink:
        "https://checkered.in/cart?ref=abandoned&token=abc123dddddddddddddddddddddddddddddddddddddddddddddddd",
    customerName: "Rohit",
    total: "₹2,499",
    items: [
        {
            name: "Limited Edition Diecast Car",
            quantity: 1,
            price: "₹1,999",
            imageUrl: "https://checkered.in/images/sample-product.png",
            productUrl: "https://checkered.in/products/limited-edition-diecast-car",
        },
        {
            name: "Collector Display Case",
            quantity: 1,
            price: "₹500",
            imageUrl: "https://checkered.in/images/sample-product-2.png",
            productUrl: "https://checkered.in/products/display-case",
        },
    ],
} as CartAbandonedEmailProps

export default CartAbandonedEmail