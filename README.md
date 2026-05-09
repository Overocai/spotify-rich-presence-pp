# Spotify Rich Presence++

> A futuristic animated Spotify player for Discord — Vencord / Equicord userplugin.

![License](https://img.shields.io/badge/license-GPL--3.0-blue)
![Platform](https://img.shields.io/badge/platform-Vencord%20%7C%20Equicord-5865F2)
![Status](https://img.shields.io/badge/status-active-brightgreen)

---

(<img width="800" height="450" alt="Image" src="https://github.com/user-attachments/assets/b156d3b2-5c69-4dd2-93ec-752f3e836f0f" />)

## Features

- **Real-time track info** — title, artist, album art
- **Smooth animated progress bar** with seek support
- **Dynamic color extraction** from album artwork
- **Animated waveform visualizer** and **spectrum analyzer**
- **Beat-reactive glow / bloom effects**
- **5 themes** — AquaWave, Hyperpop, Neon, OLED, Minimal
- **3 player modes** — Expanded, Compact, Mini
- Glassmorphism surface with configurable blur
- Full playback controls: play/pause, skip, shuffle, repeat, seek
- Custom CSS field for deep customisation

---

## Installation

### Vencord / Equicord (userplugins)

1. Clone or download this folder into your `src/userplugins/` directory:

```
src/userplugins/
└── Spotify Rich Presence++/   ← paste here
    ├── index.tsx
    ├── SpotifyStore.ts
    └── ...
```

2. Build:

```bash
pnpm build
# or for live reload:
pnpm watch
```

3. Open Discord → Settings → Vencord Plugins → enable **SpotifyRichPresencePP**.

---

## Themes

| Theme | Description |
|-------|-------------|
| AquaWave | Teal / cyan gradients |
| Hyperpop | Hot pink + electric blue |
| Neon | Green matrix glow |
| OLED | True black, crisp whites |
| Minimal | Subtle, no glow |

<!-- Add theme screenshots here:
| AquaWave | Hyperpop | Neon |
|----------|----------|------|
| ![](assets/theme-aquawave.png) | ![](assets/theme-hyperpop.png) | ![](assets/theme-neon.png) |
-->

---

## Compatibility

| Client | Status |
|--------|--------|
| Vencord | ✅ Full support |
| Equicord | ✅ Full support |
| BetterDiscord | ❌ Different plugin system |

---

## Project Structure

```
Spotify Rich Presence++/
├── index.tsx               Plugin entry, patches, panel injection
├── settings.ts             Plugin settings declaration
├── SpotifyStore.ts         Extended Flux store
├── components/
│   ├── Player.tsx          Root component
│   ├── TrackInfo.tsx       Album art + title + artist
│   ├── Controls.tsx        Playback buttons
│   ├── ProgressBar.tsx     Draggable seek bar
│   ├── Waveform.tsx        Canvas waveform renderer
│   ├── Visualizer.tsx      Canvas spectrum analyzer
│   └── SettingsPanel.tsx   Settings UI
├── hooks/
│   ├── useSpotify.ts       Store subscription hook
│   ├── useAlbumColors.ts   Canvas color extraction
│   ├── useAnimationFrame.ts rAF loop hook
│   └── usePlaybackTimer.ts Smooth position counter
├── styles/
│   └── player.css          All CSS, scoped to .vc-srpp-*
└── utils/
    ├── format.ts           msToHuman, clamp, lerp
    ├── debounce.ts         Debounce helper
    └── themes.ts           Theme token definitions
```

---

## Author

Made by **overocai** — [Discord](https://discord.com/users/1288832011452153910)

## License

[GPL-3.0](LICENSE)
