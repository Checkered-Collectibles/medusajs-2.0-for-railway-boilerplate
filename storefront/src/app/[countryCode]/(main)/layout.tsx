import { Metadata } from "next"

import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import { getBaseURL } from "@lib/util/env"
import Banner from "@modules/layout/templates/banner"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: "Checkered Collectibles | Hot Wheels Without the Hype",
  description:
    "Authentic Hot Wheels and die-cast collectibles at honest prices. We’re putting collectibles back in the hands of fans — not scalpers.",
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  return (
    <>
      {/* <Banner /> */}
      <Nav />
      {props.children}
      <Footer />
    </>
  )
}
