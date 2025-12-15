"use client"

import { InformationCircle } from "@medusajs/icons"
import Countdown from "@modules/layout/templates/banner/countdown"
import React, { useEffect, useMemo, useState } from "react"
// import Countdown from wherever your component lives
// import { Countdown } from "@/components/countdown"

type ShippingCountdownProps = {
  cutoffHour?: number // default 15 (3 PM)
  cutoffMinute?: number // default 0
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function ShippingCountdown({
  cutoffHour = 15,
  cutoffMinute = 0,
  size = "lg",
  className = "",
}: ShippingCountdownProps) {
  const [now, setNow] = useState<Date>(() => new Date())

  // Update time (no need to run every second; 15s is plenty)
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000)
    return () => clearInterval(t)
  }, [])

  const { dropDate, shipsWhen } = useMemo(() => {
    const n = now

    // today cutoff
    const cutoff = new Date(n)
    cutoff.setHours(cutoffHour, cutoffMinute, 0, 0)

    // if past cutoff, use tomorrow cutoff
    const target = n.getTime() <= cutoff.getTime()
      ? cutoff
      : new Date(new Date(cutoff).setDate(cutoff.getDate() + 1))

    const when = n.getTime() <= cutoff.getTime() ? "today" : "tomorrow"

    return { dropDate: target, shipsWhen: when }
  }, [now, cutoffHour, cutoffMinute])

  return (
    <div className={`${className} p-2 bg-white rounded-xl border border-black/10 shadow text-center`}>
      {/* <InformationCircle className="mt-1" /> */}
      <span>
        Order in{" "}
        <Countdown
          targetDate={dropDate}
          size={size}
          className="px-0 inline"
        /><br />
        to get it shipped <strong>{shipsWhen}</strong>
      </span>
      {/* <div className="text-sm opacity-70">
        Cutoff time: {cutoffHour % 12 || 12}:{String(cutoffMinute).padStart(2, "0")}{" "}
        {cutoffHour >= 12 ? "PM" : "AM"}
      </div> */}
    </div>
  )
}