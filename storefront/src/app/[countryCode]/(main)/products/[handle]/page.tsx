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
      return getProductsList({
        countryCode, queryParams: {
          limit: 1000
        }
      })
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
  const currency = price?.currency_code?.toUpperCase() ?? "INR"
  const amount = price?.calculated_amount
    ? price.calculated_amount.toFixed(2)
    : "250.00"

  const availability =
    product.variants?.some(
      (v) =>
        !v.manage_inventory ||
        v.allow_backorder ||
        (v.inventory_quantity || 1) > 0
    )
      ? "InStock"
      : "OutOfStock"

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  const canonical = baseUrl
    ? `${baseUrl}/${params.countryCode}/products/${handle}`
    : undefined

  // 🧠 SEO & CTR optimized title + description
  const title = `Buy ${product.title} Online in India | Checkered Collectibles`
  const description =
    product.description ||
    `Buy ${product.title} Hot Wheels collectible online in India at Checkered Collectibles. Authentic die-cast models, secure checkout, and fast nationwide delivery.`

  const images =
    product.images?.length
      ? product.images.map((img) => ({
        url: img.url,
        width: 1200,
        height: 630,
        alt: product.title,
      }))
      : product.thumbnail
        ? [
          {
            url: product.thumbnail,
            width: 1200,
            height: 630,
            alt: product.title,
          },
        ]
        : []

  return {
    title,
    description,
    keywords: [
      product.title || "",
      product.subtitle || "",
      "Hot Wheels",
      "die-cast cars",
      "collectibles",
      "buy online India",
    ].filter(Boolean),

    alternates: canonical ? { canonical } : undefined,

    openGraph: {
      type: "website",
      siteName: "Checkered Collectibles",
      title,
      description,
      url: canonical,
      images,
      locale: "en_IN",
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((img) => img.url),
    },

    other: {
      "product:price:amount": amount,
      "product:price:currency": currency,
      "product:availability": availability,
    },

    // 💡 Add JSON-LD structured data for product rich snippets
    metadataBase: new URL(baseUrl || "https://checkered.in"),
    // Inject JSON-LD schema directly into the <head>
    // (Can also be rendered manually inside <ProductPage />)
    // Example snippet shown below
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
    <>
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
      />
    </>
  )
}
