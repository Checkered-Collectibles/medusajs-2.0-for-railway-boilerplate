"use client"

import Link from "next/link"
import Countdown from "./countdown"

/**
 * UPDATED DATE: January 21, 2026 at 3:00 PM IST
 * Current Time: Jan 20, 2026, 9:13 PM IST
 */
const DROP_DATE_IST = "2026-01-23T21:00:00+05:30"
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
                <div className="text-xs sm:text-sm opacity-90 font-medium">
                    🔥 The 2025 N CASE &quot;Near-MRP&quot; Vault Unlocks in{" "}
                    <Countdown targetDate={dropDate} size="sm" className="px-1 inline font-medium text-yellow-400" />
                </div>
            )}

            {isSaleLive && (
                <Link
                    href="/collections/n-case-2025-licensed"
                    className="flex flex-wrap items-center justify-center gap-x-2 text-xs sm:text-sm font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                    <span className="uppercase tracking-wide">
                        🔓 2025 N CASE UNLOCKED: <span className="text-white">Flat ₹199</span>
                    </span>
                    <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded">
                        <span className="text-white/80 font-normal">Ends in:</span>
                        <Countdown targetDate={saleEndDate} size="sm" className="font-mono text-white" />
                    </div>
                </Link>
            )}

            {isPostSale && (
                <Link
                    href="/store"
                    className="text-xs sm:text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                    🚚 Free Shipping on orders above ₹1499
                </Link>
            )}
        </section>
    )
}