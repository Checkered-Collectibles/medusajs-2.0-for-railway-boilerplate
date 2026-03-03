// cache-handler.mjs
import { createClient } from "redis"
import { PHASE_PRODUCTION_BUILD } from "next/constants.js"
import { CacheHandler } from "@fortedigital/nextjs-cache-handler"
import createLruHandler from "@fortedigital/nextjs-cache-handler/local-lru"
import createRedisHandler from "@fortedigital/nextjs-cache-handler/redis-strings"

CacheHandler.onCreation(async () => {
  // Setup the local fallback cache
  const localCache = createLruHandler({
    maxItemsNumber: 10000,
    maxItemSizeBytes: 1024 * 1024 * 250, // Limit to 250 MB
  })

  // 1. Skip Redis entirely during the Railway build phase to avoid ENOTFOUND errors
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
    console.log(
      "🛠️ Build phase detected: Skipping Redis, using local LRU cache."
    )
    return { handlers: [localCache] }
  }

  // 2. Check for Redis URL
  if (!process.env.REDIS_URL) {
    console.warn("⚠️ REDIS_URL env is not set, using local cache only.")
    return { handlers: [localCache] }
  }

  // 3. Initialize Redis connection for production
  let redisHandler
  try {
    const client = createClient({
      url: process.env.REDIS_URL,
    })

    client.on("error", (error) => {
      console.error("❌ Redis Runtime Error:", error)
    })

    await client.connect()
    console.log("✅ SUCCESS: Connected to Redis Shared Cache")

    redisHandler = createRedisHandler({
      client,
      keyPrefix: "store-v1:", // Stable prefix for deployment persistence
    })
  } catch (error) {
    console.error(
      "❌ FAILURE: Failed to initialize Redis cache, falling back to local LRU.",
      error
    )
    return { handlers: [localCache] }
  }

  // Return the handlers (Redis first, fallback to Local)
  return {
    handlers: [redisHandler, localCache],
  }
})

export default CacheHandler
