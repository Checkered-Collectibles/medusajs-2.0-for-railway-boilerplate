"use client"

import Link from "next/link"
import Countdown from "./countdown"

/**
 * UPDATED: Hot Wheels Premium Flash Sale
 * Start: Feb 1, 2026
 * Duration: 48 Hours
 */
const DROP_DATE_IST = "2026-02-01T00:00:00+05:30" // Live Now (Started Midnight Feb 1)
const SALE_DURATION_MS = 48 * 60 * 60 * 1000 // 48 Hours

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
                    🔥 Premium Flash Sale starting in{" "}
                    <Countdown targetDate={dropDate} size="sm" className="px-1 inline font-medium text-yellow-300" />
                </div>
            )}

            {isSaleLive && (
                <Link
                    href="/store"
                    // Added gap-y-1 for better spacing when wrapping on mobile
                    className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity"
                >
                    <span className="uppercase tracking-wide">
                        🚨 48-HR FLASH SALE: <span className="text-yellow-300">10% OFF PREMIUMS</span>
                    </span>

                    <span className="bg-white/10 text-red-600 px-2 py-0.5 rounded text-xs font-extrabold tracking-wider">
                        USE CODE: PREMIUM10
                    </span>

                    {/* Removed 'hidden' class so it shows on mobile too. Changed bg to white/10 for visibility on black */}
                    <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded ml-0 sm:ml-2">
                        <span className="text-white/80 font-normal text-[10px] sm:text-xs">Ends in:</span>
                        <Countdown targetDate={saleEndDate} size="sm" className="font-mono text-white text-xs" />
                    </div>
                </Link>
            )}

            {isPostSale && (
                <Link
                    href="/store"
                    className="flex flex-wrap items-center justify-center gap-x-2 text-xs sm:text-sm font-medium text-yellow-300 hover:text-yellow-200 transition-colors"
                >
                    <span className="uppercase tracking-wide text-white">
                        Price Drop: <span className="font-bold text-yellow-300">Fantasy ₹99</span> | New Licensed Tiers Live 💎
                    </span>
                </Link>
            )}
        </section>
    )
}