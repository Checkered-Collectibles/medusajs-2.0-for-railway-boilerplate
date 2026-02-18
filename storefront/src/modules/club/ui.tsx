"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register the plugin
gsap.registerPlugin(ScrollTrigger)

type Props = {
    label?: string
}

export default function ClubUI({ label = "CLUB" }: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLSpanElement>(null)
    const topLeftRef = useRef<HTMLDivElement>(null)
    const bottomRightRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                // 🟢 SCROLL TRIGGER CONFIGURATION
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 90%", // Starts when top of element hits 90% down the viewport
                    toggleActions: "play none none none", // Play once when entering
                    // Options: "onEnter onLeave onEnterBack onLeaveBack"
                    // Use "play none none reverse" if you want it to reverse when scrolling up
                }
            })

            // 1. Initial State
            // Container: Invisible
            gsap.set(containerRef.current, { opacity: 0 })

            // Text: Cropped completely (hidden) & slightly shifted left
            gsap.set(textRef.current, {
                clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)",
                x: -10
            })

            // Squares: Positioned away from corners
            gsap.set(topLeftRef.current, { x: -20, y: -20, opacity: 0 })
            gsap.set(bottomRightRef.current, { x: 20, y: 20, opacity: 0 })

            // 2. Animate Container (Fast Fade In)
            tl.to(containerRef.current, {
                opacity: 1,
                duration: 0.1
            })

            // 3. Text Reveal (Wipe Left -> Right)
            tl.to(textRef.current, {
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                x: 0,
                duration: 0.5,
                ease: "power3.out"
            })

            // 4. Squares Slam (Diagonal impact)
            tl.to(topLeftRef.current, {
                x: 0,
                y: 0,
                opacity: 1,
                duration: 0.4,
                ease: "back.out(2)"
            }, "-=0.3")

            tl.to(bottomRightRef.current, {
                x: 0,
                y: 0,
                opacity: 1,
                duration: 0.4,
                ease: "back.out(2)"
            }, "<")

        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <div
            ref={containerRef}
            // Added opacity-0 here to prevent flash of unstyled content before JS loads
            className="opacity-0 py-0.5 px-1.5 h-fit rounded-none bg-black text-white relative group/club text-xs w-fit select-none"
        >
            <span ref={textRef} className="inline-block relative font-normal tracking-wide">
                {label}
            </span>

            {/* Top Left Square */}
            <div
                ref={topLeftRef}
                className="h-1.5 w-1.5 bg-black absolute -top-1.5 -left-1.5 duration-150 group-hover/club:h-2 group-hover/club:w-2"
            />

            {/* Bottom Right Square */}
            <div
                ref={bottomRightRef}
                className="h-1 w-1 bg-white absolute bottom-0 right-0 duration-150 group-hover/club:w-1.5 group-hover/club:h-1.5"
            />
        </div>
    )
}