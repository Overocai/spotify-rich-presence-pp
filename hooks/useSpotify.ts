/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useStateFromStores } from "@webpack/common";

import { AudioFeatures, getCamelotKey, getMusicalKey, SpotifyRPPStore, Track } from "../SpotifyStore";

export interface SpotifyState {
    track: Track | null;
    isPlaying: boolean;
    position: number;
    volume: number;
    repeat: "off" | "track" | "context";
    shuffle: boolean;
    audioFeatures: AudioFeatures | null;
    bpm: number | null;
    musicalKey: string | null;
    camelotKey: string | null;
}

/**
 * Subscribe to SpotifyRPPStore and derive computed fields.
 * Uses Vencord's useStateFromStores to avoid unnecessary re-renders.
 */
export function useSpotify(): SpotifyState {
    return useStateFromStores(
        [SpotifyRPPStore],
        () => {
            const store = SpotifyRPPStore;
            const af = store.audioFeatures;

            return {
                track: store.track,
                isPlaying: store.isPlaying,
                position: store.position,
                volume: store.volume,
                repeat: store.repeat,
                shuffle: store.shuffle,
                audioFeatures: af,
                bpm: af ? Math.round(af.tempo) : null,
                musicalKey: af ? getMusicalKey(af.key, af.mode) : null,
                camelotKey: af ? getCamelotKey(af.key, af.mode) : null,
            };
        }
    );
}
