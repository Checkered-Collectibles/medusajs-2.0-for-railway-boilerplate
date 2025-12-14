"use server"

import { redirect } from "next/navigation"
import { sdk } from "@lib/config"

export async function loginWithGoogleAction() {
    const result = await sdk.auth.login("customer", "google", {})

    if (typeof result === "object" && result.location) {
        redirect(result.location) // ✅ server-side redirect to Google
    }

    // if already authenticated or failed, send them somewhere sensible
    redirect("/account")
}