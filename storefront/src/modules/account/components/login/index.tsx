"use client"

import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import Input from "@modules/common/components/input"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { login } from "@lib/data/customer"
import { useActionState } from "react"
import { InformationCircle } from "@medusajs/icons"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="text-large-semi uppercase mb-2">Welcome back</h1>
      <p className="text-center text-base-regular text-ui-fg-subtle mb-6">
        Sign in to access your Checkered Collectibles account.
      </p>

      {/* NEW: Clear banner explaining the account requirement */}
      <div className="w-full bg-blue-50 border border-blue-200 text-blue-900 text-sm p-3 rounded-xl flex items-start gap-3 mb-8 shadow-sm">
        <InformationCircle className="mt-0.5 shrink-0 text-blue-600" />
        <p>
          <strong>Guest checkout is disabled.</strong> To keep drops fair and secure for all collectors, you must have an account to purchase.
        </p>
      </div>

      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />

          <div className="flex flex-col gap-y-1">
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              data-testid="password-input"
            />
            {/* MOVED: Forgot Password is now contextual to the password field */}
            <div className="flex justify-end w-full mt-1">
              <button
                type="button"
                onClick={() => setCurrentView(LOGIN_VIEW.RESET_REQ)}
                className="text-sm text-ui-fg-interactive hover:text-blue-600 underline underline-offset-4 transition-colors"
                data-testid="forgot-password-button"
              >
                Forgot password?
              </button>
            </div>
          </div>
        </div>

        <ErrorMessage error={message} data-testid="login-error-message" />

        <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
          Sign in
        </SubmitButton>
      </form>

      {/* UPGRADED: Distinct section for new users */}
      <div className="w-full flex flex-col items-center mt-10 pt-8 border-t border-ui-border-base">
        <span className="text-ui-fg-base font-medium mb-4">
          New to Checkered Collectibles?
        </span>
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="w-full border-2 border-ui-border-strong text-ui-fg-base rounded-full py-2.5 font-medium hover:bg-ui-bg-subtle transition-colors shadow-sm"
          data-testid="register-button"
        >
          Create an Account
        </button>
      </div>
    </div>
  )
}

export default Login