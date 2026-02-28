import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { trackShiprocketOrderWorkflow } from "src/workflows/shiprocket-tracking"

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const { order_id } = req.params
    const channel_id = req.query.channel_id as string | undefined

    try {
        // Run the workflow directly without any auth checks
        const { result } = await trackShiprocketOrderWorkflow(req.scope).run({
            input: {
                order_id: order_id,
                channel_id: channel_id
            }
        })

        return res.json({ success: true, tracking: result })

    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
}