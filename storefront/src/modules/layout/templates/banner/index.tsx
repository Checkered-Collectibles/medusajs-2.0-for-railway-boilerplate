import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Banner() {
    return (
        <section className="flex">
            <LocalizedClientLink href={`/store`} className="bg-black w-full text-white p-2 text-center group/link">
                <div className="flex gap-1 justify-center items-center">
                    📦 Free Shipping on orders above ₹600 <div className="group-hover/link:translate-x-1 duration-200">{'->'}</div>
                </div>
            </LocalizedClientLink>
        </section>
    )
}