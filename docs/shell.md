# The shell

Everything here runs in Quickshell (`quickshell/.config/quickshell`). Keys are set in
`hypr/.config/hypr/frame/shell.lua` and `apps.lua`.

## Hotkeys

Hold Super for three seconds and an overlay lists every Hyprland bind: a German QWERTZ
keyboard with each key lit that does something with Super (a dot when only Super+Shift
does), hovering a key says what it does, and below all binds grouped as shell, apps,
windows, workspaces and media. Letting go of Super closes it. It stays closed while Super
is busy with something else, like Super+Space or dragging a window
(`hypr/.config/hypr/frame/hotkeys.lua`). `qs ipc call hotkeys toggle` opens it without
holding anything.

The list is read live from `hyprctl binds`. Give your own binds a description to name
them, optionally with a group: `{ description = "media · next song" }`.

## Launcher

Super+Space (or `qs ipc call launcher toggle`) opens the launcher on the focused screen.

| Type | Does |
|---|---|
| anything | fuzzy search over installed apps; often used apps rank higher |
| `= 2*21` | calculator, Enter copies the result (`wl-copy`) |
| `> btop` | runs the command in Ghostty, the window stays open |
| `: reboot` | lock, logout, suspend, reboot, shutdown; all but lock need Enter twice |
| `s daft punk`, `s next`, `s f 30` | Spotify: search and controls, see [spotify.md](spotify.md) |
| `d anna` | Discord: open the DM; Shift+Enter calls |
| `d call anna`, `d msg anna hi` | call someone, send a DM without opening Discord |
| `d reply on my way` | DM to the person you last wrote to |
| `t 5m tea`, `t 1:30`, `t 25` | timer (a bare number is minutes); `t` lists running ones, Enter stops one |
| `a laundry 10:00 m-f` | alarm, see below; `a` lists them |
| `# heart` | emoji, Enter copies, Shift+Enter types it into the window behind |
| `/ notes`, `/ dev notes` | files and folders in your home (fd), words before the last narrow the path; Enter opens, Shift+Enter opens a terminal there |
| `ssh nas` | hosts from `~/.ssh/config`, or any `user@host`; opens in Ghostty |
| `; token` | clipboard history (cliphist), Enter copies, Shift+Enter deletes the entry |
| `? yt lofi`, `? aw hyprland` | web search: `g` `ddg` `yt` `gh` `aw` `aur` `w` `r`, without a shortcut DuckDuckGo |
| `c what is a tarball` | short answer from Claude (`claude -p`), only sent on Enter; Enter again copies it |

Letters need a space after them: `s ` is Spotify, `s` alone still searches apps. ↑↓ selects,
Tab and Shift+Tab cycle the modes, Esc or a click outside closes. Launch counts are kept in
`launcher-usage.json` in Quickshell's state folder.

**Timers and alarms** ring with a notification that stays until you pick *snooze* (10
minutes) or *done*, and a sound for up to a minute. They get through silent mode like calls
do and survive a shell restart (`alarms.json` in Quickshell's state folder). Alarm days:
`m tu w th f sa su` (also `mon`, `thu`, `thr`, German `mo di mi do fr sa so`), ranges like
`m-f` or `m-su`, lists like `m,w,f` or `tu,th`, and `daily`, `weekdays`, `weekend`. Without
days the alarm rings once. `t` alone is ambiguous (tuesday or thursday) and the launcher
asks for `tu` or `th`. In the list, Enter turns an alarm on or off, Shift+Enter deletes it.

**Discord** needs Vesktop with the ShellBridge plugin running. Names match display names
and usernames; for `d msg` give one word of the name. `d reply` goes to the last DM you
wrote since Discord started; before that, to your most recent DM, and the info pane says so.

**Claude** shows up only when the `claude` CLI is installed and signed in. It runs in an
empty folder (`~/.local/state/frameshell/claude`), so no project files go along. Model and
on/off: `claudeModel` and `claudeEnabled` in `config/Config.qml`, next to the web search
engines, the file search folder and the snooze length.

## Infinite canvas

Instead of tiling into workspaces, every window can float on one endless plane and the
screen is a view you move over it. Pick it in `frame install` or switch with
`frame layout canvas` (and back with `frame layout tiling`); Hyprland reloads by itself.

| Key | |
|---|---|
| Super+Ctrl+arrows | look half a screen further |
| Super+Ctrl+wheel, with Shift sideways | scroll the view |
| Super+Alt+arrows | jump to the nearest window that way and bring it into view |
| Super+Shift+arrows | move the focused window a little |
| Super+Ctrl+F | center the focused window |
| Super+Ctrl+G | tidy every window into a grid around the middle |
| Super+Ctrl+H | back to where the canvas started |
| Super + drag | move and resize windows as usual |

New windows open in the middle of the screen at about half its size, or next to the
others when the middle is taken, and the view follows them. Dialogs keep their own size
and place. Instead of the workspace numbers the bar shows a minimap: the windows as small
blocks, the screen as an outline, and the position next to it. Click on the minimap to
look there, scroll on it to move the view.

How it works: Hyprland has no camera, so moving the view moves all windows of the
workspace the other way, and the window animation turns that into a glide. Your spot is
kept in `~/.local/state/frameshell/canvas` across reloads. Each workspace (and so each
monitor) is its own canvas. With several monitors, a window half off one screen also shows
on the neighbouring one. There is no zooming out: Hyprland cannot scale windows from a
config.

## Bar and control center

The bar runs on every screen: workspaces (or the canvas minimap) and window title on the left, clock in the
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

## Apps

| App | Key | Set up by frame |
|---|---|---|
| Dolphin | Super+E | theme color scheme, qt6ct (Fusion, palette, JetBrains Mono, Breeze Dark icons), "Open with" list outside Plasma, default for folders |
| Zed | Super+Shift+E | theme, AI off, file tree on the left (Ctrl+B hides it, Ctrl+Shift+E focuses it), fish in the terminal panel (Ctrl+J), no sign-in or telemetry, default for text files |
| Zen | Super+B | accent, dark mode and square corners in `user.js`, theme `userChrome.css`, default browser |

Dolphin, Zed and Zen ask before they become
default apps. Zed's `settings.json` is linked from the repo, so changes made in Zed end up
in `~/frameshell/zed`.
