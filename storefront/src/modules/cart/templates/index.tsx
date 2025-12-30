import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"
import { evaluateHotWheelsRule } from "@lib/hw/rule"
import { Suspense } from "react"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import RelatedProducts from "@modules/products/components/related-products"
import { getFantasyProducts, getLicensedProducts } from "@lib/hw/add-product"
import ProductPreview from "@modules/products/components/product-preview"
import { getRegion } from "@lib/data/regions"
import ProductPreviewInstant from "@modules/products/components/product-preview-instant"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import InteractiveLink from "@modules/common/components/interactive-link"

const CartTemplate = async ({
  cart,
  customer,
  countryCode,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  countryCode: string
}) => {
  const region = await getRegion(countryCode)

  const {
    canCheckout,
    restrictionMessage,
    missingFantasy,
    missingMainlinesForPremium,
  } = await evaluateHotWheelsRule(cart)

  let fantasyProducts: HttpTypes.StoreProduct[] = []
  let fantasyCategoryHandle: string | undefined

  let licensedProducts: HttpTypes.StoreProduct[] = []
  let licensedCategoryHandle: string | undefined

  if (!canCheckout) {
    const fantasyRes = await getFantasyProducts(cart, countryCode)
    fantasyProducts = fantasyRes.products
    fantasyCategoryHandle = fantasyRes.categoryHandle

    const licensedRes = await getLicensedProducts(cart, countryCode)
    licensedProducts = licensedRes.products
    licensedCategoryHandle = licensedRes.categoryHandle
  }

  if (!region) {
    return null
  }

  const needsFantasy = (missingFantasy ?? 0) > 0
  const needsMainlinesForPremium = (missingMainlinesForPremium ?? 0) > 0

  return (
    <div className="py-12">
      <div className="content-container" data-testid="cart-container">
        {cart?.items?.length ? (
          <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] gap-x-40">
            <div className="flex flex-col bg-white py-6 gap-y-6">
              {!customer && (
                <>
                  <SignInPrompt />
                  <Divider />
                </>
              )}

              {restrictionMessage && (
                <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                  {restrictionMessage}
                </div>
              )}

              <ItemsTemplate items={cart.items} />

              {!canCheckout &&
                (fantasyProducts.length > 0 || licensedProducts.length > 0) && (
                  <div className="mt-12">
                    <div className="flex gap-5 justify-between items-center">
                      <div>
                        <h3 className="text-xl font-semibold mb-4">
                          Add Mainline Cars to Checkout
                        </h3>
                        <p className="text-sm text-red-600 mb-2">
                          {needsFantasy && needsMainlinesForPremium && (
                            <>
                              You need {missingMainlinesForPremium} more
                              mainline car
                              {missingMainlinesForPremium === 1 ? "" : "s"} in
                              total, including at least {missingFantasy} Fantasy
                              car{missingFantasy === 1 ? "" : "s"}.
                            </>
                          )}

                          {needsFantasy && !needsMainlinesForPremium && (
                            <>
                              You need {missingFantasy} more Fantasy car
                              {missingFantasy === 1 ? "" : "s"} to continue.
                            </>
                          )}

                          {!needsFantasy && needsMainlinesForPremium && (
                            <>
                              You need {missingMainlinesForPremium} more
                              mainline car
                              {missingMainlinesForPremium === 1 ? "" : "s"}{" "}
                              (Licensed or Fantasy) to continue.
                            </>
                          )}
                        </p>
                        {/* <p className="text-xs text-gray-500">
                          Mainlines include both Licensed and Fantasy Hot Wheels.
                        </p> */}
                      </div>
                    </div>

                    {/* Fantasy suggestions */}
                    {fantasyProducts.length > 0 && (
                      <div className="mt-8">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-base font-semibold">
                            Fantasy Picks
                          </h4>
                          <InteractiveLink
                            href={
                              fantasyCategoryHandle
                                ? `/categories/${fantasyCategoryHandle}`
                                : "/categories"
                            }
                          >
                            View all Fantasy
                          </InteractiveLink>
                        </div>
                        <ul className="grid grid-cols-2 small:grid-cols-3 gap-6">
                          {fantasyProducts.map((product) => (
                            <li key={product.id}>
                              <ProductPreviewInstant
                                product={product}
                                countryCode={countryCode}
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Licensed suggestions */}
                    {licensedProducts.length > 0 && (
                      <div className="mt-10">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-base font-semibold">
                            Licensed Picks
                          </h4>
                          <InteractiveLink
                            href={
                              licensedCategoryHandle
                                ? `/categories/${licensedCategoryHandle}`
                                : "/categories"
                            }
                          >
                            View all Licensed
                          </InteractiveLink>
                        </div>
                        <ul className="grid grid-cols-2 small:grid-cols-3 gap-6">
                          {licensedProducts.map((product) => (
                            <li key={product.id}>
                              <ProductPreviewInstant
                                product={product}
                                countryCode={countryCode}
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
            </div>

            <div className="relative">
              <div className="flex flex-col gap-y-8 sticky top-12">
                {cart && cart.region && (
                  <div className="bg-white py-6">
                    <Summary
                      cart={cart as any}
                      canCheckout={canCheckout}
                      restrictionMessage={restrictionMessage}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate