"use client"

import { HttpTypes } from "@medusajs/types"
import { useEffect, useMemo, useState } from "react"
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

    useEffect(() => {
        getLoyaltyPoints().then((points) => setLoyaltyPoints(points))
    }, [])

    const handleTogglePromotion = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault()
        if (!isLoyaltyPointsPromoApplied) {
            await applyLoyaltyPointsOnCart()
        } else {
            await removeLoyaltyPointsOnCart()
        }
    }

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
                                variant={"secondary"}
                                className="w-1/2"
                                onClick={handleTogglePromotion}
                                disabled={loyaltyPoints < 1}
                            >
                                {isLoyaltyPointsPromoApplied ? "Remove" : "Apply"} Points
                            </Button>
                            {/* <Button
                                variant={"secondary"}
                                className="w-1/2"
                                disabled={true}
                            >
                                Coming soon
                            </Button> */}

                            <span className="txt-medium text-ui-fg-subtle">
                                Balance: <span className="text-ui-fg-base font-medium">{loyaltyPoints}</span> pts
                            </span>
                        </div>

                        {/* {!isLoyaltyPointsPromoApplied && loyaltyPoints < 500 && (
                            <div className="txt-small text-ui-fg-subtle">
                                Earn <span className="font-medium text-ui-fg-base">{500 - loyaltyPoints}</span> more points to
                                unlock ₹20 off.
                            </div>
                        )} */}

                        {isLoyaltyPointsPromoApplied && (
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