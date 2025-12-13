import Image from "next/image"
import WhatsappLogo from "@images/whatsapp.png"
import Link from "next/link"

export default function WhatsappContact() {
    return (
        <div className="fixed bottom-0 right-0 p-5 z-50">
            <Link href="https://chat.whatsapp.com/D09sAJ51EXX5MzuFOAmAAK?mode=hqrt2" title="Join our Whatsapp" target="_blank" className="">
                <Image src={WhatsappLogo} alt="whatsapp" width={70} className="bg-green-100 p-2 rounded-3xl rounded-bl-none" />
            </Link>
        </div>
    )
}