import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { weeklyBroadcastWorkflow } from "../../../../workflows/weekly-broadcast";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
    // const { result } = await weeklyBroadcastWorkflow(req.scope).run();
    res.json({ success: true });
}