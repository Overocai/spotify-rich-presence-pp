/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

export type Theme = "AquaWave" | "Hyperpop" | "Neon" | "OLED" | "Minimal";
export type AnimationIntensity = "Off" | "Low" | "Medium" | "High";
export type PlayerMode = "Compact" | "Expanded" | "Mini";

export const settings = definePluginSettings({
    playerMode: {
        type: OptionType.SELECT,
        description: "Player display mode",
        default: "Expanded",
        options: [
            { label: "Compact", value: "Compact" },
            { label: "Expanded", value: "Expanded" },
            { label: "Mini (floating)", value: "Mini" },
        ],
    },
    theme: {
        type: OptionType.SELECT,
        description: "Visual theme",
        default: "AquaWave",
        options: [
            { label: "AquaWave – Teal/cyan gradients", value: "AquaWave" },
            { label: "Hyperpop – Hot pink + electric blue", value: "Hyperpop" },
            { label: "Neon – Green matrix glow", value: "Neon" },
            { label: "OLED – True black, crisp whites", value: "OLED" },
            { label: "Minimal – Subtle, no glow", value: "Minimal" },
        ],
    },
    showWaveform: {
        type: OptionType.BOOLEAN,
        description: "Show animated waveform visualizer",
        default: true,
    },
    showVisualizer: {
        type: OptionType.BOOLEAN,
        description: "Show spectrum analyzer bars",
        default: true,
    },
    showBPM: {
        type: OptionType.BOOLEAN,
        description: "Show BPM, musical key, and Camelot notation",
        default: true,
    },
    animationIntensity: {
        type: OptionType.SELECT,
        description: "Animation and glow intensity",
        default: "Medium",
        options: [
            { label: "Off", value: "Off" },
            { label: "Low", value: "Low" },
            { label: "Medium", value: "Medium" },
            { label: "High", value: "High" },
        ],
    },
    blurIntensity: {
        type: OptionType.SLIDER,
        description: "Background blur intensity (px)",
        default: 12,
        markers: [0, 4, 8, 12, 16, 24, 32],
        stickToMarkers: false,
    },
    dynamicColors: {
        type: OptionType.BOOLEAN,
        description: "Extract and apply colors from album art",
        default: true,
    },
    hoverControls: {
        type: OptionType.BOOLEAN,
        description: "Show playback controls only on hover",
        default: false,
    },
    useSpotifyUris: {
        type: OptionType.BOOLEAN,
        description: "Open spotify:// URIs instead of https://open.spotify.com",
        default: false,
    },
    refreshRate: {
        type: OptionType.SLIDER,
        description: "Visualizer refresh rate (fps). Lower = less CPU.",
        default: 30,
        markers: [15, 24, 30, 60],
        stickToMarkers: true,
    },
    spotifyClientId: {
        type: OptionType.STRING,
        description: "Spotify API Client ID (for BPM/key data). Leave blank to skip.",
        default: "",
    },
    customCSS: {
        type: OptionType.STRING,
        description: "Custom CSS injected into the player (advanced)",
        default: "",
    },
});
