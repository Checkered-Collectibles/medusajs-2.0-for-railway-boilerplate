import type {
    AuthenticatedMedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
    const customerId = req.auth_context?.actor_id

    if (!customerId) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    const customerModuleService = req.scope.resolve(Modules.CUSTOMER)

    const customer = await customerModuleService.retrieveCustomer(customerId, {
        relations: ["groups"],
    })

    // return only groups, or the whole customer if you prefer
    return res.json({ groups: customer.groups })
}