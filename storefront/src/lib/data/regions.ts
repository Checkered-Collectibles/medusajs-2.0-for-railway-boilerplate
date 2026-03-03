import { cache } from "react"
import { HttpTypes } from "@medusajs/types"
import { medusaFetch } from "@lib/medusa"

// --- Fetch all regions ---
export const listRegions = cache(async function (): Promise<
  HttpTypes.StoreRegion[]
> {
  try {
    const data = await medusaFetch<{ regions: HttpTypes.StoreRegion[] }>(
      "/store/regions",
      {
        cache: "force-cache",
        tags: ["regions"],
      }
    )
    return data.regions
  } catch (error) {
    console.error("Failed to list regions:", error)
    return []
  }
})

// --- Fetch a single region by ID ---
export const retrieveRegion = cache(async function (
  id: string
): Promise<HttpTypes.StoreRegion | null> {
  try {
    const data = await medusaFetch<{ region: HttpTypes.StoreRegion }>(
      `/store/regions/${id}`,
      {
        cache: "force-cache",
        tags: ["regions"],
      }
    )
    return data.region
  } catch (error) {
    console.error(`Failed to retrieve region ${id}:`, error)
    return null
  }
})

// In-memory cache to prevent mapping overhead on every call within a serverless instance
const regionMap = new Map<string, HttpTypes.StoreRegion>()

// --- Get a specific region by country code ---
export const getRegion = cache(async function (
  countryCode: string
): Promise<HttpTypes.StoreRegion | undefined | null> {
  try {
    // 1. Check in-memory map first
    if (regionMap.has(countryCode)) {
      return regionMap.get(countryCode)
    }

    // 2. Fetch all regions (this will instantly HIT the Next.js cache)
    const regions = await listRegions()

    if (!regions || regions.length === 0) {
      return null
    }

    // 3. Populate the map
    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        if (c?.iso_2) {
          regionMap.set(c.iso_2, region)
        }
      })
    })

    // 4. Return the requested region (fallback to "us" if not found)
    const region = countryCode
      ? regionMap.get(countryCode)
      : regionMap.get("us")

    return region
  } catch (e: any) {
    console.error(`Failed to get region for country ${countryCode}:`, e)
    return null
  }
})