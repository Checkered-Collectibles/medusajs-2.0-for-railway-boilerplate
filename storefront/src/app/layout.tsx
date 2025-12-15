import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { inter } from "styles/fonts"
import { GoogleTagManager, GoogleAnalytics } from '@next/third-parties/google';

import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <GoogleTagManager gtmId="AW-17801513380" />
      <body className={`${inter.variable} font-sans`}>
        <main className="relative">{props.children}</main>
        <GoogleAnalytics gaId="G-11D801QMB2" />
      </body>
    </html>
  )
}
