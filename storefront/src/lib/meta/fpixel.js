export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID

export const pageview = () => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView")
  }
}

export const metaEvent = (name, options) => {
  // 1. Safety Check: Ensure code is running in browser and fbq exists
  if (typeof window !== "undefined") {
    if (window.fbq) {
      // 2. Debugging: Log to console so you see if it actually fires
      console.log(`[Meta Pixel] Tracking ${name}:`, options)

      window.fbq("track", name, options)
    } else {
      console.warn(
        `[Meta Pixel] Failed to track ${name}: window.fbq is not defined yet.`
      )
    }
  }
}
