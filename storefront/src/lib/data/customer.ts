"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { cache } from "react"
import { removeAuthToken, removeCartId, setAuthToken } from "./cookies"
import { getSafeAuthHeaders } from "@lib/util/safeheaders"

export const getCustomer = cache(async function () {
  return await sdk.store.customer
    .retrieve({}, { next: { tags: ["customer"] }, ...(await getSafeAuthHeaders()) })
    .then(({ customer }) => customer)
    .catch(() => null)
})
export const getCustomerGroups = async () => {
  const headers = {
    ...(await getSafeAuthHeaders()),
  }

  return sdk.client
    .fetch<{ groups: any[] }>( // adjust type to your actual group DTO if you have it
      `/store/customers/me/groups`,
      {
        method: "GET",
        headers,
      }
    )
    .then(({ groups }) => groups)
    .catch(() => null)
}
export const getLoyaltyPoints = async () => {
  const headers = {
    ...(await getSafeAuthHeaders()),
  }

  return sdk.client.fetch<{ points: number }>(
    `/store/customers/me/loyalty-points`,
    {
      method: "GET",
      headers,
    }
  )
    .then(({ points }) => points)
    .catch(() => null)
}
export async function resetPassword(_currentState: unknown, formData: FormData) {
  const email = String(formData.get("email") || "").trim()

  if (!email) {
    return { success: false, error: "Email is required" }
  }

  try {
    await sdk.auth.resetPassword("customer", "emailpass", {
      identifier: email,
    })

    // Some Medusa setups return a string/redirect URL; we don't need it here.
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error?.toString?.() ?? "Failed to reset password" }
  }
}

export async function updatePassword(
  _currentState: unknown,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const email = String(formData.get("email") || "").trim()
  const password = String(formData.get("password") || "")
  const token = String(formData.get("token") || "").trim()

  if (!email) return { success: false, error: "Email is missing" }
  if (!token) return { success: false, error: "Reset token is missing" }
  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" }
  }

  try {
    // 1) Update password using reset token
    await sdk.auth.updateProvider("customer", "emailpass", { email, password }, token)

    // 2) Immediately log the user in with the new password
    const loginToken = await sdk.auth.login("customer", "emailpass", { email, password })

    setAuthToken(typeof loginToken === "string" ? loginToken : loginToken.location)
    sdk.client.clearToken()
    revalidateTag("customer")

    // 3) Redirect to account page
    // redirect("/account")
    return { success: true }
  } catch (err: any) {
    const message =
      err?.status === 401
        ? "This reset link is invalid or has expired. Please request a new one."
        : err?.message || "Failed to update password"

    return { success: false, error: message }
  }
}

export const updateCustomer = cache(async function (
  body: HttpTypes.StoreUpdateCustomer
) {
  const updateRes = await sdk.store.customer
    .update(body, {}, (await getSafeAuthHeaders()))
    .then(({ customer }) => customer)
    .catch(medusaError)

  revalidateTag("customer")
  return updateRes
})

export async function signup(_currentState: unknown, formData: FormData) {
  const password = formData.get("password") as string
  const marketingOptIn = formData.get("marketing_opt_in") === "true"
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
    metadata: {
      marketing_opt_in: marketingOptIn
    }
  }

  try {
    const token = await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password: password,
    })
    sdk.client.clearToken()

    const customHeaders = { authorization: `Bearer ${token}` }

    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm,
      {},
      customHeaders
    )

    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email: customerForm.email,
      password,
    })

    setAuthToken(typeof loginToken === 'string' ? loginToken : loginToken.location)
    sdk.client.clearToken()
    revalidateTag("customer")
    return createdCustomer
  } catch (error: any) {
    return error.toString()
  }
}

export async function login(_currentState: unknown, formData: FormData) {
  let email = formData.get("email") as string
  if (email) email = email.toLowerCase()
  const password = formData.get("password") as string

  try {
    const token = await sdk.auth.login("customer", "emailpass", { email, password })

    // Save to browser cookie
    await setAuthToken(typeof token === 'string' ? token : token.location)

    // 🚨 IMMEDIATELY CLEAR GLOBAL SDK MEMORY
    sdk.client.clearToken()

    revalidateTag("customer")
  } catch (error: any) {
    return error.toString()
  }
}
export async function signout(countryCode: string) {
  await sdk.auth.logout()
  sdk.client.clearToken() // Just to be safe
  removeAuthToken()
  removeCartId()
  revalidateTag("auth")
  revalidateTag("customer")
  redirect(`/account`)
}

export const addCustomerAddress = async (
  _currentState: unknown,
  formData: FormData
): Promise<any> => {
  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
  }

  return sdk.store.customer
    .createAddress(address, {}, (await getSafeAuthHeaders()))
    .then(({ customer }) => {
      revalidateTag("customer")
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<void> => {
  await sdk.store.customer
    .deleteAddress(addressId, (await getSafeAuthHeaders()))
    .then(() => {
      revalidateTag("customer")
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const addressId = currentState.addressId as string

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, (await getSafeAuthHeaders()))
    .then(() => {
      revalidateTag("customer")
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}
