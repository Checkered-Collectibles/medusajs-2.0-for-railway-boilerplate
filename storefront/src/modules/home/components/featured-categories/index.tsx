import Link from "next/link";
import { ChevronRight } from "@medusajs/icons";
import { Heading, Text } from "@medusajs/ui";

export default function FeaturedCategories() {
    return (
        <section className="content-container pt-12">
            <Text className="txt-xlarge mb-8">Explore Catalog</Text>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                {/* We use 'gap-px' with a gray background on the parent to create
                   perfectly thin grid lines between the white items.
                */}
                {[
                    { title: "Premiums", href: "/categories/hot-wheels-premium", desc: "For the serious collector" },
                    { title: "Licensed", href: "/categories/hot-wheels-mainline-licensed", desc: "Real manufacturer replicas" },
                    { title: "Fantasy", href: "/categories/hot-wheels-mainline-fantasy", desc: "Unique Hot Wheels designs" }
                ].map((item) => (
                    <Link
                        key={item.title}
                        href={item.href}
                        className="bg-white p-8 group hover:bg-gray-50 transition-colors flex flex-col h-48 justify-between"
                    >
                        <div className="flex justify-between items-start">
                            <div className="h-2 w-2 rounded-full bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
                            <ChevronRight className="text-gray-300 group-hover:text-black -translate-x-2 group-hover:translate-x-0 duration-300" />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold uppercase text-black mb-1">{item.title}</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">{item.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}