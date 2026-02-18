import { MedusaContainer } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

const CLUB_GROUP_ID = "cusgroup_01KHQVQYE2RX2JNZFZ4PYY6RPJ";

export default async function expireClubMembers(container: MedusaContainer) {
    const customerModule = container.resolve(Modules.CUSTOMER);

    // 1. Get all customers in the Club Group
    // ✅ FIXED: Removed [ ] brackets so 'customers' is an Array
    const customers = await customerModule.listCustomers({
        groups: { id: [CLUB_GROUP_ID] }
    }, {
        select: ["id", "metadata"],
        take: 10000
    });

    // Calculate "Now" in Unix Timestamp (Seconds)
    const now = Math.floor(Date.now() / 1000);
    let removedCount = 0;

    for (const customer of customers) {
        // metadata values are stored as strings or numbers, ensure type safety
        const expiry = customer.metadata?.club_expiry as number | undefined;

        // If no expiry is set, we skip (safeguard)
        if (!expiry) continue;

        // 2. Check if expired
        if (expiry < now) {
            console.log(`👋 Expiring membership for ${customer.id}. Ended at ${expiry}`);

            // Remove from Group
            // ✅ FIXED: Updated property names for Medusa V2
            await customerModule.removeCustomerFromGroup({
                customer_id: customer.id,
                customer_group_id: CLUB_GROUP_ID
            });

            // Optional: Update status
            await customerModule.updateCustomers(customer.id, {
                metadata: { ...customer.metadata, club_sub_status: "expired" }
            });

            removedCount++;
        }
    }

    console.log(`✅ Membership Cleanup Job: Removed ${removedCount} expired members.`);
}

export const config = {
    name: "expire-club-members",
    schedule: "0 0 * * *", // Runs every day at Midnight
};