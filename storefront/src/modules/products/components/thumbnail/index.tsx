import { Container, clx } from "@medusajs/ui"
import Image from "next/image"
import React from "react"

import PlaceholderImage from "@modules/common/icons/placeholder-image"

// Defaults if no specific 'sizes' prop is passed
const DEFAULT_SIZES: Record<NonNullable<ThumbnailProps["size"]>, string> = {
  small: "180px",
  medium: "290px",
  large: "440px",
  square: "80px",
  // Default assumption: 1 col mobile, 2 col tablet, 3 col desktop
  full: "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw",
}

type ThumbnailProps = {
  thumbnail?: string | null
  images?: any[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  "data-testid"?: string
  // ✅ NEW: Allow passing specific sizes string to override defaults
  sizes?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured,
  className,
  "data-testid": dataTestid,
  sizes, // Destructure new prop
}) => {
  const initialImage = thumbnail || images?.[0]?.url

  return (
    <Container
      className={clx(
        "relative w-full overflow-hidden p-4 bg-ui-bg-subtle shadow-elevation-card-rest rounded-large group-hover:shadow-elevation-card-hover transition-shadow ease-in-out duration-150",
        className,
        {
          "aspect-[11/14]": isFeatured,
          "aspect-[9/16]": !isFeatured && size !== "square",
          "aspect-[1/1]": size === "square",
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium",
          "w-[440px]": size === "large",
          "w-full": size === "full",
        }
      )}
      data-testid={dataTestid}
    >
      <ImageOrPlaceholder image={initialImage} size={size} customSizes={sizes} />
    </Container>
  )
}

const ImageOrPlaceholder = ({
  image,
  size,
  customSizes,
}: Pick<ThumbnailProps, "size"> & { image?: string; customSizes?: string }) => {
  return image ? (
    <Image
      fill
      src={image}
      alt="Thumbnail"
      className="absolute inset-0 object-cover object-center w-full"
      draggable={false}
      quality={75}
      // ✅ LOGIC: Use custom sizes if provided, otherwise fallback to defaults
      sizes={customSizes || DEFAULT_SIZES[size ?? "small"]}
    />
  ) : (
    <div className="w-full h-full absolute inset-0 flex items-center justify-center">
      <PlaceholderImage size={size === "small" ? 16 : 24} />
    </div>
  )
}

export default Thumbnail