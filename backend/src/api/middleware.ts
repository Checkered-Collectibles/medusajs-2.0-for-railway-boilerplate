// src/api/middlewares.ts
import { defineMiddlewares } from "@medusajs/framework/http"
import type { MiddlewaresConfig } from "@medusajs/framework"

const UPLOAD_SIZE_LIMIT = "10mb";

export const config: MiddlewaresConfig = {
    routes: [
        {
            matcher: "/admin/uploads",
            method: ["POST"],
            bodyParser: {
                sizeLimit: UPLOAD_SIZE_LIMIT,
            },
            middlewares: [],
        },
    ],
}

export default config