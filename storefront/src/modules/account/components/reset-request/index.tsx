import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import Input from "@modules/common/components/input"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { resetPassword } from "@lib/data/customer"
import { useActionState } from "react"

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
      <h1 className="text-large-semi uppercase mb-6">Reset your password</h1>

      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        You&apos;ll receive an email with instructions to create a new password.
      </p>

      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
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

        {state?.success && (
          <p className="text-green-600 text-sm mt-3 text-center">
            Password reset email sent. Please check your inbox.
          </p>
        )}

        <SubmitButton className="w-full mt-6" data-testid="reset-submit-button">
          Send reset email
        </SubmitButton>
      </form>

      <div className="flex justify-center gap-5">
        <div className="text-center text-ui-fg-base text-small-regular mt-6">
          Not a member?{" "}
          <button
            onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
            className="underline"
          >
            Join us
          </button>
        </div>

        <div className="text-center text-ui-fg-base text-small-regular mt-6">
          Remember your password?{" "}
          <button
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="underline"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResetRequest