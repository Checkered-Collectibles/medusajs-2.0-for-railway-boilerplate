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
          id="trustpilot-init" // Unique ID is required for inline scripts
        >
          {`
        (function(w,d,s,r,n){w.TrustpilotObject=n;w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)};
            a=d.createElement(s);a.async=1;a.src=r;a.type='text/java'+s;f=d.getElementsByTagName(s)[0];
            f.parentNode.insertBefore(a,f)})(window,document,'script', 'https://invitejs.trustpilot.com/tp.min.js', 'tp');
            tp('register', 'FHw2hvWiXcRDNF5a');
            `}
        </script>

        <script id="meta-pixel-script">
          {`
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '3400198683482314');
fbq('track', 'PageView');
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
      </body>
    </html>
  )
}