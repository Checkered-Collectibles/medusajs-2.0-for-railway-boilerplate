"use client"

import Link from "next/link"
import Countdown from "./countdown"

/**
 * UPDATED: New Tier System & Price Drop
 * Current Time: Jan 26, 2026
 */
const DROP_DATE_IST = "2026-01-26T12:00:00+05:30" // Live Now
const SALE_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 Days (Announcement banner)

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
                    💎 New Collector Tiers & ₹99 Drop launching in{" "}
                    <Countdown targetDate={dropDate} size="sm" className="px-1 inline font-medium text-yellow-400" />
                </div>
            )}

            {isSaleLive && (
                <Link
                    href="/store"
                    className="flex flex-wrap items-center justify-center gap-x-2 text-xs sm:text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                    <span className="uppercase tracking-wide">
                        🚨 Price Drop: <span className="text-white">Fantasy ₹99</span> | New Licensed Tiers Live 💎
                    </span>
                    {/* Optional: Keep countdown if you want urgency, or remove for a static announcement */}
                    {/* <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded">
                        <span className="text-white/80 font-normal">Ends in:</span>
                        <Countdown targetDate={saleEndDate} size="sm" className="font-mono text-white" />
                    </div> */}
                </Link>
            )}

            {isPostSale && (
                // <Link
                //     href="/store"
                //     className="text-xs sm:text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
                // >
                //     🚚 Free Shipping on orders above ₹1499
                // </Link>
                <Link
                    href="/store"
                    className="flex flex-wrap items-center justify-center gap-x-2 text-xs sm:text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                    <span className="uppercase tracking-wide">
                        🚨 Price Drop: <span className="text-white">Fantasy ₹99</span> | New Licensed Tiers Live 💎
                    </span>
                    {/* Optional: Keep countdown if you want urgency, or remove for a static announcement */}
                    {/* <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded">
                        <span className="text-white/80 font-normal">Ends in:</span>
                        <Countdown targetDate={saleEndDate} size="sm" className="font-mono text-white" />
                    </div> */}
                </Link>
            )}
        </section>
    )
}