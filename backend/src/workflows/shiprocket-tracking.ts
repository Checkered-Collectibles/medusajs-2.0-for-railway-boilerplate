import {
    createStep,
    StepResponse,
    createWorkflow,
    WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import { shiprocketClient } from "../utils/shiprocket-client"

type GetTrackingInput = {
    order_id: string
    channel_id?: string
}

export const getShiprocketAwbTrackingStep = createStep(
    "get-shiprocket-awb-tracking",
    async (awb: string) => {
        // Use the new AWB method
        const trackingData = await shiprocketClient.trackByAwb(awb)
        return new StepResponse(trackingData)
    }
)

export const trackShiprocketAwbWorkflow = createWorkflow(
    "track-shiprocket-awb",
    function (input: { awb: string }) {
        const trackingData = getShiprocketAwbTrackingStep(input.awb)
        return new WorkflowResponse(trackingData)
    }
)