/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * This file is a drop-in replacement for the stock SpotifyStore.
 * It extends the base store with audio features (BPM, key, Camelot).
 */

import { findByProps, findByPropsLazy, proxyLazyWebpack } from "@webpack";
import { Flux, FluxDispatcher } from "@webpack/common";

import { settings } from "./settings";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Track {
    id: string;
    name: string;
    duration: number;
    isLocal: boolean;
    album: {
        id: string;
        name: string;
        image: {
            height: number;
            width: number;
            url: string;
        };
    };
    artists: Array<{
        id: string;
        href: string;
        name: string;
        type: string;
        uri: string;
    }>;
}

export interface AudioFeatures {
    id: string;
    tempo: number;           // BPM
    key: number;             // Pitch class (0–11, or -1 if unknown)
    mode: number;            // 0 = minor, 1 = major
    time_signature: number;
    energy: number;
    danceability: number;
    valence: number;
    loudness: number;
}

export type Repeat = "off" | "track" | "context";

interface Device {
    id: string;
    is_active: boolean;
}

interface PlayerState {
    accountId: string;
    track: Track | null;
    volumePercent: number;
    isPlaying: boolean;
    repeat: boolean;
    position: number;
    context?: unknown;
    device?: Device;
    actual_repeat: Repeat;
    shuffle: boolean;
}

// ─── Camelot Wheel Lookup ─────────────────────────────────────────────────────

const CAMELOT_MAJOR: Record<number, string> = {
    0: "8B",  // C
    1: "3B",  // C# / Db
    2: "10B", // D
    3: "5B",  // D# / Eb
    4: "12B", // E
    5: "7B",  // F
    6: "2B",  // F# / Gb
    7: "9B",  // G
    8: "4B",  // G# / Ab
    9: "11B", // A
    10: "6B", // A# / Bb
    11: "1B", // B
};

const CAMELOT_MINOR: Record<number, string> = {
    0: "5A",  // Cm
    1: "12A", // C#m / Dbm
    2: "7A",  // Dm
    3: "2A",  // D#m / Ebm
    4: "9A",  // Em
    5: "4A",  // Fm
    6: "11A", // F#m / Gbm
    7: "6A",  // Gm
    8: "1A",  // G#m / Abm
    9: "8A",  // Am
    10: "3A", // A#m / Bbm
    11: "10A",// Bm
};

const KEY_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function getCamelotKey(key: number, mode: number): string {
    if (key === -1) return "?";
    return mode === 1 ? (CAMELOT_MAJOR[key] ?? "?") : (CAMELOT_MINOR[key] ?? "?");
}

