import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import { Text, clx } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import LogoImage from "@images/logo.png";
import PaymentLogos from "./payments"
import ReviewStars from "../stars"

export default async function Footer() {
  // ⚡ Fetching 6 items is good, keeps the footer clean but crawlable
  const { collections } = await getCollectionsList(0, 6)
  const { product_categories } = await getCategoriesList(0, 6)

  return (
    <footer className="border-t border-ui-border-base w-full bg-ui-bg-subtle">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-6 xsmall:flex-row items-start justify-between py-20">

          {/* 1️⃣ BRANDING & LOCAL SEO SECTION */}
          <div className="space-y-5 max-w-[300px]">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus text-ui-fg-subtle hover:text-ui-fg-base uppercase"
            >
              <Image
                src={LogoImage}
                width={200}
                // 🧠 SEO: Descriptive Alt Text for the Logo
                alt="Buy Hot Wheels India - Checkered Collectibles"
              />
            </LocalizedClientLink>

            {/* 🧠 SEO: Text contains "Buy Hot Wheels" + "India" keywords */}
            <Text className="txt-small text-ui-fg-subtle">
              Join the revolution against scalpers. The best place to <strong>buy Hot Wheels online in India</strong> at fair prices.
            </Text>

            {/* 🧠 SEO: Semantic Address Tag for Local Ranking */}
            <address className="not-italic txt-small text-ui-fg-subtle">
              Checkered Collectibles<br />
              Fatehpur, Uttar Pradesh, India
            </address>
          </div>

          {/* 2️⃣ LINKS SECTION */}
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">

            {/* CATEGORIES COLUMN */}
            {product_categories && product_categories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                {/* 🧠 SEO: "Hot Wheels Categories" > "Categories" */}
                <span className="txt-small-plus txt-ui-fg-base">
                  Hot Wheels Categories
                </span>
                <ul className="grid grid-cols-1 gap-2" data-testid="footer-categories">
                  {product_categories?.slice(0, 6).map((c) => {
                    if (c.parent_category) return null

                    const children = c.category_children?.map((child) => ({
                      name: child.name,
                      handle: child.handle,
                      id: child.id,
                    })) || null

                    return (
                      <li className="flex flex-col gap-2 text-ui-fg-subtle txt-small" key={c.id}>
                        <LocalizedClientLink
                          className={clx("hover:text-ui-fg-base", children && "txt-small-plus")}
                          href={`/categories/${c.handle}`}
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 ml-3 gap-2">
                            {children.map((child) => (
                              <li key={child.id}>
                                <LocalizedClientLink
                                  className="hover:text-ui-fg-base"
                                  href={`/categories/${child.handle}`}
                                >
                                  {child.name}
                                </LocalizedClientLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* COLLECTIONS COLUMN */}
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                {/* 🧠 SEO: "Top Collections" implies popularity */}
                <span className="txt-small-plus txt-ui-fg-base">
                  Top Collections
                </span>
                <ul className={clx("grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small", {
                  "grid-cols-2": (collections?.length || 0) > 3,
                })}
                >
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-ui-fg-base"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}

                  {/* 🚀 THE MONEY LINK: Hardcoded link to capture "Price List" traffic */}
                  <li>
                    <LocalizedClientLink
                      className="hover:text-ui-fg-base font-bold text-orange-600"
                      href="/store"
                    >
                      Hot Wheels Price List 2026
                    </LocalizedClientLink>
                  </li>
                </ul>
              </div>
            )}

            {/* SOCIALS COLUMN */}
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">Community</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <a href="https://www.instagram.com/checkered.in/" target="_blank" rel="noreferrer" className="hover:text-ui-fg-base">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="https://www.youtube.com/@CheckeredCollectibles" target="_blank" rel="noreferrer" className="hover:text-ui-fg-base">
                    YouTube
                  </a>
                </li>
                <li>
                  <a href="https://chat.whatsapp.com/D09sAJ51EXX5MzuFOAmAAK?mode=hqrt2" target="_blank" rel="noreferrer" className="hover:text-ui-fg-base">
                    Whatsapp Group
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3️⃣ LEGAL & FOOTER BOTTOM */}
        <div className="flex md:flex-row flex-col-reverse gap-5 w-full mb-16 justify-between items-center text-ui-fg-muted border-t border-ui-border-base pt-5">
          <div className="flex flex-wrap-reverse gap-5 items-center">
            <Text className="txt-compact-small">
              © {new Date().getFullYear()} Checkered Collectibles India
            </Text>
            <PaymentLogos />
            <ReviewStars />
          </div>
          <div className="flex flex-wrap gap-3">
            <LocalizedClientLink href="/contact"><Text className="text-xs hover:text-ui-fg-base">Contact Us</Text></LocalizedClientLink>
            <LocalizedClientLink href="/terms-and-conditions"><Text className="text-xs hover:text-ui-fg-base">Terms</Text></LocalizedClientLink>
            <LocalizedClientLink href="/privacy-policy"><Text className="text-xs hover:text-ui-fg-base">Privacy</Text></LocalizedClientLink>
            <LocalizedClientLink href="/shipping-policy"><Text className="text-xs hover:text-ui-fg-base">Shipping</Text></LocalizedClientLink>
            <LocalizedClientLink href="/cancellation-and-refund-policy"><Text className="text-xs hover:text-ui-fg-base">Refunds</Text></LocalizedClientLink>
          </div>
        </div>
      </div>
    </footer>
  )
}