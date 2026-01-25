import FacebookPixel from "@lib/meta/facebook-pixel"
import RegistrationFlusher from "@lib/meta/registration"
import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import Script from "next/script"
import { inter } from "styles/fonts"

import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  icons: {
    icon: '/favicon.ico?v=2',
    apple: '/apple-touch-icon.png?v=2',
    shortcut: '/apple-touch-icon.png?v=2',
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <head>
        <script
          id="trustpilot-init"
        >
          {`
        (function(w,d,s,r,n){w.TrustpilotObject=n;w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)};
            a=d.createElement(s);a.async=1;a.src=r;a.type='text/java'+s;f=d.getElementsByTagName(s)[0];
            f.parentNode.insertBefore(a,f)})(window,document,'script', 'https://invitejs.trustpilot.com/tp.min.js', 'tp');
            tp('register', 'FHw2hvWiXcRDNF5a');
            `}
        </script>

      </head>
      <body className={`${inter.variable} font-sans`}>
        {/* Google Analytics */}
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

        {/* 2. Add the flusher here (inside body is fine) */}
        <RegistrationFlusher />
      </body>
      <FacebookPixel />
    </html>
  )
}