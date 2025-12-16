import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import Script from "next/script"
import { inter } from "styles/fonts"

import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">

      <body className={`${inter.variable} font-sans`}>
        <Script src="https://www.googletagmanager.com/gtag/js?id=AW-17801513380" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
				window.dataLayer = window.dataLayer || [];
				function gtag(){window.dataLayer.push(arguments);}
				gtag('js', new Date());

				gtag('config', 'AW-17801513380');
				`}
        </Script>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
