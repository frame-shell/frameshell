# Steam

Steam gets the frameshell look through [Millennium](https://steambrew.app), and its
notifications come up in the shell instead of Steam's own popups.

```bash
frame install steam
```

That installs `steam` and `millennium` (AUR), links the theme and the plugin and turns
both on. Millennium needs Steam from the Arch repo; Flatpak and Snap are not supported.
If Steam was never started, start it once, close it and run `frame update steam`.

## Theme

`steam/.local/share/Steam/millennium/themes/Frameshell` (Millennium reads it through
`~/.steam/steam`, which points there). Like the Spotify theme it is static CSS on top of a
color file that `frame theme` writes (`colors.css`, from `themes/templates/steam/…`).
JetBrains Mono everywhere, no rounded corners, no shadows, 1px frames.

Steam's library uses class names that change with every update, so the theme mostly
recolors Steam's own design variables and styles the parts with stable names: dialogs,
buttons, inputs, the friends list and chat. Big Picture keeps Steam's layout and only
takes the colors.

After `frame theme set …` restart Steam for the new colors. If something looks off after a
Steam update, open Millennium's developer tools and adjust `frameshell.css`.

## Library colors

Steam's library, downloads and settings pages are styled in Steam's own `sp.css` and
`library.css` with hashed class names that change with every update, and with literal colors
instead of design tokens, so no theme can name them. `frame-steam-css` (steam package, in
`~/.local/bin`) reads the installed Steam's CSS and writes `generated.css` next to the theme:
for every rule that paints one of Steam's colors, the same selector with the theme's variable.
Greys are sorted by brightness into the theme's surfaces and text colors, Steam's blues,
greens, oranges and reds become the matching accent, other saturated colors (collection
labels, art tints), translucent overlays and fades over art are left alone.

`frame theme` and `frame update steam` run it; after a Steam update that changed the class
names, run `frame-steam-css` and restart Steam. Without the file the theme still applies, the
library just keeps Steam's colors.

## Notifications

The plugin (`steam/.local/share/millennium/plugins/frameshell`) connects to the shell on
`$XDG_RUNTIME_DIR/qs-steam.sock`. While the shell is there, these skip Steam's popup and
show up in the shell instead (they still land in Steam's bell):

| Steam | Shell | Buttons |
|---|---|---|
| friend message, group chat message | popup (not while Steam is focused) | open |
| game invite | stays until handled | join, chat |
| friend request | popup | show |
| friend online, friend starts a game | small popup | chat |
| achievement unlocked | popup with the icon | |
| download finished | small popup | play, downloads |

Everything else (gifts, wishlist sales, achievement progress, low battery) keeps Steam's
own popup. Without the shell, Steam shows all of them as before.

How it works: Millennium runs plugin backends in LuaJIT, so `backend/main.lua` opens the
Unix socket through LuaJIT's ffi and libc. The frontend (`.millennium/Dist/index.js`, plain
JavaScript, no build step) hooks Steam's `NotificationStore` and asks the backend twice a
second for the shell's commands. The protocol is in the header of
`quickshell/.config/quickshell/services/SteamBridge.qml`.

To see whether it works: the backend logs to `~/.local/state/millennium/logs/frameshell_log.log`,
the frontend writes `frameshell` lines to the SharedJSContext console.

## How the plugin hooks in

Checked on Steam 1791918634 with Millennium 3.6.2 (October 2026): the theme shows up and is
enabled from `frame install steam`, the plugin's Lua backend connects to the shell's socket
(LuaJIT's ffi works in Millennium's Lua host) and a friend message reaches the shell as a popup
while Steam's own toast stays away.

Steam's `NotificationStore.ProcessNotification` would be the natural hook, but it is a bound,
frozen own property of the store (`Cannot redefine property`). The plugin wraps `BShowToast`
on the store's prototype instead, which only answers whether a notification gets a toast; for
what went to the shell it answers no, and the tray entry stays. If Steam renames that method
the plugin falls back to its toasts and says so in the log.

What the frontend logs goes through the backend into Steam's log, so no SharedJSContext console
is needed:

```bash
grep "frameshell:" ~/.local/share/Steam/logs/console-linux.txt
```

`hooked BShowToast`, `forwarding notifications to the shell` and `→ shell: message` are the
lines to look for. Millennium loads plugin frontends only at Steam start (its plugin toggle
reloads a cached copy), so after a change to the plugin restart Steam.

The install links the plugin's files with stow; a Millennium installed before Steam's first
start misses its hook into Steam's runtime, `frame status` says so.
