/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useEffect, useRef, useState } from "@webpack/common";

/**
 * Returns a smoothly-updating playback position in milliseconds.
 * Reads the initial position from the store's calculated value
 * and advances it locally using requestAnimationFrame to avoid
 * re-subscribing to the store every second.
 */
export function usePlaybackTimer(
    basePosition: number,
    isPlaying: boolean,
    trackId: string | undefined,
): number {
    const [position, setPosition] = useState(basePosition);
    const startRef = useRef<number>(0);
    const baseRef = useRef<number>(basePosition);
    const rafRef = useRef<number>(0);

    // Reset timer on track change or seek (basePosition jumps)
    useEffect(() => {
        baseRef.current = basePosition;
        startRef.current = Date.now();
        setPosition(basePosition);
    }, [basePosition, trackId]);

    useEffect(() => {
        if (!isPlaying) {
            cancelAnimationFrame(rafRef.current);
            return;
        }

        const tick = () => {
            const elapsed = Date.now() - startRef.current;
            setPosition(baseRef.current + elapsed);
            rafRef.current = requestAnimationFrame(tick);
        };

        startRef.current = Date.now();
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [isPlaying, trackId]);

    return position;
}
