"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import Input from "@modules/common/components/input"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { updatePassword } from "@lib/data/customer"

type Props = {
  email: string
  token: string
  countryCode: string
}

const ResetPasswordForm = ({ email, token, countryCode }: Props) => {
  const router = useRouter()

  const [state, formAction] = useActionState(updatePassword, null)
  const [confirmPassword, setConfirmPassword] = useState("")

  // ✅ redirect after success
  useEffect(() => {
    if (state?.success) {
      router.push(`/${countryCode}/account`)
    }
  }, [state?.success, router, countryCode])

  return (
    <div className="max-w-sm w-full flex flex-col items-center px-8 py-16">
      <h1 className="text-large-semi uppercase mb-6">Set a new password</h1>

      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Enter a new password for <span className="font-semibold">{email}</span>.
      </p>

      <form className="w-full" action={formAction}>
        {/* ✅ pass token/email to server action */}
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="token" value={token} />

        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="New password"
            name="password"
            type="password"
            required
            data-testid="new-password-input"
          />

          {/* client-only confirm password check */}
          <Input
            label="Confirm password"
            name="confirm_password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            data-testid="confirm-password-input"
          />
        </div>

        {/* Optional: simple mismatch warning (client-side only) */}
        {confirmPassword && (
          <p className="text-sm mt-2 text-ui-fg-subtle">
            Make sure both passwords match before submitting.
          </p>
        )}

        {state?.error && (
          <ErrorMessage error={state.error} data-testid="reset-error-message" />
        )}

        {state?.success && (
          <p className="text-green-600 text-sm mt-3 text-center">
            Password updated successfully. Redirecting…
          </p>
        )}

        <SubmitButton
          className="w-full mt-6"
          disabled={state?.success}
        >
          Update password
        </SubmitButton>
      </form>
    </div>
  )
}

export default ResetPasswordForm