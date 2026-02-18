import { getCustomer } from "@lib/data/customer";
import { Button, Heading, Text } from "@medusajs/ui";
import SubscribeButton from "@modules/club/payment";
import Socials from "@modules/products/components/product-actions/socials";

export default async function Club() {
    const customer = await getCustomer();
    return (
        <main className="flex flex-col items-center justify-center min-h-[70vh] gap-y-6 text-center p-8">
            {/* <ExclamationCircleSolid className="text-ui-fg-error" /> */}
            <div className="space-y-5">
                <div className="space-y-2">
                    <Heading level="h1" className="text-2xl font-thin">
                        A place for diecast collectors
                    </Heading>
                    <Heading level="h2" className="text-3xl">
                        Coming Soon
                    </Heading>
                </div>
                {/* <Text className="text-ui-fg-subtle max-w-[500px] mx-auto">
                    We are currently experiencing technical difficulties with our storefront.
                    Please try refreshing the page or come back later.
                </Text> */}
            </div>
            <Socials label="Join the waitlist" />
            {customer &&
                <div className="">
                    <SubscribeButton variantId={"variant_01KHR931ZR25860TWEJQT0ADYE"} price={499} customer={customer} />
                </div>
            }
            {/* <Button
                onClick={handleReset}
                isLoading={isPending}
                variant="primary"
                size="large"
            >
                Refresh Page
            </Button> */}
        </main>
    )
}