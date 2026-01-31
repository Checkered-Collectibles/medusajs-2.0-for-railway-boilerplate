export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID

export const pageview = () => {
  if (process.env.NODE_ENV == "development") return
  window.fbq("track", "PageView")
}

// https://developers.facebook.com/docs/facebook-pixel/advanced/
export const metaEvent = (name, options = {}) => {
  if (process.env.NODE_ENV == "development") return
  window.fbq("track", name, options)
}
