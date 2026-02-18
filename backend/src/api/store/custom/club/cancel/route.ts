import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import Razorpay from "razorpay";
import { z } from "zod";

// Define schema for input validation
const CancelSchema = z.object({
    customer_id: z.string(),
});

export async function POST(req: MedusaRequest, res: MedusaResponse) {
    // 1. Validate Input
    const { success, data } = CancelSchema.safeParse(req.body);

    if (!success) {
        return res.status(400).json({ message: "Missing customer_id" });
    }

    const { customer_id } = data; // Now TypeScript knows this is a string

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    try {
        const customerModule = req.scope.resolve(Modules.CUSTOMER);
        const customer = await customerModule.retrieveCustomer(customer_id);

        // Access metadata safely
        const subId = customer.metadata?.club_subscription_id as string | undefined;

        if (!subId) {
            return res.status(404).json({ message: "No active subscription found for this user." });
        }

        // 2. Cancel in Razorpay
        // The second argument 'false' means "cancel immediately" (stop auto-charge).
        // If you want them to finish the current term, you'd handle that logic differently,
        // but usually stopping auto-pay immediately is the expected behavior for "Cancel".
        await razorpay.subscriptions.cancel(subId, false);

        // 3. Update Medusa Status
        // We mark it as "cancelled_will_expire". Your daily cron job will remove 
        // them from the group when the actual expiry date passes.
        await customerModule.updateCustomers(customer_id, {
            metadata: {
                ...customer.metadata,
                club_sub_status: "cancelled_will_expire"
            }
        });

        return res.json({
            success: true,
            message: "Subscription cancelled. Access remains until current period ends."
        });

    } catch (error: any) {
        console.error("Cancellation Error:", error);
        return res.status(500).json({
            message: error.error?.description || error.message || "Failed to cancel subscription"
        });
    }
}