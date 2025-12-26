"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import Countdown from "./countdown"

const DROP_DATE_IST = "2025-12-11T14:00:00+05:30"

export default function Banner() {
    const dropDate = new Date(DROP_DATE_IST)
    const isLive = Date.now() >= dropDate.getTime()

    const trackRef = useRef<HTMLDivElement | null>(null)

    const messages = isLive
        ? [
            "Euro Speed Premium set now in stock & discounted ⚡",
            "10% off Licensed mainlines – use code WINTER10 ❄️ (next 5 orders)",
            "Free Shipping on all orders ₹1500 & above 🚚✨",
        ]
        : [
            `Next collection drops soon – don’t miss it!`,
            "Free Shipping on all orders ₹1500 & above 🚚✨",
        ]

    useEffect(() => {
        if (!trackRef.current) return

        const ctx = gsap.context(() => {
            // reset position to avoid stacking animations on re-renders
            gsap.set(trackRef.current, { xPercent: 0 })

            gsap.to(trackRef.current, {
                xPercent: -50, // because we duplicate content below
                repeat: -1,
                duration: 25,
                ease: "linear",
            })
        }, trackRef)

        return () => ctx.revert()
    }, [])

    return (
        <section className="flex sm:text-md text-sm">
            <div className="bg-black w-full text-white py-2 text-center overflow-hidden">
                {/* Live vs countdown label on left (optional) */}
                <div className="flex items-center gap-2 justify-center mb-1 sm:mb-0">
                    {!isLive ? (
                        <div className="text-xs sm:text-sm opacity-80">
                            🚀 Next collection drops in{" "}
                            <Countdown
                                targetDate={dropDate}
                                size="sm"
                                className="px-1 inline"
                            />
                        </div>
                    ) : (
                        <></>
                        // <div className="text-xs sm:text-sm opacity-80">
                        //     ❄️ Winter Sale Live – use code WINTER10
                        // </div>
                    )}
                </div>

                {/* Marquee track */}
                <div className="relative w-full overflow-hidden">
                    <div
                        ref={trackRef}
                        className="inline-flex whitespace-nowrap will-change-transform"
                    >
                        {/* first set */}
                        {messages.map((msg, i) => (
                            <span key={`msg-${i}`} className="mx-8">
                                {msg}
                            </span>
                        ))}
                        {/* duplicate set for seamless loop */}
                        {messages.map((msg, i) => (
                            <span key={`msg-dup-${i}`} className="mx-8">
                                {msg}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}