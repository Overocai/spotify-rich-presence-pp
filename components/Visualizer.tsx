/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Spectrum analyzer / equalizer bar visualizer.
 *
 * Because Discord does not expose the Web Audio API context to plugins,
 * we synthesize a plausible-looking spectrum using the track's energy,
 * danceability, and BPM from Spotify's audio features. This is an
 * honest visual approximation rather than a real FFT.
 */

import { useEffect, useRef } from "@webpack/common";

import { useAnimationFrame } from "../hooks/useAnimationFrame";
import { clamp, lerp } from "../utils/format";

interface VisualizerProps {
    isPlaying: boolean;
    bpm: number | null;
    energy: number;         // 0–1 from Spotify audio features
    danceability: number;   // 0–1 from Spotify audio features
    accentColor: string;
    peakColor: string;
    barCount?: number;
    fps?: number;
}

const NUM_BARS_DEFAULT = 24;
const BAR_MIN_HEIGHT = 0.03;  // fraction of canvas height
const BAR_MAX_HEIGHT = 0.92;

/** Per-bar state for smooth interpolation */
interface BarState {
    target: number;
    current: number;
    velocity: number;
    phase: number;
    freq: number;
}

function initBars(count: number): BarState[] {
    return Array.from({ length: count }, (_, i) => ({
        target: BAR_MIN_HEIGHT,
        current: BAR_MIN_HEIGHT,
        velocity: 0,
        phase: (i / count) * Math.PI * 2,
        freq: 0.8 + (i / count) * 3.2,
    }));
}

/**
 * Synthesizes bar target heights based on audio features + time.
 * Produces a psychedelic-looking but temporally coherent motion.
 */
function synthesize(
    bars: BarState[],
    t: number,
    energy: number,
    danceability: number,
    bpm: number,
    dt: number,
): void {
    const beatPeriod = 60 / bpm;
    const beatPhase = (t / beatPeriod) % 1;
    const beatPulse = Math.pow(Math.sin(beatPhase * Math.PI), 3);

    for (let i = 0; i < bars.length; i++) {
        const bar = bars[i];

        // Multi-octave sine oscillation per bar
        const osc =
            0.4 * Math.sin(t * bar.freq + bar.phase) +
            0.3 * Math.sin(t * bar.freq * 2.1 + bar.phase * 1.3) +
            0.15 * Math.sin(t * bar.freq * 4.3 + bar.phase * 0.7);

        // Scale by energy and add beat emphasis on bass bars
        const bassBoost = i < bars.length * 0.3 ? beatPulse * danceability * 0.4 : 0;
        const normalized = (osc + 1) / 2; // 0–1
        bar.target = clamp(
            BAR_MIN_HEIGHT + normalized * (BAR_MAX_HEIGHT - BAR_MIN_HEIGHT) * energy + bassBoost,
            BAR_MIN_HEIGHT,
            BAR_MAX_HEIGHT,
        );

        // Spring physics for smooth interpolation
        const spring = 18;
        const damping = 0.72;
        const force = spring * (bar.target - bar.current);
        bar.velocity = bar.velocity * damping + force * (dt / 1000);
        bar.current = clamp(bar.current + bar.velocity * (dt / 1000), BAR_MIN_HEIGHT, BAR_MAX_HEIGHT);
    }
}

export function Visualizer({
    isPlaying,
    bpm,
    energy = 0.6,
    danceability = 0.5,
    accentColor,
    peakColor,
    barCount = NUM_BARS_DEFAULT,
    fps = 30,
}: VisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const barsRef = useRef<BarState[]>(initBars(barCount));
    const tRef = useRef(0);

    // Re-init bars when count changes
    useEffect(() => {
        barsRef.current = initBars(barCount);
    }, [barCount]);

    useAnimationFrame(
        (dt) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const { width, height } = canvas;
            tRef.current += dt / 1000;

            const effectiveBPM = bpm ?? 120;
            const effectiveEnergy = isPlaying ? energy : Math.max(0, energy - 0.5);

            if (isPlaying) {
                synthesize(barsRef.current, tRef.current, effectiveEnergy, danceability, effectiveBPM, dt);
            } else {
                // Decay to flat line when paused
                for (const bar of barsRef.current) {
                    bar.target = BAR_MIN_HEIGHT;
                    bar.current = lerp(bar.current, BAR_MIN_HEIGHT, 0.08);
                }
            }

            ctx.clearRect(0, 0, width, height);

            const bars = barsRef.current;
            const gap = 2;
            const barW = (width - gap * (bars.length - 1)) / bars.length;

            for (let i = 0; i < bars.length; i++) {
                const x = i * (barW + gap);
                const barH = bars[i].current * height;
                const y = height - barH;

                // Bar gradient (bottom to top)
                const grad = ctx.createLinearGradient(x, height, x, y);
                grad.addColorStop(0, accentColor);
                grad.addColorStop(0.7, accentColor);
                grad.addColorStop(1, peakColor);

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.roundRect(x, y, barW, barH, 2);
                ctx.fill();

                // Peak pixel
                ctx.fillStyle = peakColor;
                ctx.fillRect(x, Math.max(0, y - 2), barW, 2);
            }
        },
        fps,
        true, // always tick, even paused (for decay animation)
    );

    return (
        <canvas
            ref={canvasRef}
            className="vc-srpp-visualizer-canvas"
            width={200}
            height={40}
            style={{ width: "100%", height: "40px" }}
            aria-hidden="true"
        />
    );
}
