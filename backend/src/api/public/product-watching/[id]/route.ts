import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import Redis from "ioredis"
import { REDIS_URL } from "lib/constants"

const WATCHING_TTL_SECONDS = 60 * 60 * 24 // 24 hours
const redis = new Redis(REDIS_URL!)

/**
 * GET /store/product-watching/:id
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
    const count = Number(await redis.get(key)) || 0

    res.status(200).json({ watching: count })
}

/**
 * POST /store/product-watching/:id
 * No unique viewer tracking — simply increments the counter once per session.
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

    // Increment the counter (adds +1)
    const count = await redis.incr(key)

    // Set TTL if not set already
    const ttl = await redis.ttl(key)
    if (ttl === -1) {
        await redis.expire(key, WATCHING_TTL_SECONDS)
    }

    res.status(200).json({ watching: count })
}