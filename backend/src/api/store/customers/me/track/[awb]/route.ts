import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { trackShiprocketAwbWorkflow } from "../../../../../../workflows/shiprocket-tracking"

export async function GET(
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) {
    const { awb } = req.params

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
        const { result } = await trackShiprocketAwbWorkflow(req.scope).run({
            input: { awb }
        })

        // 3. Return the tracking result
        return res.json({
            success: true,
            tracking: result
        })

    } catch (error: any) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error during tracking fetch."
        })
    }
}