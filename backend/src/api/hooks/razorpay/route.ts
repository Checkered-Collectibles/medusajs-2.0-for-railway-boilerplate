import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import crypto from "crypto";
import { RazorpayWebhookEvent } from "src/types/razorpay"; // 👈 Ensure path matches your project structure

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;
const CLUB_GROUP_ID = "cusgroup_01KHQVQYE2RX2JNZFZ4PYY6RPJ";

const PLAN_VARIANT_MAP: Record<string, string> = {
    "plan_SHddv0LAawWVvp": "variant_01KHR931ZR25860TWEJQT0ADYE", // monthly
    "plan_SHbPhHGmng2NCN": "variant_01KHR931ZS4MKQ9HFR1SNP1FBE", // quaterly
    "plan_SHaofsImsfcNNi": "variant_01KHR931ZS42SV2PNB4ZXVZ2DA", // yearly
};

export async function POST(req: MedusaRequest, res: MedusaResponse) {
    // 1. Security: Validate Signature
    const shasum = crypto.createHmac("sha256", RAZORPAY_WEBHOOK_SECRET);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== req.headers["x-razorpay-signature"]) {
        return res.status(401).json({ status: "Invalid signature" });
    }

    // 2. Type Casting
    const event = req.body as RazorpayWebhookEvent;

    // 3. Safe Extraction of Customer ID
    const payload = event.payload as any;
    const medusaCustomerId =
        payload.subscription?.entity?.notes?.medusa_customer_id ||
        payload.payment?.entity?.notes?.medusa_customer_id;

    if (!medusaCustomerId) {
        return res.status(200).json({ status: "ignored_no_customer_id" });
    }

    // 4. Resolve Services
    const orderModule = req.scope.resolve(Modules.ORDER);
    const customerModule = req.scope.resolve(Modules.CUSTOMER);
    const productModule = req.scope.resolve(Modules.PRODUCT);
    const regionModule = req.scope.resolve(Modules.REGION);
    const salesChannelModule = req.scope.resolve(Modules.SALES_CHANNEL);

    try {
        // ---------------------------------------------------------
        // EVENT: subscription.charged (Success: First Pay or Renewal)
        // ---------------------------------------------------------
        if (event.event === "subscription.charged") {
            console.log(`💰 Charging Subscription for: ${medusaCustomerId}`);

            const paymentEntity = event.payload.payment.entity;
            const subscriptionEntity = event.payload.subscription.entity;

            // A. Identify Plan & Variant
            const razorpayPlanId = subscriptionEntity.plan_id;
            const targetVariantId = PLAN_VARIANT_MAP[razorpayPlanId];

            if (!targetVariantId) {
                console.error(`❌ Unknown Plan ID: ${razorpayPlanId}`);
                return res.status(200).json({ error: "Unknown Plan ID" });
            }

            // B. Fetch Medusa Data
            const customer = await customerModule.retrieveCustomer(medusaCustomerId);
            const [variant] = await productModule.listProductVariants({ id: [targetVariantId] });

            // Fetch Sales Channel (Required for creating orders in V2)
            const [salesChannel] = await salesChannelModule.listSalesChannels();

            if (!variant) throw new Error(`Variant ${targetVariantId} not found`);

            const [region] = await regionModule.listRegions({ currency_code: "inr" });
            const amountPaid = paymentEntity.amount / 100;

            // C. Create Medusa Order (COMPLETED & PAID)
            const orderData = {
                region_id: region.id,
                customer_id: customer.id,
                sales_channel_id: salesChannel?.id, // 👈 Required field
                email: customer.email,
                currency_code: region.currency_code,

                // Force Statuses
                status: "completed",
                payment_status: "captured",
                fulfillment_status: "fulfilled",

                items: [
                    {
                        title: variant.title,
                        variant_id: variant.id,
                        quantity: 1,
                        unit_price: amountPaid,
                        is_tax_inclusive: true,
                        // Not requiring shipping helps with logic, but we still add a method below
                        requires_shipping: false,
                    }
                ],

                // 1. Add Dummy Shipping to allow Fulfillment status
                shipping_methods: [
                    {
                        name: "Digital Membership Access",
                        amount: 0,
                        is_tax_inclusive: true,
                    }
                ],

                // 2. Add Transaction to balance the total -> "Paid" status
                transactions: [
                    {
                        amount: amountPaid,
                        currency_code: region.currency_code,
                        reference: "razorpay_subscription",
                        external_id: paymentEntity.id
                    }
                ],

                shipping_address: customer.addresses?.[0] || {
                    first_name: customer.first_name || "Club",
                    last_name: customer.last_name || "Member",
                    address_1: "Digital Membership",
                    city: "Digital",
                    country_code: "in",
                    postal_code: "000000"
                },
                billing_address: customer.addresses?.[0] || {
                    first_name: customer.first_name || "Club",
                    last_name: customer.last_name || "Member",
                    address_1: "Digital Membership",
                    city: "Digital",
                    country_code: "in",
                    postal_code: "000000"
                },

                metadata: {
                    razorpay_payment_id: paymentEntity.id,
                    razorpay_subscription_id: subscriptionEntity.id,
                    razorpay_plan_id: razorpayPlanId,
                    type: "club_subscription_renewal"
                }
            };

            const order = await orderModule.createOrders(orderData);
            console.log(`✅ Created Medusa Order: ${order.id}`);

            // D. Update Customer (Add to Group + Set Expiry)
            await customerModule.updateCustomers(medusaCustomerId, {
                metadata: {
                    club_expiry: subscriptionEntity.current_end,
                    club_sub_status: "active"
                }
            });

            await customerModule.addCustomerToGroup({
                customer_id: medusaCustomerId,
                customer_group_id: CLUB_GROUP_ID,
            });
        }

        // ---------------------------------------------------------
        // EVENT: subscription.halted (Payment Failed / Fraud)
        // ---------------------------------------------------------
        if (event.event === "subscription.halted") {
            console.log(`❌ Payment Halted. Removing access for: ${medusaCustomerId}`);

            await customerModule.removeCustomerFromGroup({
                customer_id: medusaCustomerId,
                customer_group_id: CLUB_GROUP_ID,
            });

            await customerModule.updateCustomers(medusaCustomerId, {
                metadata: { club_sub_status: "halted" }
            });
        }

        // ---------------------------------------------------------
        // EVENT: subscription.cancelled (User Cancelled manually)
        // ---------------------------------------------------------
        if (event.event === "subscription.cancelled") {
            console.log(`⚠️ Subscription Cancelled by user: ${medusaCustomerId}. Access remains until expiry.`);

            await customerModule.updateCustomers(medusaCustomerId, {
                metadata: { club_sub_status: "cancelled_will_expire" }
            });
        }

        // ---------------------------------------------------------
        // EVENT: subscription.completed (End of total cycles)
        // ---------------------------------------------------------
        if (event.event === "subscription.completed") {
            await customerModule.updateCustomers(medusaCustomerId, {
                metadata: { club_sub_status: "completed" }
            });
        }

        return res.json({ status: "ok" });
    } catch (err) {
        console.error("Webhook Error:", err);
        return res.status(200).json({ error: "Internal Error Handled" });
    }
}