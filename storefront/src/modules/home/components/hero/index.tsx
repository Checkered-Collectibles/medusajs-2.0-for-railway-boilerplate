import { Github } from "@medusajs/icons"
import { Button, Heading } from "@medusajs/ui"
import Image from "next/image"
import HeroImage from "@images/ferrari.png";
import HWImage from "@images/hw.png";

const Hero = () => {
  return (
    <div className="h-[60vh] md:min-h-[48rem] min-h-[30rem] w-full border-ui-border-base border-b relative bg-ui-bg-subtle">
      <div className="absolute inset-0 z-10 flex flex-col justify-start items-center text-center md:py-32 py-24 gap-6">
        <span>
          <Heading
            level="h1"
            className="text-3xl leading-10 text-ui-fg-base font-normal flex gap-2 items-center justify-center"
          >
            We sell <Image src={HWImage} width={160} alt="HW image" className="" />
          </Heading>
          <Heading
            level="h2"
            className="text-3xl leading-10 text-ui-fg-subtle font-normal"
          >
            Buy any car at ₹250
          </Heading>
        </span>
        <a
          href="/store"
        >
          <Button variant="primary">
            Be the scalpers' nightmare {"->"}
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
