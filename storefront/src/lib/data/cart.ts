"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { omit } from "lodash"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { getAuthHeaders, getCartId, removeCartId, setCartId } from "./cookies"
import { getProductsById } from "./products"
import { getRegion } from "./regions"
import { addCustomerAddress } from "./customer"

export async function retrieveCart(id?: string) {
  const cartId = id || getCartId()

  if (!cartId) {
    return null
  }

  return await sdk.store.cart
    .retrieve(
      cartId,
      {
        // expand items and their products (including tags)
        fields: "+items.*, +items.product.*, +items.product.tags.*",
      },
      { next: { tags: ["cart"] }, ...getAuthHeaders() }
    )
    .then(({ cart }) => cart)
    .catch(() => {
      return null
    })
}

export async function getOrSetCart(countryCode: string) {
  let cart = await retrieveCart()
  const region = await getRegion(countryCode)

  if (!region) throw new Error(`Region not found for country code: ${countryCode}`)

  if (!cart) {
    const cartResp = await sdk.store.cart.create({ region_id: region.id })
    cart = cartResp.cart
    setCartId(cart.id)
    revalidateTag("cart")
  }
  // keep region in sync
  if (cart && cart.region_id !== region.id) {
    await sdk.store.cart.update(cart.id, { region_id: region.id })
    revalidateTag("cart")
    cart = await retrieveCart()
  }

  // Attach cart to logged-in customer so customer_id is set
  if (cart && !cart.customer_id) {
    const authHeaders = getAuthHeaders()
    const isLoggedIn = authHeaders && Object.keys(authHeaders).length > 0

    if (isLoggedIn) {
      try {
        await sdk.store.cart.transferCart(cart.id, {}, authHeaders)
        revalidateTag("cart")
        cart = await retrieveCart()
      } catch {
        // ignore; cart can remain guest if session isn't valid
      }
    }
  }

  return cart
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = getCartId()
  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  return sdk.store.cart
    .update(cartId, data, {}, getAuthHeaders())
    .then(({ cart }) => {
      revalidateTag("cart")
      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  const cart = await getOrSetCart(countryCode)
  if (!cart) {
    throw new Error("Error retrieving or creating cart")
  }

  await sdk.store.cart
    .createLineItem(
      cart.id,
      {
        variant_id: variantId,
        quantity,
      },
      {},
      getAuthHeaders()
    )
    .then(() => {
      revalidateTag("cart")
    })
    .catch(medusaError)
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item")
  }

  const cartId = getCartId()
  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, getAuthHeaders())
    .then(() => {
      revalidateTag("cart")
    })
    .catch(medusaError)
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when deleting line item")
  }

  const cartId = getCartId()
  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item")
  }

  await sdk.store.cart
    .deleteLineItem(cartId, lineId)
    .then(() => {
      revalidateTag("cart")
    })
    .catch(medusaError)
  revalidateTag("cart")
}

export async function enrichLineItems(
  lineItems:
    | HttpTypes.StoreCartLineItem[]
    | HttpTypes.StoreOrderLineItem[]
    | null,
  regionId: string
) {
  if (!lineItems) return []

  // Prepare query parameters
  const queryParams = {
    ids: lineItems.map((lineItem) => lineItem.product_id!),
    regionId: regionId,
  }

  // Fetch products by their IDs
  const products = await getProductsById(queryParams)
  // If there are no line items or products, return an empty array
  if (!lineItems?.length || !products) {
    return []
  }

  // Enrich line items with product and variant information
  const enrichedItems = lineItems.map((item) => {
    const product = products.find((p: any) => p.id === item.product_id)
    const variant = product?.variants?.find(
      (v: any) => v.id === item.variant_id
    )

    // If product or variant is not found, return the original item
    if (!product || !variant) {
      return item
    }

    // If product and variant are found, enrich the item
    return {
      ...item,
      variant: {
        ...variant,
        product: omit(product, "variants"),
      },
    }
  }) as HttpTypes.StoreCartLineItem[]

  return enrichedItems
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  return sdk.store.cart
    .addShippingMethod(
      cartId,
      { option_id: shippingMethodId },
      {},
      getAuthHeaders()
    )
    .then(() => {
      revalidateTag("cart")
    })
    .catch(medusaError)
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  input: {
    provider_id: string
    data?: Record<string, unknown>
  }
) {
  return sdk.store.payment
    .initiatePaymentSession(cart, input, {}, getAuthHeaders())
    .then((resp) => {
      revalidateTag("cart")
      return resp
    })
    .catch(medusaError)
}

export async function applyPromotions(codes: string[]) {
  try {
    const cartId = getCartId()
    if (!cartId) {
      throw new Error("No existing cart found")
    }

    await updateCart({ promo_codes: codes })
      .then(() => {
        revalidateTag("cart")
      })
      .catch(medusaError)
  } catch (e) {
    return "Invalid Promo Code"
  }
}

export async function applyGiftCard(code: string) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function removeDiscount(code: string) {
  // const cartId = getCartId()
  // if (!cartId) return "No cartId cookie found"
  // try {
  //   await deleteDiscount(cartId, code)
  //   revalidateTag("cart")
  // } catch (error: any) {
  //   throw error
  // }
}

