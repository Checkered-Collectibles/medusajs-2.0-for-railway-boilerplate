"use client"

import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import Input from "@modules/common/components/input"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { resetPassword } from "@lib/data/customer"
import { useActionState } from "react"
import { CheckCircleSolid } from "@medusajs/icons"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const ResetRequest = ({ setCurrentView }: Props) => {
  const [state, formAction] = useActionState(resetPassword, null)

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="reset-page"
    >
      <h1 className="text-large-semi uppercase mb-2">Reset Password</h1>

      <p className="text-center text-base-regular text-ui-fg-subtle mb-8">
        Enter your email address and we'll send you a link to securely reset your password.
      </p>

      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            data-testid="email-input"
          />
        </div>

        {state?.error && (
          <ErrorMessage
            error={state.error}
            data-testid="reset-error-message"
          />
        )}

        {/* UPGRADED: Highly visible success state */}
        {state?.success && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-900 text-sm p-4 rounded-xl flex items-start gap-3 shadow-sm animate-in fade-in">
            <CheckCircleSolid className="mt-0.5 shrink-0 text-green-600" />
            <p>
              <strong>Reset link sent!</strong> Please check your inbox (and spam folder) for instructions to create a new password.
            </p>
          </div>
        )}

        <SubmitButton className="w-full mt-6" data-testid="reset-submit-button">
          Send Reset Link
        </SubmitButton>
      </form>

      {/* UPGRADED: Structured navigation matching the Login/Register flow */}
      <div className="w-full flex justify-center mt-8 pt-6 border-t border-ui-border-base">
        <span className="text-ui-fg-base text-sm">
          Remember your password?{" "}
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="font-bold text-ui-fg-interactive hover:text-blue-600 underline underline-offset-4 transition-colors"
          >
            Sign in here
          </button>
        </span>
      </div>

      <div className="w-full flex justify-center mt-4">
        <span className="text-ui-fg-base text-sm">
          Need an account?{" "}
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
            className="font-bold text-ui-fg-interactive hover:text-blue-600 underline underline-offset-4 transition-colors"
          >
            Join us
          </button>
        </span>
      </div>
    </div>
  )
}

export default ResetRequest