import type { Metadata } from "next";
import {
    XCircle,
    Receipt,
    ArrowPath,
    ExclamationCircle,
    ShieldCheck,
    DocumentText,
    Envelope,
    PlaySolid
} from "@medusajs/icons";
import { clx } from "@medusajs/ui";

export const metadata: Metadata = {
    title: "Cancellation & Refund Policy | Checkered Collectibles",
};

export default function CancellationAndRefundPolicyPage() {
    return (
        <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                {/* --- Sticky Sidebar Navigation --- */}
                <aside className="lg:w-1/4 hidden md:block">
                    <div className="sticky top-24 space-y-6">
                        <div>
                            <h1 className="text-3xl font-extrabold text-ui-fg-base mb-2 tracking-tight">Cancellation & Refunds</h1>
                            <span className="inline-flex items-center rounded-full bg-ui-bg-subtle px-3 py-1 text-xs font-medium text-ui-fg-subtle ring-1 ring-inset ring-ui-border-base">
                                Last updated: 1 March 2026
                            </span>
                        </div>
                        <nav className="flex flex-col gap-1 border-l-2 border-ui-border-base pl-4 overflow-y-auto max-h-[70vh] pb-4">
                            {[
                                { id: "cancellation", label: "1. Order Cancellation" },
                                { id: "refunds", label: "2. Refunds" },
                                { id: "returns", label: "3. Returns" },
                                { id: "exchanges", label: "4. Exchanges for Damage" },
                                { id: "exceptions", label: "5. Non-Refundable Items" },
                                { id: "process", label: "6. How to Raise a Request" },
                                { id: "contact", label: "7. Contact Information" },
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
                        <h1 className="text-3xl font-extrabold text-ui-fg-base mb-3 tracking-tight">Cancellation & Refunds</h1>
                        <span className="inline-flex items-center rounded-full bg-ui-bg-subtle px-3 py-1 text-xs font-medium text-ui-fg-subtle ring-1 ring-inset ring-ui-border-base">
                            Last updated: 1 March 2026
                        </span>
                    </div>

                    {/* Intro */}
                    <section className="bg-ui-bg-subtle p-6 sm:p-8 rounded-2xl border border-ui-border-base shadow-sm">
                        <p className="text-ui-fg-base leading-relaxed text-base sm:text-lg">
                            This Cancellation & Refund Policy explains how cancellations, refunds, and exchanges are handled for orders placed on <strong className="font-bold">checkered.in</strong>, operated by <strong className="font-bold">Checkered Collectibles</strong>.
                        </p>
                    </section>

                    {/* 1. Order Cancellation */}
                    <section id="cancellation" className="scroll-mt-32">
                        <SectionHeading icon={<XCircle />} title="1. Order Cancellation" />
                        <ul className="ml-0 sm:ml-12 space-y-4 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted">
                            <li>
                                You may request cancellation of your order <strong className="text-ui-fg-base">only before it has been shipped</strong>.
                            </li>
                            <li>
                                Once an order is marked as &quot;Shipped&quot; or handed over to the courier partner, it <strong className="text-ui-fg-base">cannot be cancelled</strong>.
                            </li>
                            <li>
                                To request a cancellation, please contact us as soon as possible at <strong className="text-ui-fg-base">hello@checkered.in</strong>, mentioning your order ID.
                            </li>
                        </ul>
                    </section>

                    {/* 2. Refunds */}
                    <section id="refunds" className="scroll-mt-32">
                        <SectionHeading icon={<Receipt />} title="2. Refunds" />
                        <ul className="ml-0 sm:ml-12 space-y-4 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted">
                            <li>
                                Refunds are applicable only for orders successfully cancelled <strong className="text-ui-fg-base">before shipment</strong>.
                            </li>
                            <li>
                                Once approved, refunds will be processed to your original payment method within <strong className="text-ui-fg-base">5–7 business days</strong>, subject to bank and payment gateway timelines.
                            </li>
                            <li>
                                We are not responsible for delays caused by banking or payment gateway systems once the refund has been initiated from our end.
                            </li>
                        </ul>
                    </section>

                    {/* 3. Returns */}
                    <section id="returns" className="scroll-mt-32">
                        <SectionHeading icon={<ArrowPath />} title="3. Returns" />

                        <div className="ml-0 sm:ml-12 mb-6">
                            <div className="bg-ui-bg-subtle border border-ui-border-base p-5 rounded-xl shadow-sm">
                                <p className="font-bold text-ui-fg-base mb-2">The Collectors' Policy on Packaging</p>
                                <p className="text-sm text-ui-fg-subtle leading-relaxed">
                                    As we deal in collectibles and toys, outer packaging (blister cards, boxes) may sometimes show minor shelf wear, soft corners, or transit marks. <strong className="text-ui-fg-base">These are not considered defects.</strong> We do not accept returns for non-damaged products, change of mind, or minor cosmetic damage to outer packaging.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 4. Exchanges for Damaged Products */}
                    <section id="exchanges" className="scroll-mt-32">
                        <SectionHeading icon={<ExclamationCircle />} title="4. Exchanges for Damaged Products" />

                        <p className="ml-0 sm:ml-12 text-ui-fg-subtle mb-6">
                            If you receive a product that is <strong className="text-ui-fg-base">physically damaged on delivery</strong>, you may request an exchange subject to the strict evidence requirements below.
                        </p>

                        <div className="ml-0 sm:ml-12 mb-8">
                            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-5 sm:p-6 rounded-xl shadow-sm">
                                <div className="flex gap-4">
                                    <PlaySolid className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                                    <div className="text-amber-900 dark:text-amber-300 text-sm leading-relaxed w-full">
                                        <p className="font-bold text-base mb-3">Mandatory Unboxing Video Requirements</p>
                                        <p className="mb-3">A <strong className="font-bold">clear, continuous video recording</strong> of the parcel being opened is mandatory for any exchange claim. The video MUST:</p>
                                        <ul className="space-y-2 list-disc pl-5 marker:text-amber-600/50">
                                            <li>Start <strong className="font-bold">before</strong> the package is opened, clearly showing the unopened parcel and the shipping label.</li>
                                            <li>Show the <strong className="font-bold">entire unboxing process</strong> without any cuts, pauses, or edits.</li>
                                            <li>Clearly show the damaged area of the product immediately upon taking it out of the box.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ul className="ml-0 sm:ml-12 space-y-4 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted">
                            <li>You must contact us within <strong className="text-ui-fg-base">24 hours of delivery</strong>, sharing the opening video and clear photos of the damage.</li>
                            <li>We will review the evidence. If the claim is approved, we will arrange an exchange for the same product, subject to stock availability.</li>
                            <li>If an exact replacement is not available, we may offer store credit or an alternative product of similar value at our discretion.</li>
                            <li><strong className="text-ui-fg-base">Claims received after 24 hours of delivery or without proper video proof will not be accepted.</strong></li>
                        </ul>
                    </section>

                    {/* 5. Exceptions */}
                    <section id="exceptions" className="scroll-mt-32">
                        <SectionHeading icon={<ShieldCheck />} title="5. Non-Refundable & Non-Exchangeable Situations" />
                        <ul className="ml-0 sm:ml-12 space-y-3 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted">
                            <li>Change of mind after purchase or shipment.</li>
                            <li>Minor imperfections in outer packaging (blister cards, boxes) that do not affect the product itself.</li>
                            <li>Damage caused by misuse, mishandling, or improper storage by the customer after delivery.</li>
                            <li>Failure to provide a valid, continuous opening video as specified in Section 4.</li>
                        </ul>
                    </section>

                    {/* 6. Process */}
                    <section id="process" className="scroll-mt-32">
                        <SectionHeading icon={<DocumentText />} title="6. How to Raise a Request" />
                        <p className="ml-0 sm:ml-12 text-ui-fg-subtle mb-4">
                            To raise a cancellation or damaged product request, please email us with the following details:
                        </p>
                        <ul className="ml-0 sm:ml-12 space-y-3 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted">
                            <li><strong className="text-ui-fg-base">Your full name</strong></li>
                            <li><strong className="text-ui-fg-base">Order ID</strong> (e.g., #1024)</li>
                            <li><strong className="text-ui-fg-base">Registered mobile number and email</strong></li>
                            <li>For damage claims: Attach the <strong className="text-ui-fg-base">mandatory unboxing video</strong> and clear photos of both the product and the packaging.</li>
                        </ul>
                    </section>

                    <hr className="border-ui-border-base my-12" />

                    {/* 7. Contact / Footer */}
                    <section id="contact" className="bg-ui-bg-subtle p-8 sm:p-10 rounded-3xl text-center space-y-6 border border-ui-border-base shadow-sm scroll-mt-32">
                        <div className="inline-flex items-center justify-center p-3 bg-ui-bg-base border border-ui-border-base rounded-full mb-2 shadow-sm">
                            <Envelope className="text-ui-fg-base" />
                        </div>
                        <h2 className="text-2xl font-bold text-ui-fg-base">Need to raise a request?</h2>
                        <p className="text-ui-fg-subtle max-w-md mx-auto">
                            For any questions or concerns related to cancellations, refunds, or exchanges, please reach out to our support team.
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