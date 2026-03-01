import type { Metadata } from "next";
import {
    MapPin,
    Clock,
    FlyingBox,
    CurrencyDollar,
    MagnifyingGlass,
    ExclamationCircle,
    PlaySolid,
    XCircle,
    Envelope,
    DocumentText
} from "@medusajs/icons";
import { clx } from "@medusajs/ui";

export const metadata: Metadata = {
    title: "Shipping Policy | Checkered Collectibles",
};

export default function ShippingPolicyPage() {
    return (
        <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                {/* --- Sticky Sidebar Navigation --- */}
                <aside className="lg:w-1/4 hidden md:block">
                    <div className="sticky top-24 space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-ui-fg-base mb-2 tracking-tight">Shipping Policy</h1>
                            <span className="inline-flex items-center rounded-full bg-ui-bg-subtle px-3 py-1 text-xs font-medium text-ui-fg-subtle ring-1 ring-inset ring-ui-border-base">
                                Last updated: 1 March 2026
                            </span>
                        </div>
                        <nav className="flex flex-col gap-1 border-l-2 border-ui-border-base pl-4 overflow-y-auto max-h-[70vh] pb-4">
                            {[
                                { id: "locations", label: "1. Serviceable Locations" },
                                { id: "processing", label: "2. Order Processing Time" },
                                { id: "delivery", label: "3. Delivery Time" },
                                { id: "charges", label: "4. Shipping Charges" },
                                { id: "tracking", label: "5. Order Tracking" },
                                { id: "delays", label: "6. Delayed or Failed Delivery" },
                                { id: "damages", label: "7. Damaged Packages" },
                                { id: "address", label: "8. Incorrect Address" },
                                { id: "contact", label: "9. Contact Information" },
                            ].map((item) => (
                                <a
                                    key={item.id}
                                    href={`#${item.id}`}
                                    className="py-1.5 text-sm font-medium text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* --- Main Content Area --- */}
                <div className="lg:w-3/4 space-y-16">

                    {/* Mobile Header (Shows only on small screens) */}
                    <div className="md:hidden mb-8">
                        <h1 className="text-3xl font-bold text-ui-fg-base mb-3 tracking-tight">Shipping Policy</h1>
                        <span className="inline-flex items-center rounded-full bg-ui-bg-subtle px-3 py-1 text-xs font-medium text-ui-fg-subtle ring-1 ring-inset ring-ui-border-base">
                            Last updated: 1 March 2026
                        </span>
                    </div>

                    {/* Intro */}
                    <section className="bg-ui-bg-subtle p-6 sm:p-8 rounded-2xl border border-ui-border-base shadow-sm">
                        <p className="text-ui-fg-base leading-relaxed text-base sm:text-lg">
                            This Shipping Policy explains how <strong className="font-bold">Checkered Collectibles</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) handles shipping and delivery for orders placed on <strong className="font-bold">checkered.in</strong>.
                        </p>
                    </section>

                    {/* 1. Serviceable Locations */}
                    <section id="locations" className="scroll-mt-32">
                        <SectionHeading icon={<MapPin />} title="1. Serviceable Locations" />
                        <div className="ml-0 sm:ml-12 text-ui-fg-subtle leading-relaxed">
                            <p>
                                We currently ship orders to most locations across India using trusted courier partners. If your pincode is unexpectedly non-serviceable by our logistics partners, we may contact you to cancel the order and process a full refund (if payment has already been made).
                            </p>
                        </div>
                    </section>

                    {/* 2. Order Processing Time */}
                    <section id="processing" className="scroll-mt-32">
                        <SectionHeading icon={<Clock />} title="2. Order Processing Time" />
                        <div className="ml-0 sm:ml-12 mb-6">
                            <div className="bg-ui-bg-base border border-ui-border-base p-5 rounded-xl shadow-sm flex items-center gap-4 w-fit">
                                <div className="bg-ui-bg-subtle p-3 rounded-full">
                                    <Clock className="text-ui-fg-base" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-bold text-ui-fg-muted tracking-wider">Dispatch Window</p>
                                    <p className="text-lg font-bold text-ui-fg-base">24–48 Business Hours</p>
                                </div>
                            </div>
                        </div>
                        <ul className="ml-0 sm:ml-12 space-y-3 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted">
                            <li>Orders are typically processed and dispatched within 24–48 business hours after successful payment.</li>
                            <li>Orders placed on weekends or public holidays may be processed on the next working day.</li>
                        </ul>
                    </section>

                    {/* 3. Delivery Time */}
                    <section id="delivery" className="scroll-mt-32">
                        <SectionHeading icon={<FlyingBox />} title="3. Delivery Time" />
                        <ul className="ml-0 sm:ml-12 space-y-3 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted">
                            <li>Standard delivery time is usually between <strong className="text-ui-fg-base">5–8 business days</strong> from the date of dispatch, depending on your location in India.</li>
                            <li>Remote or hard-to-reach areas may experience slightly longer delivery timelines.</li>
                        </ul>
                    </section>

                    {/* 4. Shipping Charges */}
                    <section id="charges" className="scroll-mt-32">
                        <SectionHeading icon={<CurrencyDollar />} title="4. Shipping Charges" />
                        <div className="ml-0 sm:ml-12 text-ui-fg-subtle leading-relaxed">
                            <p>
                                Shipping charges, if applicable, will be clearly displayed at checkout before you complete your order. From time to time, we may offer free shipping or promotional shipping rates, which will be prominently indicated on the website or automatically applied during checkout.
                            </p>
                        </div>
                    </section>

                    {/* 5. Order Tracking */}
                    <section id="tracking" className="scroll-mt-32">
                        <SectionHeading icon={<MagnifyingGlass />} title="5. Order Tracking" />
                        <ul className="ml-0 sm:ml-12 space-y-3 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted">
                            <li>Once your order is shipped, we will share tracking details via email, SMS, or within your account dashboard on the website.</li>
                            <li>You can use the tracking ID on the respective courier partner&apos;s website to monitor the status and expected delivery date of your shipment.</li>
                        </ul>
                    </section>

                    {/* 6. Delayed or Failed Delivery */}
                    <section id="delays" className="scroll-mt-32">
                        <SectionHeading icon={<ExclamationCircle />} title="6. Delayed or Failed Delivery" />
                        <ul className="ml-0 sm:ml-12 space-y-3 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted">
                            <li>While we strive to ensure timely delivery, delays may occur due to factors beyond our control, such as courier delays, weather conditions, strikes, local restrictions, or other logistical issues.</li>
                            <li>If delivery fails due to an incorrect address, unreachable phone number, or the recipient being unavailable, the courier may attempt re-delivery or return the shipment to us.</li>
                            <li>If an order is returned to us due to reasons attributable to the customer (incorrect address, not available, refusal to accept, etc.), <strong className="text-ui-fg-base">additional shipping charges may apply</strong> for reshipment.</li>
                        </ul>
                    </section>

                    {/* 7. Damaged Packages on Delivery */}
                    <section id="damages" className="scroll-mt-32">
                        <SectionHeading icon={<DocumentText />} title="7. Damaged Packages on Delivery" />

                        <p className="ml-0 sm:ml-12 text-ui-fg-subtle mb-6">
                            We pack all collectibles securely, but transit damage can occasionally happen. If the outer package appears tampered with, crushed, or visibly damaged upon arrival, please follow these steps:
                        </p>

                        <div className="ml-0 sm:ml-12 mb-8">
                            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 p-5 sm:p-6 rounded-xl shadow-sm">
                                <div className="flex gap-4">
                                    <PlaySolid className="text-orange-600 dark:text-orange-500 shrink-0 mt-0.5" />
                                    <div className="text-orange-900 dark:text-orange-300 text-sm leading-relaxed w-full">
                                        <p className="font-bold text-base mb-3">Mandatory Unboxing Video</p>
                                        <p className="mb-3">A <strong className="font-bold">clear, continuous video recording</strong> of the parcel being opened is mandatory to claim any transit damage. The video MUST:</p>
                                        <ul className="space-y-2 list-disc pl-5 marker:text-orange-600/50">
                                            <li>Start <strong className="font-bold">before</strong> the package seal is broken, showing the shipping label.</li>
                                            <li>Show the <strong className="font-bold">entire unboxing process</strong> without any cuts.</li>
                                            <li>Clearly show the damage to the product inside the box.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ul className="ml-0 sm:ml-12 space-y-3 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted">
                            <li>You must contact us within <strong className="text-ui-fg-base">24 hours of delivery</strong> with the unboxing video and clear photos.</li>
                            <li><strong className="text-ui-fg-base">Without proper evidence (a continuous unboxing video), we will not be able to process an exchange or refund.</strong></li>
                        </ul>
                    </section>

                    {/* 8. Incorrect or Incomplete Address */}
                    <section id="address" className="scroll-mt-32">
                        <SectionHeading icon={<XCircle />} title="8. Incorrect or Incomplete Address" />
                        <div className="ml-0 sm:ml-12 text-ui-fg-subtle leading-relaxed">
                            <p>
                                Please ensure your address and contact details are 100% accurate at the time of placing the order (including pin code and landmark). We are not responsible for delayed, lost, or failed deliveries due to incorrect or incomplete address details provided by the customer.
                            </p>
                        </div>
                    </section>

                    <hr className="border-ui-border-base my-12" />

                    {/* 9. Contact / Footer */}
                    <section id="contact" className="bg-ui-bg-subtle p-8 sm:p-10 rounded-3xl text-center space-y-6 border border-ui-border-base shadow-sm scroll-mt-32">
                        <div className="inline-flex items-center justify-center p-3 bg-ui-bg-base border border-ui-border-base rounded-full mb-2 shadow-sm">
                            <Envelope className="text-ui-fg-base" />
                        </div>
                        <h2 className="text-2xl font-bold text-ui-fg-base">Where is my order?</h2>
                        <p className="text-ui-fg-subtle max-w-md mx-auto">
                            If you have any questions regarding shipping, delivery times, or tracking your collectible, we're here to help.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-4">
                            <a href="mailto:hello@checkered.in" className="flex items-center gap-2 text-ui-fg-base font-medium hover:text-blue-600 transition-colors bg-ui-bg-base px-6 py-3 rounded-xl border border-ui-border-base shadow-sm w-full sm:w-auto justify-center">
                                hello@checkered.in
                            </a>
                        </div>

                        <p className="text-xs text-ui-fg-muted pt-8">
                            Checkered Collectibles and <span className="font-medium">checkered.in</span> are owned and operated by Shubhankar Trivedi in Fatehpur, UP, India.
                        </p>
                    </section>

                </div>
            </div>
        </main>
    );
}

// --- Helper Component for Headings ---
function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-4 mb-5">
            <div className="p-2.5 rounded-xl bg-ui-bg-base border border-ui-border-base shadow-sm text-ui-fg-base">
                {icon}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-ui-fg-base tracking-tight">
                {title}
            </h2>
        </div>
    );
}