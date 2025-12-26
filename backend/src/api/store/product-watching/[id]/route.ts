import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import Redis from "ioredis"
import { REDIS_URL } from "lib/constants"

const WATCHING_TTL_SECONDS = 60 * 60 * 24 // 24 hours
const redis = new Redis(REDIS_URL!)

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

    // Use only user_id OR IP so it stays stable across refreshes
    const userId = (req as any).auth?.user_id || null
    const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        null

    const viewerId = userId || ip

    if (!viewerId) {
        const existing = (await redis.scard(key)) || 0
        res.status(200).json({ watching: existing })
        return
    }

    // Redis SET ensures the same viewer doesn't increase count twice
    await redis.sadd(key, viewerId)
    await redis.expire(key, WATCHING_TTL_SECONDS)

    const count = (await redis.scard(key)) || 0
    res.status(200).json({ watching: count })
}

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