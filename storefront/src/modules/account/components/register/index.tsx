"use client"

import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import Input from "@modules/common/components/input"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"
import { useActionState, useState } from "react"
import { Checkbox } from "@medusajs/ui"

// ------------------------------------
// 1. TYPO CHECKER UTILITY
// ------------------------------------
const commonDomains = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "rediffmail.com",
]

const suggestEmail = (email: string): string | null => {
  if (!email || !email.includes("@")) return null
  const [user, domain] = email.split("@")
  if (!domain) return null
  if (commonDomains.includes(domain)) return null

  const typoMap: Record<string, string> = {
    "gamil.com": "gmail.com",
    "gmial.com": "gmail.com",
    "gmai.com": "gmail.com",
    "gmil.com": "gmail.com",
    "yaho.com": "yahoo.com",
    "yahoo.co": "yahoo.com",
    "outlok.com": "outlook.com",
    "hotmil.com": "hotmail.com"
  }

  if (typoMap[domain]) {
    return `${user}@${typoMap[domain]}`
  }
  return null
}

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [emailInput, setEmailInput] = useState("")
  const [suggestion, setSuggestion] = useState<string | null>(null)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase()
    setEmailInput(val)
    setSuggestion(suggestEmail(val))
  }

  const applySuggestion = () => {
    if (suggestion) {
      setEmailInput(suggestion)
      setSuggestion(null)
    }
  }

  const signupWithFlag = async (currentState: any, formData: FormData) => {
    const email = formData.get("email")
    if (email) {
      formData.set("email", email.toString().toLowerCase())
    }
    const result = await signup(currentState, formData)
    const isSuccess = typeof result !== "string"

    if (isSuccess && typeof window !== "undefined") {
      sessionStorage.setItem("new_registration", "true")
    }
    return result
  }

  const [message, formAction] = useActionState(signupWithFlag, null)

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-2">
        Become a Member
      </h1>
      <p className="text-center text-base-regular text-ui-fg-subtle mb-8">
        Create your Checkered profile to access drops and manage your collection.
      </p>

      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-4">
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div>
            <Input
              label="Email"
              name="email"
              required
              type="email"
              autoComplete="email"
              data-testid="email-input"
              value={emailInput}
              onChange={handleEmailChange}
            />
            {suggestion && (
              <div className="mt-2 p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                <span>Did you mean <strong className="font-semibold">{suggestion}</strong>?</span>
                <button
                  type="button"
                  onClick={applySuggestion}
                  className="bg-yellow-200 hover:bg-yellow-300 text-yellow-900 px-3 py-1 rounded-md font-bold transition-colors shadow-sm"
                >
                  Fix it
                </button>
              </div>
            )}
          </div>

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

        {/* MARKETING CHECKBOX */}
        <div className="group/input flex items-start space-x-3 mt-6 bg-green-50/50 p-3 rounded-xl border border-green-200/60 overflow-hidden relative cursor-pointer hover:bg-green-50 transition-colors shadow-sm">
          <div className="flex items-center h-5 mt-0.5">
            <Checkbox
              id="marketing_opt_in"
              name="marketing_opt_in"
              value="true"
            />
          </div>
          <label
            htmlFor="marketing_opt_in"
            className="text-small-regular leading-5 text-ui-fg-base select-none z-10 cursor-pointer w-full"
          >
            Want early access? <br />
            <span className="font-bold text-green-700">Yes, notify me</span> when new cars land.
          </label>
          <div className="absolute -right-2 -bottom-2 text-4xl opacity-20 pointer-events-none group-hover/input:rotate-12 transition-transform duration-300">
            ⭐️
          </div>
        </div>

        <ErrorMessage error={message} data-testid="register-error" />

        <span className="text-center text-ui-fg-subtle text-xs mt-6 px-4">
          By creating an account, you agree to our{" "}
          <LocalizedClientLink
            href="/legal/privacy-policy"
            className="underline hover:text-ui-fg-base"
          >
            Privacy Policy
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink
            href="/legal/terms-and-conditions"
            className="underline hover:text-ui-fg-base"
          >
            Terms of Use
          </LocalizedClientLink>
          .
        </span>

        <SubmitButton className="w-full mt-6" data-testid="register-button">
          Create Account
        </SubmitButton>
      </form>

      <div className="w-full flex justify-center mt-8 pt-6 border-t border-ui-border-base">
        <span className="text-ui-fg-base text-sm">
          Already a member?{" "}
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="font-bold text-ui-fg-interactive hover:text-blue-600 underline underline-offset-4 transition-colors"
          >
            Sign in here
          </button>
        </span>
      </div>
    </div>
  )
}

export default Register