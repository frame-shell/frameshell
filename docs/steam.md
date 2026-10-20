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

## Not tested yet

This was written from Millennium's source (v3.6.2) and a Steam client snapshot, not on a
running Steam. Check first:

- the theme shows up in Millennium's theme list (found through `~/.steam/steam`)
- `frameshell` is listed and enabled under plugins, and its log says "connected"
- LuaJIT's ffi works in Millennium's Lua host (a failing `require("ffi")` shows up in that log)
- a friend message reaches the shell and Steam's own popup stays away
- "open", "join" and "play" do what they say
