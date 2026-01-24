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
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const key = `watched-${productId}`
        const lastView = localStorage.getItem(key)
        const now = Date.now()
        const DAY = 24 * 60 * 60 * 1000
        const url = `${backendUrl}/public/product-watching/${productId}`

        const fetchCount = async (method: "GET" | "POST") => {
            return fetch(url, { method })
                .then((res) => res.json())
                .then((data) => {
                    setWatching(data.watching ?? 0)
                })
                .finally(() => {
                    setIsLoading(false)
                })
        }

        // 1) First call: register view (once per 24h) or just read
        if (!lastView || now - Number(lastView) >= DAY) {
            fetchCount("POST").then(() => {
                localStorage.setItem(key, now.toString())
            })
        } else {
            fetchCount("GET")
        }

        // 2) Poll every 10 seconds (GET only)
        const interval = setInterval(() => {
            fetch(url)
                .then((res) => res.json())
                .then((data) => setWatching(data.watching ?? 0))
                .catch(() => { })
        }, 10_000)

        return () => clearInterval(interval)
    }, [productId, backendUrl])

    // Don’t show anything while loading
    if (isLoading) return null

    return (
        <p className="bg-blue-100 text-blue-700 px-3 py-2 rounded-full border border-blue-200 animate-pulse">
            {watching > 1
                ? `${watching} watching`
                : watching === 1
                    ? "1 watching"
                    : "You're first here"}
        </p>
    )
}