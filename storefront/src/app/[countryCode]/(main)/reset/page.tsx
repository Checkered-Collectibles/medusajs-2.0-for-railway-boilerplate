import { notFound } from "next/navigation"
import ResetPasswordForm from "@modules/account/components/reset-password"

type PageProps = {
    params: { countryCode: string }
    searchParams: { token?: string; email?: string }
}

export default function ResetPasswordPage({ params, searchParams }: PageProps) {
    const token = (searchParams.token || "").trim()
    const email = (searchParams.email || "").trim()

    // ✅ basic token/email presence check
    if (!token || !email) {
        notFound()
    }

    return (
        <main className="mx-auto px-2 flex flex-col items-center">
            <ResetPasswordForm
                countryCode={params.countryCode}
                token={token}
                email={email}
            />
        </main>
    )
}