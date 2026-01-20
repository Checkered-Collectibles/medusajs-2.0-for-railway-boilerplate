"use client"

import Link from "next/link"
import Countdown from "./countdown"

/**
 * UPDATED DATE: January 21, 2026 at 3:00 PM IST
 * Current Time: Jan 20, 2026, 9:13 PM IST
 */
const DROP_DATE_IST = "2026-01-20T22:00:00+05:30"
const SALE_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours

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
                    🔥 2026 D CASE DROP starts in{" "}
                    <Countdown targetDate={dropDate} size="sm" className="px-1 inline font-medium text-yellow-400" />
                </div>
            )}

            {isSaleLive && (
                <Link
                    href="/store"
                    className="text-xs sm:text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                    🔓 2026 D CASE IS LIVE!
                </Link>
            )}

            {isPostSale && (
                <Link
                    href="/store"
                    className="text-xs sm:text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                    🔓 2026 D CASE IS LIVE!
                </Link>
            )}
        </section>
    )
}