import { Text } from "@medusajs/ui"
import Image from "next/image"

import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { getProductsById } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import QuickAddToCartButton from "../product-preview-instant/add-to-cart"

import logotypes from "@avto-dev/vehicle-logotypes/src/vehicle-logotypes.json"
import { getBrandLogoFromTitle, logosMapToArray } from "@lib/hw/get-logo"

// ✅ Convert once (module-level), not on every render
const LOGOS_ARRAY = logosMapToArray(logotypes)

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

  if (!pricedProduct) return null

  const { cheapestPrice } = getProductPrice({ product: pricedProduct })

  const countryCode = region.countries?.[0]?.iso_2
  if (!countryCode) return null

  // ✅ Use variants from pricedProduct (has stock fields)
  const defaultVariant = pricedProduct.variants?.[0]
  if (!defaultVariant) return null
  const isInStock =
    !defaultVariant.manage_inventory ||
    defaultVariant.allow_backorder ||
    (defaultVariant.inventory_quantity || 0) > 0
  // ✅ Find brand logo from title (use pricedProduct title to be safe)
  const brand = getBrandLogoFromTitle(pricedProduct.title, LOGOS_ARRAY)

  return (
    <div
      className={[
        "flex flex-col gap-5 group/item justify-between h-full transition",
        !isInStock ? "grayscale" : "",
      ].join(" ")}
    >
      <LocalizedClientLink href={`/products/${product.handle}`} className="group relative">
        {product.metadata?.preorder == true &&
          <div className="absolute top-2 right-2 z-10">
            <div className="px-3 py-1 rounded-full bg-black text-white">Pre-order</div>
          </div>
        }
        {/* ✅ Brand logo */}
        {brand?.uri && (
          <div title={`Official ${brand.name} Licensed Car`} className="absolute top-2 left-2 z-10">
            <Image
              src={brand.uri}
              alt={`${brand.name} logo`}
              width={50}
              height={40}
              className="h-14 w-auto object-contain rounded"
            />
          </div>
        )}

        <div data-testid="product-wrapper">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
          />

          <div className="flex txt-compact-medium mt-4 justify-between gap-3">
            <div className="min-w-0">
              <Text className="text-ui-fg-subtle line-clamp-2" data-testid="product-title">
                {product.title}
              </Text>
            </div>

            <div className="flex items-center gap-x-2 shrink-0">
              {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
            </div>
          </div>
        </div>
      </LocalizedClientLink>

      <div className="md:invisible md:group-hover/item:visible">
        <QuickAddToCartButton
          productId={pricedProduct.id}
          countryCode={countryCode}
          variant={defaultVariant}
        />
      </div>
    </div>
  )
}