// getBrandLogoFromTitle.ts

type VehicleLogoItem = {
    name?: string
    code?: string | null
    logotype?: {
        uri?: string
        width?: number
        height?: number
        mime?: string
        transparent?: boolean
        size?: number
    }
    alternatives?: {
        uri?: string
        width?: number
        height?: number
        mime?: string
        transparent?: boolean
        size?: number
    }[]
}

type VehicleLogoMap = Record<string, VehicleLogoItem>

export type Logotype = VehicleLogoItem & { slug: string }

const normalize = (str: string) =>
    (str || "")
        .toLowerCase()
        .replace(/hot wheels/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim()

/**
 * Convert the vehicle-logotypes JSON (object map) into an array.
 * Pass your imported JSON directly as `logosMap`.
 */
export function logosMapToArray(logosMap: unknown): Logotype[] {
    const map = logosMap as VehicleLogoMap

    return Object.entries(map).map(([slug, item]) => ({
        slug,
        ...item,
    }))
}

/**
 * Find brand logo by parsing product title.
 * Works with titles like:
 * - "Hot Wheels MERCEDES BENZ 500 E"
 * - "Hot Wheels NISSAN SKYLINE GT-R (BCNR33)"
 */
export function getBrandLogoFromTitle(
    title: string,
    logos: Logotype[]
): { name?: string; uri?: string; slug?: string } | null {
    const normalizedTitle = normalize(title)

    // longest brand match first
    const sorted = [...logos].sort(
        (a, b) => (b.name?.length || 0) - (a.name?.length || 0)
    )

    for (const brand of sorted) {
        const uri = brand.logotype?.uri
        const name = brand.name
        if (!name || !uri) continue

        const brandName = normalize(name)

        // Extra guard: avoid matching super-short brand names accidentally
        if (brandName.length < 3) continue

        if (normalizedTitle.includes(brandName)) {
            return { name, uri, slug: brand.slug }
        }

        // Optional: also match on slug (helps for cases like "mercedes benz" vs "mercedes-benz")
        const slugName = normalize(brand.slug)
        if (slugName && normalizedTitle.includes(slugName)) {
            return { name, uri, slug: brand.slug }
        }
    }

    return null
}