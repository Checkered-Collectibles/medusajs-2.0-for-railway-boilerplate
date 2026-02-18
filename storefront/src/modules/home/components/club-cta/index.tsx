import { Button, Heading, Text, Container, clx } from "@medusajs/ui"
import Link from "next/link"
import { ArrowRightMini, CheckCircleSolid } from "@medusajs/icons"

const PERKS = [
  "Mainlines at ₹179 (MRP)",
  "24h Early Access to Drops",
  "Free Shipping on Premiums",
  "Priority VIP Support"
]

export default function ClubCTA() {
  return (
    <section className="py-12 px-4 md:px-8">
      <div className="relative w-full overflow-hidden rounded-2xl bg-gray-950 text-white shadow-2xl">

        {/* 🏁 Background Pattern (Checkered Flag Hint) */}
        {/* <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-[linear-gradient(45deg,transparent_25%,white_25%,white_50%,transparent_50%,transparent_75%,white_75%,white_100%)] bg-[length:40px_40px]" />
        </div> */}

        {/* 🎨 Gradient Glow
        <div className="absolute -left-20 -bottom-40 w-96 h-96 bg-red-600 blur-[120px] rounded-full opacity-40 mix-blend-screen pointer-events-none" />
        <div className="absolute -right-20 -top-40 w-96 h-96 bg-orange-500 blur-[120px] rounded-full opacity-30 mix-blend-screen pointer-events-none" /> */}

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-16">

          {/* Left Content */}
          <div className="flex-1 text-center md:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-bold tracking-wide uppercase text-gray-200">
                Limited Time Offer
              </span>
            </div>

            <Heading level="h2" className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight space-y-2">
              The smarter way to <br />build your <span className="bg-white text-black mix-blend-difference w-fit">collection.</span>
            </Heading>

            <Text className="text-lg text-white/80 max-w-lg mx-auto md:mx-0">
              Join the Checkered Club today. Unlock Mainlines at MRP, 24-hour early access to rare drops, and exclusive member-only shipping rates.
            </Text>

            {/* Perks Grid (Mobile: Stack, Desktop: 2x2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-md mx-auto md:mx-0">
              {PERKS.map((perk, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <CheckCircleSolid className="text-green-500 shrink-0" />
                  {perk}
                </div>
              ))}
            </div>
          </div>

          {/* Right Action */}
          <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center gap-4">
            <div className="p-1 rounded-xl backdrop-blur-lg border border-white/10 shadow-2xl">
              <div className="bg-gray-900 rounded-lg p-6 text-center w-full md:w-72">
                <Text className="text-white/80 text-xs uppercase tracking-wider font-bold mb-1">
                  Starting from
                </Text>
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="text-4xl font-extrabold text-white">₹499</span>
                  <span className="text-sm text-white/80">/mo</span>
                </div>
                <Button
                  asChild
                  size="xlarge"
                  variant="primary"
                  className="w-full font-bold shadow-lg shadow-red-900/20 bg-white text-black hover:bg-gray-200 border-none"
                >
                  <Link href="/club">
                    Join the Club <ArrowRightMini />
                  </Link>
                </Button>
                <Text className="text-[10px] text-white/50 mt-3">
                  Cancel anytime. Secure payment via Razorpay.
                </Text>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}