import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { trackShiprocketAwbWorkflow } from "../../../../workflows/shiprocket-tracking"

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const { awb } = req.params
    try {
        // Run the workflow directly without any auth checks
        const { result } = await trackShiprocketAwbWorkflow(req.scope).run({
            input: { awb }
        })

        return res.json({ success: true, tracking: result })

    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
}