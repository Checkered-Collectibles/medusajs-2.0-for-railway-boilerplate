import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cancellation & Refund Policy | Checkered Collectibles",
};

const CancellationAndRefundPolicyPage = () => {
    return (
        <main className="max-w-3xl mx-auto px-4 py-10 prose prose-sm sm:prose-base">
            <h1>Cancellation &amp; Refund Policy</h1>
            <p>
                <strong>Last updated:</strong> 9 December 2025
            </p>

            <p>
                This Cancellation &amp; Refund Policy explains how cancellations,
                refunds, and exchanges are handled for orders placed on{" "}
                <strong>checkered.in</strong>, operated by{" "}
                <strong>Checkered Collectibles</strong>.
            </p>

            <h2>1. Order Cancellation</h2>
            <ul>
                <li>
                    You may request cancellation of your order{" "}
                    <strong>only before it has been shipped</strong>.
                </li>
                <li>
                    Once an order is marked as &quot;Shipped&quot; or handed over to the
                    courier partner, it <strong>cannot be cancelled</strong>.
                </li>
                <li>
                    To request a cancellation, please contact us as soon as possible at{" "}
                    <strong>hello@checkered.in</strong>,
                    {/* or call{" "}
                    <strong>6394524885</strong>, */}
                    mentioning your order ID.
                </li>
            </ul>

            <h2>2. Refunds</h2>
            <ul>
                <li>
                    Refunds are applicable only for orders successfully cancelled{" "}
                    <strong>before shipment</strong>.
                </li>
                <li>
                    Once approved, refunds will be processed to your original payment
                    method within <strong>5–7 business days</strong>, subject to bank and
                    payment gateway timelines.
                </li>
                <li>
                    We are not responsible for delays caused by banking or payment gateway
                    systems.
                </li>
            </ul>

            <h2>3. Returns</h2>
            <ul>
                <li>
                    We do <strong>not</strong> accept returns for non-damaged products,
                    change of mind, or minor cosmetic damage to outer packaging.
                </li>
                <li>
                    As we deal in collectibles and toys, outer packaging may sometimes
                    show minor shelf wear or transit marks, which are not considered a
                    defect.
                </li>
            </ul>

            <h2>4. Exchanges for Damaged Products</h2>
            <ul>
                <li>
                    If you receive a product that is{" "}
                    <strong>physically damaged on delivery</strong>, you may request an
                    exchange.
                </li>
                <li>
                    A <strong>clear, continuous video recording</strong> of the parcel
                    being opened is <strong>mandatory</strong>. The video must:
                    <ul>
                        <li>
                            Start before the package is opened, showing the unopened parcel
                            and shipping label.
                        </li>
                        <li>
                            Show the entire unboxing process without cuts or edits.
                        </li>
                        <li>
                            Clearly show the damaged area of the product.
                        </li>
                    </ul>
                </li>
                <li>
                    You must contact us within <strong>24 hours of delivery</strong>,
                    sharing the opening video and clear photos of the damage.
                </li>
                <li>
                    We will review the evidence and, if the claim is approved, arrange an
                    exchange for the same product, subject to stock availability.
                </li>
                <li>
                    If an exact replacement is not available, we may offer store credit or
                    an alternative product of similar value at our discretion.
                </li>
                <li>
                    Claims received after 24 hours of delivery or without proper proof may
                    not be accepted.
                </li>
            </ul>

            <h2>5. Non-Refundable &amp; Non-Exchangeable Situations</h2>
            <ul>
                <li>Change of mind after purchase.</li>
                <li>
                    Minor imperfections in outer packaging that do not affect the product
                    itself.
                </li>
                <li>
                    Damage caused by misuse, mishandling, or improper storage after
                    delivery.
                </li>
                <li>
                    Failure to provide a valid, continuous opening video as specified
                    above.
                </li>
            </ul>

            <h2>6. How to Raise a Cancellation or Damage Request</h2>
            <p>
                To raise a cancellation or damaged product request, please contact us
                with:
            </p>
            <ul>
                <li>Your full name</li>
                <li>Order ID</li>
                <li>Registered mobile number and email</li>
                <li>
                    For damage claims: opening video and clear photos of the product and
                    packaging
                </li>
            </ul>

            <h2>7. Contact for Cancellation &amp; Refund Queries</h2>
            <p>
                For any questions or concerns related to cancellations, refunds, or
                exchanges, you can reach us at:
            </p>
            <ul>
                <li>
                    <strong>Email:</strong> hello@checkered.in
                </li>
                {/* <li>
                    <strong>Phone:</strong> 6394524885
                </li> */}
                <li>
                    <strong>Location:</strong> Fatehpur, Uttar Pradesh, India
                </li>
            </ul>

            <p>
                Checkered Collectibles and <strong>checkered.in</strong> are owned and
                operated by <strong>Shubhankar Trivedi</strong>.
            </p>
        </main>
    );
};

export default CancellationAndRefundPolicyPage;