import { Text } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"

import { getProductPrice } from "@lib/util/get-product-price"
import { getProductsById } from "@lib/data/products"
import Thumbnail from "../thumbnail"
import PreviewPrice from "../product-preview/price"
import QuickAddToCartButton from "./add-to-cart"
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type HorizontalProductPreviewProps = {
    product: HttpTypes.StoreProduct
    countryCode: string
    isFeatured?: boolean
}

export default async function ProductPreviewInstant({
    product,
    countryCode,
    isFeatured,
}: HorizontalProductPreviewProps) {
    const region = await getRegion(countryCode)
    if (!region) return null

    const [pricedProduct] = await getProductsById({
        ids: [product.id!],
        regionId: region.id,
    })

    if (!pricedProduct || !pricedProduct.variants?.length) {
        return null
    }

    const { cheapestPrice } = getProductPrice({
        product: pricedProduct,
    })

    const defaultVariant = pricedProduct.variants[0] // ✅ correct variant

    return (
        <div className="group" data-testid="product-wrapper">
            <LocalizedClientLink href={`/products/${product.handle}`}>
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
            </LocalizedClientLink>

            <div className="flex-shrink-0 mt-3 w-full">
                <QuickAddToCartButton
                    productId={pricedProduct.id}
                    variant={defaultVariant}      // ✅ FIXED
                    disabled={!defaultVariant}
                    countryCode={countryCode}
                />
            </div>
        </div>
    )
}