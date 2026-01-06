import { Button, Heading } from "@medusajs/ui"
import Image from "next/image"
import HWImage from "@images/hw.png";
import HeroGraphic from "./graphic";

const Hero = () => {
  return (
    <div className="md:p-3 p-0">
      <div className="content-container w-full flex flex-col gap-y-10 border relative -bg-ui-bg-subtle bg-gradient-to-l from-red-50 to-blue-50 md:pt-32 pt-16 overflow-hidden">
        <div className="inset-0 z-10 flex flex-col justify-start items-center text-center gap-6">
          <span className="px-2">
            <Heading
              level="h1"
              className="sm:text-4xl text-3xl leading-10 text-ui-fg-base font-normal flex flex-wrap gap-2 items-center justify-center"
            >
              Your <Image src={HWImage} width={160} alt="Hot Wheels" className="" /> Hunt Ends Here
            </Heading>
            <Heading
              level="h2"
              className="sm:text-3xl text-2xl leading-10 text-ui-fg-subtle font-normal"
            >
              Fair prices. Verified collectibles.
            </Heading>
          </span>
          <a
            href="/store"
          >
            <Button variant="primary">
              Browse the Latest Drops {"->"}
            </Button>
          </a>
        </div>
        <HeroGraphic />
      </div>
    </div>
  )
}

export default Hero
