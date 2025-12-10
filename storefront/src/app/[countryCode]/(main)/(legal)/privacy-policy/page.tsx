import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Checkered Collectibles",
};
const PrivacyPolicyPage = () => {
    return (
        <main className="max-w-3xl mx-auto px-4 py-10 prose prose-sm sm:prose-base">
            <h1>Privacy Policy</h1>
            <p><strong>Last updated:</strong> 9 December 2025</p>

            <p>
                This Privacy Policy explains how <strong>Checkered Collectibles</strong>
                (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects, uses, and protects
                your personal information when you use <strong>checkered.in</strong>.
            </p>

            <h2>1. Information We Collect</h2>
            <ul>
                <li>
                    <strong>Personal Details:</strong> Name, shipping address, billing address,
                    phone number, and email address.
                </li>
                <li>
                    <strong>Order Information:</strong> Products purchased, order value, payment method
                    (no card details stored by us).
                </li>
                <li>
                    <strong>Technical Data:</strong> IP address, browser type, device information, and
                    basic analytics data (where applicable).
                </li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <ul>
                <li>To process and deliver your orders.</li>
                <li>To communicate order updates, shipping details, and support responses.</li>
                <li>To improve our website, products, and customer experience.</li>
                <li>To comply with legal obligations and prevent fraud.</li>
            </ul>

            <h2>3. Payments &amp; Security</h2>
            <ul>
                <li>
                    We use third-party payment gateways such as Razorpay to process payments securely.
                </li>
                <li>
                    We do <strong>not</strong> store your full card details, UPI PIN, or net banking
                    credentials on our servers.
                </li>
                <li>
                    All payment-related information is handled directly by the payment gateway in
                    accordance with their security and compliance standards.
                </li>
            </ul>

            <h2>4. Cookies &amp; Tracking</h2>
            <ul>
                <li>
                    Our website may use cookies to improve user experience, remember preferences, and
                    perform basic analytics.
                </li>
                <li>
                    You can disable cookies in your browser settings, but some features of the site
                    may not function properly.
                </li>
            </ul>

            <h2>5. Sharing of Information</h2>
            <ul>
                <li>
                    We do <strong>not</strong> sell, rent, or trade your personal information to
                    third-party marketers.
                </li>
                <li>
                    We may share necessary information with:
                    <ul>
                        <li>Courier partners for shipping your orders.</li>
                        <li>Payment gateways for processing payments.</li>
                        <li>
                            Government or regulatory authorities, if required by law or to respond to
                            legal processes.
                        </li>
                    </ul>
                </li>
            </ul>

            <h2>6. Data Retention</h2>
            <p>
                We retain your personal information for as long as necessary to fulfill the purposes
                outlined in this policy, unless a longer retention period is required by law.
            </p>

            <h2>7. Your Rights</h2>
            <ul>
                <li>You may request access to the personal data we hold about you.</li>
                <li>You may request correction of inaccurate or incomplete information.</li>
                <li>
                    You may request deletion of your data, subject to legal and accounting obligations.
                </li>
            </ul>

            <h2>8. Third-Party Links</h2>
            <p>
                Our website may contain links to third-party websites. We are not responsible for
                the privacy practices or content of such websites. We encourage you to review
                their privacy policies separately.
            </p>

            <h2>9. Children&apos;s Privacy</h2>
            <p>
                Our website is not directed toward children under 13. We do not knowingly collect
                personal information from children. If you believe a child has provided us information,
                please contact us so we can delete it.
            </p>

            <h2>10. Changes to This Privacy Policy</h2>
            <p>
                We may update this Privacy Policy from time to time. Any changes will be posted on
                this page with an updated &quot;Last updated&quot; date. Continued use of the
                website after such changes constitutes acceptance of the revised policy.
            </p>

            <h2>11. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <ul>
                <li><strong>Email:</strong> hello@checkered.in</li>
                {/* <li><strong>Phone:</strong> 6394524885</li> */}
                <li>
                    <strong>Location:</strong> Fatehpur, Uttar Pradesh, India
                </li>
            </ul>

            <p>
                Checkered Collectibles is owned and operated by <strong>Shubhankar Trivedi</strong>.
            </p>
        </main>
    );
};

export default PrivacyPolicyPage;