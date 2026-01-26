import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"
import { evaluateHotWheelsRule } from "@modules/cart/components/hw/rule"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import RelatedProducts from "@modules/products/components/related-products"
import { getFantasyProducts, getRelatedProductsForCart } from "@modules/cart/components/hw/add-product"
// 👇 Import your new function (Update path if needed)
import ProductPreviewInstant from "@modules/products/components/product-preview-instant"
import InteractiveLink from "@modules/common/components/interactive-link"
import { evaluateOutOfStockRule } from "../components/out-of-stock"
import { getRegion } from "@lib/data/regions"

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

  const hotWheelsRule = await evaluateHotWheelsRule(cart)
  const stockRule = await evaluateOutOfStockRule(cart)

  const canCheckout = hotWheelsRule.canCheckout && stockRule.canCheckout

  const restrictionMessage = [
    hotWheelsRule.restrictionMessage,
    stockRule.restrictionMessage,
  ]
    .filter(Boolean)
    .join(" ")

  const {
    missingFantasy,
    missingMainlinesForPremium,
  } = hotWheelsRule

  let fantasyProducts: HttpTypes.StoreProduct[] = []
  let fantasyCategoryHandle: string | undefined

  // 👇 New variable for related products
  let relatedProducts: HttpTypes.StoreProduct[] = []

  if (!canCheckout) {
    // 1. If blocked, show Fantasy cars needed to unblock
    const fantasyRes = await getFantasyProducts(cart, countryCode)
    fantasyProducts = fantasyRes.products
    fantasyCategoryHandle = fantasyRes.categoryHandle
  } else if (canCheckout) {
    // 2. If allowed, show "You might also like" (Related Products)
    relatedProducts = await getRelatedProductsForCart(cart, countryCode)
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
              <div className="relative small:hidden block">
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
              {/* Suggestions Section */}
              {
                (fantasyProducts.length > 0 || relatedProducts.length > 0) && (
                  <div className="mt-12">
                    <div className="flex gap-5 justify-between items-center">
                      <div>
                        {/* Dynamic Header */}
                        <h3 className="text-xl font-semibold mb-4">
                          {canCheckout ? "You might also like" : "Add Cars to Checkout"}
                        </h3>

                        {/* Error Messages (Only shown if blocked) */}
                        {!canCheckout && (
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
                        )}
                      </div>
                    </div>

                    {/* 1. Fantasy suggestions (Shown when Blocked) */}
                    {fantasyProducts.length > 0 && (
                      <div className="mt-8">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-base font-semibold">
                            Fantasy Picks (Required)
                          </h4>
                          <InteractiveLink
                            target="_blank"
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

                    {/* 2. Related suggestions (Shown when Can Checkout) */}
                    {relatedProducts.length > 0 && (
                      <div className="mt-10">
                        <div className="flex justify-start items-center mb-4">
                          <h4 className="text-base font-semibold">
                            Complete your collection
                          </h4>
                        </div>
                        <ul className="grid grid-cols-2 small:grid-cols-3 gap-6">
                          {relatedProducts.map((product) => (
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

            <div className="relative small:block hidden">
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