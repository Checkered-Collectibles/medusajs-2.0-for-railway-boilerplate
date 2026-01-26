"use client"

import Link from "next/link"
import Countdown from "./countdown"

/**
 * UPDATED: Team Transport #1 Drop
 * Current Time: Jan 26, 2026
 * Drop Time: Tonight 9:00 PM IST
 */
const DROP_DATE_IST = "2026-01-26T21:00:00+05:30"
const SALE_DURATION_MS = 48 * 60 * 60 * 1000 // Show "Live" banner for 48 hours

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
                    🏁 Team Transport #1 Drops Tonight in{" "}
                    <Countdown targetDate={dropDate} size="sm" className="px-1 inline font-medium text-yellow-400" />
                </div>
            )}

            {isSaleLive && (
                <Link
                    href="/collections/team-transport-1"
                    className="flex flex-wrap items-center justify-center gap-x-2 text-xs sm:text-sm font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                    <span className="uppercase tracking-wide">
                        🚨 Team Transport #1 IS LIVE! <span className="text-white font-normal ml-1">Secure your set now</span>
                    </span>
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