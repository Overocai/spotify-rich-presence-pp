/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Settings panel component rendered inside Vencord's plugin settings UI.
 * Uses Vencord's native component exports — no third-party UI libraries.
 */

import { Forms, Select, Slider, Switch, TextArea, TextInput } from "@webpack/common";

import { settings, Theme, AnimationIntensity } from "../settings";
import { THEMES } from "../utils/themes";

export function SettingsPanel() {
    const {
        playerMode,
        theme,
        showWaveform,
        showVisualizer,
        showBPM,
        animationIntensity,
        blurIntensity,
        dynamicColors,
        hoverControls,
        useSpotifyUris,
        refreshRate,
        spotifyClientId,
        customCSS,
    } = settings.use();

    return (
        <div className="vc-srpp-settings-panel">
            {/* ── Layout ── */}
            <Forms.FormSection title="Layout">
                <Forms.FormTitle>Player Mode</Forms.FormTitle>
                <Select
                    options={[
                        { label: "Expanded (full featured)", value: "Expanded" },
                        { label: "Compact (no visualizer)", value: "Compact" },
                        { label: "Mini (floating pill)", value: "Mini" },
                    ]}
                    isSelected={v => v === playerMode}
                    select={v => (settings.store.playerMode = v)}
                    serialize={v => v}
                />
                <Forms.FormDivider style={{ margin: "10px 0" }} />

                <Switch
                    value={hoverControls}
                    onChange={v => (settings.store.hoverControls = v)}
                    note="Only show playback controls when hovering over the player"
                >
                    Hover-only controls
                </Switch>
            </Forms.FormSection>

            {/* ── Visuals ── */}
            <Forms.FormSection title="Visuals">
                <Forms.FormTitle>Theme</Forms.FormTitle>
                <Select
                    options={Object.keys(THEMES).map(t => ({ label: t, value: t }))}
                    isSelected={v => v === theme}
                    select={v => (settings.store.theme = v as Theme)}
                    serialize={v => v}
                />
                <Forms.FormDivider style={{ margin: "10px 0" }} />

                <Switch
                    value={dynamicColors}
                    onChange={v => (settings.store.dynamicColors = v)}
                    note="Extract accent colors from album artwork (small CPU cost)"
                >
                    Dynamic album colors
                </Switch>

                <Forms.FormTitle style={{ marginTop: 8 }}>Animation Intensity</Forms.FormTitle>
                <Select
                    options={(["Off", "Low", "Medium", "High"] as AnimationIntensity[]).map(v => ({
                        label: v,
                        value: v,
                    }))}
                    isSelected={v => v === animationIntensity}
                    select={v => (settings.store.animationIntensity = v as AnimationIntensity)}
                    serialize={v => v}
                />

                <Forms.FormTitle style={{ marginTop: 8 }}>
                    Blur Intensity — {blurIntensity}px
                </Forms.FormTitle>
                <Slider
                    minValue={0}
                    maxValue={32}
                    markers={[0, 4, 8, 12, 16, 24, 32]}
                    initialValue={blurIntensity}
                    onValueChange={v => (settings.store.blurIntensity = v)}
                />
            </Forms.FormSection>

            {/* ── Visualizers ── */}
            <Forms.FormSection title="Visualizers">
                <Switch
                    value={showWaveform}
                    onChange={v => (settings.store.showWaveform = v)}
                    note="Animated sine-wave visualizer driven by BPM and energy"
                >
                    Waveform
                </Switch>
                <Switch
                    value={showVisualizer}
                    onChange={v => (settings.store.showVisualizer = v)}
                    note="Spectrum analyzer bar display (not available in Compact or Mini mode)"
                >
                    Spectrum analyzer bars
                </Switch>
                <Switch
                    value={showBPM}
                    onChange={v => (settings.store.showBPM = v)}
                    note="Show BPM, musical key and Camelot notation badges (requires Client ID)"
                >
                    BPM / Key badges
                </Switch>

                <Forms.FormTitle style={{ marginTop: 8 }}>
                    Visualizer FPS — {refreshRate} fps
                </Forms.FormTitle>
                <Slider
                    minValue={15}
                    maxValue={60}
                    markers={[15, 24, 30, 60]}
                    stickToMarkers
                    initialValue={refreshRate}
                    onValueChange={v => (settings.store.refreshRate = v)}
                />
            </Forms.FormSection>

            {/* ── Spotify API ── */}
            <Forms.FormSection title="Spotify API (optional)">
                <Forms.FormText type="description">
                    Enter your Spotify Developer Client ID to enable BPM and musical key data.
                    The plugin uses your existing Discord-linked Spotify token — your Client ID
                    is only used to identify your app quota.
                </Forms.FormText>
                <Forms.FormTitle style={{ marginTop: 8 }}>Client ID</Forms.FormTitle>
                <TextInput
                    value={spotifyClientId}
                    onChange={v => (settings.store.spotifyClientId = v)}
                    placeholder="e.g. a1b2c3d4e5f6..."
                />
                <Forms.FormDivider style={{ margin: "10px 0" }} />

                <Switch
                    value={useSpotifyUris}
                    onChange={v => (settings.store.useSpotifyUris = v)}
                    note="Opens spotify:// links instead of https://open.spotify.com"
                >
                    Use Spotify URI scheme
                </Switch>
            </Forms.FormSection>

            {/* ── Advanced ── */}
            <Forms.FormSection title="Advanced">
                <Forms.FormTitle>Custom CSS</Forms.FormTitle>
                <Forms.FormText type="description">
                    CSS injected directly into the player. Use .vc-srpp-* selectors to target player elements.
                </Forms.FormText>
                <TextArea
                    value={customCSS}
                    onChange={v => (settings.store.customCSS = v)}
                    placeholder=".vc-srpp-player { border-radius: 0; }"
                    rows={5}
                    style={{ fontFamily: "monospace", fontSize: "12px", marginTop: 6 }}
                />
            </Forms.FormSection>
        </div>
    );
}
