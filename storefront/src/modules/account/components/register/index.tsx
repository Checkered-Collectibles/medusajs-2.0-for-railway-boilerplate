"use client"

import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"
import { useActionState, useState } from "react"
import { metaEvent } from "@lib/meta/fpixel"
import { CheckCircleSolid } from "@medusajs/icons"
import { useRouter } from "next/navigation"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()

  const signupWithTracking = async (currentState: any, formData: FormData) => {
    const email = formData.get("email")?.toString()

    // 🧪 ROBUST TEST MODE:
    // Allows you to test the full UX and Pixel firing without creating DB entries
    if (email?.includes("test-pixel")) {
      console.log("🧪 Test Mode: Simulating successful registration")
      handleSuccess() // Call the robust success handler
      return null
    }

    try {
      const error = await signup(currentState, formData)

      // If we get here without an error string, it was a silent success
      if (!error) {
        handleSuccess()
      }
      return error
    } catch (e: any) {
      // 🛡️ ROBUST REDIRECT HANDLING
      // We catch the Next.js redirect signal to prevent the browser from 
      // killing our Pixel request.
      if (e.message === "NEXT_REDIRECT" || e.digest?.startsWith("NEXT_REDIRECT")) {
        handleSuccess()
        // We catch the error, so we must return something to satisfy useActionState
        return null
      }
      throw e
    }
  }

  // Centralized Success Logic
  const handleSuccess = async () => {
    // 1. Immediately switch UI to prevent double clicks
    setIsRedirecting(true)

    // 2. Fire the Pixel
    // We do this BEFORE starting the timer to maximize network time
    metaEvent("CompleteRegistration", { status: "success" })

    // 3. Wait 2 Seconds
    // This serves two purposes:
    // A. Lets the user see the "Success" message (Better UX)
    // B. Guarantees the Pixel request reaches Facebook servers
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 4. Manually Navigate
    // Instead of re-throwing the error, we manually push to /account.
    // This is safer because re-throwing after a timeout can sometimes cause issues.
    router.push("/account")
  }

  const [message, formAction] = useActionState(signupWithTracking, null)

  // ✅ SUCCESS STATE UI
  if (isRedirecting) {
    return (
      <div className="max-w-sm flex flex-col items-center justify-center min-h-[400px] text-center gap-6 animate-in fade-in zoom-in duration-500">
        <div className="rounded-full bg-green-100 h-10 w-10 flex items-center justify-center">
          <CheckCircleSolid className="text-green-600" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold text-ui-fg-base">Welcome to the Club!</h1>
          <p className="text-ui-fg-subtle">
            Registration successful. Taking you to your account...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">
        Become a Checkered Store Member
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        Create your Checkered Member profile, and get access to an enhanced
        shopping experience.
      </p>
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="First name"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="Email"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
            required
          />
          <Input
            label="Password"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          By creating an account, you agree to Checkered Collectibles&apos;{" "}
          <LocalizedClientLink
            href="/privacy-policy"
            className="underline"
          >
            Privacy Policy
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink
            href="/terms-and-conditions"
            className="underline"
          >
            Terms of Use
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          Join
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Already a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Sign in
        </button>
        .
      </span>
    </div>
  )
}

export default Register