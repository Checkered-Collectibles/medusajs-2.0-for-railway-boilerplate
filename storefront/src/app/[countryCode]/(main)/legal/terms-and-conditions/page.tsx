import type { Metadata } from "next";
import {
    BuildingStorefront,
    User,
    Key,
    Tag,
    Clock,
    CreditCard,
    FlyingBox,
    ExclamationCircle,
    ShieldCheck,
    DocumentText,
    Envelope,
    MapPin,
    Globe,
    Link,
    Calendar,
    Receipt,
    InformationCircle,
    BuildingTax
} from "@medusajs/icons";
import { clx } from "@medusajs/ui";

export const metadata: Metadata = {
    title: "Terms & Conditions | Checkered Collectibles",
};

export default function Terms() {
    return (
        <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                {/* --- Sticky Sidebar Navigation --- */}
                <aside className="lg:w-1/4 hidden md:block">
                    <div className="sticky top-24 space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-ui-fg-base mb-2 tracking-tight">Terms & Conditions</h1>
                            <span className="inline-flex items-center rounded-full bg-ui-bg-subtle px-3 py-1 text-xs font-medium text-ui-fg-subtle ring-1 ring-inset ring-ui-border-base">
                                Last updated: 1 March 2026
                            </span>
                        </div>
                        <nav className="flex flex-col gap-1 border-l-2 border-ui-border-base pl-4 overflow-y-auto max-h-[70vh] pb-4">
                            {[
                                { id: "business", label: "Business Information" },
                                { id: "eligibility", label: "Eligibility" },
                                { id: "accounts", label: "User Accounts & Security" },
                                { id: "products", label: "Products & Pricing" },
                                { id: "pricing-errors", label: "Pricing & Typographical Errors" },
                                { id: "pre-orders", label: "Pre-Orders Policy" },
                                { id: "orders", label: "Orders & Payments" },
                                { id: "shipping", label: "Shipping & Delivery" },
                                { id: "cancellations", label: "Cancellations & Refunds" },
                                { id: "usage", label: "Use of Website" },
                                { id: "ip", label: "Intellectual Property" },
                                { id: "liability", label: "Limitation of Liability" },
                                { id: "law", label: "Governing Law & Jurisdiction" },
                                { id: "links", label: "Third-Party Links" },
                                { id: "changes", label: "Changes to Terms" },
                                { id: "contact", label: "Contact Information" },
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
                        <h1 className="text-3xl font-bold text-ui-fg-base mb-3 tracking-tight">Terms & Conditions</h1>
                        <span className="inline-flex items-center rounded-full bg-ui-bg-subtle px-3 py-1 text-xs font-medium text-ui-fg-subtle ring-1 ring-inset ring-ui-border-base">
                            Last updated: 1 March 2026
                        </span>
                    </div>

                    {/* Intro */}
                    <section className="bg-ui-bg-subtle p-6 sm:p-8 rounded-2xl border border-ui-border-base shadow-sm">
                        <p className="text-ui-fg-base leading-relaxed text-base sm:text-lg">
                            Welcome to <strong className="font-bold">Checkered Collectibles</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;),
                            operated via <span className="underline decoration-ui-border-strong font-medium">checkered.in</span>.
                            By accessing or using this website, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our website.
                        </p>
                    </section>

                    {/* 1. Business Info */}
                    <section id="business" className="scroll-mt-32">
                        <SectionHeading icon={<BuildingStorefront />} title="1. Business Information" />
                        <div className="ml-0 sm:ml-12 text-ui-fg-subtle space-y-4 leading-relaxed">
                            <p>
                                Checkered Collectibles is currently an <strong>unregistered business</strong> (in the process of being registered), owned and operated by{" "}
                                <strong className="text-ui-fg-base">Shubhankar Trivedi</strong>.
                            </p>
                            <p className="flex items-center gap-2 text-ui-fg-base font-medium bg-ui-bg-subtle w-fit px-4 py-2 rounded-lg border border-ui-border-base">
                                <MapPin className="text-ui-fg-muted" />
                                Fatehpur, Uttar Pradesh, India
                            </p>
                            <p>
                                We sell collectibles, toys, and related products to customers across India through <strong className="text-ui-fg-base">checkered.in</strong>.
                            </p>
                        </div>
                    </section>

                    {/* 2. Eligibility */}
                    <section id="eligibility" className="scroll-mt-32">
                        <SectionHeading icon={<User />} title="2. Eligibility" />
                        <div className="ml-0 sm:ml-12 text-ui-fg-subtle leading-relaxed">
                            <p>
                                By using this website, you confirm that you are at least 18 years old or are accessing and using the website under the supervision of a parent or legal guardian.
                            </p>
                        </div>
                    </section>

                    {/* 3. User Accounts & Security */}
                    <section id="accounts" className="scroll-mt-32">
                        <SectionHeading icon={<Key />} title="3. User Accounts & Security" />
                        <ul className="ml-0 sm:ml-12 space-y-3 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted">
                            <li>You may be required to create an account to access certain features or track orders. You are solely responsible for maintaining the confidentiality of your account credentials.</li>
                            <li>You agree to accept responsibility for all activities that occur under your account.</li>
                            <li>We reserve the right to suspend or terminate accounts that violate our terms, display fraudulent activity, or attempt to bypass specific checkout rules.</li>
                        </ul>
                    </section>

                    {/* 4. Products & Pricing */}
                    <section id="products" className="scroll-mt-32">
                        <SectionHeading icon={<Tag />} title="4. Products & Pricing" />
                        <ul className="ml-0 sm:ml-12 space-y-3 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted">
                            <li>Product images on the website are for illustrative purposes only. Actual products, colors, and packaging may vary slightly.</li>
                            <li>All prices listed on the website are in <strong className="text-ui-fg-base">Indian Rupees (INR)</strong> and are subject to change without prior notice.</li>
                            <li>Product availability is subject to stock. If a product you ordered is unavailable, we may contact you to offer an alternative or process a cancellation.</li>
                        </ul>
                    </section>

                    {/* 5. Typographical & Pricing Errors */}
                    <section id="pricing-errors" className="scroll-mt-32">
                        <SectionHeading icon={<ExclamationCircle />} title="5. Pricing & Typographical Errors" />
                        <div className="ml-0 sm:ml-12 text-ui-fg-subtle leading-relaxed">
                            <p>
                                We strive for accuracy, but pricing or typographical errors may occasionally occur. In the event that a product is listed at an incorrect price or with incorrect information due to an error, we reserve the right to <strong>refuse or cancel any orders</strong> placed for that product.
                            </p>
                            <p className="mt-2">
                                If your payment has already been processed for the purchase and your order is cancelled, we will issue a full refund to your original payment method.
                            </p>
                        </div>
                    </section>

                    {/* 6. Pre-Orders Policy */}
                    <section id="pre-orders" className="scroll-mt-32">
                        <SectionHeading icon={<Clock />} title="6. Pre-Orders Policy" />
                        <div className="ml-0 sm:ml-12 space-y-4 text-ui-fg-subtle leading-relaxed">
                            <p>
                                Pre-order delivery dates are estimated based on manufacturer timelines and are <strong>subject to delays</strong> beyond our control.
                            </p>
                            <p>
                                In the rare event of severe stock allocation cuts or short-packing by the manufacturer, pre-orders will be fulfilled strictly in chronological order based on the date the order was placed. If we are unable to fulfill your pre-order due to insufficient allocation, you will receive a <strong>full refund</strong>.
                            </p>
                        </div>
                    </section>

                    {/* 7. Orders & Payments */}
                    <section id="orders" className="scroll-mt-32">
                        <SectionHeading icon={<CreditCard />} title="7. Orders & Payments" />
                        <ul className="ml-0 sm:ml-12 space-y-3 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted">
                            <li>Orders are considered confirmed only after we receive a successful payment through our payment gateway (such as Razorpay).</li>
                            <li>You are responsible for providing accurate and complete information, including your name, address, phone number, and email.</li>
                            <li>We reserve the right to cancel or refuse any order if we suspect fraud, incorrect information, or misuse of the website.</li>
                        </ul>

                        {/* Special Checkout Rules Callout */}
                        <div className="ml-0 sm:ml-12 mt-6">
                            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-5 sm:p-6 rounded-xl shadow-sm">
                                <div className="flex gap-4">
                                    <InformationCircle className="text-blue-600 dark:text-blue-500 shrink-0 mt-0.5" />
                                    <div className="text-blue-900 dark:text-blue-300 text-sm leading-relaxed">
                                        <p className="font-bold text-base mb-1">Special Checkout Rules</p>
                                        <p>
                                            To ensure fair distribution among collectors, certain high-demand products (such as <strong>Hot Wheels Mainlines</strong>) are subject to specific checkout rules, like the "Fantasy Rule." These rules are updated periodically based on releases. Any active rules will be clearly communicated on the product pages or in the cart. <strong>Orders that violate these specific checkout rules may be cancelled at our discretion.</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 8. Shipping & Delivery */}
                    <section id="shipping" className="scroll-mt-32">
                        <SectionHeading icon={<FlyingBox />} title="8. Shipping & Delivery" />

                        <div className="ml-0 sm:ml-12 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-5 rounded-xl border border-ui-border-base bg-ui-bg-subtle shadow-sm flex flex-col gap-1">
                                <span className="text-xs uppercase font-bold text-ui-fg-muted tracking-wider">Estimated Delivery</span>
                                <p className="text-lg font-bold text-ui-fg-base">5–8 Business Days</p>
                                <p className="text-xs text-ui-fg-subtle">Depending on your location</p>
                            </div>
                            <div className="p-5 rounded-xl border border-ui-border-base bg-ui-bg-subtle shadow-sm flex flex-col gap-1">
                                <span className="text-xs uppercase font-bold text-ui-fg-muted tracking-wider">Delivery Coverage</span>
                                <p className="text-lg font-bold text-ui-fg-base">Across India</p>
                                <p className="text-xs text-ui-fg-subtle">Via third-party couriers</p>
                            </div>
                        </div>

                        <ul className="ml-0 sm:ml-12 space-y-3 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted">
                            <li>Once your order is shipped, we will share tracking details where available.</li>
                            <li>We are not responsible for delays caused by courier partners, weather, strikes, holidays, or other events beyond our control.</li>
                        </ul>
                    </section>

                    {/* 9. Cancellations, Refunds & Exchanges */}
                    <section id="cancellations" className="scroll-mt-32">
                        <SectionHeading icon={<Receipt />} title="9. Cancellations, Refunds & Exchanges" />

                        <div className="ml-0 sm:ml-12 space-y-10">
                            {/* 6.1 & 6.2 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-base font-bold text-ui-fg-base mb-3">9.1 Order Cancellation</h3>
                                    <ul className="space-y-2 list-disc pl-5 text-sm text-ui-fg-subtle marker:text-ui-fg-muted">
                                        <li>You may request cancellation <strong>only before</strong> it has been shipped.</li>
                                        <li>Once shipped, orders <strong>cannot be cancelled</strong>.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-ui-fg-base mb-3">9.2 Refunds</h3>
                                    <ul className="space-y-2 list-disc pl-5 text-sm text-ui-fg-subtle marker:text-ui-fg-muted">
                                        <li>Available only for successfully cancelled pre-shipment orders.</li>
                                        <li>Processed to your original payment method within <strong>5–7 business days</strong>.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* 6.3 Callout Box */}
                            <div>
                                <h3 className="text-base font-bold text-ui-fg-base mb-4">9.3 Exchanges for Damaged Products</h3>

                                <div className="bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 p-5 sm:p-6 rounded-xl mb-6 shadow-sm">
                                    <div className="flex gap-4">
                                        <ExclamationCircle className="text-orange-600 dark:text-orange-500 shrink-0 mt-0.5" />
                                        <div className="text-orange-900 dark:text-orange-300 text-sm leading-relaxed">
                                            <p className="font-bold text-base mb-1">Mandatory Unboxing Video</p>
                                            <p>We only offer exchanges if the product is damaged on delivery. A <strong>clear, continuous video recording</strong> of the parcel being opened is required. The video must start before the package is opened and show the full unboxing and the damage.</p>
                                        </div>
                                    </div>
                                </div>

                                <ul className="space-y-3 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted">
                                    <li>You must contact us within <strong>24 hours of delivery</strong> with the proof of damage.</li>
                                    <li>If approved, we will arrange a replacement subject to availability. Otherwise, we may offer store credit or an alternative solution at our discretion.</li>
                                    <li>We do not accept returns/exchanges for change of mind, minor cosmetic imperfections on packaging, or normal wear and tear.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 10. Use of Website */}
                    <section id="usage" className="scroll-mt-32">
                        <SectionHeading icon={<Globe />} title="10. Use of Website" />
                        <ul className="ml-0 sm:ml-12 space-y-3 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted">
                            <li>You agree not to misuse the website, attempt to hack it, or perform any action that may disrupt its normal operation.</li>
                            <li>You agree not to copy, distribute, or modify any content from the website without our prior written permission.</li>
                        </ul>
                    </section>

                    {/* 11. Intellectual Property */}
                    <section id="ip" className="scroll-mt-32">
                        <SectionHeading icon={<DocumentText />} title="11. Intellectual Property" />
                        <div className="ml-0 sm:ml-12 text-ui-fg-subtle leading-relaxed">
                            <p>
                                All content on <strong className="text-ui-fg-base">checkered.in</strong>, including but not limited to logos, text, images, graphics, and designs, is the property of Checkered Collectibles or its respective owners and is protected by applicable intellectual property laws.
                            </p>
                        </div>
                    </section>

                    {/* 12. Limitation of Liability */}
                    <section id="liability" className="scroll-mt-32">
                        <SectionHeading icon={<ShieldCheck />} title="12. Limitation of Liability" />
                        <ul className="ml-0 sm:ml-12 space-y-3 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted">
                            <li>To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising out of your use of this website or purchase of our products.</li>
                            <li>Our total liability, if any, is limited to the amount you paid for the specific order giving rise to the claim.</li>
                        </ul>
                    </section>

                    {/* 13. Governing Law & Jurisdiction */}
                    <section id="law" className="scroll-mt-32">
                        <SectionHeading icon={<BuildingTax />} title="13. Governing Law & Jurisdiction" />
                        <div className="ml-0 sm:ml-12 text-ui-fg-subtle leading-relaxed">
                            <p>
                                These Terms & Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these Terms or your use of the website shall be subject to the exclusive jurisdiction of the courts located in <strong>Fatehpur, Uttar Pradesh</strong>.
                            </p>
                        </div>
                    </section>

                    {/* 14. Third-Party Links */}
                    <section id="links" className="scroll-mt-32">
                        <SectionHeading icon={<Link />} title="14. Third-Party Links" />
                        <div className="ml-0 sm:ml-12 text-ui-fg-subtle leading-relaxed">
                            <p>Our website may contain links to third-party websites. We are not responsible for the content, policies, or practices of such websites.</p>
                        </div>
                    </section>

                    {/* 15. Changes to Terms */}
                    <section id="changes" className="scroll-mt-32">
                        <SectionHeading icon={<Calendar />} title="15. Changes to These Terms" />
                        <div className="ml-0 sm:ml-12 text-ui-fg-subtle leading-relaxed">
                            <p>We may update these Terms & Conditions from time to time. Any changes will be posted on this page with an updated &quot;Last updated&quot; date. Continued use of the website after such changes constitutes your acceptance of the revised terms.</p>
                        </div>
                    </section>

                    <hr className="border-ui-border-base my-12" />

                    {/* 16. Contact / Footer */}
                    <section id="contact" className="bg-ui-bg-subtle p-8 sm:p-10 rounded-3xl text-center space-y-6 border border-ui-border-base shadow-sm scroll-mt-32">
                        <div className="inline-flex items-center justify-center p-3 bg-ui-bg-base border border-ui-border-base rounded-full mb-2 shadow-sm">
                            <Envelope className="text-ui-fg-base" />
                        </div>
                        <h2 className="text-2xl font-bold text-ui-fg-base">Questions about these Terms?</h2>
                        <p className="text-ui-fg-subtle max-w-md mx-auto">
                            If you have any questions or concerns regarding our Terms & Conditions, please don't hesitate to reach out to us.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-4">
                            <a href="mailto:hello@checkered.in" className="flex items-center gap-2 text-ui-fg-base font-medium hover:text-blue-600 transition-colors bg-ui-bg-base px-6 py-3 rounded-xl border border-ui-border-base shadow-sm w-full sm:w-auto justify-center">
                                hello@checkered.in
                            </a>
                        </div>

                        <p className="text-xs text-ui-fg-muted pt-8">
                            Checkered Collectibles is owned and operated by Shubhankar Trivedi.
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