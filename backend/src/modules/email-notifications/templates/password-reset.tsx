import { Button, Link, Section, Text, Img, Hr } from "@react-email/components"
import { Base } from "./base"

/**
 * The key for the PasswordResetEmail template, used to identify it
 */
export const PASSWORD_RESET = "password-reset"

/**
 * The props for the PasswordResetEmail template
 */
export interface PasswordResetEmailProps {
    /**
     * The link that the customer can click to reset their password
     */
    resetLink: string
    /**
     * The preview text for the email, appears next to the subject
     * in mail providers like Gmail
     */
    preview?: string
}

/**
 * Type guard for checking if the data is of type PasswordResetEmailProps
 * @param data - The data to check
 */
export const isPasswordResetData = (data: any): data is PasswordResetEmailProps =>
    typeof data.resetLink === "string" &&
    (typeof data.preview === "string" || !data.preview)

/**
 * The PasswordResetEmail template component built with react-email
 */
export const PasswordResetEmail = ({
    resetLink,
    preview = "Reset your password for Checkered Collectibles",
}: PasswordResetEmailProps) => {
    return (
        <Base preview={preview}>
            <Section className="mt-[32px]">
                {/* Replace this with your logo URL if you have one */}
                <Img
                    src="https://checkered.in/logo.png"
                    alt="Checkered Collectibles"
                    className="mx-auto w-28"
                />
            </Section>

            <Section className="text-center">
                <Text className="text-black text-[14px] leading-[24px]">
                    We received a request to reset the password for your{" "}
                    <strong>Checkered Collectibles</strong> account.
                </Text>

                <Text className="text-black text-[14px] leading-[24px]">
                    Click the button below to set a new password.
                </Text>

                <Section className="mt-4 mb-[32px]">
                    <Button
                        className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline px-5 py-3"
                        href={resetLink}
                    >
                        Reset Password
                    </Button>
                </Section>

                <Text className="text-black text-[14px] leading-[24px]">
                    Or copy and paste this URL into your browser:
                </Text>

                <Text
                    style={{
                        maxWidth: "100%",
                        wordBreak: "break-all",
                        overflowWrap: "break-word",
                    }}
                >
                    <Link href={resetLink} className="text-blue-600 no-underline">
                        {resetLink}
                    </Link>
                </Text>
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Text className="text-[#666666] text-[12px] leading-[24px]">
                If you didn&apos;t request a password reset, you can safely ignore this email.
                For your security, this link will expire shortly. If you believe your account
                may be at risk, please reply to this email and we&apos;ll help you.
            </Text>
        </Base>
    )
}

PasswordResetEmail.PreviewProps = {
    resetLink:
        "https://checkered.in/account/reset-password?token=abc123dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd&email=test@example.com",
} as PasswordResetEmailProps

export default PasswordResetEmail