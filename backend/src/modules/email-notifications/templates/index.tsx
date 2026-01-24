import { ReactNode } from "react"
import { MedusaError } from "@medusajs/framework/utils"

import { InviteUserEmail, INVITE_USER, isInviteUserData } from "./invite-user"
import {
  OrderPlacedTemplate,
  ORDER_PLACED,
  isOrderPlacedTemplateData,
} from "./order-placed"
import {
  OrderShippedTemplate,
  ORDER_SHIPPED,
  isOrderShippedTemplateData,
} from "./order-shipped"
// 👇 ADDED IMPORT
import {
  OrderDeliveredTemplate,
  ORDER_DELIVERED,
  isOrderDeliveredTemplateData,
} from "./order-delivered"
import {
  PasswordResetEmail,
  PASSWORD_RESET,
  isPasswordResetData,
} from "./password-reset"
import {
  CartAbandonedEmail,
  CART_ABANDONED,
  isCartAbandonedData,
} from "./cart-abandoned"

export const EmailTemplates = {
  INVITE_USER,
  ORDER_PLACED,
  ORDER_SHIPPED,
  ORDER_DELIVERED, // 👈 Added Key
  PASSWORD_RESET,
  CART_ABANDONED,
} as const

export type EmailTemplateType = keyof typeof EmailTemplates

export function generateEmailTemplate(
  templateKey: string,
  data: unknown
): ReactNode {
  switch (templateKey) {
    case EmailTemplates.INVITE_USER:
      if (!isInviteUserData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.INVITE_USER}"`
        )
      }
      return <InviteUserEmail {...data} />

    case EmailTemplates.ORDER_PLACED:
      if (!isOrderPlacedTemplateData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.ORDER_PLACED}"`
        )
      }
      return <OrderPlacedTemplate {...data} />

    case EmailTemplates.ORDER_SHIPPED:
      if (!isOrderShippedTemplateData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.ORDER_SHIPPED}"`
        )
      }
      return <OrderShippedTemplate {...data} />

    // 👇 ADDED NEW CASE
    case EmailTemplates.ORDER_DELIVERED:
      if (!isOrderDeliveredTemplateData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.ORDER_DELIVERED}"`
        )
      }
      return <OrderDeliveredTemplate {...data} />

    case EmailTemplates.PASSWORD_RESET:
      if (!isPasswordResetData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.PASSWORD_RESET}"`
        )
      }
      return <PasswordResetEmail {...data} />

    case EmailTemplates.CART_ABANDONED:
      if (!isCartAbandonedData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.CART_ABANDONED}"`
        )
      }
      return <CartAbandonedEmail {...data} />

    default:
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown template key: "${templateKey}"`
      )
  }
}

export {
  InviteUserEmail,
  OrderPlacedTemplate,
  OrderShippedTemplate,
  OrderDeliveredTemplate, // 👈 Added Export
  PasswordResetEmail,
  CartAbandonedEmail,
}