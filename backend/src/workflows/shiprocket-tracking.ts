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

export const getShiprocketTrackingStep = createStep(
    "get-shiprocket-tracking",
    async (input: GetTrackingInput) => {
        // We use our standalone client directly! No DI container resolution needed.
        const trackingData = await shiprocketClient.trackByOrderId(input.order_id, input.channel_id)

        return new StepResponse(trackingData)
    }
)

export const trackShiprocketOrderWorkflow = createWorkflow(
    "track-shiprocket-order",
    function (input: GetTrackingInput) {
        const trackingData = getShiprocketTrackingStep(input)
        return new WorkflowResponse(trackingData)
    }
)