"use client"

import Link from "next/link"
import Countdown from "./countdown"

/**
 * UPDATED: 24-Hour Flash Sale - Fantasy Rule Reduced
 * Start: Set this to your exact launch time!
 */
const DROP_DATE_IST = "2026-03-16T21:00:00+05:30"
// How long the "LIVE" banner stays active (Exactly 24 Hours)
const HYPE_DURATION_MS = 24 * 60 * 60 * 1000

export default function Banner() {
    const dropDate = new Date(DROP_DATE_IST)
    const hypeEndDate = new Date(dropDate.getTime() + HYPE_DURATION_MS)

    const now = Date.now()
    const dropTs = dropDate.getTime()
    const hypeEndTs = hypeEndDate.getTime()

    const isPreDrop = now < dropTs
    const isDropLive = now >= dropTs && now < hypeEndTs
    const isPostDrop = now >= hypeEndTs

    return (
        <section className="w-full bg-black text-white py-2 text-center sm:text-md text-sm">
            {/* 1. PRE-DROP: Count down to Start */}
            {isPreDrop && (
                <div className="text-xs sm:text-sm opacity-90 font-medium flex items-center justify-center gap-x-2">
                    <span className="uppercase tracking-wide text-yellow-300">
                        🚨 FANTASY RULE REDUCED IN:
                    </span>
                    <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-white font-mono">
                        <Countdown targetDate={dropDate} size="sm" />
                    </div>
                </div>
            )}

            {/* 2. LIVE DROP: Count down to END (24h Window) */}
            {isDropLive && (
                <Link
                    href="/store" // Update this if you have a specific collection page for the sale
                    className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity"
                >
                    <span className="uppercase tracking-wide">
                        🔥 <span className="text-yellow-300">Hot Wheels @ MRP</span>
                    </span>

                    <div className="flex items-center gap-2">
                        <span className="text-white/70 font-normal normal-case">Sale ends in:</span>
                        <span className="bg-red-600 text-white px-2 py-0.5 rounded font-mono">
                            <Countdown targetDate={hypeEndDate} size="sm" />
                        </span>
                    </div>

                    <span className="bg-white/10 text-white px-2 py-0.5 rounded text-xs font-medium tracking-wider">
                        SHOP NOW &rarr;
                    </span>
                </Link>
            )}

            {/* 3. POST DROP: Standard Message */}
            {isPostDrop && (
                <Link
                    href="/store"
                    className="flex flex-wrap items-center justify-center gap-x-2 text-xs sm:text-sm font-medium text-yellow-300 hover:text-yellow-200 transition-colors"
                >
                    <span className="uppercase tracking-wide text-white">
                        FREE SHIPPING ABOVE ₹4000
                    </span>
                </Link>
            )}
        </section>
    )
}