# roxy-dots

My personal dotfiles for **CachyOS + Hyprland + Quickshell**.
Dark navy blue, custom shell, everything built by hand.

> Status: 🚧 work in progress. The setup is being built step by step.

## Overview

| Area | Tool |
|---|---|
| Distro | CachyOS (AMD, open-source drivers) |
| Compositor | Hyprland |
| Shell (bar, OSD, popups, launcher, lockscreen) | Quickshell (QML) |
| Wallpaper | linux-wallpaperengine / mpvpaper |
| Audio interface | GoXLR via `goxlr-utility` |
| Discord | Vesktop (Vencord) with a custom theme |
| Spotify | Spicetify with the Roxy theme |
| Terminal | Ghostty |
| Terminal shell | fish + Starship |
| Dotfile management | GNU Stow |

## Planned features

- [ ] Custom top bar (workspaces, clock, volume, tray)
- [ ] Spotify popup on song change (MPRIS), fading in at the top left, with playback controls
- [ ] OSD module for GoXLR faders, mic mute, system volume and brightness
- [ ] Custom notifications
- [ ] Custom launcher
- [ ] Lockscreen
- [ ] Wallpaper Engine as background
- [ ] Infinite-canvas workflow
- [ ] Vencord theme generated from the same color palette (based on system24 theme)
- [ ] Spotify theme (Spicetify): borderless cover tiles, icon rail, queue as a table, floating player bar
- [ ] Ghostty, fish and Starship in Roxy colors
- [ ] Hotkey overlay (holding Super highlights bound keys), later on keyboard LEDs
- [ ] Multi-theme switcher

## Theme: Roxy Dark

All colors come from a single source (`themes/roxy.json`) and are distributed by script
to Hyprland, terminal, GTK/Qt, Quickshell, Vencord and Spotify.
Until that script exists, the values are copied into each config by hand.

| Role | Hex |
|---|---|
| bg | `#0a0f1f` |
| surface | `#111833` |
| surface2 | `#1a2447` |
| primary | `#4a7fe0` |
| secondary | `#8fb0f0` |
| text | `#dce6ff` |
| muted | `#7a89b3` |
| danger | `#ff6b8a` |

Additional themes can be added later as extra JSON files.

## Structure

```
roxy-dots/
├── hypr/              # Hyprland config
├── quickshell/
│   ├── shell.qml      # Entry point
│   ├── Theme.qml      # Singleton: colors and animation timings
│   ├── bar/           # Top bar
│   ├── osd/           # Overlays (GoXLR, mute, volume)
│   ├── media/         # Spotify popup (MPRIS)
│   ├── notifications/ # Notification daemon
│   ├── launcher/      # App launcher
│   └── lockscreen/
├── ghostty/           # Terminal config + Roxy color theme
├── fish/              # conf.d/roxy.fish: syntax colors, starts Starship
├── starship/          # Prompt
├── spicetify/         # Spotify theme (color.ini + user.css)
├── themes/            # Color palettes (roxy.json, ...)
├── scripts/           # Theme generator and helpers
├── vencord/           # Discord theme (CSS)
├── assets/            # Characters, wallpapers per theme
├── PLAN.md
└── README.md
```

## Installation

Not finished yet. Instructions will be added once the base setup is done.

Rough steps:

```bash
git clone git@github.com:vxnsin/roxy-dots.git ~/roxy-dots
cd ~/roxy-dots
stow ghostty fish starship spicetify   # symlinks the configs into ~/.config
```

Each package folder mirrors your home directory (`ghostty/.config/ghostty/...`),
so `stow` run from `~/roxy-dots` links everything to the right place.

Activate the Spotify theme:

```bash
spicetify config current_theme Roxy color_scheme Roxy
spicetify apply
```

Requirements: `quickshell`, `hyprland`, `goxlr-utility`, `vesktop`, `stow`,
`ghostty`, `fish`, `starship`, `spicetify-cli`, fonts JetBrains Mono and Lexend.

## Note on assets

Character artwork and wallpapers are not part of this repo unless I made them myself.
The `assets/` folder is therefore listed in `.gitignore`.

## Inspiration

- [caelestia-dots](https://github.com/caelestia-dots) (soramane)
- [dots-hyprland](https://github.com/end-4/dots-hyprland) (end_4)
- [quickshell.org](https://quickshell.org)

## License

To be decided.
