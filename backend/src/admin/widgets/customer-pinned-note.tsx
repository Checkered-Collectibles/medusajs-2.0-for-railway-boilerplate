import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Textarea, Button, toast, Text, StatusBadge } from "@medusajs/ui"
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
        <Container className="p-0 overflow-hidden">
            {/* Header: Uses standard background but adds an icon for visual distinction */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-ui-border-base bg-ui-bg-subtle">
                <div className="flex items-center gap-2">
                    {/* Orange icon to signify importance without forcing background colors */}
                    <ExclamationCircle className="text-orange-500" />
                    <Heading level="h2">Important Note</Heading>
                </div>
                {hasChanges && (
                    <Button
                        size="small"
                        variant="primary" // Changed to primary for better visibility when saving
                        onClick={handleSave}
                        isLoading={isSaving}
                    >
                        Save
                    </Button>
                )}
            </div>

            <div className="p-4 flex flex-col gap-3">
                <Textarea
                    placeholder="Add critical info here (e.g., 'Pack with extra bubble wrap')..."
                    value={note}
                    onChange={(e) => {
                        setNote(e.target.value)
                        setHasChanges(true)
                    }}
                    // Removed bg-white; Medusa handles the theme automatically
                    className="min-h-[80px]"
                />

                {/* Helper text */}
                <div className="flex gap-2 items-center">
                    <Text size="xsmall" className="text-ui-fg-subtle">
                        This note is pinned to the top of the customer profile.
                    </Text>
                </div>
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "customer.details.side.before",
})

export default CustomerPinnedNote