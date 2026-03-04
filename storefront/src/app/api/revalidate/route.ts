import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        // 1. Secure the endpoint
        const secret = request.headers.get("x-revalidate-secret")
        if (secret !== process.env.REVALIDATE_SECRET) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const eventType = body.type || ""

        // Helper array to track exactly what we busted for debugging logs
        const revalidatedTags: string[] = []
        const bustTag = (tag: string) => {
            revalidateTag(tag)
            revalidatedTags.push(tag)
        }

        // ---------------------------------------------------------
        // A. GRANULAR ORDER REVALIDATION (The "Smart" Webhook)
        // ---------------------------------------------------------
        if (eventType.startsWith("order")) {
            // Bust specific products
            if (Array.isArray(body.products)) {
                body.products.forEach((id: string) => bustTag(`product:${id}`))
            }
            // Bust the specific collections those products belonged to
            if (Array.isArray(body.collections)) {
                body.collections.forEach((id: string) => bustTag(`collection:${id}`))
            }
            // Bust the specific categories those products belonged to
            if (Array.isArray(body.categories)) {
                body.categories.forEach((id: string) => bustTag(`category:${id}`))
            }

            return NextResponse.json({ revalidated: true, event: eventType, tags: revalidatedTags, now: Date.now() })
        }

        // ---------------------------------------------------------
        // B. STANDARD MEDUSA EVENTS (Admin edits, creates, deletes)
        // ---------------------------------------------------------
        const entityId = body.data?.id
        const entityHandle = body.handle // NOTE: You must send this from your Medusa Webhook

        if (eventType.startsWith("product.")) {
            // 1. Always bust the specific product pages
            if (entityId) bustTag(`product:${entityId}`)
            if (entityHandle) bustTag(`product:handle:${entityHandle}`)

            // 2. Surgically bust its specific collection and categories
            if (body.collection_id) {
                bustTag(`collection:${body.collection_id}`)
            }
            if (Array.isArray(body.category_ids)) {
                body.category_ids.forEach((id: string) => bustTag(`category:${id}`))
            }

            // 3. ONLY use the sledgehammer if the product was created or deleted
            // (Because a new/deleted product changes the total count of the global /store page)
            if (eventType === "product.created" || eventType === "product.deleted") {
                bustTag("products:list")
            }

            return NextResponse.json({ revalidated: true, event: eventType, tags: revalidatedTags, now: Date.now() })
        }

        if (eventType.startsWith("collection.")) {
            bustTag("collections:list")
            if (entityId) bustTag(`collection:${entityId}`)
            if (entityHandle) bustTag(`collection:handle:${entityHandle}`)

            return NextResponse.json({ revalidated: true, event: eventType, tags: revalidatedTags, now: Date.now() })
        }

        if (eventType.startsWith("category.") || eventType.startsWith("product-category.")) {
            bustTag("categories:list")
            if (entityId) bustTag(`category:${entityId}`)
            if (entityHandle) bustTag(`category:handle:${entityHandle}`)

            return NextResponse.json({ revalidated: true, event: eventType, tags: revalidatedTags, now: Date.now() })
        }

        // ---------------------------------------------------------
        // C. MANUAL FALLBACK
        // ---------------------------------------------------------
        if (body.tag) {
            bustTag(body.tag)
            return NextResponse.json({ revalidated: true, event: "manual", tags: revalidatedTags, now: Date.now() })
        }

        return NextResponse.json({ message: `No matching cache logic for event: ${eventType}` }, { status: 200 })

    } catch (error) {
        console.error("Revalidation error:", error)
        return NextResponse.json({ message: "Error parsing webhook" }, { status: 500 })
    }
}