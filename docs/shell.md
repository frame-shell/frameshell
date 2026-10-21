# The shell

Everything here runs in Quickshell (`quickshell/.config/quickshell`). Keys are set in
`hypr/.config/hypr/frame/shell.lua` and `apps.lua`.

## Hotkeys

Hold Super for a second and a half and an overlay lists every Hyprland bind: a German QWERTZ
keyboard with each key lit that does something with Super (a dot when only Super+Shift
does), hovering a key says what it does, and below all binds grouped as shell, apps,
windows, workspaces and media. Letting go of Super closes it. It stays closed while Super
is busy with something else, like Super+Space or dragging a window
(`hypr/.config/hypr/frame/hotkeys.lua`). `qs ipc call hotkeys toggle` opens it without
holding anything.

On an AULA F75 the keys themselves light up while modifiers are held, with what the held
combination does (see [keyboard.md](keyboard.md)).

Windows over each other: Alt+Tab goes to the next window and brings it up, Super+Alt+B sends
the active window to the back, Super+Alt+S puts it into the scratchpad and Super+S shows and
hides the scratchpad (Super+Shift+S is the screenshot).

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
| `d`, `d anna` | Discord: `d` alone lists the chats that moved last with their newest message, `d anna` opens the DM; Shift+Enter calls |
| `d call anna`, `d msg anna hi` | call someone, send a DM without opening Discord |
| `d reply on my way` | DM to the person you last wrote to |
| `t 5m tea`, `t 1:30`, `t 25` | timer (a bare number is minutes); `t` lists running ones, Enter stops one |
| `a laundry 10:00 m-f` | alarm, see below; `a` lists them |
| `# heart` | emoji, Enter copies, Shift+Enter pastes it into the window behind (it lands in the clipboard too) |
| `/ notes`, `/ dev notes` | files and folders in your home (find, hidden and build folders skipped), words before the last narrow the path; Enter opens, Shift+Enter opens a terminal there |
| `ssh nas` | hosts from `~/.ssh/config`, or any `user@host`; opens in Ghostty |
| `; token` | clipboard history (frame-clip, the newest 100 copies), Enter copies, Shift+Enter deletes the entry; Super+V opens straight into it |
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
and usernames; for `d msg` give one word of the name. Group DMs are in the list too (with
their icon), Enter opens the group, Shift+Enter or `d call` rings it. `d reply` goes to the last DM you
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
| Super+wheel down | zoom out into the overview, see below |
| Super+Ctrl+F | fullscreen on and off |
| Super+Ctrl+C | center the focused window |
| Super+Ctrl+G | tidy every window into a grid around the middle |
| Super+Ctrl+H | back to where the canvas started |
| Super + drag | move and resize windows as usual |
| drag empty canvas | move the view (middle button too, scroll to move it as well) |

**Overview.** Super+wheel down shrinks the desktop until every screen and every window
on the canvas is in view, each window a live preview, each screen an outline. The screens
stay put where they physically are; moving a view moves its windows across the map, so the
frames never drift apart. The wheel
zooms around the cursor (with or without Super), dragging empty canvas moves the map,
dragging a window moves the window (drop it inside another screen's outline and it goes to
that monitor), dragging its bottom right corner resizes it, a click on a window focuses it
and brings it to the middle of its screen, a click on empty canvas looks there. Keys act on
the window under the cursor (without one, the focused window): F makes it fullscreen on the
screen it sits on and leaves the overview, Enter goes to it like a click, Q closes it. Zooming in past 1:1 picks what is under the cursor, so
wheel down, point, wheel up is the quick way to another app. Esc or right click goes back
without changing anything. A fullscreen window is taken out of fullscreen first.
`qs ipc call overview toggle` opens it from anywhere (`quickshell/canvas/CanvasOverview.qml`).

New windows open in the middle of the screen at about half its size, or next to the
others when the middle is taken, and the view follows them. Dialogs keep their own size
and place. Instead of the workspace numbers the bar shows a minimap of that screen's canvas: the
windows as small blocks, the screen as an outline, and the position next to it. Click on the minimap to
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

Two things show up only when they matter: `● rec 0:42` while a screen recording runs
(click stops it), and `↑ 12` when there are package updates (pacman against a copy of its
databases in /tmp, and paru or yay, a minute after start and every 30 minutes; "(3 aur)"
counts the AUR ones). A click
on the number opens Ghostty with the update and `frame update` afterwards, and the count
is checked again when that window closes.

