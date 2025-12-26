"use client"

import { useEffect, useState } from "react"

interface WatchingCountProps {
    productId: string
    backendUrl: string
}

export default function WatchingCount({
    productId,
    backendUrl,
}: WatchingCountProps) {
    const [watching, setWatching] = useState<number>(0)

    useEffect(() => {
        const key = `watched-${productId}`
        const lastView = localStorage.getItem(key)
        const now = Date.now()
        const DAY = 24 * 60 * 60 * 1000

        const getUrl = `${backendUrl}/public/product-watching/${productId}`

        // If already viewed within 24 hours → only GET
        if (lastView && now - Number(lastView) < DAY) {
            fetch(getUrl)
                .then((res) => res.json())
                .then((data) => setWatching(data.watching ?? 0))
            return
        }

        // Otherwise → POST (register view) + update localStorage
        fetch(getUrl, { method: "POST" })
            .then((res) => res.json())
            .then((data) => {
                setWatching(data.watching ?? 0)
                localStorage.setItem(key, now.toString())
            })
    }, [productId, backendUrl])

    return (
        <p className="">
            {watching > 1
                ? `${watching} watching now`
                : watching === 1
                    ? "1 watching now"
                    : "You're first here"}
        </p>
    )
}