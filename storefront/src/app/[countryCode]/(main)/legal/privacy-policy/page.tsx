import type { Metadata } from "next";
import {
    DocumentText,
    Server,
    ShieldCheck,
    Globe,
    Users,
    Clock,
    User,
    Link,
    InformationCircle,
    Calendar,
    Envelope,
    CreditCard,
    ChartBar,
    Trash,
    PaperClip
} from "@medusajs/icons";
import { clx } from "@medusajs/ui";

export const metadata: Metadata = {
    title: "Privacy Policy | Checkered Collectibles",
};

export default function PrivacyPolicyPage() {
    return (
        <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                {/* --- Sticky Sidebar Navigation --- */}
                <aside className="lg:w-1/4 hidden md:block">
                    <div className="sticky top-24 space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-ui-fg-base mb-2 tracking-tight">Privacy Policy</h1>
                            <span className="inline-flex items-center rounded-full bg-ui-bg-subtle px-3 py-1 text-xs font-medium text-ui-fg-subtle ring-1 ring-inset ring-ui-border-base">
                                Last updated: 1 March 2026
                            </span>
                        </div>
                        <nav className="flex flex-col gap-1 border-l-2 border-ui-border-base pl-4 overflow-y-auto max-h-[70vh] pb-4">
                            {[
                                { id: "collect", label: "Information We Collect" },
                                { id: "use", label: "How We Use Your Info" },
                                { id: "security", label: "Payments & Security" },
                                { id: "analytics", label: "Analytics & Tracking" },
                                { id: "marketing", label: "Marketing & Communications" },
                                { id: "sharing", label: "Sharing of Information" },
                                { id: "retention", label: "Data Retention" },
                                { id: "rights", label: "Your Rights & Deletion" },
                                { id: "links", label: "Third-Party Links" },
                                { id: "children", label: "Children's Privacy" },
                                { id: "changes", label: "Changes to Policy" },
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
                        <h1 className="text-3xl font-bold text-ui-fg-base mb-3 tracking-tight">Privacy Policy</h1>
                        <span className="inline-flex items-center rounded-full bg-ui-bg-subtle px-3 py-1 text-xs font-medium text-ui-fg-subtle ring-1 ring-inset ring-ui-border-base">
                            Last updated: 1 March 2026
                        </span>
                    </div>

                    {/* Intro */}
                    <section className="bg-ui-bg-subtle p-6 sm:p-8 rounded-2xl border border-ui-border-base shadow-sm">
                        <p className="text-ui-fg-base leading-relaxed text-base sm:text-lg mb-4">
                            This Privacy Policy explains how <strong className="font-bold">Checkered Collectibles</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects, uses, and protects your personal information when you use <span className="underline decoration-ui-border-strong font-medium">checkered.in</span>.
                        </p>
                        <p className="text-ui-fg-subtle text-sm">
                            We are committed to protecting your privacy and process your data in compliance with India's <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>.
                        </p>
                    </section>

                    {/* 1. Information We Collect */}
                    <section id="collect" className="scroll-mt-32">
                        <SectionHeading icon={<DocumentText />} title="1. Information We Collect" />

                        <div className="ml-0 sm:ml-12 mb-6">
                            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-5 rounded-xl shadow-sm">
                                <div className="flex gap-4">
                                    <User className="text-blue-600 dark:text-blue-500 shrink-0 mt-0.5" />
                                    <div className="text-blue-900 dark:text-blue-300 text-sm leading-relaxed">
                                        <p className="font-bold text-base mb-1">Mandatory Accounts</p>
                                        <p>To provide a secure and fair shopping experience for all collectors, we do not offer guest checkout. You are required to create an account to purchase any product, which allows us to securely manage your order history and apply checkout rules.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ul className="ml-0 sm:ml-12 space-y-4 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted">
                            <li>
                                <strong className="text-ui-fg-base">Account & Identity Details:</strong> Name, shipping address, billing address, phone number, email address, and account password (securely hashed).
                            </li>
                            <li>
                                <strong className="text-ui-fg-base">Order Information:</strong> Products purchased, order value, and payment method used.
                            </li>
                            <li>
                                <strong className="text-ui-fg-base">Technical & Usage Data:</strong> IP address, browser type, device information, and interactions with our website (collected via analytics tools).
                            </li>
                        </ul>
                    </section>

                    {/* 2. How We Use Your Information */}
                    <section id="use" className="scroll-mt-32">
                        <SectionHeading icon={<Server />} title="2. How We Use Your Information" />
                        <ul className="ml-0 sm:ml-12 space-y-3 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted">
                            <li>To create and manage your mandatory user account.</li>
                            <li>To process, fulfill, and deliver your orders accurately within India.</li>
                            <li>To communicate order updates, shipping details, and support responses.</li>
                            <li>To send you product updates, offers, and newsletters (if opted in).</li>
                            <li>To analyze website performance and improve our customer experience.</li>
                            <li>To comply with legal obligations, resolve disputes, and prevent fraud or bot-purchasing.</li>
                        </ul>
                    </section>

                    {/* 3. Payments & Security */}
                    <section id="security" className="scroll-mt-32">
                        <SectionHeading icon={<ShieldCheck />} title="3. Payments & Security" />

                        <div className="ml-0 sm:ml-12 mb-6">
                            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-5 rounded-xl shadow-sm">
                                <div className="flex gap-4">
                                    <CreditCard className="text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
                                    <div className="text-green-900 dark:text-green-300 text-sm leading-relaxed">
                                        <p className="font-bold text-base mb-1">Zero Financial Data Storage</p>
                                        <p>We do <strong>not</strong> store your full card details, UPI PIN, or net banking credentials on our servers. All transactions are securely encrypted and processed by our payment partners.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ul className="ml-0 sm:ml-12 space-y-3 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted">
                            <li>We use trusted third-party payment gateways (such as Razorpay) to process payments securely.</li>
                            <li>All payment-related information is handled directly by the payment gateway in accordance with strict PCI-DSS security and compliance standards.</li>
                        </ul>
                    </section>

                    {/* 4. Analytics & Tracking */}
                    <section id="analytics" className="scroll-mt-32">
                        <SectionHeading icon={<ChartBar />} title="4. Analytics & Tracking" />
                        <div className="ml-0 sm:ml-12 text-ui-fg-subtle leading-relaxed mb-4">
                            <p>To understand how collectors use our website and to improve our services, we use industry-standard tracking tools. These tools collect anonymous or aggregated data about your browsing behavior.</p>
                        </div>
                        <ul className="ml-0 sm:ml-12 space-y-3 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted">
                            <li><strong>Google Analytics & PostHog:</strong> Used to track website traffic, page views, and user interactions to help us optimize the website layout and speed.</li>
                            <li><strong>Meta (Facebook) Pixel:</strong> Used to measure the effectiveness of our advertising campaigns and deliver relevant product recommendations on social media.</li>
                            <li>You can disable tracking cookies through your browser settings or opt out of personalized ads via your Meta account settings.</li>
                        </ul>
                    </section>

                    {/* 5. Marketing & Communications */}
                    <section id="marketing" className="scroll-mt-32">
                        <SectionHeading icon={<PaperClip />} title="5. Marketing & Communications" />
                        <div className="ml-0 sm:ml-12 text-ui-fg-subtle leading-relaxed">
                            <p>
                                When you create an account, you may choose to subscribe to our newsletter. We use this to send you exciting updates about new collectible drops, restocks, and exclusive offers.
                            </p>
                            <p className="mt-4 font-medium text-ui-fg-base">
                                You have the right to opt out at any time. Every marketing email we send includes a clear "Unsubscribe" link at the bottom. Clicking this link will immediately remove you from our promotional mailing list (though you will still receive essential transactional emails regarding your orders).
                            </p>
                        </div>
                    </section>

                    {/* 6. Sharing of Information */}
                    <section id="sharing" className="scroll-mt-32">
                        <SectionHeading icon={<Users />} title="6. Sharing of Information" />

                        <div className="ml-0 sm:ml-12 space-y-4">
                            <p className="text-ui-fg-base font-medium border-l-4 border-blue-500 pl-4 py-1">
                                We do <strong>not</strong> sell, rent, or trade your personal information to third-party data brokers.
                            </p>
                            <p className="text-ui-fg-subtle">We only share necessary information with trusted partners to operate our business, including:</p>
                            <ul className="space-y-2 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted">
                                <li><strong>Logistics & Courier Partners:</strong> (e.g., Shiprocket) to deliver your orders across India.</li>
                                <li><strong>Payment Gateways:</strong> (e.g., Razorpay) for processing your transactions.</li>
                                <li><strong>Analytics & Marketing Platforms:</strong> (e.g., Google, Meta, PostHog) to provide insights and advertising, as detailed above.</li>
                                <li><strong>Legal Authorities:</strong> Government or regulatory bodies, if required by Indian law or to respond to valid legal processes.</li>
                            </ul>
                        </div>
                    </section>

                    {/* 7. Data Retention */}
                    <section id="retention" className="scroll-mt-32">
                        <SectionHeading icon={<Clock />} title="7. Data Retention" />
                        <div className="ml-0 sm:ml-12 text-ui-fg-subtle leading-relaxed">
                            <p>
                                We retain your personal information only for as long as necessary to maintain your account, fulfill your orders, and provide customer support. Certain transaction data may be kept for a longer period strictly to comply with accounting, tax, and legal obligations in India.
                            </p>
                        </div>
                    </section>

                    {/* 8. Your Rights & Account Deletion */}
                    <section id="rights" className="scroll-mt-32">
                        <SectionHeading icon={<Trash />} title="8. Your Rights & Account Deletion" />
                        <p className="ml-0 sm:ml-12 text-ui-fg-subtle mb-4">Under the DPDP Act, you have specific rights regarding your personal data:</p>
                        <ul className="ml-0 sm:ml-12 space-y-3 list-disc pl-5 text-ui-fg-subtle leading-relaxed marker:text-ui-fg-muted mb-6">
                            <li><strong>Right to Access:</strong> You may request a copy of the personal data we hold about you.</li>
                            <li><strong>Right to Correction:</strong> You can update your shipping addresses and personal details directly within your account dashboard.</li>
                        </ul>

                        <div className="ml-0 sm:ml-12">
                            <div className="bg-ui-bg-base border border-ui-border-base p-5 rounded-xl shadow-sm">
                                <h4 className="font-bold text-ui-fg-base mb-2">How to Delete Your Account & Data</h4>
                                <p className="text-sm text-ui-fg-subtle mb-3">
                                    If you wish to permanently close your Checkered Collectibles account and request the erasure of your personal data, please email us directly from the email address associated with your account.
                                </p>
                                <p className="text-sm font-mono bg-ui-bg-subtle px-3 py-2 rounded-md border border-ui-border-base text-ui-fg-base inline-block">
                                    Email: hello@checkered.in<br />
                                    Subject: Data Deletion Request
                                </p>
                                <p className="text-xs text-ui-fg-muted mt-3">
                                    *Note: We may be required to retain certain records of past purchases for tax and fraud-prevention purposes, even after account deletion.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 9. Third-Party Links */}
                    <section id="links" className="scroll-mt-32">
                        <SectionHeading icon={<Link />} title="9. Third-Party Links" />
                        <div className="ml-0 sm:ml-12 text-ui-fg-subtle leading-relaxed">
                            <p>
                                Our website may contain links to third-party websites (e.g., manufacturer sites or social media). We are not responsible for the privacy practices or content of such websites. We encourage you to review their privacy policies separately.
                            </p>
                        </div>
                    </section>

                    {/* 10. Children's Privacy */}
                    <section id="children" className="scroll-mt-32">
                        <SectionHeading icon={<InformationCircle />} title="10. Children's Privacy" />
                        <div className="ml-0 sm:ml-12 text-ui-fg-subtle leading-relaxed">
                            <p>
                                Our website is strictly for users aged 18 and older. We do not knowingly collect personal information from minors. If you believe a child has provided us with personal information to create an account, please contact us immediately so we can suspend the account and delete the data.
                            </p>
                        </div>
                    </section>

                    {/* 11. Changes to This Privacy Policy */}
                    <section id="changes" className="scroll-mt-32">
                        <SectionHeading icon={<Calendar />} title="11. Changes to This Privacy Policy" />
                        <div className="ml-0 sm:ml-12 text-ui-fg-subtle leading-relaxed">
                            <p>
                                We may update this Privacy Policy from time to time to reflect changes in our tools (like adding new analytics software) or legal requirements. Any changes will be posted on this page with an updated &quot;Last updated&quot; date. Continued use of the website after such changes constitutes your acceptance of the revised policy.
                            </p>
                        </div>
                    </section>

                    <hr className="border-ui-border-base my-12" />

                    {/* Contact / Footer */}
                    <section id="contact" className="bg-ui-bg-subtle p-8 sm:p-10 rounded-3xl text-center space-y-6 border border-ui-border-base shadow-sm scroll-mt-32">
                        <div className="inline-flex items-center justify-center p-3 bg-ui-bg-base border border-ui-border-base rounded-full mb-2 shadow-sm">
                            <Envelope className="text-ui-fg-base" />
                        </div>
                        <h2 className="text-2xl font-bold text-ui-fg-base">Questions about your Privacy?</h2>
                        <p className="text-ui-fg-subtle max-w-md mx-auto">
                            If you wish to exercise your data rights or have any questions about how we handle your personal information, please contact us.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-4">
                            <a href="mailto:hello@checkered.in" className="flex items-center gap-2 text-ui-fg-base font-medium hover:text-blue-600 transition-colors bg-ui-bg-base px-6 py-3 rounded-xl border border-ui-border-base shadow-sm w-full sm:w-auto justify-center">
                                hello@checkered.in
                            </a>
                        </div>

                        <p className="text-xs text-ui-fg-muted pt-8">
                            Checkered Collectibles is owned and operated by Shubhankar Trivedi in Fatehpur, UP, India.
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