export async function removeGiftCard(
  codeToRemove: string,
  giftCards: any[]
  // giftCards: GiftCard[]
) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, {
  //       gift_cards: [...giftCards]
  //         .filter((gc) => gc.code !== codeToRemove)
  //         .map((gc) => ({ code: gc.code })),
  //     }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string
  try {
    await applyPromotions([code])
  } catch (e: any) {
    return e.message
  }
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(currentState: unknown, formData: FormData) {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }
    const cartId = getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    const data = {
      shipping_address: {
        first_name: formData.get("shipping_address.first_name"),
        last_name: formData.get("shipping_address.last_name"),
        address_1: formData.get("shipping_address.address_1"),
        address_2: "",
        company: formData.get("shipping_address.company"),
        postal_code: formData.get("shipping_address.postal_code"),
        city: formData.get("shipping_address.city"),
        country_code: formData.get("shipping_address.country_code"),
        province: formData.get("shipping_address.province"),
        phone: formData.get("shipping_address.phone"),
      },
      email: formData.get("email"),
    } as any
    const shippingPhone = String(formData.get("shipping_address.phone") || "").trim()
    const sameAsBilling = formData.get("same_as_billing")
    if (sameAsBilling === "on") data.billing_address = data.shipping_address

    if (sameAsBilling !== "on")
      data.billing_address = {
        first_name: formData.get("billing_address.first_name"),
        last_name: formData.get("billing_address.last_name"),
        address_1: formData.get("billing_address.address_1"),
        address_2: "",
        company: formData.get("billing_address.company"),
        postal_code: formData.get("billing_address.postal_code"),
        city: formData.get("billing_address.city"),
        country_code: formData.get("billing_address.country_code"),
        province: formData.get("billing_address.province"),
        phone: formData.get("billing_address.phone"),
      }
    await updateCart(data)
    const updatedCart = await updateCart(data)

    // ✅ Save address to customer account ONLY if logged in
    // (guests will not have a customer session, so this would 401)
    if (updatedCart?.customer_id) {
      const customerAddressForm = new FormData()
      customerAddressForm.set("first_name", String(formData.get("shipping_address.first_name") || ""))
      customerAddressForm.set("last_name", String(formData.get("shipping_address.last_name") || ""))
      customerAddressForm.set("company", String(formData.get("shipping_address.company") || ""))
      customerAddressForm.set("address_1", String(formData.get("shipping_address.address_1") || ""))
      customerAddressForm.set("address_2", "")
      customerAddressForm.set("city", String(formData.get("shipping_address.city") || ""))
      customerAddressForm.set("postal_code", String(formData.get("shipping_address.postal_code") || ""))
      customerAddressForm.set("province", String(formData.get("shipping_address.province") || ""))
      customerAddressForm.set("country_code", String(formData.get("shipping_address.country_code") || ""))
      customerAddressForm.set("phone", shippingPhone)

      // don’t block checkout if saving address fails
      try {
        // await addCustomerAddress(null, customerAddressForm)
      } catch {
        // ignore
      }
    }
  } catch (e: any) {
    return e.message
  }

  redirect(
    `/checkout?step=delivery`
  )
}

export async function placeOrder() {
  const cartId = getCartId()
  if (!cartId) {
    throw new Error("No existing cart found when placing an order")
  }

  const cartRes = await sdk.store.cart
    .complete(cartId, {}, getAuthHeaders())
    .then((cartRes) => {
      revalidateTag("cart")
      return cartRes
    })
    .catch(medusaError)

  if (cartRes?.type === "order") {
    const countryCode =
      cartRes.order.shipping_address?.country_code?.toLowerCase()
    removeCartId()
    redirect(`/order/confirmed/${cartRes?.order.id}`)
  }

  return cartRes.cart
}

export async function deleteCartCompletely(cartId?: string) {
  const id = cartId || getCartId()

  // Nothing to delete — ensure cookie is cleared anyway
  if (!id) {
    removeCartId()
    revalidateTag("cart")
    return { deleted: true, cartId: null }
  }

  try {
    // Preferred: delete cart in Medusa (if supported by your Medusa version)
    // Many versions expose: sdk.store.cart.delete(cartId, config?, headers?)
    await (sdk.store.cart as any).delete(id, {}, getAuthHeaders())

    // Clear local cart reference
    removeCartId()
    revalidateTag("cart")

    return { deleted: true, cartId: id }
  } catch (e) {
    // Fallback: if delete endpoint isn't available / fails,
    // we still reset the session cart by removing the cookie.
    removeCartId()
    revalidateTag("cart")

    return { deleted: true, cartId: id, fallback: true }
  }
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart({ region_id: region.id })
    revalidateTag("cart")
  }

  revalidateTag("regions")
  revalidateTag("products")

  redirect(`/${currentPath}`)
}

export async function applyLoyaltyPointsOnCart() {
  const cartId = await getCartId()
  const headers = {
    ...(getAuthHeaders()),
  }

  return await sdk.client.fetch<{
    cart: HttpTypes.StoreCart & {
      promotions: HttpTypes.StorePromotion[]
    }
  }>(`/store/carts/${cartId}/loyalty-points`, {
    method: "POST",
    headers,
  })
    .then(async (result) => {
      revalidateTag("cart")
      return result
    })
}

export async function removeLoyaltyPointsOnCart() {
  const cartId = await getCartId()
  const headers = {
    ...(getAuthHeaders()),
  }
  // const next = {
  //   ...(await getCacheOptions("carts")),
  // }

  return await sdk.client.fetch<{
    cart: HttpTypes.StoreCart & {
      promotions: HttpTypes.StorePromotion[]
    }
  }>(`/store/carts/${cartId}/loyalty-points`, {
    method: "DELETE",
    headers,
  })
    .then(async (result) => {
      revalidateTag("cart")

      return result
    })
}