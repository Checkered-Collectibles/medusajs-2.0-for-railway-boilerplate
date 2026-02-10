import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { newCollectionDropWorkflow } from "../../../../workflows/new-drop";

import { z } from "zod";

// 1. Define Validation Schema
const NewDropSchema = z.object({
    collection_id: z.string().min(1, "Collection ID is required"),
    headline: z.string().min(1, "Headline is required"),
    subHeadline: z.string().optional().default("Don't miss out on this limited release."),
    audience_id: z.string().optional(), // Allow overriding audience
});

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    // 2. Validate Input
    const parseResult = NewDropSchema.safeParse(req.body);

    if (!parseResult.success) {
        return res.status(400).json({
            message: "Invalid input",
            errors: parseResult.error.errors
        });
    }

    const input = parseResult.data;

    try {
        // 3. Execute Workflow
        const { result } = await newCollectionDropWorkflow(req.scope)
            .run({
                input: {
                    collection_id: input.collection_id,
                    headline: input.headline,
                    subHeadline: input.subHeadline!, // ! because default is set by Zod
                    audience_id: input.audience_id
                }
            });

        // 4. Return Success
        return res.json({
            success: true,
            message: "Broadcast initiated successfully",
            data: result
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to initiate broadcast",
            error: error.message
        });
    }
};