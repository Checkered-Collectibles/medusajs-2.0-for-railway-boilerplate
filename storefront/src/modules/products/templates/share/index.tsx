"use client"

import { useState } from "react"

interface ShareProps {
    title?: string
    text?: string
    className?: string
}

export default function Share({
    title = "Checkered Collectibles",
    text = "Check out this rare find!",
    className = ""
}: ShareProps) {
    const [isCopied, setIsCopied] = useState(false)

    const handleShare = async () => {
        const url = window.location.href

        // 1. Try Native Share (Mobile/Tablet)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: text,
                    url: url,
                })
            } catch (error) {
                console.log("Share cancelled or failed", error)
            }
        }
        // 2. Fallback to Clipboard (Desktop)
        else {
            try {
                await navigator.clipboard.writeText(url)
                setIsCopied(true)
                // Reset "Copied" state after 2 seconds
                setTimeout(() => setIsCopied(false), 2000)
            } catch (error) {
                console.error("Failed to copy", error)
            }
        }
    }

    return (
        <button
            onClick={handleShare}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-full border
            ${isCopied
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } ${className}`}
            aria-label="Share this page"
        >
            {isCopied ? (
                <>
                    <CheckIcon className="w-4 h-4" />
                    <span>Link Copied!</span>
                </>
            ) : (
                <>
                    <ShareIcon className="w-4 h-4" />
                    <span>Share</span>
                </>
            )}
        </button>
    )
}

// --- Icons ---

function ShareIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" x2="12" y1="2" y2="15" />
        </svg>
    )
}

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}