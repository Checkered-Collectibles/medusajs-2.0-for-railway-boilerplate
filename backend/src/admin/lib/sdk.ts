import Medusa from "@medusajs/js-sdk"

export const sdk = new Medusa({
    baseUrl: "/", // Proxied to backend in dev
    debug: process.env.NODE_ENV === "development",
    auth: {
        type: "session",
    },
})