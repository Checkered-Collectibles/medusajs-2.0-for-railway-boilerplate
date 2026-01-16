import { Metadata } from "next"
import { notFound } from "next/navigation"

import ProductTemplate from "@modules/products/templates"
import { getRegion, listRegions } from "@lib/data/regions"
import { getProductByHandle, getProductsList } from "@lib/data/products"
import Script from "next/script"

type Props = {
  params: { countryCode: string; handle: string }
}

export async function generateStaticParams() {
  const countryCodes = await listRegions().then((regions) =>
    regions
      ?.map((r) => r.countries?.map((c) => c.iso_2))
      .flat()
      .filter(Boolean) as string[]
  )

  if (!countryCodes) return null

  const products = await Promise.all(
    countryCodes.map((countryCode) => {
      return getProductsList({
        countryCode,
        queryParams: { limit: 1000 },
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

  // 💰 PRICE LOGIC FOR METADATA
  const priceObj = product.variants?.[0]?.calculated_price
  const currency = priceObj?.currency_code?.toUpperCase() ?? "INR"
  const amount = priceObj?.calculated_amount
    ? priceObj.calculated_amount.toFixed(2) // Ensure "249.00" format
    : null

  const availability = product.variants?.some(
    (v) =>
      !v.manage_inventory ||
      v.allow_backorder ||
      (v.inventory_quantity || 0) > 0
  )
    ? "InStock"
    : "OutOfStock"

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  const canonical = baseUrl
    ? `${baseUrl}/products/${handle}`
    : undefined

  // 🧠 SMART TITLE LOGIC
  // If product is "Nissan Skyline", title becomes "Buy Hot Wheels Nissan Skyline..."
  // If product is "Hot Wheels Premium", title stays "Buy Hot Wheels Premium..."
  const cleanTitle = product.title.replace(/hot\s?wheels/i, "").trim()
  const fullTitle = `Hot Wheels ${cleanTitle}`

  // 🏆 SEO TITLE: Targets "[Model] Price" + "Buy India"
  const title = `Buy ${fullTitle} Online India | Best Price`

  // 📝 SEO DESCRIPTION
  const description =
    product.description?.substring(0, 160) ||
    `Buy ${fullTitle} online in India. Check the latest price for this authentic die-cast collectible. Secure packing and fast delivery at Checkered Collectibles.`

  const images = product.images?.length
    ? product.images.map((img) => ({
      url: img.url,
      width: 1200,
      height: 630,
      alt: `${fullTitle} - Buy Online India`,
    }))
    : []

  return {
    title,
    description,
    keywords: [
      `${fullTitle} Price`,
      `${fullTitle} India`,
      `Buy ${cleanTitle} Online`,
      "Hot Wheels India",
      "Diecast Collectibles",
    ],
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
    // 🛍️ PRODUCT METADATA FOR INSTAGRAM/FACEBOOK SHOP
    other: {
      "product:price:amount": amount || "0",
      "product:price:currency": currency,
      "product:availability": availability,
    },
    metadataBase: new URL(baseUrl || "https://checkered.in"),
  }
}

export default async function ProductPage({ params }: Props) {
  const region = await getRegion(params.countryCode)

  if (!region) notFound()

  const pricedProduct = await getProductByHandle(params.handle, region.id)
  if (!pricedProduct || !pricedProduct.variants) notFound()

  // 🔢 EXTRACT PRICE FOR SCHEMA (JSON-LD)
  // We extract the raw number (e.g., 249) directly from the first variant
  // This avoids dependency on 'getProductPrice' helper which might return strings
  const firstVariant = pricedProduct.variants[0]
  const priceObj = firstVariant?.calculated_price
  const priceValue = priceObj?.calculated_amount || 0
  const currencyCode = priceObj?.currency_code?.toUpperCase() || "INR"

  const isAvailable = pricedProduct.variants.some(
    (v) =>
      !v.manage_inventory ||
      v.allow_backorder ||
      (v.inventory_quantity || 0) > 0
  )

  const availabilitySchema = isAvailable
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock"

  // 🏗️ CONSTRUCT JSON-LD SCHEMA
  // This puts the "Rich Snippet" data on the page
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: pricedProduct.title,
    image: pricedProduct.images?.map((img) => img.url),
    description: pricedProduct.description,
    sku: pricedProduct.handle,
    brand: {
      "@type": "Brand",
      name: "Hot Wheels",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: currencyCode,
      price: priceValue, // Must be a number (e.g. 249)
      availability: availabilitySchema,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${params.countryCode}/products/${params.handle}`,
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Checkered Collectibles",
      },
    },
  }

  return (
    <>
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
      />
      {/* ⚡ INJECT SCHEMA FOR GOOGLE RICH SNIPPETS */}
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
    </>
  )
}