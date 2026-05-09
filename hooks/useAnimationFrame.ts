/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useCallback, useEffect, useRef, useState } from "@webpack/common";

/**
 * Runs a callback on every animation frame at a capped fps rate.
 * Automatically cancels the loop on unmount.
 * @param callback - Called with elapsed ms since last frame
 * @param fps - Target framerate (default 30). Set 0 to pause.
 * @param active - Whether the loop should be running
 */
export function useAnimationFrame(
    callback: (dt: number) => void,
    fps: number = 30,
    active: boolean = true,
): void {
    const rafRef = useRef<number>(0);
    const lastTime = useRef<number>(0);
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    const minInterval = fps > 0 ? 1000 / fps : Infinity;

    const loop = useCallback((now: number) => {
        const dt = now - lastTime.current;
        if (dt >= minInterval) {
            lastTime.current = now;
            callbackRef.current(dt);
        }
        rafRef.current = requestAnimationFrame(loop);
    }, [minInterval]);

    useEffect(() => {
        if (!active || fps === 0) {
            cancelAnimationFrame(rafRef.current);
            return;
        }
        rafRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafRef.current);
    }, [active, fps, loop]);
}

/**
 * BPM-synced pulse value (0–1). Returns 1 at beat, decays exponentially.
 * Used to drive glow/bloom effects in sync with music tempo.
 * Uses setState so the parent re-renders on each beat tick.
 */
export function useBPMPulse(bpm: number | null, active: boolean): number {
    const [pulse, setPulse] = useState(0);
    const lastBeatRef = useRef(0);

    useAnimationFrame(
        () => {
            if (!bpm || !active) {
                setPulse(0);
                return;
            }
            const beatInterval = 60000 / bpm;
            const now = Date.now();
            if (now - lastBeatRef.current >= beatInterval) {
                lastBeatRef.current = now;
                setPulse(1);
            } else {
                const elapsed = now - lastBeatRef.current;
                // Exponential decay — pulse dies in ~half a beat interval
                setPulse(Math.exp(-4 * elapsed / beatInterval));
            }
        },
        60,
        active && bpm !== null,
    );

    return pulse;
}
