/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Main player component — the root of the SpotifyRichPresence++ UI.
 * Composes all sub-components and manages top-level state.
 */

import { useEffect, useRef, useState } from "@webpack/common";

import { useAlbumColors } from "../hooks/useAlbumColors";
import { useBPMPulse } from "../hooks/useAnimationFrame";
import { usePlaybackTimer } from "../hooks/usePlaybackTimer";
import { useSpotify } from "../hooks/useSpotify";
import { settings } from "../settings";
import { getTheme } from "../utils/themes";
import { Controls } from "./Controls";
import { ProgressBar } from "./ProgressBar";
import { TrackInfo } from "./TrackInfo";
import { Visualizer } from "./Visualizer";
import { Waveform } from "./Waveform";

// Auto-hide after 5 minutes when paused
const AUTO_HIDE_MS = 5 * 60 * 1000;

export function Player() {
    const spotify = useSpotify();
    const [shouldHide, setShouldHide] = useState(false);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { track, isPlaying, position: basePosition, repeat, shuffle, audioFeatures, bpm, musicalKey, camelotKey } = spotify;

    // Smooth position timer
    const position = usePlaybackTimer(basePosition, isPlaying, track?.id);

    // Settings
    const {
        theme,
        showWaveform,
        showVisualizer,
        playerMode,
        dynamicColors,
        animationIntensity,
        blurIntensity,
        refreshRate,
        customCSS,
    } = settings.use(["theme", "showWaveform", "showVisualizer", "playerMode",
        "dynamicColors", "animationIntensity", "blurIntensity", "refreshRate", "customCSS"]);

    // Colors
    const albumColors = useAlbumColors(dynamicColors ? track?.album.image.url : undefined);
    const themeTokens = getTheme(theme as Parameters<typeof getTheme>[0]);

    const accentColor = dynamicColors ? albumColors.accent : themeTokens.gradientA;
    const glowColor = dynamicColors ? albumColors.primary : themeTokens.glow;
    const surfaceColor = themeTokens.surface;

    // BPM pulse
    const animActive = animationIntensity !== "Off" && isPlaying;
    const pulse = useBPMPulse(bpm, animActive);

    // Auto-hide timer
    useEffect(() => {
        if (isPlaying) {
            setShouldHide(false);
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
            return;
        }
        hideTimerRef.current = setTimeout(() => setShouldHide(true), AUTO_HIDE_MS);
        return () => {
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        };
    }, [isPlaying]);

    if (!track || shouldHide) return null;

    const isCompact = playerMode === "Compact";
    const isMini = playerMode === "Mini";
    const fps = (typeof refreshRate === "number" ? refreshRate : Number(refreshRate)) || 30;

    // Glow intensity multiplier based on setting
    const glowMult = { Off: 0, Low: 0.4, Medium: 1, High: 2 }[animationIntensity as string] ?? 1;
    const pulseGlow = glowMult * pulse;

    // Build inline CSS vars for current theme.
    // We use a style tag so that rgba() values with commas aren't
    // misinterpreted when spread onto the React style prop.
    const playerCSSVars = [
        `--srpp-gradient-a: ${themeTokens.gradientA}`,
        `--srpp-gradient-b: ${themeTokens.gradientB}`,
        `--srpp-glow: ${themeTokens.glow}`,
        `--srpp-surface: ${themeTokens.surface}`,
        `--srpp-surface2: ${themeTokens.surface2}`,
        `--srpp-text-primary: ${themeTokens.textPrimary}`,
        `--srpp-text-muted: ${themeTokens.textMuted}`,
        `--srpp-progress-fill: ${themeTokens.progressFill}`,
        `--srpp-viz-bar: ${themeTokens.vizBar}`,
        `--srpp-viz-peak: ${themeTokens.vizPeak}`,
        `--srpp-border: ${themeTokens.border}`,
        `--srpp-blur: ${blurIntensity}px`,
        `--srpp-glow-pulse: ${pulseGlow}`,
    ].join("; ");

    return (
        <div
            id="vc-srpp-player"
            className={[
                "vc-srpp-player",
                `vc-srpp-mode-${playerMode.toLowerCase()}`,
                `vc-srpp-theme-${(theme as string).toLowerCase()}`,
                isPlaying ? "vc-srpp-playing" : "vc-srpp-paused",
            ].join(" ")}
            style={{
                background: surfaceColor,
                backdropFilter: `blur(${blurIntensity}px)`,
                WebkitBackdropFilter: `blur(${blurIntensity}px)`,
            } as React.CSSProperties}
        >
            {/* Inject CSS vars via a scoped style tag — avoids React style prop parsing issues with rgba() */}
            <style>{`#vc-srpp-player { ${playerCSSVars} }`}</style>
            {/* Animated background gradient that reacts to beat */}
            {animationIntensity !== "Off" && (
                <div
                    className="vc-srpp-bg-glow"
                    style={{
                        background: `radial-gradient(ellipse at 50% 120%, ${glowColor} 0%, transparent 70%)`,
                        opacity: 0.15 + pulseGlow * 0.25,
                    }}
                    aria-hidden="true"
                />
            )}

            {/* Track info (album art + title + artist + album + BPM badges) */}
            <TrackInfo
                track={track}
                bpm={bpm}
                musicalKey={musicalKey}
                camelotKey={camelotKey}
                accentColor={accentColor}
                glowColor={glowColor}
                pulse={pulseGlow}
            />

            {/* Waveform */}
            {showWaveform && !isMini && (
                <Waveform
                    isPlaying={isPlaying}
                    bpm={bpm}
                    energy={audioFeatures?.energy ?? 0.6}
                    valence={audioFeatures?.valence ?? 0.5}
                    accentColor={accentColor}
                    fps={fps}
                />
            )}

            {/* Progress bar */}
            {!isMini && (
                <ProgressBar
                    position={position}
                    duration={track.duration}
                    fillColor={accentColor}
                    isPlaying={isPlaying}
                />
            )}

            {/* Spectrum visualizer */}
            {showVisualizer && !isCompact && !isMini && (
                <Visualizer
                    isPlaying={isPlaying}
                    bpm={bpm}
                    energy={audioFeatures?.energy ?? 0.6}
                    danceability={audioFeatures?.danceability ?? 0.5}
                    accentColor={accentColor}
                    peakColor={themeTokens.vizPeak}
                    fps={fps}
                />
            )}

            {/* Playback controls */}
            <Controls
                isPlaying={isPlaying}
                repeat={repeat}
                shuffle={shuffle}
                accentColor={accentColor}
            />

            {/* Custom user CSS */}
            {customCSS && (
                <style>{customCSS}</style>
            )}
        </div>
    );
}
