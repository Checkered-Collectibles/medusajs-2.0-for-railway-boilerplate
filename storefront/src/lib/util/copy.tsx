"use client"

import { useState } from "react"

type CopyToClipboardProps = {
    value: string
    className?: string
    children?: React.ReactNode
}

export default function CopyToClipboard({
    value,
    className,
    children,
}: CopyToClipboardProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy: ", err)
        }
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            className={`px-2 py-1 text-compact-xsmall border border-ui-border-base rounded hover:bg-ui-bg-subtle transition-colors ${className}`}
        >
            {copied ? "Copied" : children ?? "Copy"}
        </button>
    )
}