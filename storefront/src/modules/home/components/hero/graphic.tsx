"use client";

import Image from "next/image";
import HeroImage1 from "@images/ferrari-hero.png";
import HeroImage2 from "@images/bugatti-hero.png";
import EuroSpeed from "@images/euro-speed.png";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

export default function HeroGraphic() {
    const container = useRef(null);

    useGSAP(() => {
        gsap.from(".hero-img", {
            y: 200,           // start from below
            opacity: 0,
            duration: 2,
            ease: "power4.out",
            stagger: 0.5,     // delay between images
        });
    }, { scope: container });

    return (
        <div ref={container} className="w-full flex justify-center items-end">
            <Image
                src={HeroImage2}
                width={1200}
                priority
                draggable={false}
                alt="Hero image 1"
                className="hero-img drop-shadow-xl"
            />
            <Image
                src={HeroImage1}
                width={1200}
                priority
                draggable={false}
                alt="Hero image 2"
                className="hero-img drop-shadow-2xl scale-x-[-1]"
            />
            <div title="Hot Wheels Premium Euro Speed set coming soon" className="hero-img absolute bottom-0 left-0 bg-white border shadow-md rounded-3xl m-2 p-2 flex flex-col items-center">
                <Image
                    src={EuroSpeed}
                    width={120}
                    draggable={false}
                    // priority
                    alt="Euro Speed"
                    className=""
                />
                <p className="text-xs italic text-gray-500">Coming soon</p>
            </div>
        </div>
    );
}