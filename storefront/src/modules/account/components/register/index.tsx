"use client"

import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"
import { useActionState } from "react"
// 1. Import UI components
import { Checkbox, Label } from "@medusajs/ui"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {

  const signupWithFlag = async (currentState: any, formData: FormData) => {
    const result = await signup(currentState, formData)

    const isSuccess = typeof result !== "string"

    if (isSuccess) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("new_registration", "true")
      }
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

        {/* --- 2. MARKETING CHECKBOX --- */}
        <label
          htmlFor="marketing_opt_in"
          className="group/input flex items-start space-x-3 mt-4 bg-green-100 p-1 rounded-md border border-green-300 overflow-hidden relative cursor-pointer hover:bg-green-50 transition-colors"
        >
          {/* Checkbox Wrapper */}
          <div className="flex items-center h-5">
            <Checkbox
              id="marketing_opt_in"
              name="marketing_opt_in"
              value="true"
            />
          </div>

          <div className="text-small-regular leading-5 text-ui-fg-base select-none z-10">
            Want early access?
            <br />
            <span className="font-bold text-green-900">Yes, notify me</span> when new cars land.
          </div>

          {/* Star: Added pointer-events-none so it doesn't block clicks */}
          <div className="absolute -right-2 -bottom-1 text-5xl opacity-30 pointer-events-none duration-200 group-hover/input:rotate-12">
            ⭐️
          </div>
        </label>
        {/* ----------------------------- */}

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