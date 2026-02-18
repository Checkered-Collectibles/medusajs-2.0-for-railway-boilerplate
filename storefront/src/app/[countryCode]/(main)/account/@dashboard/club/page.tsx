import { Metadata } from "next"
import { notFound } from "next/navigation"

// Import the component we built earlier
import { getCustomer } from "@lib/data/customer"
import MembershipCard from "@modules/account/components/club/card"

export const metadata: Metadata = {
  title: "Club",
  description: "Manage your Checkered Club subscription.",
}

export default async function MembershipPage() {
  const customer = await getCustomer()

  if (!customer) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="membership-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">My Checkered Club</h1>
        <p className="text-base-regular text-ui-fg-subtle">
          View your current plan status, manage auto-renewal, or update your payment method.
        </p>
      </div>

      <div className="flex flex-col gap-y-8 w-full">
        {/* The Card handles all the logic (Active, Cancelled, None) */}
        <MembershipCard />
      </div>
    </div>
  )
}