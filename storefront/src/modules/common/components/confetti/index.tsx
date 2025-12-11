"use client";

import { useEffect, useState } from "react";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";

export default function ConfettiComponent() {
    const [mounted, setMounted] = useState(false);
    const { width, height } = useWindowSize();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null; // ⛔️ Prevent SSR render → stops hydration mismatch

    return (
        <Confetti
            recycle={false}
            numberOfPieces={300}
            width={width}
            height={height}
        />
    );
}