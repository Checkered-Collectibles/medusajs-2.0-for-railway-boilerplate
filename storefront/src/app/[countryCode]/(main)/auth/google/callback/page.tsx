import { redirect } from "next/navigation"
import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

type PageProps = {
    searchParams: Record<string, string | string[] | undefined>
}

export default async function GoogleCallbackPage({ searchParams }: PageProps) {
    // Convert Next's searchParams shape to a plain Record<string, string>
    const queryParams: Record<string, string> = {}
    for (const [k, v] of Object.entries(searchParams)) {
        if (typeof v === "string") queryParams[k] = v
        else if (Array.isArray(v) && v[0]) queryParams[k] = v[0]
    }

    try {
        // ✅ Server-side callback exchange
        await sdk.auth.callback("customer", "google", queryParams)

        // ✅ Confirm customer
        const { customer } = (await sdk.store.customer.retrieve()) as {
            customer: HttpTypes.StoreCustomer
        }

        // Redirect wherever you want after login
        redirect("/account")
    } catch (e) {
        // optional: redirect to login with error
        console.log(e)
        // redirect("/account/login?error=google_auth_failed")
    }
}