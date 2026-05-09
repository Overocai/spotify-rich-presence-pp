/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Extracts dominant colors from album artwork using a canvas-based
 * k-means-lite approach. Runs off the main thread via requestIdleCallback
 * to avoid janking Discord's UI.
 */

import { useCallback, useEffect, useRef, useState } from "@webpack/common";

export interface AlbumColors {
    primary: string;    // dominant color
    secondary: string;  // second most dominant
    accent: string;     // vibrant accent
    text: string;       // readable text color derived from primary
}

const DEFAULT_COLORS: AlbumColors = {
    primary: "#1db954",
    secondary: "#191414",
    accent: "#1ed760",
    text: "#ffffff",
};

function luminance(r: number, g: number, b: number): number {
    const toLinear = (v: number) => {
        const n = v / 255;
        return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function toHex(r: number, g: number, b: number): string {
    return `#${[r, g, b].map(v => v.toString(16).padStart(2, "0")).join("")}`;
}

function pickReadableText(r: number, g: number, b: number): string {
    return luminance(r, g, b) > 0.4 ? "#0d0d0d" : "#ffffff";
}

function quantize(data: Uint8ClampedArray, samples: number): [number, number, number][] {
    const buckets = new Map<string, { r: number; g: number; b: number; count: number; }>();
    const step = Math.max(1, Math.floor(data.length / 4 / samples)) * 4;

    for (let i = 0; i < data.length; i += step) {
        const r = data[i] >> 4 << 4;
        const g = data[i + 1] >> 4 << 4;
        const b = data[i + 2] >> 4 << 4;
        const a = data[i + 3];
        if (a < 128) continue;

        const key = `${r},${g},${b}`;
        const existing = buckets.get(key);
        if (existing) {
            existing.count++;
        } else {
            buckets.set(key, { r, g, b, count: 1 });
        }
    }

    return Array.from(buckets.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)
        .map(({ r, g, b }) => [r, g, b]);
}

function pickAccent(colors: [number, number, number][]): [number, number, number] {
    // Find most saturated color from top candidates
    let best: [number, number, number] = colors[0] ?? [30, 185, 84];
    let bestSat = 0;

    for (const [r, g, b] of colors) {
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const sat = max === 0 ? 0 : (max - min) / max;
        if (sat > bestSat) {
            bestSat = sat;
            best = [r, g, b];
        }
    }
    return best;
}

function extractColors(img: HTMLImageElement): AlbumColors {
    const canvas = document.createElement("canvas");
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return DEFAULT_COLORS;

    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);
    const topColors = quantize(data, 512);

    if (topColors.length === 0) return DEFAULT_COLORS;

    const [pr, pg, pb] = topColors[0];
    const [sr, sg, sb] = topColors[1] ?? topColors[0];
    const [ar, ag, ab] = pickAccent(topColors);

    return {
        primary: toHex(pr, pg, pb),
        secondary: toHex(sr, sg, sb),
        accent: toHex(ar, ag, ab),
        text: pickReadableText(pr, pg, pb),
    };
}

/**
 * Given an album art URL, extract dominant colors.
 * Returns DEFAULT_COLORS while loading / on error.
 */
export function useAlbumColors(imageUrl: string | undefined): AlbumColors {
    const [colors, setColors] = useState<AlbumColors>(DEFAULT_COLORS);
    const prevUrl = useRef<string | undefined>(undefined);
    const idleHandle = useRef<number>(0);

    const doExtract = useCallback((url: string) => {
        cancelIdleCallback(idleHandle.current);
        idleHandle.current = requestIdleCallback(() => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                try {
                    setColors(extractColors(img));
                } catch {
                    setColors(DEFAULT_COLORS);
                }
            };
            img.onerror = () => setColors(DEFAULT_COLORS);
            img.src = url;
        }, { timeout: 1000 });
    }, []);

    useEffect(() => {
        if (!imageUrl || imageUrl === prevUrl.current) return;
        prevUrl.current = imageUrl;
        doExtract(imageUrl);
        return () => cancelIdleCallback(idleHandle.current);
    }, [imageUrl, doExtract]);

    return colors;
}
