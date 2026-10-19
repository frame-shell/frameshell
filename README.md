<p align="center">
  <img src=".github/banner.svg" alt="roxy-dots" width="100%">
</p>

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
| System info | fastfetch with your own image as ASCII logo |
| Dotfile management | GNU Stow via the `roxy` CLI |

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
- [ ] Ghostty, fish, Starship and fastfetch in Roxy colors
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
├── roxy               # CLI: install, remove, update, status
├── ghostty/           # Terminal config + Roxy color theme
├── fish/              # conf.d/roxy.fish: syntax colors, Starship, fastfetch greeting
├── starship/          # Prompt with git and language pills
├── fastfetch/         # System info, logo from assets/roxy.png
├── spicetify/         # Spotify theme (color.ini + user.css)
├── themes/            # Color palettes (roxy.json, ...)
├── scripts/           # Theme generator and helpers
├── vencord/           # Discord theme (CSS)
├── assets/            # Characters, wallpapers per theme
├── PLAN.md
└── README.md
```

## Installation

```bash
git clone git@github.com:vxnsin/roxy-dots.git ~/roxy-dots
~/roxy-dots/roxy install
```

`roxy install` installs the missing packages (through `paru`/`yay`), moves existing
configs to `~/.local/state/roxy-dots/backup/`, links the configs with GNU Stow, applies
the Spotify theme and puts `roxy` into `~/.local/bin`.

```bash
roxy status                 # what is linked, what is missing
roxy install starship fish  # only some packages
roxy install --dry-run      # show what would happen
roxy update                 # git pull + relink
roxy remove spicetify       # unlink a package
```

Packages: `ghostty`, `fish`, `starship`, `fastfetch`, `spicetify`.
Each package folder mirrors the home directory (`ghostty/.config/ghostty/...`).

Manual steps:

- **fastfetch logo:** put any PNG at `assets/roxy.png`; fastfetch renders it as ASCII art.
- **Spotify:** install and open Spotify once before `roxy install spicetify`.
- **Fonts:** JetBrains Mono (built into Ghostty) and Lexend for the Spotify theme.

Not covered by `roxy` yet: `quickshell`, `hyprland`, `goxlr-utility`, `vesktop`.

## Note on assets

Character artwork and wallpapers are not part of this repo unless I made them myself.
The `assets/` folder is therefore listed in `.gitignore`.

## Inspiration

- [caelestia-dots](https://github.com/caelestia-dots) (soramane)
- [dots-hyprland](https://github.com/end-4/dots-hyprland) (end_4)
- [quickshell.org](https://quickshell.org)

## License

To be decided.
