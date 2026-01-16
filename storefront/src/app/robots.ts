import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    // 🛑 Fix: Add wildcards (*) to handle country codes (e.g., /in/cart, /us/cart)
                    "/*/account/",
                    "/*/checkout/",
                    "/*/cart/",
                    "/*/order/",

                    // 🚫 Block internal Search Results (Critical for SEO)
                    // Google shouldn't index your search pages, it wastes crawl budget.
                    "/search",
                    "/*/search",

                    // 🚫 Block Backend/API routes
                    "/api/",

                    // 🚫 Block Filter/Sort parameters to prevent duplicate content
                    // (Only if you don't want Google indexing sorted lists)
                    //   "/*?*sort=",
                    //   "/*?*order=",
                ],
            },
            // 🤖 Explicitly allow Google's Image Bot (Helpful for Visual Products)
            {
                userAgent: "Googlebot-Image",
                allow: "/",
                disallow: [],
            }
        ],
        sitemap: "https://checkered.in/sitemap.xml",
    }
}