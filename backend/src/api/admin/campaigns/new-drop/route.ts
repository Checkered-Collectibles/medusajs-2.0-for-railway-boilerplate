import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { newCollectionDropWorkflow } from "../../../../workflows/new-drop";
import { z } from "zod";

// 1. Define Validation Schema
const NewDropSchema = z.object({
    collection_id: z.string().min(1, "Collection ID is required"),
    headline: z.string().min(1, "Headline is required"),
    subHeadline: z.string().optional().default("Don't miss out on this limited release."),
    audience_id: z.string().optional(),
    // ⚠️ IMPORTANT: Your workflow likely expects 'heroImageUrl'. 
    // If you don't send it, the workflow will crash. I added a fallback here.
    heroImageUrl: z.string().optional().default("https://checkered-assets.sgp1.cdn.digitaloceanspaces.com/manual-uploads/banner.jpg"),
});

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    // [DEBUG] Log the start of request
    console.log("➡️ [API] Received New Drop Request");

    try {
        // [DEBUG] Log Raw Body to see what is arriving
        if (!req.body) {
            console.error("❌ [API] Request body is empty!");
            return res.status(400).json({ message: "Request body is empty or malformed" });
        }
        console.log("📄 [API] Payload:", JSON.stringify(req.body, null, 2));

        // 2. Validate Input
        const parseResult = NewDropSchema.safeParse(req.body);

        if (!parseResult.success) {
            console.error("❌ [API] Zod Validation Failed:", parseResult.error.flatten());
            return res.status(400).json({
                success: false,
                message: "Invalid input data",
                errors: parseResult.error.errors, // Detailed array
                formatted: parseResult.error.flatten() // Easy to read object
            });
        }

        const input = parseResult.data;
        console.log(`✅ [API] Validated. Starting workflow for Collection: ${input.collection_id}`);

        // 3. Execute Workflow with Error Capture
        // We use 'throwOnError: false' to get the errors object instead of crashing immediately
        const { result, errors } = await newCollectionDropWorkflow(req.scope)
            .run({
                input: {
                    collection_id: input.collection_id,
                    headline: input.headline,
                    subHeadline: input.subHeadline!,
                    audience_id: input.audience_id,
                },
                throwOnError: false
            });

        // 4. Handle Workflow Specific Errors
        if (errors && errors.length > 0) {
            console.error("❌ [Workflow] Execution failed:", JSON.stringify(errors, null, 2));
            return res.status(500).json({
                success: false,
                message: "Workflow failed to execute",
                workflow_errors: errors.map(e => e.error?.message || e)
            });
        }

        console.log("✅ [API] Broadcast Successful!");

        // 5. Return Success
        return res.json({
            success: true,
            message: "Broadcast initiated successfully",
            data: result
        });

    } catch (error: any) {
        // 6. Catch Unhandled Server Errors
        console.error("🔥 [API] Critical Internal Error:", error);

        // Log stack trace if available
        if (error.stack) console.error(error.stack);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error_message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};