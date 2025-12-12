// src/api/middlewares.ts
import { defineMiddlewares } from "@medusajs/framework/http"

export default defineMiddlewares({
    routes: [
        {
            method: ["POST"],
            matcher: "/admin/uploads",          // change to match your upload route
            bodyParser: {
                sizeLimit: "20mb",         // increase as needed
            },
        },
    ],
})