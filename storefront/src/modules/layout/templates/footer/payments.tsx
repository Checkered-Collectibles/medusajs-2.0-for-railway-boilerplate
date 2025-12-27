import Image from "next/image";

import UPI from "@images/payments/upi.png";


export default function PaymentLogos() {
    return (
        <div className="flex gap-2 items-center">
            <Image
                src="https://badges.razorpay.com/badge-light.png"
                alt="Razorpay | Payment Gateway | Neobank"
                width={113}
                height={45}
                referrerPolicy="origin"
            />
            <div className="border border-gray-300 h-[45px] flex items-center justify-center px-3 rounded">
                <Image
                    src={UPI}
                    alt="UPI"
                    width={80}
                    referrerPolicy="origin"
                />
            </div>
        </div>
    )
}