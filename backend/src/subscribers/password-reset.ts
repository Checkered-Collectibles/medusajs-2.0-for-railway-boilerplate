import { INotificationModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { BACKEND_URL } from "../lib/constants"
import { EmailTemplates } from "../modules/email-notifications/templates"

type PasswordResetEventData = {
    entity_id: string // usually the email/identifier
    token: string
    actor_type: string // "customer" | "user"
}

export default async function passwordResetHandler({
    event: { data },
    container,
}: SubscriberArgs<PasswordResetEventData>) {
    const notificationModuleService: INotificationModuleService = container.resolve(
        Modules.NOTIFICATION
    )

    try {
        const email = data.entity_id
        const token = data.token
        const actorType = data.actor_type

        // ✅ Storefront link for customers, admin link for users
        // Adjust STORE_URL to your storefront domain if you have it in constants/env.
        const STORE_URL =
            process.env.STOREFRONT_URL || "https://checkered.in"

        const resetLink =
            actorType === "customer"
                ? `${STORE_URL}/reset?token=${encodeURIComponent(
                    token
                )}&email=${encodeURIComponent(email)}`
                : `${BACKEND_URL}/reset?token=${encodeURIComponent(
                    token
                )}&email=${encodeURIComponent(email)}`

        await notificationModuleService.createNotifications({
            to: email,
            channel: "email",
            template: EmailTemplates.PASSWORD_RESET, // ✅ add this to your templates enum
            data: {
                emailOptions: {
                    replyTo: "hello@checkered.in",
                    subject: "Reset your password",
                },
                resetLink,
                preview: "Use this link to set a new password.",
            },
        })
    } catch (error) {
        console.error(error)
    }
}

export const config: SubscriberConfig = {
    event: "auth.password_reset",
}