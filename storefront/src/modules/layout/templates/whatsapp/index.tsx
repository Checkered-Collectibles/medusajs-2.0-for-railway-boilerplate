import Image from "next/image"
import WhatsappLogoWhite from "@images/whatsapp/logo-white.png";
import Qr from "@images/whatsapp/qr.png";
import Link from "next/link"

export default function WhatsappContact() {
    return (
        <div className="fixed bottom-0 right-0 p-5 z-30">
            <Link href="https://chat.whatsapp.com/D09sAJ51EXX5MzuFOAmAAK?mode=hqrt2" title="Join our Whatsapp" target="_blank" className="">
                <div className="bg-[#128c7e] p-2 rounded-3xl gap-3 flex flex-col items-center border border-black/10 shadow-lg hover:scale-105 duration-200 hover:shadow-xl">
                    <Image src={WhatsappLogoWhite} alt="whatsapp" width={50} className="" />
                    <Image src={Qr} alt="whatsapp qr" width={70} className="rounded-2xl hidden md:block" />
                </div>
            </Link>
        </div>
    )
}