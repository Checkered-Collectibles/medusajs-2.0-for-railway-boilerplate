import { Button } from "@medusajs/ui"
import Spinner from "@modules/common/icons/spinner"
import React, { useCallback, useEffect, useState } from "react"
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay"
import { HttpTypes } from "@medusajs/types"
import { deleteLineItem, placeOrder, clearCartCookie } from "@lib/data/cart"
import { redirect } from "next/navigation"
import { CurrencyCode } from "react-razorpay/dist/constants/currency"
export const RazorpayPaymentButton = ({
    session,
    notReady,
    cart,
}: {
    session: HttpTypes.StorePaymentSession
    notReady: boolean
    cart: HttpTypes.StoreCart
}) => {
    const [submitting, setSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | undefined>(
        undefined
    )
    const { Razorpay } = useRazorpay()

    const [orderData, setOrderData] = useState({ id: "" })

    const onPaymentCompleted = async (authorizedCart: any) => {
        setSubmitting(false)
        // await placeOrder().catch(() => {
        //   setErrorMessage("An error occurred, please try again.")
        //   setSubmitting(false)
        // })
        const countryCode =
            authorizedCart.order.shipping_address?.country_code?.toLowerCase()
        // removeCartId()(
        await clearCartCookie()
        redirect(`/order/${authorizedCart?.order.id}/confirmed`)
    }

    useEffect(() => {
        setOrderData(session?.data as { id: string })
    }, [session?.data])

    const handlePayment = useCallback(async () => {
        setSubmitting(true)
        const authorizedCart: any = await placeOrder()
            .then((authorizedCart) => {
                return authorizedCart
            })
            .catch((err) => {
                setSubmitting(false)
                setErrorMessage("Error placing order :" + JSON.stringify(err))
            })

        if (authorizedCart.cart) {
            setSubmitting(false)
            setErrorMessage(
                "Error placing order :" + JSON.stringify(authorizedCart.error.message)
            )
        } else if (authorizedCart.order) {
            const onPaymentCancelled = async () => {
                await deleteLineItem(session?.provider_id).catch(() => {
                    setErrorMessage("PaymentCancelled")
                    setSubmitting(false)
                })
            }

            const options: RazorpayOrderOptions = {
                callback_url: `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/razorpay`,
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY ?? "",
                amount: authorizedCart.order.total * 100,
                order_id: orderData.id,
                currency: cart.currency_code.toUpperCase() as CurrencyCode,
                name: process.env.COMPANY_NAME ?? "Checkered Collectibles",
                description: `Order number ${orderData.id}`,
                remember_customer: true,

                image:
                    "https://checkered.in/images/logo.png",
                modal: {
                    backdropclose: true,
                    escape: true,
                    handleback: true,
                    confirm_close: true,
                    ondismiss: async () => {
                        setSubmitting(false)
                        setErrorMessage(`Payment cancelled`)
                        await onPaymentCancelled()
                    },
                    animation: true,
                },
                theme: {
                    hide_topbar: true,
                    color: "black",
                },

                handler: async () => {
                    onPaymentCompleted(authorizedCart)
                },
                prefill: {
                    name:
                        authorizedCart.order.billing_address?.first_name +
                        " " +
                        authorizedCart.order?.billing_address?.last_name,
                    email: authorizedCart.order?.email,
                    contact: authorizedCart.order?.shipping_address?.phone,
                    method: "upi",
                },
            }

            const razorpay = new Razorpay(options)
            if (orderData.id) razorpay.open()
            razorpay.on("payment.failed", function (response: any) {
                setErrorMessage(JSON.stringify(response.error))
            })
            razorpay.on("payment.authorized" as any, function (response: any) {
                console.log("Payment Authorized.")
            })
            // razorpay.on("payment.captured", function (response: any) {})
        }
    }, [
        Razorpay,
        cart.billing_address?.first_name,
        cart.billing_address?.last_name,
        cart.currency_code,
        cart?.email,
        cart?.shipping_address?.phone,
        orderData.id,
        session?.amount,
        session?.provider_id,
    ])
    return (
        <>
            <Button
                disabled={
                    submitting || notReady || !orderData?.id || orderData.id == ""
                }
                onClick={() => {
                    //   console.log(`processing order id: ${orderData.id}`)
                    handlePayment()
                }}
            >
                {submitting ? <Spinner /> : "Place Order"}
            </Button>
            {errorMessage && (
                <div className="text-red-500 text-small-regular mt-2">
                    {errorMessage}
                </div>
            )}
        </>
    )
}