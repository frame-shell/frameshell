# The frame command

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

## Assets

Logos and wallpapers are not part of this repo unless I made them myself. The `assets/`
folder is therefore listed in `.gitignore`.
