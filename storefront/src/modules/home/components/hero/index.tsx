import { Button, Heading } from "@medusajs/ui"
import Image from "next/image"
import Link from "next/link" // ⚡ Use Next.js Link for faster navigation (SEO Factor)
import HWImage from "@images/hw.png";
import HeroGraphic from "./graphic";

const Hero = () => {
  return (
    <div className="md:p-0 p-0 bg-black h-[calc(100vh-6rem)] md:min-h-[60rem] min-h-[45rem] relative">
      <div className="content-container w-full flex flex-col gap-y-10 -bg-ui-bg-subtle md:pt-32 pt-16 overflow-hidden">
        <div className="inset-0 z-10 flex flex-col justify-start items-center text-center gap-6">
          <span className="px-2">
            {/* 🏆 H1 SEO STRATEGY: 
               Google reads this as: "Buy Hot Wheels Cars Online in India"
               This hits your #1 keyword (165k searches) immediately.
            */}
            <Heading
              level="h1"
              className="sm:text-4xl text-3xl leading-10 text-ui-fg-base font-thin"
            >
              SCALE 1:64.<br className="sm:hidden block" /> ADRENALINE 100%.
              {/* <Image
                src={HWImage}
                width={160}
                alt="Hot Wheels" // Critical: Google reads this as text
                className="mb-1"
                priority // ⚡ Loads image faster for better Core Web Vitals
              />
              Cars Online in India */}
            </Heading>

            {/* 📝 H2 SUBTEXT:
               Includes secondary keywords: "Premium", "Mainline", "JDM"
            */}
            <Heading
              level="h2"
              className="sm:text-3xl text-2xl leading-10 text-ui-fg-subtle font-normal mt-2"
            >
              Legends, not toys. Curated for the obsessed.
            </Heading>
            <p className="flex flex-wrap gap-2 items-center justify-center mt-3">
              Fuel your passion with the best<Image
                src={HWImage}
                width={100}
                alt="Hot Wheels" // Critical: Google reads this as text
                className="mb-1"
                priority // ⚡ Loads image faster for better Core Web Vitals
              /> Collection.
            </p>
          </span>

          <Link href="/store">
            <Button variant="primary" className="mt-4">
              Browse the 2026 Catalog {"->"}
            </Button>
          </Link>
        </div>
        <HeroGraphic />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute top-0 w-screen h-full bg-gradient-to-t from-transparent to-[80%] to-white pointer-events-none" />
    </div>
  )
}

export default Hero