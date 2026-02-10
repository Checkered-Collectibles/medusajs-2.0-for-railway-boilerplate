import {
    Button,
    Link,
    Section,
    Text,
    Img,
    Hr,
    Row,
    Column,
    Container,
} from "@react-email/components"
import { Base } from "./base"

/**
 * The key for the NewCollectionDropEmail template
 */
export const NEW_COLLECTION_DROP = "new-collection-drop"

export interface DropHighlightItem {
    id: string
    name: string
    imageUrl: string
    productUrl: string
}

export interface NewCollectionDropEmailProps {
    /**
     * The main headline (e.g., "The 2026 JDM Case is Here!")
     */
    headline?: string

    /**
     * Sub-headline with urgency (e.g., "Limited stock available. Don't wait.")
     */
    subHeadline?: string

    /**
     * Link to the specific collection page
     */
    collectionUrl: string

    /**
     * Name of the button (e.g., "Shop the Drop")
     */
    ctaText?: string

    /**
     * Optional: 2-4 highlight products from this drop
     */
    highlights?: DropHighlightItem[]

    /**
     * Mandatory Unsubscribe URL
     */
    unsubscribeUrl: string
}

/**
 * Type guard
 */
export const isNewCollectionDropData = (
    data: any
): data is NewCollectionDropEmailProps =>
    typeof data?.collectionUrl === "string" &&
    typeof data?.unsubscribeUrl === "string"

