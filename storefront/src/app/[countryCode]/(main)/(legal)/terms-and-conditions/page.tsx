import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms & Conditions | Checkered Collectibles",
};

export default function Terms() {
    return (
        <main className="max-w-3xl mx-auto px-4 py-10 prose prose-sm sm:prose-base">
            <h1 className="h1">Terms &amp; Conditions</h1>
            <p><strong>Last updated:</strong> 9 December 2025</p>

            <p>
                Welcome to <strong>Checkered Collectibles</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;),
                operated via <strong>checkered.in</strong>. By accessing or using this website,
                you agree to be bound by these Terms &amp; Conditions. If you do not agree,
                please do not use our website.
            </p>

            <h2>1. Business Information</h2>
            <p>
                Checkered Collectibles is a sole proprietorship owned and operated by{" "}
                <strong>Shubhankar Trivedi</strong>, based in{" "}
                <strong>Fatehpur, Uttar Pradesh, India</strong>.
            </p>
            <p>
                We sell collectibles, toys, and related products to customers across India through{" "}
                <strong>checkered.in</strong>.
            </p>

            <h2>2. Eligibility</h2>
            <p>
                By using this website, you confirm that you are at least 18 years old or
                are accessing and using the website under the supervision of a parent or legal guardian.
            </p>

            <h2>3. Products &amp; Pricing</h2>
            <ul>
                <li>
                    Product images on the website are for illustrative purposes only. Actual products,
                    colors, and packaging may vary slightly.
                </li>
                <li>
                    All prices listed on the website are in Indian Rupees (INR) and are subject to change
                    without prior notice.
                </li>
                <li>
                    Product availability is subject to stock. If a product you ordered is unavailable,
                    we may contact you to offer an alternative or process a cancellation.
                </li>
            </ul>

            <h2>4. Orders &amp; Payments</h2>
            <ul>
                <li>
                    Orders are considered confirmed only after we receive a successful payment through
                    our payment gateway (such as Razorpay).
                </li>
                <li>
                    You are responsible for providing accurate and complete information, including your
                    name, address, phone number, and email.
                </li>
                <li>
                    We reserve the right to cancel or refuse any order if we suspect fraud, incorrect
                    information, or misuse of the website.
                </li>
            </ul>

            <h2>5. Shipping &amp; Delivery</h2>
            <ul>
                <li>
                    We ship orders across India using third-party courier services.
                </li>
                <li>
                    Typical delivery time is <strong>3–5 business days</strong>, depending on your location.
                    This is an estimate and not a guarantee.
                </li>
                <li>
                    Once your order is shipped, we will share tracking details where available.
                </li>
                <li>
                    We are not responsible for delays caused by courier partners, weather, strikes,
                    holidays, or other events beyond our control.
                </li>
            </ul>

            <h2>6. Cancellations, Refunds &amp; Exchanges</h2>

            <h3>6.1 Order Cancellation</h3>
            <ul>
                <li>
                    You may request cancellation of your order <strong>only before it has been shipped</strong>.
                </li>
                <li>
                    Once the order is shipped, it <strong>cannot be cancelled</strong>.
                </li>
            </ul>

            <h3>6.2 Refunds</h3>
            <ul>
                <li>
                    Refunds are available only for orders successfully cancelled before shipment.
                </li>
                <li>
                    Eligible refunds will be processed to your original payment method within{" "}
                    <strong>5–7 business days</strong>, subject to payment gateway and bank timelines.
                </li>
            </ul>

            <h3>6.3 Exchanges for Damaged Products</h3>
            <ul>
                <li>
                    We only offer exchanges if the product you receive is <strong>damaged on delivery</strong>.
                </li>
                <li>
                    A <strong>clear, continuous video recording</strong> of the parcel being opened
                    is required as proof. The video must start before the package is opened and show
                    the full unboxing and the damage.
                </li>
                <li>
                    You must contact us within <strong>24 hours of delivery</strong> with the proof of damage.
                </li>
                <li>
                    If the exchange is approved, we will arrange a replacement of the same product,
                    subject to availability. If a replacement is not available, we may offer store credit
                    or an alternative solution at our discretion.
                </li>
                <li>
                    We do not accept returns or exchanges for reasons such as change of mind, minor
                    cosmetic imperfections on packaging, or normal wear and tear.
                </li>
            </ul>

            <h2>7. Use of Website</h2>
            <ul>
                <li>
                    You agree not to misuse the website, attempt to hack it, or perform any action that
                    may disrupt its normal operation.
                </li>
                <li>
                    You agree not to copy, distribute, or modify any content from the website without
                    our prior written permission.
                </li>
            </ul>

            <h2>8. Intellectual Property</h2>
            <p>
                All content on <strong>checkered.in</strong>, including but not limited to logos,
                text, images, graphics, and designs, is the property of Checkered Collectibles or
                its respective owners and is protected by applicable intellectual property laws.
            </p>

            <h2>9. Limitation of Liability</h2>
            <ul>
                <li>
                    To the maximum extent permitted by law, we are not liable for any indirect,
                    incidental, or consequential damages arising out of your use of this website
                    or purchase of our products.
                </li>
                <li>
                    Our total liability, if any, is limited to the amount you paid for the specific order
                    giving rise to the claim.
                </li>
            </ul>

            <h2>10. Third-Party Links</h2>
            <p>
                Our website may contain links to third-party websites. We are not responsible for the
                content, policies, or practices of such websites.
            </p>

            <h2>11. Changes to These Terms</h2>
            <p>
                We may update these Terms &amp; Conditions from time to time. Any changes will be
                posted on this page with an updated &quot;Last updated&quot; date. Continued use of
                the website after such changes constitutes your acceptance of the revised terms.
            </p>

            <h2>12. Contact Information</h2>
            <p>
                If you have any questions about these Terms &amp; Conditions, you can contact us at:
            </p>
            <ul>
                <li><strong>Email:</strong> support@checkered.in</li>
                <li><strong>Phone:</strong> 6394524885</li>
                <li>
                    <strong>Location:</strong> Fatehpur, Uttar Pradesh, India
                </li>
            </ul>

            <p>
                Checkered Collectibles is owned and operated by <strong>Shubhankar Trivedi</strong>.
            </p>
        </main>
    )
}