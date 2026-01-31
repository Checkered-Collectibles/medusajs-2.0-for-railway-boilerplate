"use client";

import Image from "next/image";
import Link from "next/link";
import WhatsappLogo from "@images/whatsapp/logo-white.png";
import { metaEvent } from "@lib/meta/fpixel";

export default function Socials() {
    const handleJoin = () => {
        metaEvent("Lead", {
            content_name: "WhatsApp Group",
            content_category: "Community",
            currency: "INR"
        })
    }
    return (
        <div className="mt-1 text-sm">
            <Link onClick={handleJoin} href="https://chat.whatsapp.com/D09sAJ51EXX5MzuFOAmAAK?mode=hqrt2" title="Join our Whatsapp Group" target="_blank"
                className="flex gap-2 items-center justify-center px-3 py-2 bg-[#128c7e] rounded-lg border text-white border-black/10">
                <Image src={WhatsappLogo} alt="whatsapp" width={30} className="" /> Join our Whatsapp group
            </Link>
        </div>
    )
}