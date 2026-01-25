"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation" // 1. Import hooks
import { metaEvent } from "@lib/meta/fpixel"

export default function RegistrationFlusher() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        // 2. This now runs on mount AND whenever the URL changes
        const isNewUser = typeof window !== "undefined" ? sessionStorage.getItem("new_registration") : null

        if (isNewUser === "true") {
            console.log("✅ Pixel Flusher: Detecting new registration. Firing event.")

            metaEvent("CompleteRegistration", {
                status: "success",
                content_name: "New Member"
            })

            sessionStorage.removeItem("new_registration")
        }

        // 3. Add pathname and searchParams to dependency array
    }, [pathname, searchParams])

    return null
}