import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"

type ShiprocketOptions = {
    email: string
    password: string
}

class ShiprocketFulfillmentService extends AbstractFulfillmentProviderService {
    static identifier = "shiprocket"
    protected options: ShiprocketOptions
    protected logger: Logger

    // --- 1. ADD THESE CACHE VARIABLES ---
    private cachedToken: string | null = null
    private tokenExpiry: number | null = null

    constructor({ logger }: { logger: Logger }, options: ShiprocketOptions) {
        super()
        this.options = options
        this.logger = logger
    }

    // --- 2. REPLACE YOUR OLD getToken() WITH THIS ONE ---
    private async getToken() {
        // Return cached token if valid (with a 1-hour safety buffer)
        if (this.cachedToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.cachedToken;
        }

        if (!this.options.email || !this.options.password) {
            throw new Error("Shiprocket configuration error: Missing email or password");
        }

        try {
            const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: this.options.email,
                    password: this.options.password,
                }),
            })

            const data = await response.json()

            if (!response.ok || !data.token) {
                this.logger.error(`Shiprocket Auth Error: ${JSON.stringify(data)}`)
                throw new Error(`Shiprocket Login Failed: ${data.message || "Unknown Error"}`)
            }

            // Cache the new token for 24 hours
            this.cachedToken = data.token;
            this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000);

            return this.cachedToken
        } catch (error) {
            this.logger.error(`Shiprocket Auth Failed: ${error}`)
            throw error
        }
    }

    // --- 3. ADD THIS NEW TRACKING METHOD ---
    async trackAwb(awb: string) {
        const token = await this.getToken()

        const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`, {
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

    async trackByOrderId(orderId: string, channelId?: string) {
        const token = await this.getToken()

        // Build the URL. channel_id is optional but supported if you pass it.
        let url = `https://apiv2.shiprocket.in/v1/external/courier/track?order_id=${orderId}`;
        if (channelId) {
            url += `&channel_id=${channelId}`;
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

    // ... KEEP ALL YOUR EXISTING METHODS DOWN HERE ...
    // (getFulfillmentOptions, createFulfillment, cancelFulfillment, etc.)
}

export default ShiprocketFulfillmentService