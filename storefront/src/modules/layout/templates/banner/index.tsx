"use client"

import { useEffect, useMemo, useState } from "react"
import Countdown from "./countdown"

const DROP_DATE_IST = "2025-12-10T14:00:00+05:30"

function nowInIST() {
    // returns a Date representing "current moment", but computed via IST wall-clock
    const now = new Date()
    const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    return new Date(istString)
}

export default function Banner() {
    const dropDate = useMemo(() => new Date(DROP_DATE_IST), [])
    const [isLive, setIsLive] = useState(false)

    useEffect(() => {
        const tick = () => setIsLive(nowInIST().getTime() >= dropDate.getTime())
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [dropDate])

    return (
        <section className="flex">
            <div className="bg-black w-full text-white p-2 text-center">
                {isLive ? (
                    <a href="/collections/n-case-2025-day-2">
                        🔥 N CASE 2025 - Day 2 is live — Shop Now →
                    </a>
                ) : (
                    <div>
                        🚀 Next collection drops in{" "}
                        <Countdown targetDate={dropDate} size="lg" className="px-0 inline" />{" "}
                        — Don’t miss it!
                    </div>
                )}
            </div>
        </section>
    )
}