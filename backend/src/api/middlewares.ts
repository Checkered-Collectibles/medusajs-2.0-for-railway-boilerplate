import cors from "cors"
import { defineMiddlewares, validateAndTransformQuery } from "@medusajs/framework/http"
import { parseCorsOrigins } from "@medusajs/framework/utils"
import type {
    MedusaNextFunction,
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { ConfigModule } from "@medusajs/framework/types"
import { z } from "zod"

export default defineMiddlewares({
    routes: [
        /**
         * ===========================
         *  CORS for /public and /custom-routes
         * ===========================
         */
        {
            matcher: "/public*",
            middlewares: [
                (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
                    const configModule: ConfigModule = req.scope.resolve("configModule")

                    return cors({
                        origin: parseCorsOrigins(
                            configModule.projectConfig.http.storeCors
                        ),
                        credentials: false,
                    })(req, res, next)
                },
            ],
        },

        /**
         * ===========================
         *  Validation for /product-feed
         * ===========================
         */
        {
            matcher: "/product-feed",
            methods: ["GET"],
            middlewares: [
                validateAndTransformQuery(
                    z.object({
                        currency_code: z.string(),
                        country_code: z.string(),
                    }),
                    {}
                ),
            ],
        },
    ],
})