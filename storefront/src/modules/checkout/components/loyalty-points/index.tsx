"use client"

import { HttpTypes } from "@medusajs/types"
import { useEffect, useMemo, useState, useTransition } from "react"
import { getLoyaltyPoints } from "../../../../lib/data/customer"
import { Button, Heading } from "@medusajs/ui"
import {
    applyLoyaltyPointsOnCart,
    removeLoyaltyPointsOnCart,
} from "../../../../lib/data/cart"
import Link from "next/link"

type LoyaltyPointsProps = {
    cart: HttpTypes.StoreCart & {
        promotions: HttpTypes.StorePromotion[]
    }
}

const LoyaltyPoints = ({ cart }: LoyaltyPointsProps) => {
    const isLoyaltyPointsPromoApplied = useMemo(() => {
        return (
            cart.promotions.find((promo) => promo.id === cart.metadata?.loyalty_promo_id) !==
            undefined
        )
    }, [cart])

    const [loyaltyPoints, setLoyaltyPoints] = useState<number | null>(null)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        getLoyaltyPoints().then((points) => setLoyaltyPoints(points))
    }, [])

    const handleTogglePromotion = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()

        // ✅ hard guard against click spam
        if (isPending) return

        setError(null)

        startTransition(async () => {
            try {
                if (!isLoyaltyPointsPromoApplied) {
                    await applyLoyaltyPointsOnCart()
                } else {
                    await removeLoyaltyPointsOnCart()
                }
            } catch (err: any) {
                setError(err?.message || "Something went wrong. Please try again.")
            }
        })
    }

    const buttonText = isPending
        ? isLoyaltyPointsPromoApplied
            ? "Removing..."
            : "Applying..."
        : isLoyaltyPointsPromoApplied
            ? "Remove Points"
            : "Apply Points"

    return (
        <>
            <div className="h-px w-full border-b border-gray-200 my-4" />

            <div className="flex flex-col gap-2">
                <Heading className="txt-medium">Loyalty Points ✨</Heading>

                <div className="txt-small text-ui-fg-subtle leading-6">
                    <div>
                        <span className="font-medium text-ui-fg-base">Earn:</span> Spend ₹10 = get 10 points
                    </div>
                    <div>
                        <span className="font-medium text-ui-fg-base">Redeem:</span> 500 points = ₹25 off
                    </div>
                </div>

                {loyaltyPoints === null ? (
                    <div className="mt-2">
                        <Link
                            href="/account"
                            className="txt-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                        >
                            Log in / Sign up
                        </Link>
                        <span className="txt-small text-ui-fg-subtle"> to earn and use points.</span>
                    </div>
                ) : (
                    <div className="mt-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-3">
                            <Button
                                variant="secondary"
                                className="w-1/2"
                                onClick={handleTogglePromotion}
                                disabled={
                                    isPending || loyaltyPoints < 1 // you can change to < 500 if required
                                }
                                isLoading={isPending} // if Medusa UI Button supports it; if not, remove
                            >
                                {buttonText}
                            </Button>

                            <span className="txt-medium text-ui-fg-subtle">
                                Balance:{" "}
                                <span className="text-ui-fg-base font-medium">{loyaltyPoints}</span> pts
                            </span>
                        </div>

                        {error && (
                            <div className="txt-small text-ui-fg-error">
                                {error}
                            </div>
                        )}

                        {isLoyaltyPointsPromoApplied && !isPending && (
                            <div className="txt-small text-ui-fg-subtle">
                                ✅ Loyalty discount applied to this cart.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}

export default LoyaltyPoints