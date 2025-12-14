"use client"
import { sdk } from "@lib/config"
import { Button } from "@medusajs/ui"

// include with Next.js 13+


export default function LoginGoogle() {
    const loginWithGoogle = async () => {
        const result = await sdk.auth.login("customer", "google", {})

        if (typeof result === "object" && result.location) {
            // redirect to Google for authentication
            window.location.href = result.location

            return
        }

        if (typeof result !== "string") {
            // result failed, show an error
            alert("Authentication failed")
            return
        }

        // Customer was previously authenticated, and its token is now stored in the JS SDK.
        // all subsequent requests are authenticated
        const { customer } = await sdk.store.customer.retrieve()

        console.log(customer)
    }

    return (
        <Button
            size="large"
            className={"w-full mt-6"}
            onClick={loginWithGoogle}
            type="button"
            //   type="submit"
            //   isLoading={pending}
            variant={"secondary"}
        //   disabled={disabled}
        >
            Login with Google
        </Button>
    )
}