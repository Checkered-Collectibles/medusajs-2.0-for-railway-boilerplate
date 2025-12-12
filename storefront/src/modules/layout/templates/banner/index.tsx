import Countdown from "./countdown"

const DROP_DATE_IST = "2025-12-10T14:00:00+05:30"

export default function Banner() {
    const dropDate = new Date(DROP_DATE_IST)
    const isLive = Date.now() >= dropDate.getTime()

    return (
        <section className="flex">
            <div className="bg-black w-full text-white p-2 text-center">
                {isLive ? (
                    <a
                        href="/collections/n-case-2025-day-2"
                        className=""
                    >
                        🔥 N CASE 2025 - Day 2 is live — Show Now {"->"}
                    </a>
                ) : (
                    <div>
                        🚀 Next collection drops in{" "}
                        <Countdown
                            targetDate={dropDate}
                            size="lg"
                            className="px-0 inline"
                        />{" "}
                        — Don’t miss it!
                    </div>
                )}
            </div>
        </section>
    )
}