import { Metadata } from "next"
import { redirect, notFound } from "next/navigation"

import Overview from "@modules/account/components/overview"
import { getCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"

export const metadata: Metadata = {
  title: "Account",
  description: "Overview of your account activity.",
}

type PageProps = {
  searchParams?: {
    nextPath?: string
  }
}

export default async function OverviewTemplate({ searchParams }: PageProps) {
  // 🔁 Redirect if nextPath exists
  if (searchParams?.nextPath) {
    redirect(searchParams.nextPath)
  }

  const customer = await getCustomer().catch(() => null)
  const orders = (await listOrders().catch(() => null)) || null

  if (!customer) {
    notFound()
  }

  return <Overview customer={customer} orders={orders} />
}