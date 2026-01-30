import {
    Button,
    Link,
    Section,
    Text,
    Img,
    Hr,
    Row,
    Column,
} from "@react-email/components"
import { Base } from "./base"

/**
 * The key for the WeeklyTrendingEmail template
 */
export const WEEKLY_TRENDING = "weekly-trending"

export interface ProductItem {
    id: string
    name: string
    price: string
    imageUrl: string
    productUrl: string
}

export interface WeeklyTrendingEmailProps {
    /**
     * The main headline (e.g., "Fresh Drops are Here!")
     */
    headline?: string

    /**
     * Optional sub-headline or intro text
     */
    subHeadline?: string

    /**
     * List of trending products to display
     */
    products?: ProductItem[]

    /**
     * Link to the "Shop All" or "New Arrivals" page
     */
    shopAllLink: string

    /**
     * Mandatory Unsubscribe URL (Required for marketing emails)
     */
    unsubscribeUrl: string
}

/**
 * Type guard
 */
export const isWeeklyTrendingData = (
    data: any
): data is WeeklyTrendingEmailProps =>
    Array.isArray(data?.products) &&
    typeof data?.shopAllLink === "string" &&
    typeof data?.unsubscribeUrl === "string"

export const WeeklyTrendingEmail = ({
    headline = "🔥 These Hot Wheels are Trending!",
    subHeadline = "Collectors are grabbing these fast. Secure yours before they're gone.",
    products = [],
    shopAllLink,
    unsubscribeUrl,
}: WeeklyTrendingEmailProps) => {
    return (
        <Base preview={headline}>
            {/* --- LOGO --- */}
            <Section className="mt-[32px] mb-[32px]">
                <Img
                    src="https://checkered.in/images/logo.png"
                    alt="Checkered Collectibles"
                    className="mx-auto w-28"
                />
            </Section>

            {/* --- HERO TEXT --- */}
            <Section className="text-center px-4">
                <Text className="text-black text-[20px] leading-[28px] font-bold m-0 mb-2">
                    {headline}
                </Text>
                <Text className="text-[#666666] text-[14px] leading-[22px] m-0 mb-[24px]">
                    {subHeadline}
                </Text>
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[20px] mx-0 w-full" />


            {/* --- PRODUCT GRID (2 Columns) --- */}
            <Section className="w-full">
                {products.map((product, index) => {
                    if (index % 2 !== 0) return null
                    const nextProduct = products[index + 1]

                    return (
                        <Row key={product.id} className="mb-[32px]">
                            {/* Left Column */}
                            <Column className="w-[50%] pr-[4px] align-top text-center">
                                {/* FIX: Added max-w-[160px] and mx-auto */}
                                <Img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="mx-auto w-full max-w-[160px] h-auto rounded border border-solid border-[#eaeaea] object-cover aspect-square"
                                />
                                <Text className="text-black text-[14px] font-semibold mt-[12px] mb-[4px] leading-[20px]">
                                    {product.name}
                                </Text>
                                <Text className="text-[#666666] text-[12px] m-0 mb-[12px]">
                                    {product.price}
                                </Text>
                                <Button
                                    className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline px-2 py-2 text-center block w-[140px] mx-auto"
                                    href={product.productUrl}
                                >
                                    Shop Now
                                </Button>
                            </Column>

                            {/* Right Column */}
                            {nextProduct ? (
                                <Column className="w-[50%] pl-[4px] align-top text-center">
                                    {/* FIX: Added max-w-[160px] and mx-auto */}
                                    <Img
                                        src={nextProduct.imageUrl}
                                        alt={nextProduct.name}
                                        className="mx-auto w-full max-w-[160px] h-auto rounded border border-solid border-[#eaeaea] object-cover aspect-square"
                                    />
                                    <Text className="text-black text-[14px] font-semibold mt-[12px] mb-[4px] leading-[20px]">
                                        {nextProduct.name}
                                    </Text>
                                    <Text className="text-[#666666] text-[12px] m-0 mb-[12px]">
                                        {nextProduct.price}
                                    </Text>
                                    <Button
                                        className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline px-2 py-2 text-center block w-[140px] mx-auto"
                                        href={nextProduct.productUrl}
                                    >
                                        Shop Now
                                    </Button>
                                </Column>
                            ) : (
                                <Column className="w-[50%] pl-[4px]" />
                            )}
                        </Row>
                    )
                })}
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            {/* --- MAIN CTA --- */}
            <Section className="text-center mb-[32px]">
                <Text className="text-black text-[14px] leading-[24px] mb-4">
                    Looking for something else?
                </Text>
                <Button
                    className="bg-[#000000] rounded text-white text-[14px] font-bold no-underline px-6 py-4"
                    href={shopAllLink}
                >
                    View All New Arrivals
                </Button>
            </Section>

            {/* --- FOOTER / UNSUBSCRIBE --- */}
            <Section className="text-center mt-[40px]">
                <Text className="text-[#888888] text-[12px] leading-[20px] m-0">
                    You are receiving this email because you opted in to marketing updates from Checkered Collectibles.
                </Text>
                <Text className="text-[#888888] text-[12px] leading-[20px] mt-2">
                    <Link href={unsubscribeUrl} className="text-[#888888] underline">
                        Unsubscribe
                    </Link>
                    {" • "}
                    <Link href={shopAllLink} className="text-[#888888] underline">
                        Visit Store
                    </Link>
                </Text>
            </Section>
        </Base>
    )
}

/**
 * Preview Props for Testing
 */
WeeklyTrendingEmail.PreviewProps = {
    headline: "🔥 Fresh Hot Wheels Just Landed!",
    subHeadline: "These just arrived in the warehouse. Grab them before stock runs out.",
    shopAllLink: "https://checkered.in/store",
    unsubscribeUrl: "https://checkered.in/unsubscribe",
    products: [
        {
            id: "1",
            name: "Nissan Skyline GT-R (R34)",
            price: "₹1,299",
            imageUrl: "https://checkered-assets.sgp1.cdn.digitaloceanspaces.com/IMG_3445%201-Photoroom%202-01KC8XY1SAFNPJRZCP0T8AKPAT.jpg",
            productUrl: "https://checkered.in/products/nissan-r34",
        },
        {
            id: "2",
            name: "'69 Dodge Charger",
            price: "₹999",
            imageUrl: "https://checkered-assets.sgp1.cdn.digitaloceanspaces.com/cadillac-project-gtp-hypercar-01KCCGBX4HDFWF8YW3R8G0KE4B.jpg",
            productUrl: "https://checkered.in/products/dodge-charger",
        },
        {
            id: "3",
            name: "Porsche 911 GT3 RS",
            price: "₹1,499",
            imageUrl: "https://checkered-assets.sgp1.cdn.digitaloceanspaces.com/73-pontiac-firebird-01KCCJH44NHF9GXDCYQ9PCT5D3.jpg",
            productUrl: "https://checkered.in/products/porsche-gt3",
        },
        {
            id: "4",
            name: "Bone Shaker (Chase)",
            price: "₹2,199",
            imageUrl: "https://checkered-assets.sgp1.cdn.digitaloceanspaces.com/bmw-2002-01KCCEWYEAJJ3T2KAQQE7RKCV1.jpg",
            productUrl: "https://checkered.in/products/bone-shaker",
        },
    ],
} as WeeklyTrendingEmailProps

export default WeeklyTrendingEmail