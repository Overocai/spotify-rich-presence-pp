/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { Theme } from "../settings";

export interface ThemeTokens {
    /** Main accent gradient start */
    gradientA: string;
    /** Main accent gradient end */
    gradientB: string;
    /** Glow / bloom color */
    glow: string;
    /** Card background (rgba) */
    surface: string;
    /** Secondary surface */
    surface2: string;
    /** Primary text */
    textPrimary: string;
    /** Muted text */
    textMuted: string;
    /** Progress bar fill */
    progressFill: string;
    /** Visualizer bar color */
    vizBar: string;
    /** Visualizer bar peak color */
    vizPeak: string;
    /** Border / divider */
    border: string;
}

export const THEMES: Record<Theme, ThemeTokens> = {
    AquaWave: {
        gradientA: "#00d2ff",
        gradientB: "#0066ff",
        glow: "rgba(0, 210, 255, 0.5)",
        surface: "rgba(0, 20, 40, 0.72)",
        surface2: "rgba(0, 40, 80, 0.55)",
        textPrimary: "#e0f7ff",
        textMuted: "rgba(180, 230, 255, 0.6)",
        progressFill: "#00d2ff",
        vizBar: "#00b4e0",
        vizPeak: "#00ffff",
        border: "rgba(0, 210, 255, 0.2)",
    },
    Hyperpop: {
        gradientA: "#ff2dff",
        gradientB: "#002eff",
        glow: "rgba(255, 45, 255, 0.55)",
        surface: "rgba(20, 0, 35, 0.75)",
        surface2: "rgba(40, 0, 70, 0.55)",
        textPrimary: "#ffe0ff",
        textMuted: "rgba(255, 180, 255, 0.6)",
        progressFill: "#ff2dff",
        vizBar: "#cc00ff",
        vizPeak: "#ff00ff",
        border: "rgba(255, 45, 255, 0.2)",
    },
    Neon: {
        gradientA: "#00ff41",
        gradientB: "#008f11",
        glow: "rgba(0, 255, 65, 0.5)",
        surface: "rgba(0, 10, 0, 0.82)",
        surface2: "rgba(0, 20, 0, 0.62)",
        textPrimary: "#b3ffb3",
        textMuted: "rgba(100, 200, 100, 0.6)",
        progressFill: "#00ff41",
        vizBar: "#00cc35",
        vizPeak: "#00ff41",
        border: "rgba(0, 255, 65, 0.2)",
    },
    OLED: {
        gradientA: "#ffffff",
        gradientB: "#888888",
        glow: "rgba(255, 255, 255, 0.18)",
        surface: "rgba(0, 0, 0, 0.92)",
        surface2: "rgba(15, 15, 15, 0.80)",
        textPrimary: "#ffffff",
        textMuted: "rgba(180, 180, 180, 0.7)",
        progressFill: "#ffffff",
        vizBar: "#cccccc",
        vizPeak: "#ffffff",
        border: "rgba(255, 255, 255, 0.12)",
    },
    Minimal: {
        gradientA: "#1db954",
        gradientB: "#15803d",
        glow: "rgba(29, 185, 84, 0.25)",
        surface: "rgba(18, 18, 18, 0.88)",
        surface2: "rgba(30, 30, 30, 0.70)",
        textPrimary: "#f0f0f0",
        textMuted: "rgba(160, 160, 160, 0.65)",
        progressFill: "#1db954",
        vizBar: "#1db954",
        vizPeak: "#1ed760",
        border: "rgba(255, 255, 255, 0.08)",
    },
};

export function getTheme(name: Theme): ThemeTokens {
    return THEMES[name] ?? THEMES.AquaWave;
}

/** Convert ThemeTokens into a CSS custom property string for inline injection */
export function themeToCSS(tokens: ThemeTokens): string {
    return Object.entries(tokens)
        .map(([k, v]) => `--srpp-${k.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${v};`)
        .join(" ");
}
