import Countdown from "./countdown"

const DROP_DATE_IST = "2025-12-11T14:00:00+05:30"

export default function Banner() {
    const dropDate = new Date(DROP_DATE_IST)
    const isLive = Date.now() >= dropDate.getTime()

    return (
        <section className="flex sm:text-md text-sm">
            <div className="bg-black w-full text-white p-2 text-center">
                {isLive ? (
                    <a
                        href="/collections/n-case-2025-licensed"
                        className=""
                    >
                        🔥 N CASE 2025 - Licensed is live<br className="sm:hidden block" /> — Shop Now {"->"}
                    </a>
                ) : (
                    <div>
                        🚀 Next collection drops in{" "}
                        <Countdown
                            targetDate={dropDate}
                            size="lg"
                            className="px-0 inline"
                        />{" "}
                        <br className="sm:hidden block" />
                        — Don’t miss it!
                    </div>
                )}
            </div>
        </section>
    )
}