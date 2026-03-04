// MEDUSA BACKEND CODE (Not Next.js)
import { SubscriberArgs, type SubscriberConfig } from "@medusajs/medusa"

export default async function productRevalidateHandler({
    event: { data, name },
}: SubscriberArgs<{ id: string }>) {

    const storefrontUrl = process.env.STOREFRONT_URL || "https://checkered.in"
    const secret = process.env.REVALIDATE_SECRET || "super_secret_string_12345"

    try {
        // Ping your Next.js webhook
        // await fetch(`${storefrontUrl}/api/revalidate`, {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //         "x-revalidate-secret": secret,
        //     },
        //     body: JSON.stringify({
        //         type: name, // e.g., "product.updated"
        //         data: data,
        //     }),
        // })
        // console.log(`Successfully pinged storefront to revalidate for event: ${name}`)
    } catch (error) {
        console.error("Failed to ping storefront for revalidation:", error)
    }
}

export const config: SubscriberConfig = {
    event: [
        "product.created",
        "product.updated",
        "product.deleted",
    ],
}