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
frame theme set              # without a name: pick one with the arrow keys
frame grub                   # theme the GRUB boot menu (sudo)
frame grub remove            # switch it off again
frame login                  # the lockscreen look as the login screen (greetd, sudo)
frame login remove           # back to the greeter
frame wallpaper backend mpv  # wallpaper backend: both, mpv or image
frame spotify login          # Spotify Web API for the launcher, see spotify.md
frame layout canvas          # infinite canvas; frame layout tiling goes back
```

`frame login` puts the lockscreen's look on the login screen. greetd (CachyOS' display
manager) gets `greeter/frame-greeter-session` as its `default_session`: a small compositor
(the one that comes with noctalia-greeter, or cage) with Quickshell drawing
`greeter/shell.qml`, clock, date and one password field for the one user of the machine.
The files go to `/usr/share/frameshell/greeter` (the greeter user cannot read your home),
together with the active theme; `greeter.json` there names the user and the session
command (`/usr/bin/start-hyprland` on CachyOS). Before it touches greetd it checks that
Quickshell and a compositor are there, it takes the config file greetd's service really
reads, and afterwards it reads the file back. The original config is kept twice, in
`~/.local/state/frameshell/` and as `config.toml.frameshell-orig` next to it;
`frame login remove` puts it back and refuses to delete anything when neither copy exists.
`frame status` says when greetd no longer starts the frameshell greeter (a package update
can replace the config); `frame login` again fixes that.

Trying it without a reboot: switch to a text console (Ctrl+Alt+F3), log in and run
`sudo systemctl restart greetd`. The greeter logs to the journal
(`journalctl -b -t frame-greeter -u greetd`). To look at it inside a running desktop:
`qs -p ~/frameshell/greeter`.

`frame grub` only works when the system boots with GRUB (`/boot/grub/grub.cfg` exists;
the CachyOS installer also offers systemd-boot and Limine). It builds the fonts from
JetBrains Mono, draws the frame images in the theme colors, copies everything to
`/boot/grub/themes/frameshell`, sets `GRUB_THEME` in `/etc/default/grub` (the original is
saved once to `~/.local/state/frameshell/`) and rebuilds `grub.cfg`. `frame update`
refreshes an installed GRUB theme too.

Questions with a choice (theme, layout, how much to set up) are menus: ↑↓ and Enter, or
type the start of a name to jump to it, Esc to cancel. Piped into a script or with `-y`
they fall back to plain numbered questions. Tab completes commands, packages, themes and
backups in fish and bash (`completions/`, linked by `frame install` and `frame update`;
bash needs the bash-completion package).

Backups live in `~/.local/state/frameshell/backup/` (one folder per snapshot, named by date
and reason). `install` moves conflicting configs there, `update` and `restore` take a
snapshot before they change anything. `update` also updates the `frame` CLI itself.

Packages: `ghostty`, `fish`, `starship`, `fastfetch`, `spicetify`, `vencord`, `steam`, `quickshell`,
`hypr`, `wallpaper`, `keyboard`, `zed`, `dolphin`, `zen`. Each package folder mirrors the home directory
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
- **AULA F75:** `frame install keyboard` (also picked by the setup when the keyboard is
  plugged in) links `frame-keyboard` and installs its udev rule with sudo; replug the
  keyboard once. Super+K opens the keyboard app, see [keyboard.md](keyboard.md).

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
│   ├── services/      # Weather, Apps, SystemStats, Audio, GoXLR, Toggles, Notifications, DiscordBridge, Wallpapers, Keyboard
│   ├── lockscreen/    # Lock, LockContext (PAM), LockSurface (UI), pam/
│   ├── bar/           # Top bar: workspaces, title, clock, media, stats, volume
│   ├── controlcenter/ # Control center (session, toggles, faders, stats) and app mixer
│   ├── launcher/      # Launcher (window, IPC), LauncherView (UI), Modes (prefixes, results, Enter)
│   ├── osd/           # Fader, mute, volume and layout notices
│   ├── wallpapers/    # Wallpaper app (Super+W)
│   ├── keyboard/      # Keyboard app for the AULA F75 (Super+K)
│   ├── media/         # Spotify popup on song change (MPRIS)
│   └── notifications/ # Popup cards and history
├── ghostty/           # Terminal config (+ generated color theme)
├── fish/              # conf.d/frameshell.fish: Starship, fastfetch greeting (+ generated colors)
├── starship/          # generated TUI frame prompt with git and language segments
├── fastfetch/         # System info, logo from assets/logo.png
├── spicetify/         # Spotify theme, launcher extension (Extensions/frameshell.js), frame-spotify (Web API)
├── vencord/           # generated Vesktop theme (system24) and plugins/shellBridge
├── steam/             # Millennium theme (+ generated colors.css) and the frameshell plugin
├── wallpaper/         # frame-wallpaper: backends for the wallpaper app
├── keyboard/          # frame-keyboard (AULA F75 over hidraw) and its udev rule
├── zed/               # settings.json (+ generated theme)
├── dolphin/           # generated KDE color scheme + qt6ct palette
├── zen/               # generated user.js + chrome/userChrome.css, linked into the Zen profile
├── assets/            # your logo and wallpapers (git-ignored)
└── README.md
```

## Assets

Logos and wallpapers are not part of this repo unless I made them myself. The `assets/`
folder is therefore listed in `.gitignore`.
