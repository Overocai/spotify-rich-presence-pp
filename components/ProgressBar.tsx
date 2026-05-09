/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useCallback, useRef, useState } from "@webpack/common";

import { SpotifyRPPStore } from "../SpotifyStore";
import { debounce } from "../utils/debounce";
import { msToHuman } from "../utils/format";

interface ProgressBarProps {
    position: number;
    duration: number;
    fillColor: string;
    isPlaying: boolean;
}

const seekDebounced = debounce((ms: number) => SpotifyRPPStore.seek(ms), 200);

export function ProgressBar({ position, duration, fillColor, isPlaying }: ProgressBarProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragValue, setDragValue] = useState(0);
    const trackRef = useRef<HTMLDivElement>(null);

    const progress = duration > 0 ? Math.min(position / duration, 1) : 0;
    const displayProgress = isDragging ? dragValue / duration : progress;
    const displayPosition = isDragging ? dragValue : position;

    const getPositionFromEvent = useCallback((e: React.MouseEvent | React.TouchEvent): number => {
        const track = trackRef.current;
        if (!track) return 0;
        const rect = track.getBoundingClientRect();
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
        return Math.round(ratio * duration);
    }, [duration]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        const ms = getPositionFromEvent(e);
        setDragValue(ms);

        const handleMove = (ev: MouseEvent) => {
            const track = trackRef.current;
            if (!track) return;
            const rect = track.getBoundingClientRect();
            const ratio = Math.min(Math.max((ev.clientX - rect.left) / rect.width, 0), 1);
            setDragValue(Math.round(ratio * duration));
        };

        const handleUp = (ev: MouseEvent) => {
            const track = trackRef.current;
            if (!track) return;
            const rect = track.getBoundingClientRect();
            const ratio = Math.min(Math.max((ev.clientX - rect.left) / rect.width, 0), 1);
            const seekMs = Math.round(ratio * duration);
            seekDebounced(seekMs);
            setIsDragging(false);
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
        };

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);
    }, [duration, getPositionFromEvent]);

    return (
        <div className="vc-srpp-progress-container">
            <span className="vc-srpp-time vc-srpp-time-elapsed">
                {msToHuman(displayPosition)}
            </span>

            <div
                ref={trackRef}
                className="vc-srpp-progress-track"
                onMouseDown={handleMouseDown}
                role="slider"
                aria-label="Playback position"
                aria-valuemin={0}
                aria-valuemax={duration}
                aria-valuenow={position}
            >
                <div
                    className="vc-srpp-progress-fill"
                    style={{
                        width: `${displayProgress * 100}%`,
                        background: fillColor,
                        boxShadow: `0 0 8px ${fillColor}`,
                    }}
                />
                <div
                    className="vc-srpp-progress-thumb"
                    style={{
                        left: `${displayProgress * 100}%`,
                        background: fillColor,
                        boxShadow: `0 0 10px ${fillColor}`,
                        opacity: isDragging ? 1 : undefined,
                    }}
                />
            </div>

            <span className="vc-srpp-time vc-srpp-time-remaining">
                -{msToHuman(Math.max(0, duration - displayPosition))}
            </span>
        </div>
    );
}
