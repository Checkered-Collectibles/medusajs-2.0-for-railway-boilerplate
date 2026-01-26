import { ArrowUpRightMini } from "@medusajs/icons"
import { Text } from "@medusajs/ui"
import LocalizedClientLink from "../localized-client-link"

type InteractiveLinkProps = {
  href: string
  children?: React.ReactNode
  onClick?: () => void
  target?: React.HTMLAttributeAnchorTarget // 👈 Added target prop type
}

const InteractiveLink = ({
  href,
  children,
  onClick,
  target, // 👈 Destructure target
  ...props
}: InteractiveLinkProps) => {
  return (
    <LocalizedClientLink
      className="flex gap-x-1 items-center group py-2 px-3 bg-blue-50 rounded border border-blue-200"
      href={href}
      onClick={onClick}
      target={target} // 👈 Pass target to the link
      {...props}
    >
      <Text className="text-blue-600">{children}</Text>
      <ArrowUpRightMini
        className="group-hover:rotate-45 ease-in-out duration-150"
        color="var(--fg-interactive)"
      />
    </LocalizedClientLink>
  )
}

export default InteractiveLink