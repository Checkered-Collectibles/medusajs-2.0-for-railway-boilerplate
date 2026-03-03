import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        // 1. Secure the endpoint (you don't want randos busting your cache)
        const secret = request.headers.get("x-revalidate-secret")
        if (secret !== process.env.REVALIDATE_SECRET) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        // 2. Parse the incoming webhook payload from Medusa
        const body = await request.json()

        // Medusa sends events like "product.updated", "product.created", etc.
        const eventType = body.type || ""

        // 3. Map the Medusa events to your Next.js Cache Tags
        if (eventType.startsWith("product.")) {
            revalidateTag("products")
            return NextResponse.json({ revalidated: true, tag: "products", now: Date.now() })
        }

        if (eventType.startsWith("collection.")) {
            revalidateTag("collections")
            return NextResponse.json({ revalidated: true, tag: "collections", now: Date.now() })
        }

        if (eventType.startsWith("category.")) {
            revalidateTag("categories")
            return NextResponse.json({ revalidated: true, tag: "categories", now: Date.now() })
        }

        // Fallback if we just want to pass a specific tag manually
        if (body.tag) {
            revalidateTag(body.tag)
            return NextResponse.json({ revalidated: true, tag: body.tag, now: Date.now() })
        }

        return NextResponse.json({ message: "No matching event to revalidate" }, { status: 200 })

    } catch (error) {
        console.error("Revalidation error:", error)
        return NextResponse.json({ message: "Error parsing webhook" }, { status: 500 })
    }
}