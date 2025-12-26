import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import Redis from "ioredis"
import { REDIS_URL } from "lib/constants"

const WATCHING_TTL_SECONDS = 60 * 60 * 24 // 24 hours

// Create a single shared Redis client using your existing REDIS_URL
const redis = new Redis(REDIS_URL!)

/**
 * GET /store/product-watching/:id
 * Response: { watching: number }
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const { id: productId } = req.params

    if (!productId) {
        res.status(400).json({ message: "Product id is required" })
        return
    }

    const key = `product:watching:${productId}`

    const count = (await redis.scard(key)) || 0

    res.status(200).json({ watching: count })
}

/**
 * POST /store/product-watching/:id
 * Tracks the viewer and returns updated count.
 * Response: { watching: number }
 */
export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const { id: productId } = req.params

    if (!productId) {
        res.status(400).json({ message: "Product id is required" })
        return
    }

    const key = `product:watching:${productId}`

    // Prefer logged-in user → session → IP
    const userId = (req as any).auth?.user_id || null
    const sessionId = (req as any).session_id || req.headers["x-session-id"] || null
    const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        null

    const viewerId = userId || sessionId || ip

    // If somehow we can't identify the viewer, just return current count
    if (!viewerId) {
        const existing = (await redis.scard(key)) || 0
        res.status(200).json({ watching: existing })
        return
    }

    // Add viewer to SET (unique viewers)
    await redis.sadd(key, viewerId)

    // Refresh TTL (24 hours)
    await redis.expire(key, WATCHING_TTL_SECONDS)

    const count = (await redis.scard(key)) || 0

    res.status(200).json({ watching: count })
}