import type { Metadata } from "next";
import Link from "next/link";
import {
    DocumentText,
    ShieldCheck,
    Receipt,
    FlyingBox,
    ArrowRight,
    Envelope
} from "@medusajs/icons";

export const metadata: Metadata = {
    title: "Legal & Policies | Checkered Collectibles",
    description: "Legal information, policies, and terms of service for Checkered Collectibles.",
};

const policies = [
    {
        title: "Terms & Conditions",
        description: "The rules, guidelines, and agreements for using our website and purchasing our collectibles.",
        href: "/legal/terms-and-conditions",
        icon: <DocumentText className="" />,
    },
    {
        title: "Privacy Policy",
        description: "How we securely collect, use, and protect your personal data and account information.",
        href: "/legal/privacy-policy",
        icon: <ShieldCheck className="" />,
    },
    {
        title: "Cancellation & Refunds",
        description: "Our strict rules regarding order cancellations, unboxing videos, and damage exchanges.",
        href: "/legal/cancellation-and-refund",
        icon: <Receipt className="" />,
    },
    {
        title: "Shipping Policy",
        description: "Everything you need to know about delivery timelines, serviceable areas, and tracking.",
        href: "/legal/shipping-policy",
        icon: <FlyingBox className="" />,
    }
];

export default function LegalIndexPage() {
    return (
        <main className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">

            {/* Header Section */}
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold text-ui-fg-base tracking-tight mb-4">
                    Legal & Policies
                </h1>
                <p className="text-lg text-ui-fg-subtle max-w-2xl mx-auto">
                    Everything you need to know about how we operate, process orders, and protect your data at Checkered Collectibles.
                </p>
            </div>

            {/* Policies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                {policies.map((policy) => (
                    <Link
                        key={policy.href}
                        href={policy.href}
                        className="group flex flex-col justify-between bg-ui-bg-subtle p-6 sm:p-8 rounded-2xl border border-ui-border-base shadow-sm hover:shadow-md hover:border-ui-border-interactive transition-all duration-200"
                    >
                        <div>
                            <div className="p-3 flex items-center justify-center bg-ui-bg-base border border-ui-border-base rounded-xl w-fit text-ui-fg-base mb-6 group-hover:bg-ui-bg-interactive group-hover:text-ui-fg-on-color group-hover:border-transparent transition-colors">
                                {policy.icon}
                            </div>
                            <h2 className="text-xl font-bold text-ui-fg-base mb-2">
                                {policy.title}
                            </h2>
                            <p className="text-ui-fg-subtle leading-relaxed">
                                {policy.description}
                            </p>
                        </div>

                        <div className="mt-8 flex items-center gap-2 text-sm font-bold text-ui-fg-interactive group-hover:text-blue-600 transition-colors">
                            Read Policy <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                ))}
            </div>

            <hr className="border-ui-border-base my-12" />

            {/* Contact / Support Footer */}
            <section className="bg-ui-bg-subtle p-8 sm:p-10 rounded-3xl text-center space-y-6 border border-ui-border-base shadow-sm">
                <div className="inline-flex items-center justify-center p-3 bg-ui-bg-base border border-ui-border-base rounded-full mb-2 shadow-sm">
                    <Envelope className="text-ui-fg-base" />
                </div>
                <h2 className="text-2xl font-bold text-ui-fg-base">Still need help?</h2>
                <p className="text-ui-fg-subtle max-w-md mx-auto">
                    If you couldn't find the answer you were looking for in our policy documents, our support team is ready to assist you.
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

        </main>
    );
}