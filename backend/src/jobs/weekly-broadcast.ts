import { MedusaContainer } from "@medusajs/framework/types"
import { weeklyBroadcastWorkflow } from "../workflows/weekly-broadcast"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function weeklyBroadcastJob(container: MedusaContainer) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

    logger.info("⏰ Starting Weekly Broadcast Job...")

    try {
        await weeklyBroadcastWorkflow(container).run()

        logger.info(`✅ Weekly Broadcast Job Complete.`)
    } catch (error) {
        logger.error(`❌ Weekly Broadcast Job Failed: ${error}`)
    }
}

// Schedule: At 12:00 on Friday.
// Cron format: Minute Hour DayOfMonth Month DayOfWeek
export const config = {
    name: "weekly-broadcast-job",
    schedule: "0 12 * * 5",
}