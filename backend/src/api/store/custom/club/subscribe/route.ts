import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import Razorpay from "razorpay";
import { z } from "zod";

// ❌ OLD: Don't initialize here at the top level. It crashes the server if env vars are missing.
// const razorpay = new Razorpay({ ... }) 

// 🗺️ MAP MEDUSA VARIANTS TO RAZORPAY PLAN IDs
const VARIANT_TO_PLAN_MAP: Record<string, string> = {
    "variant_01KHR931ZR25860TWEJQT0ADYE": "plan_SHcyGJ6NoaKOun", // monthly og: plan_SHbbVebsDdPvwO
    "variant_01KHR931ZS4MKQ9HFR1SNP1FBE": "plan_SHbPhHGmng2NCN", // quaterly
    "variant_01KHR931ZS42SV2PNB4ZXVZ2DA": "plan_SHaofsImsfcNNi", // yearly
};

const Schema = z.object({
    customer_id: z.string(),
    variant_id: z.string(),
});

export async function POST(req: MedusaRequest, res: MedusaResponse) {
    // 1. Validate Env Vars exist before running
    if (!process.env.RAZORPAY_ID || !process.env.RAZORPAY_SECRET) {
        console.error("❌ Missing Razorpay Keys in .env");
        return res.status(500).json({ message: "Server Configuration Error" });
    }

    // ✅ NEW: Initialize Razorpay INSIDE the function
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_ID,     // Make sure this matches your .env exactly
        key_secret: process.env.RAZORPAY_SECRET,
    });

    // 2. Validate Input
    const { success, data } = Schema.safeParse(req.body);
    if (!success) {
        return res.status(400).json({ message: "Invalid Request: Missing customer_id or variant_id" });
    }

    // 3. Resolve Plan ID
    const planId = VARIANT_TO_PLAN_MAP[data.variant_id];

    if (!planId) {
        return res.status(400).json({ message: "Invalid Variant ID or Plan not found" });
    }

    try {
        // 4. Create Subscription
        const subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            customer_notify: 1,
            total_count: 100,
            notes: {
                medusa_customer_id: data.customer_id,
                medusa_variant_id: data.variant_id,
                type: "club_membership"
            },
        });

        return res.json({
            subscription_id: subscription.id,
            key_id: process.env.RAZORPAY_ID
        });

    } catch (error: any) {
        console.error("Razorpay Error:", error);
        return res.status(500).json({ message: error.error?.description || error.message });
    }
}