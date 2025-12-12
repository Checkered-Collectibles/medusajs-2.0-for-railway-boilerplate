import { Github } from "@medusajs/icons"
import { Button, Heading } from "@medusajs/ui"
import Image from "next/image"
import HeroImage from "@images/ferrari.png";
import HWImage from "@images/hw.png";

const Hero = () => {
  return (
    <div className="h-[60vh] md:min-h-[48rem] min-h-[31rem] w-full border-ui-border-base border-b relative bg-ui-bg-subtle">
      <div className="absolute inset-0 z-10 flex flex-col justify-start items-center text-center md:py-32 py-24 gap-6">
        <span className="px-5">
          <Heading
            level="h1"
            className="sm:text-3xl text-2xl leading-10 text-ui-fg-base font-normal flex flex-wrap gap-2 items-center justify-center"
          >
            Stop Overpaying for <Image src={HWImage} width={160} alt="Hot Wheels" className="" />
          </Heading>
          <Heading
            level="h2"
            className="sm:text-3xl text-2xl leading-10 text-ui-fg-subtle font-normal"
          >
            Genuine Hot Wheels cars, <br className="sm:hidden" /> only ₹350
          </Heading>
        </span>
        <a
          href="/store"
        >
          <Button variant="primary">
            Beat the scalpers – Shop Now {"->"}
          </Button>
        </a>
      </div>
      <div className="absolute -bottom-24 w-full flex justify-center">
        <Image src={HeroImage} width={900} alt="Hero image" className="drop-shadow-xl" />
      </div>
    </div>
  )
}

export default Hero