export function getMusicalKey(key: number, mode: number): string {
    if (key === -1) return "Unknown";
    return `${KEY_NAMES[key]} ${mode === 1 ? "Major" : "Minor"}`;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const SpotifyRPPStore = proxyLazyWebpack(() => {
    const { Store } = Flux;
    const SpotifySocket = findByProps("getActiveSocketAndDevice");
    const SpotifyAPI = findByPropsLazy("vcSpotifyMarker");
    const PLAYER_BASE = "https://api.spotify.com/v1/me/player";

    class SpotifyRPPStore extends Store {
        public mPosition = 0;
        public _start = 0;
        public track: Track | null = null;
        public device: Device | null = null;
        public isPlaying = false;
        public repeat: Repeat = "off";
        public shuffle = false;
        public volume = 0;
        public isSettingPosition = false;

        // Extended audio features
        public audioFeatures: AudioFeatures | null = null;
        public _lastFetchedTrackId: string | null = null;
        public _fetchAbortController: AbortController | null = null;

        public get position(): number {
            let pos = this.mPosition;
            if (this.isPlaying) pos += Date.now() - this._start;
            return pos;
        }

        public set position(p: number) {
            this.mPosition = p;
            this._start = Date.now();
        }

        public openExternal(path: string) {
            const useUri = settings.store.useSpotifyUris;
            const url = useUri
                ? "spotify:" + path.replaceAll("/", (_, i) => i === 0 ? "" : ":")
                : "https://open.spotify.com" + path;
            VencordNative.native.openExternal(url);
        }

        // ── Playback controls ──────────────────────────────────────────────────

        prev() { this._req("post", "/previous"); }
        next() { this._req("post", "/next"); }

        setPlaying(playing: boolean) {
            this._req("put", playing ? "/play" : "/pause");
        }

        setRepeat(state: Repeat) {
            this._req("put", "/repeat", { query: { state } });
        }

        setShuffle(state: boolean) {
            this._req("put", "/shuffle", { query: { state } }).then(() => {
                this.shuffle = state;
                this.emitChange();
            });
        }

        setVolume(percent: number) {
            this._req("put", "/volume", {
                query: { volume_percent: Math.round(percent) },
            }).then(() => {
                this.volume = percent;
                this.emitChange();
            });
        }

        seek(ms: number) {
            if (this.isSettingPosition) return Promise.resolve();
            this.isSettingPosition = true;
            return this._req("put", "/seek", {
                query: { position_ms: Math.round(ms) },
            }).catch((e: unknown) => {
                console.error("[SRPP] seek failed:", e);
                this.isSettingPosition = false;
            });
        }

        // ── Spotify Audio Features (BPM, key) ──────────────────────────────────

        async fetchAudioFeatures(trackId: string): Promise<void> {
            const clientId = settings.store.spotifyClientId?.trim();
            if (!clientId || !settings.store.showBPM) return;
            if (this._lastFetchedTrackId === trackId) return;

            this._fetchAbortController?.abort();
            this._fetchAbortController = new AbortController();

            try {
                const { socket } = SpotifySocket.getActiveSocketAndDevice();
                const resp = await fetch(
                    `https://api.spotify.com/v1/audio-features/${trackId}`,
                    {
                        headers: { Authorization: `Bearer ${socket.accessToken}` },
                        signal: this._fetchAbortController.signal,
                    }
                );

                if (!resp.ok) return;
                const data: AudioFeatures = await resp.json();
                this.audioFeatures = data;
                this._lastFetchedTrackId = trackId;
                this.emitChange();
            } catch (e: unknown) {
                if ((e as Error).name !== "AbortError") {
                    console.error("[SRPP] audio features fetch failed:", e);
                }
            }
        }

        // ── Internal request helper ────────────────────────────────────────────

        _req(method: "post" | "get" | "put", route: string, data: Record<string, unknown> = {}) {
            if (this.device?.is_active) {
                data.query = (data.query as Record<string, unknown>) ?? ({} as Record<string, unknown>);
                (data.query as Record<string, unknown>).device_id = this.device.id;
            }
            const { socket } = SpotifySocket.getActiveSocketAndDevice();
            return SpotifyAPI[method](socket.accountId, socket.accessToken, {
                url: PLAYER_BASE + route,
                ...data,
            });
        }
    }

    const store = new SpotifyRPPStore(FluxDispatcher, {
        SPOTIFY_PLAYER_STATE(e: PlayerState) {
            store.track = e.track;
            store.device = e.device ?? null;
            store.isPlaying = e.isPlaying ?? false;
            store.volume = e.volumePercent ?? 0;
            store.repeat = e.actual_repeat || "off";
            store.shuffle = e.shuffle ?? false;
            store.position = e.position ?? 0;
            store.isSettingPosition = false;

            if (e.track && e.track.id !== store._lastFetchedTrackId) {
                // Clear stale audio features immediately on track change
                store.audioFeatures = null;
                store.fetchAudioFeatures(e.track.id);
            }

            store.emitChange();
        },

        SPOTIFY_SET_DEVICES({ devices }: { devices: Device[]; }) {
            store.device = devices.find(d => d.is_active) ?? devices[0] ?? null;
            store.emitChange();
        },
    });

    return store;
});
