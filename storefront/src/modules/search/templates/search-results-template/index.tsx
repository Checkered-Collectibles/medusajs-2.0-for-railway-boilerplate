import { Heading, Text } from "@medusajs/ui"
import Link from "next/link"

import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type SearchResultsTemplateProps = {
  query: string
  ids: string[]
  sortBy?: SortOptions
  page?: string
  countryCode: string
  inStock?: string // 👈 1. Accept new prop
}

const SearchResultsTemplate = ({
  query,
  ids,
  sortBy,
  page,
  countryCode,
  inStock, // 👈 2. Destructure it
}: SearchResultsTemplateProps) => {
  const pageNumber = page ? parseInt(page) : 1

  // Convert string param to boolean for UI
  const isStockFilterChecked = inStock === "true"

  return (
    <>
      <div className="flex justify-between border-b w-full py-6 px-8 small:px-14 items-center">
        <div className="flex flex-col items-start">
          <Text className="text-ui-fg-muted">Search Results for:</Text>
          <Heading>
            {decodeURI(query)} ({ids.length})
          </Heading>
        </div>
        <LocalizedClientLink
          href="/store"
          className="txt-medium text-ui-fg-subtle hover:text-ui-fg-base"
        >
          Clear
        </LocalizedClientLink>
      </div>
      <div className="flex flex-col small:flex-row small:items-start p-6">
        {ids.length > 0 ? (
          <>
            {/* 3. Pass boolean to RefinementList to sync the checkbox */}
            <RefinementList
              sortBy={sortBy || "-created_at"}
              search
              inStock={isStockFilterChecked}
            />

            <div className="content-container">
              {/* 4. Pass string param to PaginatedProducts for filtering logic */}
              <PaginatedProducts
                productsIds={ids}
                sortBy={sortBy}
                page={pageNumber}
                countryCode={countryCode}
                inStock={inStock}
              />
            </div>
          </>
        ) : (
          <Text className="ml-8 small:ml-14 mt-3">No results.</Text>
        )}
      </div>
    </>
  )
}

export default SearchResultsTemplate