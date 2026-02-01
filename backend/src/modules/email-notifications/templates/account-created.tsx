import * as React from "react"
import { Text, Section, Img, Button, Hr, Container } from "@react-email/components"
import { Base } from "./base"

export const ACCOUNT_CREATED = "account-created"

export interface AccountCreatedTemplateProps {
    customer: {
        first_name: string
        last_name: string
        email: string
    }
    preview?: string
}

export const isAccountCreatedTemplateData = (
    data: any
): data is AccountCreatedTemplateProps =>
    typeof data?.customer === "object" && typeof data?.customer?.email === "string"

export const AccountCreatedTemplate: React.FC<AccountCreatedTemplateProps> & {
    PreviewProps: AccountCreatedTemplateProps
} = ({ customer, preview = "Welcome to the Checkered Crew! 🏁" }) => {

    const storeUrl = "https://checkered.in/store"
    const accountUrl = "https://checkered.in/account"

    return (
        <Base preview={preview}>
            <Section>
                {/* HEADER LOGO */}
                <Img
                    src="https://checkered.in/images/logo.png"
                    alt="Checkered Collectibles"
                    className="mx-auto w-28 mb-6"
                />

                {/* WELCOME HEADLINE */}
                <Text
                    style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        textAlign: "center",
                        margin: "0 0 20px",
                        color: "#111",
                    }}
                >
                    Welcome to the Fast Lane! 🏁
                </Text>

                <Text style={{ margin: "0 0 15px", fontSize: "16px" }}>
                    Hi {customer.first_name || "Collector"},
                </Text>

                <Text style={{ margin: "0 0 20px", lineHeight: "1.5", color: "#444" }}>
                    Thanks for creating an account with <strong>Checkered Collectibles</strong>. You are now officially part of the crew!
                </Text>

                <Text style={{ margin: "0 0 20px", lineHeight: "1.5", color: "#444" }}>
                    With your account, you can now:
                </Text>

                <ul style={{ color: "#444", paddingLeft: "20px", marginBottom: "30px" }}>
                    <li style={{ marginBottom: "8px" }}>🚀 Checkout faster with saved details.</li>
                    <li style={{ marginBottom: "8px" }}>📦 Track your orders in real-time.</li>
                    <li style={{ marginBottom: "8px" }}>💎 Access exclusive drops & history.</li>
                </ul>

                {/* PRIMARY CTA */}
                <Section style={{ textAlign: "center", margin: "20px 0 40px" }}>
                    <Button
                        href={storeUrl}
                        style={{
                            backgroundColor: "#111", // Brand Black
                            color: "#ffffff",
                            padding: "14px 28px",
                            borderRadius: "4px",
                            fontSize: "16px",
                            fontWeight: "bold",
                            textDecoration: "none",
                            display: "inline-block",
                        }}
                    >
                        Start Your Collection
                    </Button>
                </Section>

                <Hr style={{ borderColor: "#eee", margin: "20px 0" }} />

                {/* ACCOUNT MANAGE LINK */}
                <Text style={{ fontSize: "14px", color: "#666", textAlign: "center" }}>
                    Need to update your details?{" "}
                    <a href={accountUrl} style={{ color: "#111", textDecoration: "underline" }}>
                        Manage your account here
                    </a>
                    .
                </Text>

                {/* SOCIAL LINKS */}
                <Section style={{
                    marginTop: "30px",
                    backgroundColor: "#f9f9f9",
                    padding: "20px",
                    borderRadius: "8px",
                    textAlign: "center"
                }}>
                    <Text style={{ fontSize: "14px", color: "#444", fontWeight: "bold", marginBottom: "15px" }}>
                        Join the Collector's Community 🏎️
                    </Text>

                    {/* Social Icons Container */}
                    <Section>
                        <table align="center" border={0} cellPadding={0} cellSpacing={0}>
                            <tr>
                                <td style={{ padding: "0 10px" }}>
                                    <a href="https://instagram.com/checkered.in" target="_blank">
                                        <Img
                                            src="https://cdn.tools.unlayer.com/social/icons/circle/instagram.png"
                                            alt="Instagram"
                                            width="40"
                                            height="40"
                                        />
                                    </a>
                                </td>
                                <td style={{ padding: "0 10px" }}>
                                    <a href="https://youtube.com/@CheckeredCollectibles" target="_blank">
                                        <Img
                                            src="https://cdn.tools.unlayer.com/social/icons/circle/youtube.png"
                                            alt="YouTube"
                                            width="40"
                                            height="40"
                                        />
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </Section>

                    <Text style={{ fontSize: "12px", color: "#888", marginTop: "15px" }}>
                        Follow us for unboxings, drops & giveaways.
                    </Text>
                </Section>

            </Section>
        </Base>
    )
}

/* -----------------------
   MOCK DATA FOR PREVIEW
------------------------ */

AccountCreatedTemplate.PreviewProps = {
    customer: {
        first_name: "Shubhankar",
        last_name: "Trivedi",
        email: "collector@example.com"
    },
    preview: "Welcome to the Checkered Crew! 🏁"
} as AccountCreatedTemplateProps

export default AccountCreatedTemplate