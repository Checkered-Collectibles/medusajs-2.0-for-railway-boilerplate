import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import logotypes from "@avto-dev/vehicle-logotypes/src/vehicle-logotypes.json"
import { getBrandLogoFromTitle, logosMapToArray } from "@modules/cart/components/hw/get-logo"
import ReviewStars from "@modules/layout/templates/stars"



type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = async ({ product }: ProductInfoProps) => {
  const logosArray = logosMapToArray(logotypes)
  const brand = getBrandLogoFromTitle(product.title, logosArray)

  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}

        <div className="space-y-2">
          {/* ✅ Brand logo */}
          {brand?.uri && (
            <div title={`Official ${brand.name} Licensed Car`} className="flex gap-1 items-center bg-white border border-black/10 shadow-md pl-2 pr-4 py-1 rounded-full w-fit italic">
              <Image
                src={brand.uri}
                alt={`${brand.name} logo`}
                width={80}
                height={40}
                className="h-11 w-auto object-contain"
                priority={false}
              />
              {brand.name} Licensed
            </div>
          )}
          {product.metadata?.preorder == true &&
            <div className="w-fit">
              <div className="px-3 py-1 rounded-full bg-black text-white">Pre-order</div>
            </div>
          }

          <Heading
            level="h1"
            className="text-3xl leading-10 text-ui-fg-base"
            data-testid="product-title"
          >
            {product.title}
          </Heading>
          <div className="w-full py-3 flex items-start">
            <ReviewStars />
          </div>
        </div>
        <Text
          className="text-medium text-ui-fg-subtle whitespace-pre-line"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      </div>
    </div>
  )
}

export default ProductInfo