import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Shipping Policy | Checkered Collectibles",
};

const ShippingPolicyPage = () => {
    return (
        <main className="max-w-3xl mx-auto px-4 py-10 prose prose-sm sm:prose-base">
            <h1>Shipping Policy</h1>
            <p>
                <strong>Last updated:</strong> 9 December 2025
            </p>

            <p>
                This Shipping Policy explains how <strong>Checkered Collectibles</strong>{" "}
                (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) handle shipping and
                delivery for orders placed on <strong>checkered.in</strong>.
            </p>

            <h2>1. Serviceable Locations</h2>
            <p>
                We currently ship orders to most locations across India using trusted
                courier partners. If your pincode is not serviceable, we may contact you
                to cancel the order and process a refund (if payment has already been
                made).
            </p>

            <h2>2. Order Processing Time</h2>
            <ul>
                <li>
                    Orders are typically processed and dispatched within{" "}
                    <strong>24–48 business hours</strong> after successful payment.
                </li>
                <li>
                    Orders placed on weekends or public holidays may be processed on the
                    next working day.
                </li>
            </ul>

            <h2>3. Delivery Time</h2>
            <ul>
                <li>
                    Standard delivery time is usually between{" "}
                    <strong>3–5 business days</strong> from the date of dispatch,
                    depending on your location.
                </li>
                <li>
                    Remote or hard-to-reach areas may experience slightly longer delivery
                    timelines.
                </li>
            </ul>

            <h2>4. Shipping Charges</h2>
            <p>
                Shipping charges, if applicable, will be clearly displayed at checkout
                before you complete your order. From time to time, we may offer free
                shipping or promotional shipping rates, which will be indicated on the
                website or during checkout.
            </p>

            <h2>5. Order Tracking</h2>
            <ul>
                <li>
                    Once your order is shipped, we will share tracking details via email,
                    SMS, or your account section on the website (where applicable).
                </li>
                <li>
                    You can use the tracking ID on the courier partner&apos;s website to
                    monitor the status and expected delivery date of your shipment.
                </li>
            </ul>

            <h2>6. Delayed or Failed Delivery</h2>
            <ul>
                <li>
                    While we strive to ensure timely delivery, delays may occur due to
                    factors beyond our control, such as courier delays, weather
                    conditions, strikes, local restrictions, or other logistical issues.
                </li>
                <li>
                    If delivery fails due to an incorrect address, unreachable phone
                    number, or the recipient being unavailable, the courier may attempt
                    re-delivery or return the shipment to us.
                </li>
                <li>
                    If an order is returned to us due to reasons attributable to the
                    customer (incorrect address, not available, refusal to accept, etc.),
                    additional shipping charges may apply for reshipment.
                </li>
            </ul>

            <h2>7. Damaged Packages on Delivery</h2>
            <ul>
                <li>
                    If the outer package appears tampered with or visibly damaged, please
                    record a <strong>clear, continuous video</strong> while opening the
                    parcel.
                </li>
                <li>
                    The video should start before opening the seal and clearly show the
                    product and any damage.
                </li>
                <li>
                    You must contact us within <strong>24 hours of delivery</strong> with
                    the opening video and photos if the product inside is damaged.
                </li>
                <li>
                    Without proper evidence (continuous unboxing video), we may not be
                    able to process an exchange.
                </li>
            </ul>

            <h2>8. Incorrect or Incomplete Address</h2>
            <p>
                Please ensure your address and contact details are accurate at the time
                of placing the order. We are not responsible for delayed or failed
                deliveries due to incorrect or incomplete address details provided by
                the customer.
            </p>

            <h2>9. Contact for Shipping Queries</h2>
            <p>
                If you have any questions regarding shipping, delivery, or tracking,
                you can contact us at:
            </p>
            <ul>
                <li>
                    <strong>Email:</strong> support@checkered.in
                </li>
                <li>
                    <strong>Phone:</strong> 6394524885
                </li>
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

export default ShippingPolicyPage;