**Game mode** switches itself on while a game runs: Steam games (window class
`steam_app_<id>`), gamescope, and the classes in `gameClasses` in `config/Config.qml`.
It turns animations and blur off, sets the performance power profile, silences popups
(calls and alarms still come through), pauses the wallpaper and, with `goxlrGameProfile`
set, loads that GoXLR profile. When the last game closes, everything goes back, the
GoXLR profile too. Switching it on by hand in the control center still works; a game
does not turn off what you switched on yourself. `gameModeAuto: false` turns the
automatic part off.

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

On a GoXLR Mini the System channel has no fader: the control center shows a slider for it,
and the volume in the bar is that channel; scrolling on it changes it in steps of 5 %
(without a GoXLR: the default output). The OSD shows the change like a fader move.

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
| `both` | Wallpaper Engine scenes and videos from the Workshop (linux-wallpaperengine), plus videos (mpvpaper) and images (drawn by the shell) from the folders |
| `mpv` | only the folders: videos through mpvpaper, images drawn by the shell |
| `image` | only still images, lowest power use |

Folders: `~/Pictures/wallpapers` and `assets/wallpapers`; Workshop items come from
`~/.local/share/Steam/steamapps/workshop/content/431960`. `frame install wallpaper` asks for
the backend once; `frame wallpaper backend both|mpv|image` changes it later. Everything is
kept in `~/.local/state/frameshell/wallpaper.json`. A screen without a wallpaper shows the
theme's background color. Workshop items linux-wallpaperengine cannot show are left out:
"web" ones (HTML), presets (only settings for another wallpaper) and gif scenes. The
lockscreen blurs a still snapshot and freezes the backends while it is up
(`frame-wallpaper pause`); after the unlock they run again, and Wallpaper Engine is always
started anew, since it does not come back from a lock by itself (`resume`). A shell that
starts while they are still frozen lets them run again. Muted Wallpaper Engine scenes run without any
audio connection.

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

- DMs and mentions, with "open" (not while Vesktop is the focused window, you see them there)
- people joining or leaving your voice channel
- channels you watch (right-click a voice channel → "Watch in shell"), with "join"
- scheduled server events going live, with "join" for stage and voice events
- incoming calls with "accept" and "decline", group calls with the group's name and icon; a
  call nobody answers turns into a missed-call notice with "call back" (declining inside
  Discord itself also shows up as missed)
- your own mute and deafen changes, with "unmute"/"undeafen"

`frame install vencord` sets it up: it clones Vencord to `~/.local/share/frameshell/vencord`,
adds ShellBridge, builds it with pnpm, points Vesktop at that build (`vencordDir` in
`~/.config/vesktop/state.json`) and turns on theme and plugin (close Vesktop for that step).
`frame update` rebuilds only when Vencord or the plugin changed.

While the bridge is connected, Vesktop's own desktop notifications are dropped, so a DM
shows up once. "open" and "call back" bring the Vesktop window to the front.

Steam's popups (messages, invites, achievements, finished downloads) come through the
Millennium plugin on `qs-steam.sock` the same way, see [Steam](steam.md).

`frame install quickshell` also looks for mako, dunst and swaync (running, as a user
service or in `exec-once`) and offers to turn them off, since only one program can
receive notifications. `frame restore` brings them back.

## Typing @

Ctrl+Alt+Q types an @ into the focused window, for keyboards whose AltGr does not work.
Hyprland sends AltGr+Q straight to that window, so no virtual keyboard is involved and the
layout in the bar stays as it is (`hypr/frame/shell.lua`).

## Screenshots

Print freezes every screen: drag a region, or click a window (it lights up under the
cursor, the label says which and how big), Enter or a click on empty desktop takes the
whole screen, Esc or a right click cancels. Shift+Print and Super+Print take the focused
screen right away. The picture goes to `~/Pictures/screenshots` (your XDG pictures
folder, here `~/Bilder/screenshots`) and into the clipboard, and a notification shows it
with "open", "folder" and "delete". grim takes the picture, wl-copy fills the clipboard
(`screenshot/Screenshot.qml`, `qs ipc call screenshot region|screen`).

Super+Shift+R records instead: the same picker in red, then wf-recorder records the region,
window or screen until you stop it, with the same key or a click on `● rec` in the bar. The video
goes to `~/Videos/recordings` (your XDG videos folder) as MP4; the notification offers open,
folder, copy (the file, for chats) and delete. The audio panel bottom left in the picker picks the
sound: the GoXLR's channels (system, game, chat, music, chat mic, sampler, stream mix; without a
GoXLR the default output and mic), each with its own level. More than one channel is mixed into a
sink that wf-recorder records (`frame-record-mix`, PipeWire null sink and loopbacks, gone again
when the recording ends). The choice is kept in `~/.local/state/frameshell/record-audio.json`
(`services/Recorder.qml`, `qs ipc call screenshot record`).

