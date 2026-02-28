import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { trackShiprocketOrderWorkflow } from "../../../../../../workflows/shiprocket-tracking"

export async function GET(
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) {
    // Grab the order_id from the URL path
    const { order_id } = req.params

    // Optionally grab channel_id from the query parameters (e.g., ?channel_id=12345)
    const channel_id = req.query.channel_id as string | undefined

    // 1. Security Check: Verify customer is logged in
    const customerId = req.auth_context?.actor_id

    if (!customerId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized. Please log in to view tracking details."
        })
    }

    try {
        // 2. Execute the Workflow
        const { result } = await trackShiprocketOrderWorkflow(req.scope).run({
            input: {
                order_id: order_id,
                channel_id: channel_id
            }
        })

        // 3. Return the tracking result
        return res.json({
            success: true,
            tracking: result
        })

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error during tracking fetch."
        })
    }
}