export const NewCollectionDropEmail = ({
    headline = "🚨 FRESH DROP ALERT",
    subHeadline = "The wait is over. The latest case has just landed in the warehouse. Secure your favorites before they sell out.",
    collectionUrl,
    ctaText = "Shop the Collection",
    highlights = [],
    unsubscribeUrl,
}: NewCollectionDropEmailProps) => {
    return (
        <Base preview={headline}>
            {/* --- LOGO --- */}
            <Section className="mt-[32px] mb-[24px]">
                <Img
                    src="https://checkered-assets.sgp1.cdn.digitaloceanspaces.com/manual-uploads/logo-notext2.png"
                    alt="Checkered Collectibles"
                    className="mx-auto w-20"
                />
            </Section>

            {/* --- HERO IMAGE ---
            <Section className="w-full mb-[24px]">
                <Img
                    src={heroImageUrl}
                    alt="New Collection Drop"
                    className="w-full max-w-[600px] h-auto rounded-lg mx-auto object-cover border border-[#eaeaea]"
                />
            </Section> */}

            {/* --- HEADLINE & INTRO --- */}
            <Section className="text-center px-4 mb-[24px]">
                <Text className="text-black text-[24px] leading-[32px] font-bold m-0 mb-3 uppercase tracking-tight">
                    {headline}
                </Text>
                <Text className="text-[#555555] text-[16px] leading-[24px] m-0 mb-[24px]">
                    {subHeadline}
                </Text>

                {/* --- PRIMARY CTA --- */}
                <Button
                    className="bg-black rounded text-white text-[16px] font-bold no-underline px-8 py-4 block w-full max-w-[280px] mx-auto text-center"
                    href={collectionUrl}
                >
                    {ctaText}
                </Button>
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[32px] mx-0 w-full" />

            {/* --- DROP HIGHLIGHTS (If any) --- */}
            {highlights.length > 0 && (
                <Section className="w-full px-4">
                    <Text className="text-black text-[18px] font-bold mb-[20px] text-center uppercase">
                        Drop Highlights
                    </Text>

                    <Row>
                        {highlights.map((item, index) => (
                            <Column key={item.id} className="w-[50%] px-2 pb-6 align-top text-center">
                                <Img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="mx-auto w-full max-w-[140px] h-auto rounded border border-solid border-[#eaeaea] object-cover aspect-square mb-3"
                                />
                                <Text className="text-black text-[14px] font-semibold m-0 mb-2 leading-[18px] h-[36px] overflow-hidden">
                                    {item.name}
                                </Text>
                                <Link
                                    href={item.productUrl}
                                    className="text-[#e11d48] text-[12px] font-bold underline"
                                >
                                    Get it Now &rarr;
                                </Link>
                            </Column>
                        ))}
                    </Row>

                    {/* --- SECONDARY CTA --- */}
                    <Section className="text-center mt-[10px]">
                        <Link
                            href={collectionUrl}
                            className="text-[#666] text-[14px] underline font-medium"
                        >
                            + View All Items in This Drop
                        </Link>
                    </Section>
                </Section>
            )}

            {/* --- COMMUNITY SECTION --- */}
            <Section style={{
                marginTop: "40px",
                backgroundColor: "#f9f9f9",
                padding: "30px 20px",
                borderRadius: "8px",
                textAlign: "center"
            }}>
                <Text style={{ fontSize: "16px", color: "#111", fontWeight: "bold", marginBottom: "10px" }}>
                    Don't Miss the Next Drop! 🏎️
                </Text>
                <Text style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
                    Follow us for unboxings, sneak peeks & giveaways.
                </Text>

                {/* Social Icons Container */}
                <Section>
                    <table align="center" border={0} cellPadding={0} cellSpacing={0}>
                        <tr>
                            <td style={{ padding: "0 10px" }}>
                                <a href="https://instagram.com/checkered.in" target="_blank">
                                    <Img
                                        src="https://checkered-assets.sgp1.cdn.digitaloceanspaces.com/manual-uploads/instagram-small-circle.png"
                                        alt="Instagram"
                                        width="40"
                                        height="40"
                                    />
                                </a>
                            </td>
                            <td style={{ padding: "0 10px" }}>
                                <a href="https://youtube.com/@CheckeredCollectibles" target="_blank">
                                    <Img
                                        src="https://checkered-assets.sgp1.cdn.digitaloceanspaces.com/manual-uploads/youtube-small-circle.png"
                                        alt="YouTube"
                                        width="40"
                                        height="40"
                                    />
                                </a>
                            </td>
                        </tr>
                    </table>
                </Section>
            </Section>

            {/* --- FOOTER / UNSUBSCRIBE --- */}
            <Section className="text-center mt-[40px]">
                <Text className="text-[#888888] text-[12px] leading-[20px] m-0">
                    You are receiving this email because you opted in to new drop alerts.
                </Text>
                <Text className="text-[#888888] text-[12px] leading-[20px] mt-2">
                    <Link href={unsubscribeUrl} className="text-[#888888] underline">
                        Unsubscribe
                    </Link>
                    {" • "}
                    <Link href="https://checkered.in/store" className="text-[#888888] underline">
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
NewCollectionDropEmail.PreviewProps = {
    headline: "🎌 JDM LEGENDS: CASE H IS LIVE!",
    subHeadline: "The wait is finally over. Featuring the Nissan Skyline R34, Mazda RX-7, and more. Stock is extremely limited.",
    collectionUrl: "https://checkered.in/collections/case-h",
    unsubscribeUrl: "https://checkered.in/unsubscribe",
    highlights: [
        {
            id: "1",
            name: "Nissan Skyline GT-R (R34)",
            imageUrl: "https://checkered-assets.sgp1.cdn.digitaloceanspaces.com/IMG_3445%201-Photoroom%202-01KC8XY1SAFNPJRZCP0T8AKPAT.jpg",
            productUrl: "https://checkered.in/products/r34",
        },
        {
            id: "2",
            name: "Mazda RX-7 FD",
            imageUrl: "https://checkered-assets.sgp1.cdn.digitaloceanspaces.com/cadillac-project-gtp-hypercar-01KCCGBX4HDFWF8YW3R8G0KE4B.jpg",
            productUrl: "https://checkered.in/products/rx7",
        },
    ],
} as NewCollectionDropEmailProps

export default NewCollectionDropEmail