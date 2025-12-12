import { defineMiddlewares } from "@medusajs/framework/http"

export default defineMiddlewares({
    routes: [
        // Admin upload route
        {
            method: ["POST"],
            matcher: "/admin/uploads",
            bodyParser: { sizeLimit: "50mb" },
        },

        // If you're using protected uploads too
        {
            method: ["POST"],
            matcher: "/admin/uploads/protected",
            bodyParser: { sizeLimit: "50mb" },
        },

        // (Optional) Store uploads if you have any custom endpoint there
        {
            method: ["POST"],
            matcher: "/store/uploads",
            bodyParser: { sizeLimit: "50mb" },
        },
    ],
})