"use client"

import FilterRadioGroup from "@modules/common/components/filter-radio-group"
import { Checkbox, Label, Text, clx } from "@medusajs/ui"
import { useEffect, useState, useTransition } from "react"
import { Spinner } from "@medusajs/icons" // Ensure you have this or a similar icon

export type SortOptions = "price_asc" | "price_desc" | "-created_at" | "-updated_at"

type SortProductsProps = {
  sortBy: SortOptions
  inStock: boolean
  setQueryParams: (name: string, value: string) => void
  "data-testid"?: string
}

const sortOptions = [
  {
    value: "-created_at",
    label: "Newest",
  },
  {
    value: "-updated_at",
    label: "Latest Arrivals",
  },
  {
    value: "price_asc",
    label: "Price: Low -> High",
  },
  {
    value: "price_desc",
    label: "Price: High -> Low",
  },
]

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  inStock,
  setQueryParams,
}: SortProductsProps) => {
  const [isPending, startTransition] = useTransition()

  // 1. Local state for instant visual feedback
  const [isChecked, setIsChecked] = useState(inStock)

  // 2. Sync local state if the URL/Prop changes externally
  useEffect(() => {
    setIsChecked(inStock)
  }, [inStock])

  const handleSortChange = (value: SortOptions) => {
    // Wrap navigation in transition to track loading state
    startTransition(() => {
      setQueryParams("sortBy", value)
    })
  }

  const handleStockChange = (checked: boolean | "indeterminate") => {
    if (checked === "indeterminate") return

    // 3. Update local state IMMEDIATELY
    setIsChecked(checked)

    // 4. Update URL in background, tracked by isPending
    startTransition(() => {
      setQueryParams("inStock", checked ? "true" : "false")
    })
  }

  return (
    <div className="flex flex-col gap-y-6">
      <FilterRadioGroup
        title="Sort by"
        items={sortOptions}
        value={sortBy}
        handleChange={handleSortChange}
        data-testid={dataTestId}
      />

      <div className="flex flex-col gap-y-3">
        <div className="flex items-center gap-3">
          <Text className="txt-compact-small-plus text-ui-fg-muted">Filters</Text>
          {/* Optional: Global Spinner if any filter is changing */}
          {isPending && <Spinner className="animate-spin w-3 h-3 text-ui-fg-muted" />}
        </div>

        <div className={clx("flex items-center gap-x-2 transition-opacity duration-200", {
          "opacity-50 cursor-wait": isPending // Dim the controls while loading
        })}>
          <Checkbox
            id="in-stock-filter"
            checked={isChecked}
            onCheckedChange={handleStockChange}
            disabled={isPending} // Prevent double clicking
          />
          <Label
            htmlFor="in-stock-filter"
            className="text-ui-fg-subtle hover:cursor-pointer !transform-none !txt-compact-small"
          >
            In Stock Only
          </Label>
        </div>
      </div>
    </div>
  )
}

export default SortProducts