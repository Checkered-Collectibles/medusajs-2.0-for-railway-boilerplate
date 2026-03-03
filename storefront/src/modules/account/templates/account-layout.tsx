import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="flex-1" data-testid="account-page">
      <div className="flex-1 content-container h-full max-w-5xl mx-auto bg-white flex flex-col">
        <div className={`flex  ${customer ? 'justify-between small:flex-row flex-col items-start' : 'justify-center min-h-[calc(100vh-7rem)] items-center'} gap-x-20 gap-y-12 w-full py-16`}>
          {customer && <div> <AccountNav customer={customer} /></div>}
          <div className="flex-1">{children}</div>
        </div>
        <div className="flex flex-col small:flex-row justify-between small:items-center small:border-t border-gray-200 py-12 gap-8">
          <div>
            <h3 className="text-xl-semi mb-4">Got questions?</h3>
            <span className="txt-medium">
              You can email us anytime if you have any questions.
            </span>
          </div>
          <div className="w-full sm:w-fit">
            <UnderlineLink href="mailto:hello@checkered.in">
              Email Us
            </UnderlineLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
