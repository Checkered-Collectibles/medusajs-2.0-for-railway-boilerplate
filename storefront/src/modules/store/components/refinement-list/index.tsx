"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import SortProducts, { SortOptions } from "./sort-products"

type RefinementListProps = {
  sortBy: SortOptions
  inStock?: boolean // 👈 1. Add new prop type
  search?: boolean
  'data-testid'?: string
}

const RefinementList = ({
  sortBy,
  inStock = false, // 👈 2. Destructure with default
  'data-testid': dataTestId
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`)
  }

  return (
    <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">
      <SortProducts
        sortBy={sortBy}
        inStock={inStock} // 👈 3. Pass it down to the child component
        setQueryParams={setQueryParams}
        data-testid={dataTestId}
      />
    </div>
  )
}

export default RefinementList