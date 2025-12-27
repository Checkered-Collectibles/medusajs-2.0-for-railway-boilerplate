export default function Loading() {
    return (
        <div className="content-container flex flex-col small:flex-row small:items-start py-6 relative animate-pulse h-[90vh]">
            {/* LEFT SIDEBAR */}
            <div className="flex flex-col small:sticky small:top-36 small:max-w-[300px] w-full py-5 gap-y-6">
                {/* Product title skeleton */}
                <div className="h-6 w-2/3 bg-gray-200 rounded" />

                {/* Price */}
                <div className="h-5 w-1/3 bg-gray-200 rounded" />

                {/* Short description */}
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 rounded" />

                {/* Tabs placeholder */}
                <div className="mt-4 flex flex-col gap-3">
                    <div className="h-6 w-24 bg-gray-200 rounded" />
                    <div className="h-6 w-20 bg-gray-200 rounded" />
                    <div className="h-6 w-28 bg-gray-200 rounded" />
                </div>
            </div>

            {/* IMAGE GALLERY */}
            <div className="block w-full relative px-4 h-full">
                {/* Main image skeleton */}
                <div className="w-full h-[35rem] small:h-[50rem] bg-gray-200 rounded-lg" />

            </div>

            {/* RIGHT SIDEBAR */}
            <div className="flex flex-col small:sticky small:top-36 small:max-w-[300px] py-5 w-full gap-y-10">
                {/* CTA card skeleton */}
                <div className="w-full h-20 bg-gray-200 rounded-lg" />

                {/* Add to Cart area */}
                <div className="w-full flex flex-col gap-4">
                    {/* Variant selectors */}
                    <div className="h-10 w-full bg-gray-200 rounded" />
                    <div className="h-10 w-full bg-gray-200 rounded" />

                    {/* Add to cart button */}
                    <div className="h-12 w-full bg-gray-300 rounded-md" />
                </div>
            </div>
        </div>
    )
}