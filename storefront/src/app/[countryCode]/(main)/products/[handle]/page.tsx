import { Metadata } from "next"
import { notFound } from "next/navigation"

import ProductTemplate from "@modules/products/templates"
import { getRegion, listRegions } from "@lib/data/regions"
import { getProductByHandle, getProductsList } from "@lib/data/products"
import Script from "next/script"
import { ViewContentTracker } from "@modules/products/components/meta-pixel"


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
    ? priceObj.calculated_amount.toFixed(2)
    : null

  const availability = product.variants?.some(
    (v) =>
      !v.manage_inventory ||
      v.allow_backorder ||
      (v.inventory_quantity || 0) > 0
  )
    ? "InStock"
    : "OutOfStock"

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const canonical = baseUrl
    ? `${baseUrl}/${params.countryCode}/products/${handle}`
    : undefined

  // 🧠 SMART TITLE LOGIC
  const cleanTitle = product.title.replace(/hot\s?wheels/i, "").trim()
  const fullTitle = `Hot Wheels ${cleanTitle}`

  // 🏆 SEO TITLE
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
  const firstVariant = pricedProduct.variants[0]
  const priceObj = firstVariant?.calculated_price
  const priceValue = priceObj?.calculated_amount || 0
  const currencyCode = priceObj?.currency_code?.toUpperCase() || "INR"

  // 🚚 DYNAMIC SHIPPING LOGIC
  const shippingCost = priceValue > 1499 ? "0" : "150"

  // 📅 PRICE VALID UNTIL LOGIC
  const nextYear = new Date()
  nextYear.setFullYear(nextYear.getFullYear() + 1)
  const priceValidString = nextYear.toISOString().split("T")[0]

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
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: pricedProduct.title,
    image: pricedProduct.images?.map((img) => img.url),
    description: pricedProduct.description,
    sku: pricedProduct.handle,
    brand: {
      "@type": "Brand",
      name: pricedProduct.type?.value || "Hot Wheels",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: currencyCode,
      price: priceValue,
      availability: availabilitySchema,
      priceValidUntil: priceValidString,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${pricedProduct.handle}`,
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Checkered Collectibles",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": shippingCost,
          "currency": "INR"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "IN"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 2,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 3,
            "maxValue": 7,
            "unitCode": "DAY"
          }
        }
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "IN",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 7,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/ReturnShippingFees"
      }
    },
  }

  return (
    <>
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
      />

      {/* 👇 2. Render the tracker here */}
      <ViewContentTracker product={pricedProduct} region={region} />

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