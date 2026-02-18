"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Button, Heading, Text, clx } from "@medusajs/ui"
import ConfettiComponent from "@modules/common/components/confetti"
import Image from "next/image"
import { CheckCircleSolid } from "@medusajs/icons"
// Make sure this path matches your project aliases
import LogoNoText from "@images/logo-notext.png";

const UNLOCKED_FEATURES = [
    {
        title: "Mainlines at MRP (₹179)",
        description: "Save 50%+ on every car. No more reseller prices.",
    },
    {
        title: "24-Hour Early Access",
        description: "Secure Mainlines & Premiums before the public.",
    },
    {
        title: "Free Shipping",
        description: "On all premium diecast orders.",
    },
    {
        title: "Priority VIP Support",
        description: "Direct line for fast query resolution.",
    }
]

export default function SubscriptionSuccessModal() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const [isOpen, setIsOpen] = useState(false)
    const [showConfetti, setShowConfetti] = useState(false)

    useEffect(() => {
        // 1. Trigger Modal only if ?club=true is present
        if (searchParams.get("club") === "true") {
            setIsOpen(true)
            setShowConfetti(true)
        }
    }, [searchParams])

    const handleClose = () => {
        // 2. Clean up ALL params when closing
        const params = new URLSearchParams(searchParams.toString())

        // Remove all tracking params related to the subscription flow
        params.delete("club")
        params.delete("status")
        params.delete("sub_id")
        params.delete("payment_id")
        params.delete("razorpay_payment_id")
        params.delete("razorpay_subscription_id")
        params.delete("razorpay_signature")

        // Replace URL silently without reloading the page
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })

        // Close Modal
        setIsOpen(false)
        setShowConfetti(false)
    }

    if (!isOpen) return null

    return (
        <>
            {/* 🎉 Confetti Overlay */}
            {showConfetti && (
                <div className="fixed inset-0 z-[60] pointer-events-none">
                    <ConfettiComponent />
                </div>
            )}

            {/* 🌑 Backdrop */}
            <div className="fixed inset-0 z-[50] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">

                {/* 📦 Modal Content */}
                <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">

                    {/* Header Section */}
                    <div className="bg-black p-8 text-center text-white relative overflow-hidden">
                        {/* Subtle background glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-white/10 blur-[50px] rounded-full pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="mb-6 drop-shadow-lg">
                                <Image
                                    src={LogoNoText}
                                    width={70}
                                    height={70}
                                    alt="Checkered Collectibles"
                                    className="object-contain"
                                />
                            </div>
                            <Heading level="h2" className="text-3xl font-bold mb-2 tracking-tight">
                                Welcome to the Club!
                            </Heading>
                            <Text className="text-gray-400 text-sm font-medium">
                                Your VIP membership is now active.
                            </Text>
                        </div>
                    </div>

                    {/* Features List */}
                    <div className="p-6 bg-white">
                        <Text className="font-bold text-gray-400 text-[10px] uppercase tracking-widest mb-4 text-center">
                            Unlocked Privileges
                        </Text>

                        <div className="space-y-3 mb-6">
                            {UNLOCKED_FEATURES.map((feature, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                                    <div className="mt-0.5 text-green-600 bg-green-100 p-1 rounded-full">
                                        <CheckCircleSolid className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <Text className="font-bold text-gray-900 leading-tight mb-0.5 text-sm">
                                            {feature.title}
                                        </Text>
                                        <Text className="text-xs text-gray-500 leading-snug">
                                            {feature.description}
                                        </Text>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Button */}
                        <Button
                            size="large"
                            variant="primary"
                            className="w-full font-bold text-base py-3 shadow-lg hover:shadow-xl transition-all active:scale-95"
                            onClick={handleClose}
                        >
                            Start Shopping Deals
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}