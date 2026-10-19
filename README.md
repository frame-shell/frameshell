<p align="center">
  <img src=".github/banner.svg" alt="frameshell" width="100%">
</p>

**frameshell** is a terminal-styled desktop for **CachyOS + Hyprland**: its own Quickshell
shell (bar, control center, launcher, lockscreen, notifications, OSD, wallpaper app),
bridges to Discord, GoXLR and Spotify, app themes generated from one palette, and the
`frame` CLI that installs, updates and re-themes all of it.

Square 1px frames with the label in the top line, JetBrains Mono everywhere, six themes.

> Status: 🚧 work in progress. Built from Windows so far; nothing has run on Linux yet.

## Overview

| Area | Tool |
|---|---|
| Distro | CachyOS (AMD, open-source drivers) |
| Compositor | Hyprland |
| Shell (bar, OSD, popups, launcher, lockscreen, wallpapers) | Quickshell (QML) |
| Wallpaper | linux-wallpaperengine / mpvpaper / swaybg |
| Audio interface | GoXLR via `goxlr-utility` |
| Discord | Vesktop (Vencord), TUI theme built on system24, ShellBridge plugin |
| Spotify | Spicetify, TUI theme |
| Terminal | Ghostty |
| Terminal shell | fish + Starship |
| File manager | Dolphin (SFTP, split view), Qt look through qt6ct |
| Code editor | Zed, AI features off, file tree on the left |
| Browser | Zen (vertical tabs), square TUI look through `userChrome.css` |
| System info | fastfetch with your own image as ASCII logo |
| Boot menu | GRUB theme, terminal style (`frame grub`) |
| Config management | GNU Stow via the `frame` CLI |

## Themes

Every app gets its colors from one theme file in `themes/`. Switch all of them at once:

```bash
frame theme list         # the themes, the active one marked
frame theme set sakura   # rewrite every color file and reload what can reload
```

| Theme | Colors | primary | bg |
|---|---|---|---|
| `periwinkle` (default) | blue-violet | `#5d6fe8` | `#0b0c1f` |
| `sakura` | pink | `#f06aa8` | `#1a0d17` |
| `matcha` | green | `#5fd39a` | `#0c1410` |
| `ember` | orange | `#f08a3c` | `#170f0a` |
| `lagoon` | teal | `#3fc7d9` | `#08141a` |
| `mono` | black and white; only errors, warnings and success keep a faint tint | `#ededed` | `#0a0a0a` |

All themes share the same roles: `bg`, `surface`, `surface2`, `shadow`, `primary`,
`secondary`, `accent`, `text`, `textDim`, `muted`, `frame`, `danger`, `warn`, `ok`, plus 16
terminal colors (`ansi`) and the fonts. A new theme is one more JSON file with these keys.

`frame install` asks for a theme once. After `frame theme set …`, Quickshell, Zed and
Hyprland's window borders change right away; Spotify gets the theme applied again; new
Ghostty windows and new shells pick it up; Dolphin and Zen need a restart; GRUB needs
`frame grub` (sudo).

### How the files are made

Each app file with colors has a template in `themes/templates/<package>/<path>` with
placeholders like `{{colors.primary}}`, `{{ansi.4}}` or `{{colors.surface2|lighten:8|bare}}`.
`frame theme` fills them in and writes `<package>/<path>`, which Stow links as usual.
Steps can be chained:

| Step | Result for `#5d6fe8` |
|---|---|
| `lighten:N`, `darken:N` | N percent of white or black mixed in |
| `mix:<key>:N` | N percent of another palette color mixed in, e.g. `mix:colors.text:20` |
| `bare` | `5d6fe8` |
| `rgb` | `93,111,232` |
| `argb` | `#ff5d6fe8` |
| `alpha:XX` | `#5d6fe8XX` (XX in hex) |

The written files are git-ignored, so switching themes never shows up as a change in the
repo; `frame install` and `frame update` write them before linking. Edit the template,
never the output. `frame theme check` only reports files that do not match the active theme.

Generated: Quickshell (`config/Theme.qml`), Ghostty, fish syntax colors, Starship, Spotify
(`color.ini`), Vesktop, Hyprland window borders, Zed, Dolphin (KDE color scheme and qt6ct
palette), Zen and GRUB (`theme.txt`; `frame grub` draws the 1px frame images itself).

## Planned features

- [ ] Top bar with control center (PC stats, toggles, GoXLR faders) and app mixer for per-app routing (built, untested)
- [ ] Spotify popup on song change (MPRIS), fading in at the top left, with playback controls (built, untested)
- [ ] Calendar under the clock on hover, with ISO weeks (built, untested)
- [ ] Media hover card on the bar: cover, progress, play/pause; next/previous only when the player supports it (built, untested)
- [ ] OSD for GoXLR faders and mutes, the GoXLR mic button, default output volume and keyboard layout (built, untested)
- [ ] Custom notifications: TUI banners with actions and timer, bell with history, "silent" mode (built, untested)
- [ ] Vencord plugin with a socket bridge to the shell: messages, voice joins/leaves (own and
  watched channels), server events going live, calls with accept/decline and missed-call
  notices, mute/deafen notices, and actions back into Discord (built, test on Linux)
