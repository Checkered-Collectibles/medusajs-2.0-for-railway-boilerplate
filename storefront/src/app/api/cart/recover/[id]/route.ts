import { NextRequest } from "next/server"
import { notFound, redirect } from "next/navigation"
import { retrieveCart } from "@lib/data/cart"
import { setCartId } from "@lib/data/cookies"
type Params = Promise<{
    id: string
}>

export async function GET(req: NextRequest, { params }: { params: Params }) {
    const { id } = await params
    const cart = await retrieveCart(id)

    if (!cart) {
        redirect("/404")
    }

    setCartId(id)

    const countryCode = cart.shipping_address?.country_code ||
        cart.region?.countries?.[0]?.iso_2

    redirect(
        `/cart`
    )
}