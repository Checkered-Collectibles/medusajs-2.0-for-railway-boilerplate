import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { syncAudienceWorkflow } from "../../../workflows/sync-audience";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
    const { result } = await syncAudienceWorkflow(req.scope).run();

    res.json({
        message: "Audience sync completed",
        stats: result,
    });
}