- [ ] Launcher: fuzzy app search, calculator, run and power modes (built, untested)
- [ ] Lockscreen: blurred desktop snapshot, weather panel, media, fade animation (built, untested)
- [ ] Wallpapers: Wallpaper Engine scenes, videos and images, picked in their own app (built, untested)
- [ ] Six themes for every app, switched with `frame theme set` (built, untested)
- [ ] Hotkey overlay (holding Super highlights bound keys), later on keyboard LEDs
- [ ] Later, once the setup runs on Linux and can be tested live:
  - Millennium plugin for Steam, same bridge: game invites with accept/decline, friends
    now playing, coming online, chat messages
  - Steam theme for Millennium in the TUI look, generated from the themes
  - GRUB ASCII art section

## Structure

```
frameshell/
├── frame              # CLI: install, update, remove, backup, restore, theme, grub, wallpaper, status
├── themes/            # periwinkle.json, sakura.json, … and templates/ for frame theme
├── hypr/              # frame/shell.conf (keybinds, autostart), frame/apps.conf, hypridle.conf
├── quickshell/.config/quickshell/
│   ├── shell.qml      # Entry point
│   ├── config/        # Theme.qml (generated), Config.qml (your settings)
│   ├── components/    # Frame, Meter, TuiSlider, TuiButton, AppIcon
│   ├── services/      # Weather, Apps, SystemStats, Audio, GoXLR, Toggles, Notifications, DiscordBridge, Wallpapers
│   ├── lockscreen/    # Lock, LockContext (PAM), LockSurface (UI), pam/
│   ├── bar/           # Top bar: workspaces, title, clock, media, stats, volume
│   ├── controlcenter/ # Control center (session, toggles, faders, stats) and app mixer
│   ├── launcher/      # Launcher (window, IPC), LauncherView (apps, calc, run, power)
│   ├── osd/           # Fader, mute, volume and layout notices
│   ├── wallpapers/    # Wallpaper app (Super+W)
│   ├── media/         # Spotify popup on song change (MPRIS)
│   └── notifications/ # Popup cards and history
├── ghostty/           # Terminal config (+ generated color theme)
├── fish/              # conf.d/frameshell.fish: Starship, fastfetch greeting (+ generated colors)
├── starship/          # generated TUI frame prompt with git and language segments
├── fastfetch/         # System info, logo from assets/logo.png
├── spicetify/         # Spotify theme (user.css + generated color.ini)
├── vencord/           # generated Vesktop theme (system24) and plugins/shellBridge
├── wallpaper/         # frame-wallpaper: backends for the wallpaper app
├── zed/               # settings.json (+ generated theme)
├── dolphin/           # generated KDE color scheme + qt6ct palette
├── zen/               # generated user.js + chrome/userChrome.css, linked into the Zen profile
├── assets/            # your logo and wallpapers (git-ignored)
└── README.md
```

## Installation

```bash
git clone git@github.com:vxnsin/frameshell.git ~/frameshell
~/frameshell/frame install
```

`frame install` installs the missing packages (through `paru`/`yay`), asks for a theme
and writes its color files, moves existing configs to `~/.local/state/frameshell/backup/`,
links the configs with GNU Stow, applies the Spotify theme and puts `frame` into
`~/.local/bin`.

```bash
frame status                 # what is linked, what is missing, active theme
frame install starship fish  # only some packages
frame install --dry-run      # show what would happen
frame update                 # git pull, backup, re-render, relink, re-apply app themes
frame update spicetify       # after a Spotify update wiped the theme
frame remove spicetify       # unlink a package
frame backup                 # snapshot configs and app settings
frame restore                # list backups
frame restore latest         # put the newest one back
frame theme list             # themes; frame theme set <name> switches
frame grub                   # theme the GRUB boot menu (sudo)
frame grub remove            # switch it off again
frame wallpaper backend mpv  # wallpaper backend: both, mpv or image
```

`frame grub` only works when the system boots with GRUB (`/boot/grub/grub.cfg` exists;
the CachyOS installer also offers systemd-boot and Limine). It builds the fonts from
JetBrains Mono, draws the frame images in the theme colors, copies everything to
`/boot/grub/themes/frameshell`, sets `GRUB_THEME` in `/etc/default/grub` (the original is
saved once to `~/.local/state/frameshell/`) and rebuilds `grub.cfg`. `frame update`
refreshes an installed GRUB theme too.

