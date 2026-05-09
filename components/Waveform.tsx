/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Animated waveform visualizer — generates a Lissajous-style wave
 * driven by BPM and audio energy. Rendered on a canvas via rAF.
 */

import { useEffect, useRef } from "@webpack/common";

import { useAnimationFrame } from "../hooks/useAnimationFrame";
import { lerp } from "../utils/format";

interface WaveformProps {
    isPlaying: boolean;
    bpm: number | null;
    energy: number;
    valence: number;    // 0–1 (mood), affects wave "happiness"
    accentColor: string;
    fps?: number;
}

const TWO_PI = Math.PI * 2;

interface WaveState {
    phase: number;
    amplitude: number;
}

export function Waveform({
    isPlaying,
    bpm,
    energy = 0.5,
    valence = 0.5,
    accentColor,
    fps = 30,
}: WaveformProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stateRef = useRef<WaveState>({ phase: 0, amplitude: 0.3 });

    useAnimationFrame(
        (dt) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const { width, height } = canvas;
            const state = stateRef.current;
            const effectiveBPM = bpm ?? 120;
            const speed = (effectiveBPM / 60) * (TWO_PI / 4); // radians per second

            if (isPlaying) {
                state.phase += speed * (dt / 1000);
                state.amplitude = lerp(state.amplitude, 0.25 + energy * 0.55, 0.05);
            } else {
                state.amplitude = lerp(state.amplitude, 0.04, 0.04);
            }

            ctx.clearRect(0, 0, width, height);

            const midY = height / 2;
            const amp = state.amplitude * midY;

            // Number of wave cycles across the width: valence controls harmonics
            const cycles = 2 + Math.floor(valence * 3);
            const freq = (TWO_PI * cycles) / width;

            // Render two offset waves for a glassy interference pattern
            for (let pass = 0; pass < 2; pass++) {
                const phaseOffset = pass * (Math.PI / 3);
                const alpha = pass === 0 ? 0.85 : 0.45;

                ctx.beginPath();
                for (let x = 0; x <= width; x++) {
                    const y = midY + amp * Math.sin(freq * x + state.phase + phaseOffset)
                        * (0.85 + 0.15 * Math.sin(freq * x * 0.5 + state.phase * 0.7));
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }

                ctx.strokeStyle = accentColor.replace(/[\d.]+\)$/, `${alpha})`).replace(/^#/, "") === accentColor
                    ? hexToRgba(accentColor, alpha)
                    : accentColor;
                ctx.lineWidth = pass === 0 ? 2 : 1.2;
                ctx.shadowColor = accentColor;
                ctx.shadowBlur = pass === 0 ? 8 : 4;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        },
        fps,
        true,
    );

    // Keep canvas resolution in sync with its rendered size
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            canvas.width = Math.round(width);
            canvas.height = Math.round(height);
        });
        ro.observe(canvas);
        return () => ro.disconnect();
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="vc-srpp-waveform-canvas"
            style={{ width: "100%", height: "28px", display: "block" }}
            aria-hidden="true"
        />
    );
}

function hexToRgba(hex: string, alpha: number): string {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}
