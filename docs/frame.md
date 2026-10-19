# The frame command

```bash
git clone git@github.com:vxnsin/frameshell.git ~/frameshell
~/frameshell/frame install
```

`frame install` without package names starts the setup. It asks three things:

1. **How much:** *everything* (the shell plus Spotify, Vesktop, Zed, Dolphin, Zen and
   Claude Code), *pick* (the shell, then a yes or no for each app) or *only the shell*
   (terminal, prompt, bar, launcher, lockscreen, wallpapers).
2. **Layout:** Hyprland's tiling with workspaces, or the infinite canvas (see
   [shell.md](shell.md#infinite-canvas)); `frame layout tiling|canvas` switches later.
3. **Theme:** one of the six; `frame theme set <name>` switches later.

On top of that it notices a connected GoXLR (or GoXLR Mini) and installs GoXLR Utility for
the faders and mutes in the shell, and it installs Spotify (the AUR package) when the
Spotify theme is picked and no Spotify is there. Claude Code comes from Anthropic's own
installer (`claude.ai/install.sh`). `frame install -y` takes everything without asking.

Then it installs the missing packages (through `paru`/`yay`), writes the theme's color
files, moves existing configs to `~/.local/state/frameshell/backup/`, links the configs
with GNU Stow, applies the Spotify theme and puts `frame` into `~/.local/bin`.
`frame install zed dolphin` installs just those packages, without the questions.

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
frame login                  # the lockscreen as the login screen (greetd, sudo)
frame login remove           # back to the greeter
frame wallpaper backend mpv  # wallpaper backend: both, mpv or image
frame spotify login          # Spotify Web API for the launcher, see spotify.md
frame layout canvas          # infinite canvas; frame layout tiling goes back
```

`frame login` is for one person on one machine: greetd gets an `initial_session` that
starts Hyprland for you at boot, and the shell locks the session the moment it is up, so
the first thing on screen is the frameshell lockscreen with your password field. The
distro's greeter stays as `default_session` (the fallback when a session ends), the
original `/etc/greetd/config.toml` is kept in `~/.local/state/frameshell/`. The session
itself (autostart, Discord, …) runs behind the lockscreen; `frame login remove` undoes it.

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
- **Spotify:** it has to have run once before the theme applies; if the first install
  says so, open Spotify, log in and run `frame update spicetify`.
- **Vesktop:** start it once, then close it before `frame install vencord` so the theme can be
  switched on automatically (otherwise: Settings → Themes → Frameshell).
- **Font:** JetBrains Mono everywhere (TUI look); `frame` installs `ttf-jetbrains-mono`
  and the Nerd Font build for icons.
- **Hyprland:** frameshell's Hyprland files are Lua (Hyprland 0.55+, which reads
  `hyprland.lua` before the old `hyprland.conf`). `frame install hypr` adds
  `require("frame/shell")` to your own `hyprland.lua` (backed up first). Still on
  `hyprland.conf`? Move your settings to `hyprland.lua` first; Hyprland's
  [example config](https://github.com/hyprwm/Hyprland/blob/main/example/hyprland.lua) is a
  good start. Remove older SUPER+L, SUPER+SPACE, SUPER+C, SUPER+W, SUPER+E or SUPER+B
  binds or a second `hl.exec_cmd("hypridle")` if your config has them. `frame/shell.lua`
  also loads `frame/colors.lua` (window borders in the theme colors); drop that line to
  keep your own.
- **Weather:** set your city in `quickshell/.config/quickshell/config/Config.qml`
  (`weatherLocation`); empty means wttr.in guesses it from your IP.
- **Zen:** start it once and close it, then `frame install zen`; its files go into the
  profile folder, which only exists after the first start.
- **Dolphin:** log out and in once after `frame install dolphin`, so Hyprland sets
  `QT_QPA_PLATFORMTHEME=qt6ct`.
- **Wallpaper Engine:** needs Wallpaper Engine bought on Steam; subscribed Workshop items
  show up in the wallpaper app.

Not covered by `frame` yet: Hyprland itself.

## Structure

```
frameshell/
├── frame              # CLI: install, update, remove, backup, restore, theme, grub, login, wallpaper, status
├── themes/            # periwinkle.json, sakura.json, … and templates/ for frame theme
├── hypr/              # frame/shell.lua (keybinds, autostart), apps.lua, hotkeys.lua, hypridle.conf
├── quickshell/.config/quickshell/
│   ├── shell.qml      # Entry point
│   ├── config/        # Theme.qml (generated), Config.qml (your settings)
│   ├── components/    # Frame, Meter, TuiSlider, TuiButton, AppIcon
│   ├── services/      # Weather, Apps, SystemStats, Audio, GoXLR, Toggles, Notifications, DiscordBridge, Wallpapers
│   ├── lockscreen/    # Lock, LockContext (PAM), LockSurface (UI), pam/
│   ├── bar/           # Top bar: workspaces, title, clock, media, stats, volume
│   ├── controlcenter/ # Control center (session, toggles, faders, stats) and app mixer
│   ├── launcher/      # Launcher (window, IPC), LauncherView (UI), Modes (prefixes, results, Enter)
│   ├── osd/           # Fader, mute, volume and layout notices
│   ├── wallpapers/    # Wallpaper app (Super+W)
│   ├── media/         # Spotify popup on song change (MPRIS)
│   └── notifications/ # Popup cards and history
├── ghostty/           # Terminal config (+ generated color theme)
├── fish/              # conf.d/frameshell.fish: Starship, fastfetch greeting (+ generated colors)
├── starship/          # generated TUI frame prompt with git and language segments
├── fastfetch/         # System info, logo from assets/logo.png
├── spicetify/         # Spotify theme, launcher extension (Extensions/frameshell.js), frame-spotify (Web API)
├── vencord/           # generated Vesktop theme (system24) and plugins/shellBridge
├── wallpaper/         # frame-wallpaper: backends for the wallpaper app
├── zed/               # settings.json (+ generated theme)
├── dolphin/           # generated KDE color scheme + qt6ct palette
├── zen/               # generated user.js + chrome/userChrome.css, linked into the Zen profile
├── assets/            # your logo and wallpapers (git-ignored)
└── README.md
```

## Assets

Logos and wallpapers are not part of this repo unless I made them myself. The `assets/`
folder is therefore listed in `.gitignore`.