Backups live in `~/.local/state/frameshell/backup/` (one folder per snapshot, named by date
and reason). `install` moves conflicting configs there, `update` and `restore` take a
snapshot before they change anything. `update` also updates the `frame` CLI itself.

Packages: `ghostty`, `fish`, `starship`, `fastfetch`, `spicetify`, `vencord`, `quickshell`,
`hypr`, `wallpaper`, `zed`, `dolphin`, `zen`. Each package folder mirrors the home directory
(`ghostty/.config/ghostty/...`); only `zen` mirrors the Zen profile folder instead.

Manual steps:

- **fastfetch logo:** put any PNG at `assets/logo.png`; fastfetch renders it as ASCII art.
- **Spotify:** install and open Spotify once before `frame install spicetify`.
- **Vesktop:** start it once, then close it before `frame install vencord` so the theme can be
  switched on automatically (otherwise: Settings → Themes → Frameshell).
- **Font:** JetBrains Mono everywhere (TUI look); `frame` installs `ttf-jetbrains-mono`
  and the Nerd Font build for icons.
- **Hyprland:** `frame install hypr` adds `source = ~/.config/hypr/frame/shell.conf` to your
  own `hyprland.conf` (backed up first). Remove older SUPER+L, SUPER+SPACE, SUPER+C,
  SUPER+W, SUPER+E or SUPER+B binds or a second `exec-once = hypridle` if your config has
  them. `frame/shell.conf` also sources `frame/colors.conf` (window borders in the theme
  colors); drop that line to keep your own.
- **Weather:** set your city in `quickshell/.config/quickshell/config/Config.qml`
  (`weatherLocation`); empty means wttr.in guesses it from your IP.
- **Zen:** start it once and close it, then `frame install zen`; its files go into the
  profile folder, which only exists after the first start.
- **Dolphin:** log out and in once after `frame install dolphin`, so Hyprland sets
  `QT_QPA_PLATFORMTHEME=qt6ct`.
- **Wallpaper Engine:** needs Wallpaper Engine bought on Steam; subscribed Workshop items
  show up in the wallpaper app.

Not covered by `frame` yet: Hyprland itself, `goxlr-utility`.

## Launcher

Super+Space (or `qs ipc call launcher toggle`) opens the launcher on the focused screen.

| Type | Does |
|---|---|
| anything | fuzzy search over installed apps; often used apps rank higher |
| `= 2*21` | calculator, Enter copies the result (`wl-copy`) |
| `> btop` | runs the command in Ghostty, the window stays open |
| `: reboot` | lock, logout, suspend, reboot, shutdown; all but lock need Enter twice |

↑↓ selects, Tab cycles the modes, Esc or a click outside closes. Launch counts are kept
in `launcher-usage.json` in Quickshell's state folder.

## Bar and control center

The bar runs on every screen: workspaces and window title on the left, clock in the
middle, media, CPU load and temperature, RAM, volume and keyboard layout on the right.
It flies up while the lockscreen takes over and drops back in after unlocking.

Super+C (or the slider button in the bar) opens the control center:

- **session:** user, uptime, lock, sleep, reboot, off (reboot and off need a second click)
- **toggles:** wi-fi (`nmcli`), bluetooth, silent (notifications only on the bell), stay
  awake (blocks idle lock and screen-off), game mode (animations and blur off,
  `powerprofilesctl set performance`), mic mute (the GoXLR mic fader mute);
  **wallpapers ›** opens the wallpaper app
- **goxlr faders:** levels follow the physical faders, the mute buttons work from here
- **system:** CPU with a one-minute curve, GPU, VRAM (amdgpu), RAM, disk, network

**app mixer ›** opens the mixer beside it: every app that plays or records audio, with
its own volume, mute and the GoXLR channel it is routed to (system, game, chat, music;
inputs: chat mic, sampler). Routing uses `pactl move-sink-input`, WirePlumber remembers it
per app. From six apps on the rows get compact, idle apps are dimmed at the bottom.

GoXLR notes: levels and mutes come from the goxlr-utility HTTP API
(`http://localhost:14564`). The mixer finds the GoXLR devices by their PipeWire
description; if yours are named differently (`wpctl status`), change `goxlrOutputs` and
`goxlrInputs` in `config/Config.qml`.

## OSD

A small frame at the bottom center, gone after 1.6 s and never on the lockscreen. It only
shows what already happened: a GoXLR fader moved or was muted, the GoXLR mic button was
pressed, the default output volume changed (e.g. from an app), the keyboard layout
switched. There is no keyboard volume control; the levels live on the GoXLR.

## Wallpapers

