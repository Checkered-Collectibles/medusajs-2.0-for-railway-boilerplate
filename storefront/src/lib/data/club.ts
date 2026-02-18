"server only";

import { getCustomerGroups } from "./customer";

const CLUB_GROUP_ID = "cusgroup_01KHQVQYE2RX2JNZFZ4PYY6RPJ"

export const checkClubMember = async (): Promise<boolean> => {
    const customerGroups = await getCustomerGroups().catch(() => null)
    return !!customerGroups && customerGroups.some((g) => g.id === CLUB_GROUP_ID)
}