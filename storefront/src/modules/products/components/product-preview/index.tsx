import { Text } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { getProductsById } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import QuickAddToCartButton from "../product-preview-instant/add-to-cart"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const [pricedProduct] = await getProductsById({
    ids: [product.id!],
    regionId: region.id,
  })

  if (!pricedProduct) {
    return null
  }

  const { cheapestPrice } = getProductPrice({
    product: pricedProduct,
  })
  if (region.countries && region.countries[0].iso_2 && product.variants)
    return (
      <div className="flex flex-col gap-5 group/item justify-between h-full">
        <LocalizedClientLink href={`/products/${product.handle}`} className="group">
          <div data-testid="product-wrapper">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
            />
            <div className="flex txt-compact-medium mt-4 justify-between">
              <Text className="text-ui-fg-subtle" data-testid="product-title">
                {product.title}
              </Text>
              <div className="flex items-center gap-x-2">
                {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
              </div>
            </div>
          </div>
        </LocalizedClientLink>
        <div className="md:invisible md:group-hover/item:visible">
          <QuickAddToCartButton productId={product.id} countryCode={region.countries[0].iso_2} variant={product.variants[0]} />
        </div>
      </div>
    )
}
