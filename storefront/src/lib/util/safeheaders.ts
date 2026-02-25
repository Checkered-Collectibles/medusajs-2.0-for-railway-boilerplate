// --- Helper: Safe Auth Headers ---

import { getAuthHeaders } from "@lib/data/cookies"

// Fixes "cookies called outside request scope" during build time
export const getSafeAuthHeaders = async () => {
    try {
        const headers = await getAuthHeaders()
        return headers
    } catch (error) {
        // This happens during build/SSG when there is no request/cookies.
        // We return empty headers so the build generates default (non-member) pricing.
        return {}
    }
}