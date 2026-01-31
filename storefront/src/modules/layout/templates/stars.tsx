import LocalizedClientLink from "@modules/common/components/localized-client-link";
import Image from "next/image";

export default function ReviewStars() {
    return (
        <LocalizedClientLink href="https://www.trustpilot.com/review/checkered.in" target="_blank" className="h-full flex flex-col items-center gap-1.5 text-xs text-green-700 italic">
            <Image className="CDS_StarRating_starRating__614d2e" alt="TrustScore 4 out of 5" width={108} height={30} src="https://cdn.trustpilot.net/brand-assets/4.1.0/stars/stars-4.svg"></Image>
            Trusted by Collectors
        </LocalizedClientLink>
    )
}