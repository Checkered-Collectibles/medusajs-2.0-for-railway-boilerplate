import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"

import { getProductsList } from "@lib/data/products"
import { getRelatedProducts } from "./actions"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({ product, countryCode }: RelatedProductsProps) {
  const region = await getRegion(countryCode)
  if (!region) return null

  // 1) Try Meili-based related products
  let products = await getRelatedProducts({ product, countryCode, limit: 8 })

  // 2) Fallback to your current “collection/tags” logic if Meili returns empty
  if (!products.length) {
    const queryParams: HttpTypes.StoreProductListParams = {
      region_id: region.id,
      is_giftcard: false,
    }

    if (product.collection_id) {
      queryParams.collection_id = [product.collection_id]
    }

    if (product.tags?.length) {
      queryParams.tag_id = product.tags.map((t) => t.id).filter(Boolean) as string[]
    }

    products = await getProductsList({ queryParams, countryCode }).then(({ response }) =>
      response.products.filter((p) => p.id !== product.id)
    )
  }

  if (!products.length) return null

  return (
    <div className="product-page-constraint">
      <div className="flex flex-col items-center text-center mb-16">
        <span className="text-base-regular text-gray-600 mb-6">Related products</span>
        <p className="text-2xl-regular text-ui-fg-base max-w-lg">
          You might also want to check out these products.
        </p>
      </div>

      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
        {products.map((p) => (
          <li key={p.id}>
            <Product region={region} product={p} />
          </li>
        ))}
      </ul>
    </div>
  )
}