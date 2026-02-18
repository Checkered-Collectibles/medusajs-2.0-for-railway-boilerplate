import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import Image from "next/image"
import LogoImage from "@images/logo.png";
import { getCustomer } from "@lib/data/customer"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)
  // const customer = await getCustomer().catch(() => null)
  const isClubMember = false
  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu regions={regions} />
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus hover:text-ui-fg-base uppercase"
              data-testid="nav-store-link"
            >
              <Image src={LogoImage} width={130} alt="Checkered Collectibles" />
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="hidden small:flex items-center gap-x-6 h-full">
              {process.env.NEXT_PUBLIC_FEATURE_SEARCH_ENABLED && (
                <LocalizedClientLink
                  className="hover:text-ui-fg-base"
                  href="/search"
                  scroll={false}
                  data-testid="nav-search-link"
                >
                  Search
                </LocalizedClientLink>
              )}
              {isClubMember &&
                <LocalizedClientLink
                  className="py-0.5 px-1.5 bg-black text-white relative group/club"
                  href="/club"
                  data-testid="nav-club-link"
                >
                  <span className="">CLUB</span>
                  <div className="h-1.5 w-1.5 bg-black absolute -top-1.5 -left-1.5 duration-150 group-hover/club:h-2 group-hover/club:w-2" />
                  <div className="h-1 w-1 bg-white absolute bottom-0 right-0 duration-150 group-hover/club:w-1.5 group-hover/club:h-1.5" />
                </LocalizedClientLink>
              }
              <LocalizedClientLink
                className="hover:text-ui-fg-base"
                href="/account"
                data-testid="nav-account-link"
              >
                Account
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
