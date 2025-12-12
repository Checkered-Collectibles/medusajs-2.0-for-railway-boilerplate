import { getCustomer } from "@lib/data/customer"
import PostHogCustomerIdentityClient from "@lib/posthog/client"
import AccountLayout from "@modules/account/templates/account-layout"

export default async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  const customer = await getCustomer().catch(() => null)

  return (
    <>
      <PostHogCustomerIdentityClient
        customer={customer}
        registerProps={{ app: "storefront" }}
      />
      <AccountLayout customer={customer}>
        {customer ? dashboard : login}
      </AccountLayout>
    </>
  )
}
