"use client"

import Link from "next/link"
import Countdown from "./countdown"

// Set for TODAY at 3:00 PM IST (based on your current time)
const DROP_DATE_IST = "2026-01-19T14:00:00+05:30"
const SALE_DURATION_MS = 31 * 60 * 60 * 1000 // 24 hours

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
                    ✨ FREEDOM DROP starts in{" "}
                    <Countdown targetDate={dropDate} size="sm" className="px-1 inline font-bold" />
                </div>
            )}

            {isSaleLive && (
                <Link
                    href="/store"
                    className="text-xs sm:text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                    🔓 FREEDOM DROP LIVE: No Rules on Mainlines or Premiums! Ends in{" "}
                    <Countdown targetDate={saleEndDate} size="sm" className="px-1 inline text-white" />{" "}
                    {"->"}
                </Link>
            )}

            {isPostSale && (
                <Link
                    href="/store"
                    className="text-xs sm:text-sm opacity-80"
                >
                    🚚 Free shipping on orders above ₹1500 {"->"}
                </Link>
            )}
        </section>
    )
}