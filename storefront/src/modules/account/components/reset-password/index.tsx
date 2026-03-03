"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import Input from "@modules/common/components/input"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { updatePassword } from "@lib/data/customer"
import { CheckCircleSolid, ExclamationCircleSolid } from "@medusajs/icons"

type Props = {
  email: string
  token: string
  countryCode: string
}

const ResetPasswordForm = ({ email, token, countryCode }: Props) => {
  const router = useRouter()

  const [state, formAction] = useActionState(updatePassword, null)

  // State for live password validation
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Redirect after success
  useEffect(() => {
    if (state?.success) {
      // Slight delay so they can read the success message before it jumps
      const timer = setTimeout(() => {
        router.push(`/account`)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [state?.success, router, countryCode])

  const isMismatch = confirmPassword.length > 0 && password !== confirmPassword

  return (
    <div className="max-w-sm w-full flex flex-col items-center mx-auto px-4 py-16">
      <h1 className="text-large-semi uppercase mb-2">Set New Password</h1>

      <p className="text-center text-base-regular text-ui-fg-subtle mb-8">
        Enter a new secure password for <strong className="text-ui-fg-base">{email}</strong>.
      </p>

      <form className="w-full flex flex-col" action={formAction}>
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="token" value={token} />

        <div className="flex flex-col w-full gap-y-4">
          <Input
            label="New password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="new-password-input"
          />

          <div className="flex flex-col gap-y-1">
            <Input
              label="Confirm password"
              name="confirm_password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              data-testid="confirm-password-input"
            />
            {/* Live Client-Side Validation Error */}
            {isMismatch && (
              <span className="text-xs text-red-500 flex items-center gap-1 mt-1 animate-in fade-in">
                <ExclamationCircleSolid className="w-4 h-4" /> Passwords do not match
              </span>
            )}
          </div>
        </div>

        {state?.error && (
          <ErrorMessage error={state.error} data-testid="reset-error-message" />
        )}

        {state?.success && (
          <div className="mt-6 bg-green-50 border border-green-200 text-green-900 text-sm p-3 rounded-xl flex items-center justify-center gap-2 shadow-sm animate-in fade-in">
            <CheckCircleSolid className="text-green-600" />
            <p className="font-medium">Password updated! Redirecting...</p>
          </div>
        )}

        <SubmitButton
          className="w-full mt-8"
          disabled={state?.success || isMismatch || !password || !confirmPassword}
        >
          Update Password
        </SubmitButton>
      </form>
    </div>
  )
}

export default ResetPasswordForm