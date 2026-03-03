import { getAuthHeaders } from "./data/cookies"

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

type FetchOptions = RequestInit & {
    query?: Record<string, any>
    requireAuth?: boolean
    tags?: string[]
}

/**
 * Helper to build Medusa-compatible query strings
 * (Handles arrays like category_id[]=1&category_id[]=2)
 */
function buildQueryString(query?: Record<string, any>): string {
    if (!query) return ""

    const params = new URLSearchParams()

    Object.entries(query).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((v) => params.append(`${key}[]`, String(v)))
        } else if (value !== undefined && value !== null) {
            params.append(key, String(value))
        }
    })

    const queryString = params.toString()
    return queryString ? `?${queryString}` : ""
}

/**
 * The ultimate stateless Medusa Fetch wrapper for Next.js 15
 */
export async function medusaFetch<T>(
    path: string,
    options: FetchOptions = {}
): Promise<T> {
    const { query, requireAuth, tags, cache, ...restOptions } = options

    // 1. Construct URL
    const endpoint = path.startsWith("/") ? path : `/${path}`
    const url = `${MEDUSA_URL}${endpoint}${buildQueryString(query)}`

    // 2. Setup Base Headers (Stateless!)
    const headers = new Headers({
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
        ...(restOptions.headers as Record<string, string>),
    })

    // 3. Inject Auth ONLY if explicitly requested
    if (requireAuth) {
        const authHeader = await getAuthHeaders() as { authorization?: string }
        if (authHeader.authorization) {
            headers.set("Authorization", authHeader.authorization)
        }
    } else {
        // Ruthlessly ensure no auth header leaks into public fetches
        headers.delete("Authorization")
        headers.delete("authorization")
    }

    // 4. Execute Fetch
    const response = await fetch(url, {
        ...restOptions,
        headers,
        cache: cache || (requireAuth ? "no-store" : "force-cache"), // Auto-cache public, auto-skip private
        next: {
            ...(tags ? { tags } : {}),
        },
    })

    // 5. Handle Errors Gracefully
    if (!response.ok) {
        const errorText = await response.text()
        console.error(`Medusa Fetch Error [${response.status}] at ${url}:`, errorText)
        throw new Error(`Medusa API Error: ${response.statusText}`)
    }

    // 6. Return Typed JSON
    return response.json() as Promise<T>
}