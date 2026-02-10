import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { newCollectionDropWorkflow } from "../../../../workflows/new-drop";
import { z } from "zod";

// Schema for validation
const NewDropSchema = z.object({
    collection_id: z.string(),
    headline: z.string(),
    subHeadline: z.string().optional().default("Don't miss out on this limited release."),
    audience_id: z.string().optional(),
});

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
) {
    // 1. Validate the body
    const { success, data, error } = NewDropSchema.safeParse(req.body);

    if (!success) {
        return res.status(400).json({
            message: "Invalid input",
            errors: error.errors
        });
    }

    // 2. Run the workflow
    const { result } = await newCollectionDropWorkflow(req.scope)
        .run({
            input: {
                collection_id: data.collection_id,
                headline: data.headline,
                subHeadline: data.subHeadline,
                audience_id: data.audience_id,
            },
        });

    // 3. Return the result
    res.json({ result });
}