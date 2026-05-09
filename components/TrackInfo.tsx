/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useState } from "@webpack/common";

import { SpotifyRPPStore, Track } from "../SpotifyStore";
import { settings } from "../settings";
import { truncate } from "../utils/format";

interface TrackInfoProps {
    track: Track;
    bpm: number | null;
    musicalKey: string | null;
    camelotKey: string | null;
    accentColor: string;
    glowColor: string;
    pulse: number;
}

function ArtistList({ artists, accentColor }: { artists: Track["artists"]; accentColor: string; }) {
    return (
        <span className="vc-srpp-artists">
            {artists.map((a, i) => (
                <span key={a.id}>
                    <span
                        className="vc-srpp-link"
                        role="button"
                        tabIndex={0}
                        onClick={() => SpotifyRPPStore.openExternal(`/artist/${a.id}`)}
                        onKeyDown={e => e.key === "Enter" && SpotifyRPPStore.openExternal(`/artist/${a.id}`)}
                        style={{ color: accentColor }}
                    >
                        {a.name}
                    </span>
                    {i < artists.length - 1 && <span className="vc-srpp-separator">, </span>}
                </span>
            ))}
        </span>
    );
}

export function TrackInfo({ track, bpm, musicalKey, camelotKey, accentColor, glowColor, pulse }: TrackInfoProps) {
    const [albumExpanded, setAlbumExpanded] = useState(false);
    const showBPM = settings.store.showBPM;

    const glowStrength = Math.round(4 + pulse * 20);

    return (
        <div className="vc-srpp-track-info">
            {/* Album art */}
            <button
                className="vc-srpp-album-btn"
                onClick={() => setAlbumExpanded(v => !v)}
                title={albumExpanded ? "Collapse album art" : "Expand album art"}
                type="button"
                style={{
                    boxShadow: `0 0 ${glowStrength}px ${glowColor}, 0 0 ${glowStrength * 2}px ${glowColor}40`,
                }}
            >
                <img
                    className="vc-srpp-album-img"
                    src={track.album.image.url}
                    alt={track.album.name}
                    style={albumExpanded ? { height: "80px", width: "80px" } : undefined}
                    draggable={false}
                />
            </button>

            {/* Text metadata */}
            <div className="vc-srpp-meta">
                {/* Song title */}
                <span
                    className="vc-srpp-title vc-srpp-link"
                    role="button"
                    tabIndex={0}
                    title={track.name}
                    onClick={() => SpotifyRPPStore.openExternal(`/track/${track.id}`)}
                    onKeyDown={e => e.key === "Enter" && SpotifyRPPStore.openExternal(`/track/${track.id}`)}
                    style={{ color: accentColor, textShadow: `0 0 12px ${glowColor}` }}
                >
                    {truncate(track.name, 32)}
                </span>

                {/* Artists */}
                <ArtistList artists={track.artists} accentColor={accentColor} />

                {/* Album */}
                <span
                    className="vc-srpp-album vc-srpp-link"
                    role="button"
                    tabIndex={0}
                    title={track.album.name}
                    onClick={() => SpotifyRPPStore.openExternal(`/album/${track.album.id}`)}
                    onKeyDown={e => e.key === "Enter" && SpotifyRPPStore.openExternal(`/album/${track.album.id}`)}
                >
                    {truncate(track.album.name, 28)}
                </span>

                {/* BPM / Key row */}
                {showBPM && (bpm !== null || musicalKey !== null) && (
                    <div className="vc-srpp-audio-meta">
                        {bpm !== null && (
                            <span
                                className="vc-srpp-badge"
                                style={{ borderColor: accentColor, color: accentColor }}
                                title="Tempo (BPM)"
                            >
                                {bpm} BPM
                            </span>
                        )}
                        {musicalKey !== null && (
                            <span
                                className="vc-srpp-badge"
                                style={{ borderColor: accentColor, color: accentColor }}
                                title={`Musical key: ${musicalKey}`}
                            >
                                {musicalKey}
                            </span>
                        )}
                        {camelotKey !== null && (
                            <span
                                className="vc-srpp-badge vc-srpp-camelot"
                                title="Camelot key"
                            >
                                {camelotKey}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
