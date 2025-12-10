import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { inter } from "styles/fonts"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body className={`${inter.variable} font-sans`}>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
