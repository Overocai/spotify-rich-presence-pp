/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { disableStyle, enableStyle } from "@api/Styles";
import ErrorBoundary from "@components/ErrorBoundary";

import definePlugin from "@utils/types";

import { Player } from "./components/Player";
import { settings } from "./settings";
import styles from "./styles/player.css?managed";

function toggleStyles(enabled: boolean) {
    (enabled ? enableStyle : disableStyle)(styles);
}

export { settings };

export default definePlugin({
    name: "SpotifyRichPresencePP",
    description: "A futuristic animated Spotify Rich Presence player with visualizers, BPM sync, and dynamic color extraction.",
    authors: [
        { name: "overocai", id: 1288832011452153910n },
    ],
    tags: ["Spotify", "Music", "Rich Presence", "Visualizer", "Player"],
    settings,

    patches: [
        {
            // Inject our player above the account panel, same injection point as SpotifyControls
            find: ".DISPLAY_NAME_STYLES_COACHMARK)",
            replacement: {
                match: /(?<=\i\.jsxs?\)\()(\i),\{(?=[^}]*?userTag:\i,occluded:)/,
                replace: "$self.PanelWrapper,{VencordOriginal:$1,",
            },
        },
        {
            // Patch Spotify API to allow POST requests (needed for player commands)
            find: ".PLAYER_DEVICES",
            replacement: [
                {
                    match: /get:(\i)\.bind\(null,(\i\.\i)\.get\)/,
                    replace: "post:$1.bind(null,$2.post),vcSpotifyMarker:1,$&",
                },
                {
                    // Allow 202 responses from the Spotify API (play/pause return 202)
                    match: /202===\i\.status/,
                    replace: "false",
                },
            ],
        },
        {
            // Expose shuffle and actual_repeat from Spotify player state
            find: 'repeat:"off"!==',
            replacement: [
                {
                    match: /repeat:"off"!==(\i),/,
                    replace: "shuffle:arguments[2]?.shuffle_state??false,actual_repeat:$1,$&",
                },
            ],
        },
    ],

    start() {
        toggleStyles(true);
    },

    stop() {
        toggleStyles(false);
    },

    PanelWrapper({ VencordOriginal, ...props }: { VencordOriginal: React.ComponentType<any>; [key: string]: any; }) {
        return (
            <>
                <ErrorBoundary
                    fallback={() => (
                        <div className="vc-srpp-error">
                            <p>SpotifyRichPresence++ failed to render.</p>
                            <p>Check the DevTools console for details.</p>
                        </div>
                    )}
                >
                    <Player />
                </ErrorBoundary>
                <VencordOriginal {...props} />
            </>
        );
    },
});
