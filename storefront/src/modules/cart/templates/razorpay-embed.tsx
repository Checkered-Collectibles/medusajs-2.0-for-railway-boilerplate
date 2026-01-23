"use client";

import Script from "next/script";

type Props = {
    amount: number
}

export default function RazorpayEmbed({ amount }: Props) {
    const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY;
    const AMOUNT = amount; // in paise

    const handleScriptLoad = () => {
        // Check if the Razorpay object is available on the window
        if (window.RazorpayAffordabilitySuite) {
            const widgetConfig = {
                key: RAZORPAY_KEY,
                amount: AMOUNT,
            };

            const rzpAffordabilitySuite = new window.RazorpayAffordabilitySuite(
                widgetConfig
            );
            rzpAffordabilitySuite.render();
        }
    };

    return (
        <div className="p-4">
            {/* <h3>Affordability Widget</h3> */}

            {/* 1. The Container for the widget */}
            <div id="razorpay-affordability-widget"></div>

            {/* 2. The Script Loader */}
            <Script
                src="https://cdn.razorpay.com/widgets/affordability/affordability.js"
                strategy="afterInteractive"
                onLoad={handleScriptLoad}
            />
        </div>
    );
}