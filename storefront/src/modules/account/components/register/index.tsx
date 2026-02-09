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
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "rediffmail.com", // Popular in India
]

const suggestEmail = (email: string): string | null => {
  if (!email || !email.includes("@")) return null

  const [user, domain] = email.split("@")
  if (!domain) return null

  // Check for exact match (if valid, return null)
  if (commonDomains.includes(domain)) return null

  // Find close match (simple Levenshtein-like logic or simpler check)
  for (const common of commonDomains) {
    // If the domain is very similar (e.g. gamil vs gmail)
    // We check if it starts with the same letter and has similar length
    if (
      domain !== common &&
      Math.abs(domain.length - common.length) <= 2 &&
      (domain.includes(common.replace(".com", "")) || common.includes(domain.replace(".com", "")))
    ) {
      // This is a basic check. For production, libraries like 'mailcheck' are more robust.
      // But for specifically "gamil", "yaho", etc, we can hardcode specific maps:
    }
  }

  // Hardcoded map for most common Indian typos
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
  // 2. State for Email Suggestion
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
    // ⬇️ Force email to lowercase before sending to backend
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

          {/* 3. MODIFIED EMAIL INPUT */}
          <div>
            <Input
              label="Email"
              name="email"
              required
              type="email"
              autoComplete="email"
              data-testid="email-input"
              value={emailInput}
              onChange={handleEmailChange} // Hook up the change handler
            />
            {/* 4. SUGGESTION ALERT */}
            {suggestion && (
              <div
                className="mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex items-center justify-between animate-in fade-in slide-in-from-top-1"
              >
                <span>Did you mean <strong>{suggestion}</strong>?</span>
                <button
                  type="button"
                  onClick={applySuggestion}
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-900 px-2 py-0.5 rounded font-bold ml-2 transition-colors"
                >
                  Yes, fix it
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
        <div className="group/input flex items-start space-x-3 mt-4 bg-green-50/50 p-2 rounded-md border border-green-200/60 overflow-hidden relative cursor-pointer hover:bg-green-50 transition-colors">
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