import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "@medusajs/framework/zod";
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { ProductStatus } from "@medusajs/framework/utils"; // Optional, but good practice

// 1. Define Schema
const PublishCollectionSchema = z.object({
    collection_id: z.string(),
});

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    // 2. Validate Input
    const { success, data, error } = PublishCollectionSchema.safeParse(req.body);

    if (!success) {
        return res.status(400).json({
            message: "Invalid input",
            errors: error.errors,
        });
    }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    // 3. Fetch all products in the collection
    const { data: products } = await query.graph({
        entity: "product",
        fields: ["id"],
        filters: {
            collection_id: data.collection_id,
        },
    });

    if (!products.length) {
        return res.json({
            message: "No products found in this collection",
            updated_count: 0,
        });
    }

    // 4. Prepare updates
    // FIX: Use 'as const' or 'as ProductStatus' to fix the type error
    const productUpdates = products.map((product) => ({
        id: product.id,
        status: "published" as ProductStatus,
    }));

    // 5. Run Workflow
    const { result } = await updateProductsWorkflow(req.scope).run({
        input: {
            products: productUpdates,
        },
    });

    // 6. Return success
    res.json({
        message: `Successfully published ${products.length} products.`,
        updated_count: products.length,
        result,
    });
};