import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Textarea, Button, toast, Text } from "@medusajs/ui"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import { useState, useEffect } from "react"
import { sdk } from "../lib/sdk"

// --- TYPES ---
type Order = {
    id: string
    metadata: Record<string, any> | null
}

const OrderInternalNote = ({ data }: { data: { id: string } }) => {
    const [note, setNote] = useState("")
    const [loading, setLoading] = useState(false)

    // 1. Load initial note
    useEffect(() => {
        sdk.client.fetch<{ order: Order }>(`/admin/orders/${data.id}`).then((res) => {
            setNote(res.order.metadata?.internal_note || "")
        })
    }, [data.id])

    // 2. Save Handler
    const handleSave = async () => {
        setLoading(true)
        try {
            // Fetch current metadata first to avoid overwriting other keys
            const { order } = await sdk.client.fetch<{ order: Order }>(`/admin/orders/${data.id}`)

            await sdk.admin.order.update(data.id, {
                metadata: {
                    ...order.metadata,
                    internal_note: note
                }
            })
            toast.success("Internal note saved")
        } catch (e) {
            toast.error("Failed to save note")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Container className="p-4 flex flex-col gap-3 bg-yellow-50/50 border-yellow-200/60">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-ui-fg-base">
                    <ChatBubbleLeftRight className="text-ui-fg-subtle" />
                    <Heading level="h2">Staff Note</Heading>
                </div>
                <Button
                    size="small"
                    variant="secondary"
                    onClick={handleSave}
                    isLoading={loading}
                >
                    Save
                </Button>
            </div>

            <Textarea
                placeholder="Add internal instructions for this order..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-white min-h-[100px] text-sm"
            />

            <Text size="xsmall" className="text-ui-fg-subtle">
                Only visible to admin staff. Not shown to customers.
            </Text>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "order.details.side.before", // 👈 Sidebar placement
})

export default OrderInternalNote