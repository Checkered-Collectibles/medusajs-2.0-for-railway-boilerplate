class ShiprocketClient {
    private cachedToken: string | null = null
    private tokenExpiry: number | null = null

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

        // --- FIXED LOGIC ---
        if (!response.ok) {
            const errorText = await response.text()
            console.error("Shiprocket Auth HTML Error:", errorText)
            throw new Error(`Shiprocket Login Failed with status ${response.status}`)
        }

        const data = await response.json()

        if (!data.token) {
            throw new Error(`Shiprocket Auth Success but no token found: ${JSON.stringify(data)}`)
        }

        this.cachedToken = data.token
        this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000)
        return this.cachedToken
    }

    async trackByAwb(awb: string) {
        const token = await this.getToken()
        const url = `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })

        // --- FIXED LOGIC ---
        if (!response.ok) {
            const errorText = await response.text()
            console.error("Shiprocket Tracking HTML Error:", errorText)
            throw new Error(`Shiprocket AWB Tracking Failed with status ${response.status}`)
        }

        return await response.json()
    }
}

export const shiprocketClient = new ShiprocketClient()