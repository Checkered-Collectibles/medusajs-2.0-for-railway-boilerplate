class ShiprocketClient {
    private cachedToken: string | null = null
    private tokenExpiry: number | null = null

    // --- Smart Auth Token Fetcher ---
    async getToken(): Promise<string> {
        if (this.cachedToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.cachedToken;
        }

        const email = process.env.SHIPROCKET_EMAIL
        const password = process.env.SHIPROCKET_PASSWORD

        if (!email || !password) {
            throw new Error("Missing SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD in .env file")
        }

        const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (!response.ok || !data.token) {
            throw new Error(`Shiprocket Login Failed: ${data.message || "Unknown Error"}`)
        }

        // Cache the new token for 24 hours
        this.cachedToken = data.token
        this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000)

        return this.cachedToken
    }

    // --- Tracking Method ---
    async trackByOrderId(orderId: string, channelId?: string) {
        const token = await this.getToken()

        let url = `https://apiv2.shiprocket.in/v1/external/courier/track?order_id=${orderId}`
        if (channelId) {
            url += `&channel_id=${channelId}`
        }

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })

        const trackData = await response.json()

        if (!response.ok) {
            throw new Error(`Shiprocket Tracking Failed: ${trackData.message || "Unknown error"}`)
        }

        return trackData
    }
}

// Export a single instance so the token cache is shared across your entire backend
export const shiprocketClient = new ShiprocketClient()