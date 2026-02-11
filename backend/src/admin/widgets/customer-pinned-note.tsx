import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Textarea, Button, toast, Text } from "@medusajs/ui"
import { ExclamationCircle } from "@medusajs/icons"
import { useState, useEffect } from "react"
import { sdk } from "../lib/sdk"

// --- TYPES ---
type Customer = {
    id: string
    metadata: Record<string, any> | null
}

const CustomerPinnedNote = ({ data }: { data: Customer }) => {
    // 1. Initialize state from existing metadata
    const [note, setNote] = useState(data.metadata?.pinned_note || "")
    const [isSaving, setIsSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    // Update local state if props change
    useEffect(() => {
        setNote(data.metadata?.pinned_note || "")
    }, [data.metadata])

    // 2. Handle Save
    const handleSave = async () => {
        setIsSaving(true)
        try {
            await sdk.admin.customer.update(data.id, {
                metadata: {
                    ...data.metadata,
                    pinned_note: note
                }
            })
            toast.success("Note saved")
            setHasChanges(false)
        } catch (e) {
            toast.error("Failed to save note")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Container className="p-4 flex flex-col gap-3 bg-amber-50/30 border-amber-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-700">
                    <ExclamationCircle />
                    <Heading level="h2" className="text-amber-900">Important Note</Heading>
                </div>
                {hasChanges && (
                    <Button
                        size="small"
                        variant="secondary"
                        onClick={handleSave}
                        isLoading={isSaving}
                    >
                        Save
                    </Button>
                )}
            </div>

            <Textarea
                placeholder="Add critical info here (e.g., 'Pack with extra bubble wrap')..."
                value={note}
                onChange={(e) => {
                    setNote(e.target.value)
                    setHasChanges(true)
                }}
                className="bg-white min-h-[80px]"
            />
            <Text size="small" className="text-ui-fg-subtle">
                This note is pinned to the top of the customer profile.
            </Text>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "customer.details.side.before", // 👈 Also top, usually stacks below Metrics
})

export default CustomerPinnedNote