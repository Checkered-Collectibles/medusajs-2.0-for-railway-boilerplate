import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import Razorpay from "razorpay";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    // 1. Initialize Razorpay
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_ID!,
        key_secret: process.env.RAZORPAY_SECRET!,
    });

    const customerModule = req.scope.resolve(Modules.CUSTOMER);

    // 2. Get Logged-in Customer ID (Assuming Auth Middleware adds this)
    // If using Medusa's standard auth, req.auth_context.actor_id should be available
    // For custom storefronts, you might need to pass customer_id as a query param validated by session
    const customerId = req.query.customer_id as string;

    if (!customerId) return res.status(400).json({ message: "Customer ID required" });

    try {
        // 3. Get Customer Metadata
        const customer = await customerModule.retrieveCustomer(customerId);
        const subId = customer.metadata?.club_subscription_id as string;

        if (!subId) {
            return res.json({ active: false });
        }

        // 4. Fetch Live Data from Razorpay
        const sub = await razorpay.subscriptions.fetch(subId);

        // 5. Return Unified Status
        return res.json({
            active: sub.status === "active",
            status: sub.status, // active, authenticated, cancelled, halted
            plan_name: "Checkered Flag Club", // You could map plan_id to names here
            next_billing_at: sub.charge_at ? sub.charge_at * 1000 : null,
            current_end: sub.current_end ? sub.current_end * 1000 : null,
            short_url: sub.short_url, // URL to update payment method
            subscription_id: sub.id
        });

    } catch (error: any) {
        console.error("Fetch Error", error);
        return res.status(500).json({ active: false, error: "Could not fetch subscription" });
    }
}