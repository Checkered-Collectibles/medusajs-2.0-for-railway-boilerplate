"use client"

import Link from "next/link"
import Countdown from "./countdown"

/**
 * UPDATED: 2026 E Case Drop
 * Start: Feb 6, 2026 @ 9:00 PM IST
 */
const DROP_DATE_IST = "2026-02-11T21:00:00+05:30"
// How long the "LIVE" banner stays active
const HYPE_DURATION_MS = 48 * 60 * 60 * 1000 // 48 Hours

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
            {isPreDrop && (
                <div className="text-xs sm:text-sm opacity-90 font-medium flex items-center justify-center gap-x-2">
                    <span className="uppercase tracking-wide">
                        📦 Silver Series HYBRID SPEED Dropping Tonight
                    </span>
                    <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-yellow-300 font-mono">
                        <Countdown targetDate={dropDate} size="sm" />
                    </div>
                </div>
            )}

            {isDropLive && (
                <Link
                    href="/collections/hot-wheels-silver-series-hybrid-speed"
                    className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity"
                >
                    <span className="uppercase tracking-wide">
                        🚨 FRESH COLLECTION! <span className="text-yellow-300">Silver Series HYBRID SPEED IS LIVE</span>
                    </span>

                    <span className="bg-white/10 text-white px-2 py-0.5 rounded text-xs font-medium tracking-wider">
                        HUNT THEM ALL &rarr;
                    </span>
                </Link>
            )}

            {isPostDrop && (
                <Link
                    href="/collections/hot-wheels-silver-series-hybrid-speed"
                    className="flex flex-wrap items-center justify-center gap-x-2 text-xs sm:text-sm font-medium text-yellow-300 hover:text-yellow-200 transition-colors"
                >
                    <span className="uppercase tracking-wide text-white">
                        New Arrivals: <span className="font-bold text-white">Silver Series HYBRID SPEED</span> In Stock 📦
                    </span>
                </Link>
            )}
        </section>
    )
}