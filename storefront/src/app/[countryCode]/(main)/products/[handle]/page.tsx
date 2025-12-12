import { Metadata } from "next"
import { notFound } from "next/navigation"

import ProductTemplate from "@modules/products/templates"
import { getRegion, listRegions } from "@lib/data/regions"
import { getProductByHandle, getProductsList } from "@lib/data/products"

type Props = {
  params: { countryCode: string; handle: string }
}

export async function generateStaticParams() {
  const countryCodes = await listRegions().then(
    (regions) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )

  if (!countryCodes) {
    return null
  }

  const products = await Promise.all(
    countryCodes.map((countryCode) => {
      return getProductsList({ countryCode })
    })
  ).then((responses) =>
    responses.map(({ response }) => response.products).flat()
  )

  const staticParams = countryCodes
    ?.map((countryCode) =>
      products.map((product) => ({
        countryCode,
        handle: product.handle,
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = params
  const region = await getRegion(params.countryCode)
  if (!region) notFound()

  const product = await getProductByHandle(handle, region.id)
  if (!product) notFound()

  const price = product.variants?.[0]?.calculated_price
  const currency = price?.currency_code?.toUpperCase() ?? "inr"
  const amount = price?.calculated_amount
    ? (price.calculated_amount).toFixed(2)
    : 250

  const availability =
    product.variants?.some(
      (v) =>
        !v.manage_inventory ||
        v.allow_backorder ||
        v.inventory_quantity !== 0
    )
      ? "InStock"
      : "OutOfStock"
  let category = "Hot Wheels";
  if (product.categories) category = product.categories[0].name ?? "Hot Wheels";
  const title = `${category} ${product.title} | Checkered Collectibles`
  const description =
    product.description ||
    `${product.title} available online. Buy now with fast shipping.`

  return {
    title,
    description,
    keywords: [
      product.title,
      product.subtitle,
      product.collection?.title,
      product.type?.value,
    ].filter(Boolean) as string[],

    openGraph: {
      type: "website",
      title,
      description,
      images: product.images?.length
        ? product.images.map((img) => ({
          url: img.url,
          alt: product.title,
        }))
        : product.thumbnail
          ? [{ url: product.thumbnail, alt: product.title }]
          : [],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.thumbnail ? [product.thumbnail] : [],
    },

    other: {
      "product:price:amount": amount,
      "product:price:currency": currency,
      "product:availability": availability,
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const pricedProduct = await getProductByHandle(params.handle, region.id)
  if (!pricedProduct) {
    notFound()
  }

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={params.countryCode}
    />
  )
}
