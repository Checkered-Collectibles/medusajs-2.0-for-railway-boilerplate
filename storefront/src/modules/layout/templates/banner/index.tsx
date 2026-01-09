"use client"

import Link from "next/link"
import Countdown from "./countdown"

const DROP_DATE_IST = "2026-01-05T21:00:00+05:30";
const SALE_DURATION_MS = 48 * 60 * 60 * 1000 // 48 hours

export default function Banner() {
    const dropDate = new Date(DROP_DATE_IST)
    const saleEndDate = new Date(dropDate.getTime() + SALE_DURATION_MS)

    const now = Date.now()
    const dropTs = dropDate.getTime()
    const saleEndTs = saleEndDate.getTime()

    const isPreDrop = now < dropTs
    const isSaleLive = now >= dropTs && now < saleEndTs
    const isPostSale = now >= saleEndTs

    return (
        <section className="w-full bg-black text-white py-2 text-center sm:text-md text-sm">
            {isPreDrop && (
                <div className="text-xs sm:text-sm opacity-80">
                    🚀 Next collection drops in{" "}
                    <Countdown
                        targetDate={dropDate}
                        size="sm"
                        className="px-1 inline"
                    />
                </div>
            )}

            {isSaleLive && (
                <Link href="/collections/a-case-2026-licensed" className="text-xs sm:text-sm opacity-80">
                    🔥 A Case 2026 is here {"->"}
                </Link>
            )}

            {isPostSale && (
                <Link href="/collections/a-case-2026-licensed" className="text-xs sm:text-sm opacity-80">
                    🔥 A Case 2026 is here {"->"}
                </Link>
            )}
        </section>
    )
}