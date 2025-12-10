import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import { Text, clx } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MedusaCTA from "@modules/layout/components/medusa-cta"
import Image from "next/image"
import LogoImage from "@images/logo.png";

export default async function Footer() {
  const { collections } = await getCollectionsList(0, 6)
  const { product_categories } = await getCategoriesList(0, 6)

  return (
    <footer className="border-t border-ui-border-base w-full">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-40">
          <div className="flex flex-col gap-y-5">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus text-ui-fg-subtle hover:text-ui-fg-base uppercase"
            >
              <Image src={LogoImage} width={200} alt="Checkered Collectibles" />
            </LocalizedClientLink>
            <Text className="">We are an end to the scalpers.<br />Join the revolution.</Text>
            <Text className="">Fatehpur, Uttar Pradesh, India</Text>
          </div>
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
            {product_categories && product_categories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">
                  Categories
                </span>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {product_categories?.slice(0, 6).map((c) => {
                    if (c.parent_category) {
                      return
                    }

                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null

                    return (
                      <li
                        className="flex flex-col gap-2 text-ui-fg-subtle txt-small"
                        key={c.id}
                      >
                        <LocalizedClientLink
                          className={clx(
                            "hover:text-ui-fg-base",
                            children && "txt-small-plus"
                          )}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 ml-3 gap-2">
                            {children &&
                              children.map((child) => (
                                <li key={child.id}>
                                  <LocalizedClientLink
                                    className="hover:text-ui-fg-base"
                                    href={`/categories/${child.handle}`}
                                    data-testid="category-link"
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
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">
                  Collections
                </span>
                <ul
                  className={clx(
                    "grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small",
                    {
                      "grid-cols-2": (collections?.length || 0) > 3,
                    }
                  )}
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
                </ul>
              </div>
            )}
            {/* <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">Connect with us</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base"
                  >
                    Whatsapp
                  </a>
                </li>
              </ul>
            </div> */}
          </div>
        </div>
        <div className="flex md:flex-row flex-col-reverse gap-5 w-full mb-16 justify-between items-center text-ui-fg-muted">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} Checkered Collectibles — Owned and operated by Shubhankar Trivedi.
          </Text>
          <div className="flex gap-3">
            <a href="mailto:hello@checkered.in" className=""><Text className="text-xs underline hover:no-underline">
              Contact Us
            </Text></a>
            <LocalizedClientLink href="/terms-and-conditions" className=""><Text className="text-xs underline hover:no-underline">
              Terms & Conditions
            </Text></LocalizedClientLink>
            <LocalizedClientLink href="/privacy-policy" className=""><Text className="text-xs underline hover:no-underline">
              Privacy Policy
            </Text></LocalizedClientLink>
            <LocalizedClientLink href="/shipping-policy" className=""><Text className="text-xs underline hover:no-underline">
              Shipping Policy
            </Text></LocalizedClientLink>
            <LocalizedClientLink href="/cancellation-and-refund-policy" className=""><Text className="text-xs underline hover:no-underline">
              Cancellation and Refunds
            </Text></LocalizedClientLink>
          </div>
          {/* <MedusaCTA /> */}
        </div>
      </div>
    </footer>
  )
}
