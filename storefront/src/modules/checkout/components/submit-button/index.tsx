"use client"

import { Button } from "@medusajs/ui"
import React from "react"
import { useFormStatus } from "react-dom"

export function SubmitButton({
  children,
  variant = "primary",
  className,
  disabled = false,
  onClick, // 👈 1. Destructure onClick
  "data-testid": dataTestId,
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "transparent" | "danger" | null
  className?: string
  disabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void // 👈 2. Add type definition
  "data-testid"?: string
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      size="large"
      className={className}
      type="submit"
      isLoading={pending}
      variant={variant || "primary"}
      disabled={disabled}
      onClick={onClick} // 👈 3. Pass it to the UI component
      data-testid={dataTestId}
    >
      {children}
    </Button>
  )
}