Super+W (or **wallpapers ›** in the control center) opens the wallpaper app: search by
title and tags, filter by type and screen, pick backend and playback settings (FPS limit,
sound, scaling, pause in fullscreen). It is a front end for `frame-wallpaper`, which
Hyprland also runs at login (`frame-wallpaper apply`).

| Backend | Shows |
|---|---|
| `both` | Wallpaper Engine scenes and videos from the Workshop (linux-wallpaperengine), plus videos (mpvpaper) and images (swaybg) from the folders |
| `mpv` | only the folders: videos through mpvpaper, images through swaybg |
| `image` | only still images, lowest power use |

Folders: `~/Pictures/wallpapers` and `assets/wallpapers`; Workshop items come from
`~/.local/share/Steam/steamapps/workshop/content/431960`. `frame install wallpaper` asks for
the backend once; `frame wallpaper backend both|mpv|image` changes it later. Everything is
kept in `~/.local/state/frameshell/wallpaper.json`. A screen without a wallpaper shows the
theme's background color. The lockscreen blurs a still snapshot, so moving wallpapers do
not run behind it.

## Apps

| App | Key | Set up by frame |
|---|---|---|
| Dolphin | Super+E | theme color scheme, qt6ct (Fusion, palette, JetBrains Mono, Breeze Dark icons), "Open with" list outside Plasma, default for folders |
| Zed | Super+Shift+E | theme, AI off, file tree on the left (Ctrl+B hides it, Ctrl+Shift+E focuses it), fish in the terminal panel (Ctrl+J), no sign-in or telemetry, default for text files |
| Zen | Super+B | accent, dark mode and square corners in `user.js`, theme `userChrome.css`, default browser |

SFTP in Dolphin: type `sftp://user@host/path` into the address bar; right-click the
sidebar → **Add Entry** keeps the server there. Dolphin, Zed and Zen ask before they become
default apps. Zed's `settings.json` is linked from the repo, so changes made in Zed end up
in `~/frameshell/zed`.

## Notifications and media

The shell is the notification daemon (no mako/dunst/swaync needed; remove them from
autostart). Popups stack top right with a timer that pauses on hover; critical ones and
calls stay until handled. "silent" in the control center keeps popups away (calls and
critical ones still show) and counts them on the bell in the bar; the bell opens the
history (`qs ipc call notifications toggle`).

Spotify gets a popup top left on every song change. Hovering the song in the bar shows a
card with progress and play/pause; next/previous appear only when the player supports
them over MPRIS (Spotify yes, a YouTube tab usually not).

### Discord (Vencord plugin)

`vencord/plugins/shellBridge` talks to the shell over `$XDG_RUNTIME_DIR/qs-discord.sock`:

- DMs and mentions, with "open"
- people joining or leaving your voice channel
- channels you watch (right-click a voice channel → "Watch in shell"), with "join"
- scheduled server events going live, with "join" for stage and voice events
- incoming calls with "accept" and "decline"; a call nobody answers turns into a missed-call
  notice with "call back" (declining inside Discord itself also shows up as missed)
- your own mute and deafen changes, with "unmute"/"undeafen"

`frame install vencord` sets it up: it clones Vencord to `~/.local/share/frameshell/vencord`,
adds ShellBridge, builds it with pnpm, points Vesktop at that build and turns on theme
and plugin (close Vesktop for that step). `frame update` rebuilds only when Vencord or the
plugin changed. Not tested yet.

`frame install quickshell` also looks for mako, dunst and swaync (running, as a user
service or in `exec-once`) and offers to turn them off, since only one program can
receive notifications. `frame restore` brings them back.

## Lockscreen

Super+L (or `qs ipc call lock lock`, or hypridle after 10 minutes) takes a snapshot of
every screen, locks the session and blurs that snapshot behind the clock, password field,
weather panel, media controls and keyboard status. The login only shows on the screen
you were on; the others show the blur. Unlocking plays the animation backwards. The
password is checked by PAM with `lockscreen/pam/password.conf` (password only).

If Quickshell crashes while locked, Hyprland keeps the screen locked on purpose. To get
back in: switch to a TTY (Ctrl+Alt+F3), log in, then run

```bash
hyprctl --instance 0 dispatch exec qs
```

```bash
hyprctl --instance 0 dispatch exec "qs ipc call lock lock"
```

and switch back (Ctrl+Alt+F1 or F2). The new lockscreen takes over and unlocks normally.

## Note on assets

Logos and wallpapers are not part of this repo unless I made them myself. The `assets/`
folder is therefore listed in `.gitignore`.

## Inspiration

- [caelestia-dots](https://github.com/caelestia-dots) (soramane)
- [dots-hyprland](https://github.com/end-4/dots-hyprland) (end_4)
- [system24](https://github.com/refact0r/system24) (refact0r, MIT), base of the Vencord theme
- [quickshell.org](https://quickshell.org)

## License

To be decided.
