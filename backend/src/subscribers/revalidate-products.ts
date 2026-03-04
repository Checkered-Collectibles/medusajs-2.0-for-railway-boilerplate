import { Modules } from '@medusajs/framework/utils'
import { SubscriberArgs, type SubscriberConfig } from "@medusajs/medusa"

export default async function masterRevalidateHandler({
    event: { data, name },
    container,
}: SubscriberArgs<{ id: string }>) {

    const storefrontUrl = process.env.STOREFRONT_URL || "https://checkered.in"
    const secret = process.env.REVALIDATE_SECRET || "super_secret_string_12345"

    // Base payload
    let payloadBody: any = {
        type: name,
        data: data,
    }

    // ====================================================================
    // 1. HANDLE PRODUCT EVENTS (Admin edits, creates, deletes)
    // ====================================================================
    if (name.startsWith("product.")) {
        let productHandle = undefined
        let collectionId = undefined
        let categoryIds: string[] = []

        try {
            if (data.id && name !== "product.deleted") {
                const productModuleService = container.resolve(Modules.PRODUCT)
                const product = await productModuleService.retrieveProduct(data.id, {
                    relations: ["categories"]
                })

                if (product) {
                    productHandle = product.handle
                    collectionId = product.collection_id
                    if (product.categories) {
                        categoryIds = product.categories.map(c => c.id)
                    }
                }
            }
        } catch (err) {
            console.warn(`Could not retrieve product ${data.id} for webhook handle extraction:`, err)
        }

        // Attach specific product data to payload
        payloadBody = {
            ...payloadBody,
            handle: productHandle,
            collection_id: collectionId,
            category_ids: categoryIds
        }
    }

    // ====================================================================
    // 2. HANDLE ORDER EVENTS (Placed, Canceled, Edited)
    // ====================================================================
    if (name.startsWith("order")) {
        const productIds = new Set<string>()
        const collectionIds = new Set<string>()
        const categoryIds = new Set<string>()

        try {
            const orderModuleService = container.resolve(Modules.ORDER)
            const productModuleService = container.resolve(Modules.PRODUCT)

            // A. Get the order and its items
            const order = await orderModuleService.retrieveOrder(data.id, {
                relations: ["items"]
            })

            // B. Extract unique product IDs from the order
            // @ts-ignore - product_id exists on order items but types might complain
            const pIds = Array.from(new Set(order.items.map(item => item.product_id).filter(Boolean)))

            // C. Fetch the actual products to get their categories/collections
            if (pIds.length > 0) {
                // @ts-ignore
                const products = await productModuleService.listProducts({ id: pIds }, {
                    relations: ["categories"]
                })

                products.forEach(p => {
                    productIds.add(p.id)
                    if (p.collection_id) collectionIds.add(p.collection_id)
                    if (p.categories) {
                        p.categories.forEach(c => categoryIds.add(c.id))
                    }
                })
            }
        } catch (err) {
            console.warn(`Could not retrieve order data for webhook revalidation:`, err)
        }

        // Attach grouped order data to payload
        payloadBody = {
            ...payloadBody,
            products: Array.from(productIds),
            collections: Array.from(collectionIds),
            categories: Array.from(categoryIds)
        }
    }

    // ====================================================================
    // 3. PING NEXT.JS STOREFRONT
    // ====================================================================
    try {
        await fetch(`${storefrontUrl}/api/revalidate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-revalidate-secret": secret,
            },
            body: JSON.stringify(payloadBody)
        })
        console.log(`✅ Successfully pinged storefront to revalidate for event: ${name}`)
    } catch (error) {
        console.error("❌ Failed to ping storefront for revalidation:", error)
    }
}

export const config: SubscriberConfig = {
    event: [
        // Product Events
        "product.created",
        "product.updated",
        "product.deleted",
        // Order Events
        "order.placed",
        "order.canceled",
        "order-edit.confirmed"
    ],
}