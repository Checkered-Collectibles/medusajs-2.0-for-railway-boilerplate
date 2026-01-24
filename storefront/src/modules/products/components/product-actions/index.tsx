"use client"

import { Button } from "@medusajs/ui"
import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { useIntersection } from "@lib/hooks/use-in-view"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"

import MobileActions from "./mobile-actions"
import ProductPrice from "../product-price"
// ❌ Remove direct import
// import { addToCart } from "@lib/data/cart" 
import { HttpTypes } from "@medusajs/types"
import ShippingCountdown from "@modules/checkout/templates/shipping-countdown"
import Socials from "./socials"
// ✅ Import the hook
import { useAddToCart } from "@lib/hooks/use-add-to-cart"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (variantOptions: any) => {
  return variantOptions?.reduce((acc: Record<string, string | undefined>, varopt: any) => {
    if (varopt.option && varopt.value !== null && varopt.value !== undefined) {
      acc[varopt.option.title] = varopt.value
    }
    return acc
  }, {})
}

export default function ProductActions({
  product,
  region,
  disabled,
}: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const countryCode = useParams().countryCode as string

  // ✅ Use the hook (replaces local isAdding state)
  const { add, isAdding } = useAddToCart()

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (title: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [title]: value,
    }))
  }

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }
    if (selectedVariant?.allow_backorder) {
      return true
    }
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }
    return false
  }, [selectedVariant])

  const stockLabel = useMemo(() => {
    if (!selectedVariant) return null

    if (!selectedVariant.manage_inventory) {
      return { text: "In stock", tone: "success" as const }
    }

    if (selectedVariant.allow_backorder) {
      return { text: "Available on backorder", tone: "warning" as const }
    }

    const qty = selectedVariant.inventory_quantity || 0

    if (qty > 0) {
      const lowStock = qty <= 3
      return {
        text: lowStock ? `Only ${qty} left` : `In stock (${qty} available)`,
        tone: lowStock ? ("warning" as const) : ("success" as const),
      }
    }

    return { text: "Out of stock", tone: "danger" as const }
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // ✅ Updated handler using the hook
  const handleAddToCart = () => {
    if (!selectedVariant?.id) return null

    add({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode,
      productInfo: {
        title: product.title,
        value: selectedVariant.calculated_price?.calculated_amount || 0,
        currency: "INR"
      }
    })
  }

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.title ?? ""]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>
        <div className="flex justify-between gap-3 items-center">
          <ProductPrice product={product} variant={selectedVariant} />
          {/* Stock display */}
          {stockLabel && (
            <div
              className={[
                "text-sm py-0.5 px-2 w-fit border border-black/10 rounded-full",
                stockLabel.tone === "success" ? "text-green-700 bg-green-100" : "",
                stockLabel.tone === "warning" ? "text-red-700 bg-red-100" : "",
                stockLabel.tone === "danger" ? "text-red-700 bg-red-100" : "",
              ].join(" ")}
              data-testid="stock-indicator"
            >
              {stockLabel.text}
            </div>
          )}
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={!inStock || !selectedVariant || !!disabled || isAdding}
          variant="primary"
          className="w-full h-10"
          isLoading={isAdding}
          data-testid="add-product-button"
        >
          {!selectedVariant
            ? "Select variant"
            : !inStock
              ? "Out of stock"
              : "Add to cart"}
        </Button>
        {!inStock && <Socials />}
        {inStock && <ShippingCountdown className="mt-2" />}
        {/* Trust & scarcity points */}
        <div className="mt-3 flex flex-col gap-2 text-sm text-ui-fg-subtle">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>100% authentic Hot Wheels</span>
          </div>

          <div className="flex items-center gap-2">
            <span>📦</span>
            <span>Collector-safe packaging</span>
          </div>

          <div className="flex items-center gap-2">
            <span>🚚</span>
            <span>Ships PAN-India</span>
          </div>

          {stockLabel?.tone === "warning" && (
            <div className="flex items-center gap-2 text-amber-700 font-medium">
              <span>⏳</span>
              <span>Limited stock — restock not guaranteed</span>
            </div>
          )}
        </div>
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}