### Recording editor

"edit" on a recording's notification (or `qs ipc call editor open <video>`) opens it in the
editor, a window of its own. Every channel chosen in the audio panel was also recorded on its
own (`<recording>.tracks/`, one FLAC per channel via parecord), so each gets its own row with a
waveform, a level and mute; a recording without channels has one row for its own sound.

- `c` cuts at the playhead, a click on a piece and `del` takes it out, the rest closes up
- `b` adds a blur box: drag it over names or messages, pick blur or pixelate and the strength,
  and drag its bar in the timeline to set from when to when
- pictures dragged in from Dolphin land where they are dropped; move them, pull the corner to
  size them, set their opacity
- a channel that sounds a little early or late gets nudged with "sync" (± half a second)
- `space` plays, ←/→ steps a second (Shift: five), Ctrl+wheel zooms the timeline, Ctrl+Z undoes

Nothing touches the recording itself: the edit is kept next to it as `<recording>.edit.json`
and "export" writes `<recording>-edit.mp4` with ffmpeg; the notification offers open, folder and
copy. The editor needs Qt Multimedia (`qt6-multimedia-ffmpeg`, offered by `frame install`;
without it the shell says so and everything else keeps working). Files: `editor/`,
`quickshell/.local/bin/frame-record-mix` (tracks).

### Picture editor

"edit" on a screenshot's notification opens it in the same window, without the timeline:
`b` adds a blur box (blur or pixelate, strength), pictures dragged in from Dolphin go on top,
`c` crops (drag the frame or its corners). The edit is kept as `<name>.edit.json`, "export"
(Ctrl+S) writes `<name>-edit.png` and the notification copies it as a picture for chats.
In Dolphin both editors are under "Open with → frameshell editor" for any picture or video
(`quickshell/.local/share/applications/frameshell-editor.desktop`).

### Media

Super+G (or "frameshell media" in the launcher, `qs ipc call media toggle`) shows every
screenshot and recording as a grid, newest first, with filters for pictures, videos and edited
ones. Click picks one, Ctrl+click more, Shift+click a run, Ctrl+A all of them; double click or
Enter opens it in the editor. "copy" puts one picture in as the picture and anything else as
files, "delete" asks in place and moves them into the trash together with a recording's
`.tracks` folder and an `.edit.json` (`gio trash`). A folder dropped on the window joins the
grid (kept in `~/.local/state/quickshell/…/media.json`, × takes it out again). Video thumbnails
come from ffmpeg and are cached in `~/.cache/frameshell/media`. Files: `gallery/`,
`quickshell/.local/bin/frame-media`.

## Lockscreen

Super+L (or `qs ipc call lock lock`, or 10 idle minutes, or going to sleep) takes a snapshot of
every screen, locks the session and blurs that snapshot behind the clock, password field,
weather panel, media controls and keyboard status. The login only shows on the screen
you were on; the others show the blur. Unlocking plays the animation backwards. The
password is checked by PAM with `lockscreen/pam/password.conf` (password only).

With `frame login` ([frame.md](frame.md)) the login screen looks the same: a greeter built
from the same pieces (`greeter/`), shown by greetd before the session starts.

If Quickshell crashes while locked, Hyprland keeps the screen locked on purpose. To get
back in: switch to a TTY (Ctrl+Alt+F3), log in, then run

```bash
hyprctl --instance 0 dispatch "hl.dsp.exec_cmd('qs')"
```

```bash
hyprctl --instance 0 dispatch "hl.dsp.exec_cmd('qs ipc call lock lock')"
```

and switch back (Ctrl+Alt+F1 or F2). The new lockscreen takes over and unlocks normally.

## Apps

| App | Key | Set up by frame |
|---|---|---|
| Dolphin | Super+E | theme color scheme, qt6ct (Fusion, palette, JetBrains Mono, Breeze Dark icons), "Open with" list outside Plasma, default for folders |
| Zed | Super+Shift+E | theme, AI off, file tree on the left (Ctrl+B hides it, Ctrl+Shift+E focuses it), fish in the terminal panel (Ctrl+J), no sign-in or telemetry, default for text files; language extensions (HTML, SCSS, QML with Qt's qmlls, Java, Lua, fish, hyprlang, TOML, XML, SQL, Dockerfile, Make, .env, logs, git files, GitHub Actions) install themselves on first start |
| Zen | Super+B | accent, dark mode and square corners in `user.js`, theme `userChrome.css`, default browser |

Dolphin, Zed and Zen ask before they become
default apps. Zed's `settings.json` is linked from the repo, so changes made in Zed end up
in `~/frameshell/zed`.
