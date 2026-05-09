/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useCallback } from "@webpack/common";

import { SpotifyRPPStore } from "../SpotifyStore";

interface ControlsProps {
    isPlaying: boolean;
    repeat: "off" | "track" | "context";
    shuffle: boolean;
    accentColor: string;
}

// ─── SVG Icon Helpers ──────────────────────────────────────────────────────────

function Icon({ children, size = 20 }: { children: React.ReactNode; size?: number; }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            width={size}
            height={size}
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

const PlayIcon = () => (
    <Icon size={22}>
        <polygon points="5,3 19,12 5,21" />
    </Icon>
);

const PauseIcon = () => (
    <Icon size={22}>
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
    </Icon>
);

const SkipNextIcon = () => (
    <Icon>
        <polygon points="6,4 17,12 6,20" />
        <rect x="17" y="4" width="3" height="16" rx="1" />
    </Icon>
);

const SkipPrevIcon = () => (
    <Icon>
        <polygon points="18,4 7,12 18,20" />
        <rect x="4" y="4" width="3" height="16" rx="1" />
    </Icon>
);

const ShuffleIcon = () => (
    <Icon size={18}>
        <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
    </Icon>
);

const RepeatIcon = ({ mode }: { mode: "off" | "track" | "context"; }) => (
    <Icon size={18}>
        {mode === "track"
            ? <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zM11 9v6h2v-4h2V9h-4z" />
            : <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
        }
    </Icon>
);

// ─── Control Button ────────────────────────────────────────────────────────────

interface ButtonProps {
    onClick: () => void;
    title: string;
    active?: boolean;
    activeColor?: string;
    children: React.ReactNode;
}

function ControlButton({ onClick, title, active, activeColor, children }: ButtonProps) {
    return (
        <button
            className={`vc-srpp-ctrl-btn${active ? " vc-srpp-ctrl-btn--active" : ""}`}
            onClick={onClick}
            title={title}
            type="button"
            style={active && activeColor ? { color: activeColor } : undefined}
        >
            {children}
        </button>
    );
}

// ─── Controls Component ────────────────────────────────────────────────────────

export function Controls({ isPlaying, repeat, shuffle, accentColor }: ControlsProps) {
    const cycleRepeat = useCallback(() => {
        const next: Record<"off" | "track" | "context", "off" | "track" | "context"> = {
            off: "context",
            context: "track",
            track: "off",
        };
        SpotifyRPPStore.setRepeat(next[repeat]);
    }, [repeat]);

    return (
        <div className="vc-srpp-controls">
            <ControlButton
                onClick={() => SpotifyRPPStore.setShuffle(!shuffle)}
                title={shuffle ? "Shuffle: On" : "Shuffle: Off"}
                active={shuffle}
                activeColor={accentColor}
            >
                <ShuffleIcon />
            </ControlButton>

            <ControlButton
                onClick={() => SpotifyRPPStore.prev()}
                title="Previous"
            >
                <SkipPrevIcon />
            </ControlButton>

            <ControlButton
                onClick={() => SpotifyRPPStore.setPlaying(!isPlaying)}
                title={isPlaying ? "Pause" : "Play"}
                active
                activeColor={accentColor}
            >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </ControlButton>

            <ControlButton
                onClick={() => SpotifyRPPStore.next()}
                title="Next"
            >
                <SkipNextIcon />
            </ControlButton>

            <ControlButton
                onClick={cycleRepeat}
                title={`Repeat: ${repeat}`}
                active={repeat !== "off"}
                activeColor={accentColor}
            >
                <RepeatIcon mode={repeat} />
                {repeat === "track" && (
                    <span className="vc-srpp-repeat-badge">1</span>
                )}
            </ControlButton>
        </div>
    );
}
