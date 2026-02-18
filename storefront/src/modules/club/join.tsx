import { Metadata } from "next"
import { Heading, Text, Button, clx, Container } from "@medusajs/ui"
import { CheckCircleSolid } from "@medusajs/icons" // Ensure icons exist or use lucide-react
import { getCustomer } from "@lib/data/customer"
import SubscribeButton from "./payment"
import Image from "next/image"
import LogoNoText from "@images/logo-notext.png";

export const metadata: Metadata = {
    title: "Join the Club | VIP Access",
    description: "Get Hot Wheels Mainlines at MRP and Early Access to all drops.",
}

const BENEFITS = [
    {
        title: "HW Mainlines at MRP (₹179)",
        description: "Stop paying reseller prices (₹399+). Save over 50% on every single car.",
        value: "Save ₹200+ per car",
        icon: "🏎️"
    },
    {
        title: "24-Hour Early Access",
        description: "Beat the bots. Shop Premiums, and Mainlines a full day before the public.",
        value: "Secure rare drops",
        icon: "🔓"
    },
    {
        title: "Free Shipping on Premiums",
        description: "Pay zero delivery fees on all premium diecast orders. No minimum spend.",
        value: "Save ₹80 per order",
        icon: "📦"
    },
    {
        title: "Exclusive Accessory Discounts",
        description: "Get special pricing on protectors, wheels, and display cases.",
        value: "15-20% Off",
        icon: "🛠️"
    },
    {
        title: "Priority Support",
        description: "Skip the queue. Your queries get resolved first via a dedicated VIP channel.",
        value: "VIP Status",
        icon: "⭐"
    }
]

const PLANS = [
    {
        id: "monthly",
        variantId: "variant_01KHR931ZR25860TWEJQT0ADYE", // Replace with real ID
        name: "Monthly",
        price: 499,
        originalPrice: 699,
        billing: "Billed every month",
        features: ["Mainlines at MRP", "24h Early Access", "Free Shipping (Premiums)", "Accessory Discounts"],
        highlight: false,
    },
    {
        id: "quarterly",
        variantId: "variant_01KHR931ZS4MKQ9HFR1SNP1FBE", // Replace with real ID
        name: "Quarterly",
        price: 1299,
        originalPrice: 2097, // 699 * 3
        billing: "Billed every 3 months",
        savings: "Save ₹800",
        features: ["Mainlines at MRP", "24h Early Access", "Free Shipping (Premiums)", "Accessory Discounts", "Priority Support"],
        highlight: true,
        tag: "Most Popular"
    },
    {
        id: "yearly",
        variantId: "variant_01KHR931ZS42SV2PNB4ZXVZ2DA", // Replace with real ID
        name: "Yearly",
        price: 4999,
        originalPrice: 8388, // 699 * 12
        billing: "Billed every 12 months",
        savings: "2 Months FREE",
        features: ["All Quarterly Perks", "10% OFF All Premiums"],
        highlight: false,
        tag: "Best Value"
    }
]

export default async function ClubPage() {
    const customer = await getCustomer()

    return (
        <div className="bg-ui-bg-subtle min-h-screen">

            {/* 🏁 HERO SECTION */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('/pattern-grid.png')]"></div>
                <div className="content-container pt-24 pb-18 relative z-10 text-center flex flex-col items-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-yellow-400/20 text-yellow-600 text-sm font-medium border border-yellow-400/50 mb-6">
                        LIMITED: First 100 Members Pricing
                    </span>
                    <Heading level="h1" className="mx-auto text-5xl md:text-7xl font-extrabold tracking-tight mb-6 flex flex-wrap items-center justify-center gap-5">
                        Join the
                        <div className="p-5 flex gap-3 bg-black text-white w-fit items-center">
                            <Image src={LogoNoText} width={60} height={60} alt="Checkered Collectibles" className="w-fit h-fit" />
                            <div className="">Club</div>
                        </div>
                    </Heading>
                    <Text className="text-xl text-gray-800 max-w-2xl mx-auto mb-10">
                        The ultimate membership for diecast collectors. Get Mainlines at MRP, beat the scalpers with early access, and unlock exclusive perks.
                    </Text>
                </div>
            </div>

            {/* 💎 BENEFITS BREAKDOWN */}
            <div className="content-container py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {BENEFITS.map((b, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-ui-border-base shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-4xl mb-4">{b.icon}</div>
                            <Heading level="h3" className="text-lg font-bold mb-2">{b.title}</Heading>
                            <Text className="text-ui-fg-subtle text-sm mb-4">{b.description}</Text>
                            <div className="mt-auto pt-4 border-t border-gray-100">
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                                    VALUE: {b.value}
                                </span>
                            </div>
                        </div>
                    ))}
                    {/* Value Calculator Card */}
                    <div className="bg-green-950 p-6 rounded-xl text-white flex flex-col justify-center items-center text-center">
                        <Heading level="h3" className="text-xl font-bold mb-2">Do the math.</Heading>
                        <Text className="text-white/70 text-sm mb-4">
                            If you buy just <span className="text-white font-semibold">3 Mainlines</span> a month from us at MRP vs. scalper prices, the membership pays for itself.
                        </Text>
                        <div className="text-3xl font-bold text-green-400">
                            You save ₹600/mo
                        </div>
                    </div>
                </div>
            </div>

            {/* 🏷️ PRICING TIERS */}
            <div className="content-container pb-24" id="pricing">
                <div className="text-center mb-12 space-y-3">
                    <Heading level="h2" className="text-3xl font-bold">Choose your Pit Stop</Heading>
                    <Text className="text-ui-fg-subtle">Lock in these "First 100" rates for life.</Text>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            className={clx(
                                "relative bg-white rounded-2xl overflow-hidden transition-all duration-300",
                                plan.highlight
                                    ? "border-2 border-gray-600 shadow-xl scale-105 z-10"
                                    : "border border-ui-border-base shadow-lg hover:border-gray-300"
                            )}
                        >
                            {plan.tag && (
                                <div className="bg-gray-600 text-white text-xs font-bold text-center py-1.5 uppercase tracking-wide">
                                    {plan.tag}
                                </div>
                            )}

                            <div className="p-8">
                                <Heading level="h3" className="text-xl font-bold text-gray-900 mb-2">{plan.name}</Heading>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-4xl font-extrabold text-gray-900">₹{plan.price}</span>
                                    <span className="text-lg text-gray-400 line-through">₹{plan.originalPrice}</span>
                                </div>
                                <Text className="text-xs text-gray-500 font-medium mb-6 uppercase tracking-wider">{plan.billing}</Text>

                                {plan.savings && (
                                    <div className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full inline-block mb-6">
                                        {plan.savings}
                                    </div>
                                )}

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                            <CheckCircleSolid className="text-green-500 shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <SubscribeButton
                                    variantId={plan.variantId}
                                    price={plan.price}
                                    customer={customer}
                                />

                                <Text className="text-[10px] text-center text-gray-400 mt-3">
                                    Secure payment via UPI Autopay or Card
                                </Text>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}