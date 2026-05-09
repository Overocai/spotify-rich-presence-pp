/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Converts milliseconds to a human-readable MM:SS string.
 * e.g. 183400 → "3:03"
 */
export function msToHuman(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
}

/**
 * Clamps a value between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between a and b by t (0–1).
 */
export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Formats BPM to a clean display string.
 * e.g. 127.843 → "128 BPM"
 */
export function formatBPM(bpm: number): string {
    return `${Math.round(bpm)} BPM`;
}

/**
 * Truncate a string to maxLen chars, appending "…" if truncated.
 */
export function truncate(str: string, maxLen: number): string {
    return str.length > maxLen ? str.slice(0, maxLen - 1) + "…" : str;
}
