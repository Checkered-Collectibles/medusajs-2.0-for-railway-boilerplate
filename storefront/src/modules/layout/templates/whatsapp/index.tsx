"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import WhatsappLogoWhite from "@images/whatsapp/logo-white.png"
import Qr from "@images/whatsapp/qr.png"
import { metaEvent } from "@lib/meta/fpixel"

import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function WhatsappContact() {
    const wrapRef = useRef<HTMLDivElement | null>(null)

    const handleJoin = () => {
        metaEvent("Lead", {
            content_name: "WhatsApp Group",
            content_category: "Community",
            currency: "INR",
        })
    }

    useEffect(() => {
        if (!wrapRef.current) return

        const OFFSET_PX = 220 // 👈 adjust this (how early before bottom to hide)

        const ctx = gsap.context(() => {
            // Initial visible state
            gsap.set(wrapRef.current, { autoAlpha: 1, y: 0 })

            const show = () =>
                gsap.to(wrapRef.current, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.25,
                    ease: "power2.out",
                    overwrite: "auto",
                    pointerEvents: "auto",
                })

            const hide = () =>
                gsap.to(wrapRef.current, {
                    autoAlpha: 0,
                    y: 24,
                    duration: 0.25,
                    ease: "power2.out",
                    overwrite: "auto",
                    pointerEvents: "none",
                })

            // Track scroll and toggle near-bottom
            ScrollTrigger.create({
                start: 0,
                end: "max",
                onUpdate: (self) => {
                    const maxScroll = self.end // ScrollTrigger's max scroll value
                    const current = self.scroll()

                    const nearBottom = current >= maxScroll - OFFSET_PX
                    if (nearBottom) hide()
                    else show()
                },
            })
        }, wrapRef)

        return () => ctx.revert()
    }, [])

    return (
        <div ref={wrapRef} className="fixed bottom-0 right-0 md:p-5 sm:p-3 p-2 z-30">
            <Link
                href="https://chat.whatsapp.com/D09sAJ51EXX5MzuFOAmAAK?mode=hqrt2"
                title="Join our Whatsapp"
                target="_blank"
                className="flex flex-col items-end gap-2"
                onClick={handleJoin}
            >
                <p className="text-right font-medium text-white bg-[#128c7e] px-2 py-1 rounded-2xl text-sm">
                    Join our group <br /> for exciting drops
                </p>
                <div className="bg-[#128c7e] w-fit p-2 rounded-3xl gap-3 flex flex-col items-center border border-black/10 shadow-lg hover:scale-105 duration-200 hover:shadow-xl">
                    <Image src={WhatsappLogoWhite} alt="whatsapp" width={50} />
                    <Image src={Qr} alt="whatsapp qr" width={70} className="rounded-2xl hidden md:block" />
                </div>
            </Link>
        </div>
    )
}