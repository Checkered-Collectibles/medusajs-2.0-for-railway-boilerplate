// app/components/Countdown.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';

/** Parse "HH:MM:SS" into total seconds */
function parseToSeconds(str: string): number {
    const [hh, mm, ss] = str.split(':').map((n) => parseInt(n, 10) || 0);
    return hh * 3600 + mm * 60 + ss;
}

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

/** A rolling digit (0–9) */
const DigitRoll: React.FC<{ value: number; heightEm?: number; duration?: number }> = ({
    value,
    heightEm = 1,
    duration = 0.38,
}) => {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const lastVal = useRef<number>(value);

    useEffect(() => {
        if (!innerRef.current) return;

        if (lastVal.current !== value) {
            gsap.to(innerRef.current, {
                y: `-${value * heightEm}em`,
                duration,
                ease: 'expo.out',
            });
            lastVal.current = value;
        } else {
            gsap.set(innerRef.current, { y: `-${value * heightEm}em` });
        }
    }, [value, heightEm, duration]);

    return (
        <div
            className="relative overflow-hidden shrink-0"
            style={{ height: `${heightEm}em`, width: '1ch' }}
        >
            <div ref={innerRef} style={{ willChange: 'transform' }}>
                {Array.from({ length: 10 }, (_, i) => (
                    <div
                        key={i}
                        className="leading-none text-current text-center"
                        style={{ height: `${heightEm}em`, width: '1ch' }}
                    >
                        {i}
                    </div>
                ))}
            </div>
        </div>
    );
};

type CountdownProps = {
    /** Target end time; if provided, counts down to this moment. */
    targetDate?: Date | string | number;
    /** Fallback duration (HH:MM:SS) if targetDate is not provided. */
    start?: string;
    /** Fires when timer reaches 00:00:00 */
    onComplete?: () => void;
    /** Extra classes */
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
};

const sizeToClasses: Record<NonNullable<CountdownProps['size']>, string> = {
    sm: 'text-sm',
    md: 'text-md',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
};

export const Countdown: React.FC<CountdownProps> = ({
    targetDate,
    start = '01:30:00',
    onComplete,
    className = '',
    size = 'lg',
}) => {
    // compute initial remaining seconds
    const totalStartSec = useMemo(() => {
        if (targetDate != null) {
            const endMs = new Date(targetDate).getTime();
            if (Number.isNaN(endMs)) return 0;
            return Math.max(0, Math.floor((endMs - Date.now()) / 1000));
        }
        return Math.max(0, parseToSeconds(start));
    }, [targetDate, start]);

    const [remainingSec, setRemainingSec] = useState<number>(totalStartSec);
    const colonRefs = [useRef<HTMLSpanElement | null>(null), useRef<HTMLSpanElement | null>(null)];

    // Countdown loop
    useEffect(() => {
        let rafId = 0;
        let startTime = performance.now();
        let startRemaining = totalStartSec;

        const usingTarget = targetDate != null;
        const endMs = usingTarget ? new Date(targetDate as any).getTime() : null;

        const loop = () => {
            let next = 0;

            if (usingTarget && endMs != null && !Number.isNaN(endMs)) {
                // recompute directly against wall clock for accuracy
                next = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
            } else {
                // original duration mode
                const elapsedSec = Math.floor((performance.now() - startTime) / 1000);
                next = clamp(startRemaining - elapsedSec, 0, totalStartSec);
            }

            setRemainingSec(next);

            if (next > 0) {
                rafId = requestAnimationFrame(loop);
            } else {
                (onComplete ?? (() => window.location.reload()))();
            }
        };

        // reset baseline when inputs change
        startTime = performance.now();
        startRemaining = totalStartSec;
        setRemainingSec(totalStartSec);

        rafId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafId);
    }, [totalStartSec, targetDate, onComplete]);

    // Break into HH:MM:SS (hours may be 3+ digits)
    const hh = Math.floor(remainingSec / 3600);
    const mm = Math.floor((remainingSec % 3600) / 60);
    const ss = remainingSec % 60;

    const hoursStr = String(hh).padStart(2, '0');
    const minutesStr = String(mm).padStart(2, '0');
    const secondsStr = String(ss).padStart(2, '0');

    return (
        <div
            className={`inline-flex items-end font-mono tabular-nums tracking-tight ${sizeToClasses[size]} ${className}`}
            role="timer"
            aria-label="countdown"
        >
            {/* Hours: dynamic digit count */}
            {hoursStr.split('').map((char, idx) => (
                <DigitRoll key={`h-${idx}`} value={Number(char)} />
            ))}

            <span
                ref={colonRefs[0]}
                className="mx-[0.1ch] pb-[0.05em] leading-none select-none animate-pulse"
            >
                :
            </span>

            {/* Minutes */}
            {minutesStr.split('').map((char, idx) => (
                <DigitRoll key={`m-${idx}`} value={Number(char)} />
            ))}

            <span
                ref={colonRefs[1]}
                className="mx-[0.1ch] pb-[0.05em] leading-none select-none animate-pulse"
            >
                :
            </span>

            {/* Seconds */}
            {secondsStr.split('').map((char, idx) => (
                <DigitRoll key={`s-${idx}`} value={Number(char)} />
            ))}
        </div>
    );
};

export default Countdown;