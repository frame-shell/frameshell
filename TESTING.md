# Testing frameshell

A checklist for trying frameshell on CachyOS. The parts that have never run on Linux come
first. Tick what works; for what does not, note the step, what happened and the output of
the command next to it.

## Before you start

```bash
cd ~/frameshell && git pull
frame update            # new packages, links, theme files
frame status            # everything linked? anything missing?
```

Then log out and in again: idle lock, wallpapers and the clipboard history now start from
the shell and from Hyprland's start.

Where to look when something is off:

| What | Where |
|---|---|
| Quickshell (bar, launcher, lockscreen, …) | `pkill -x qs; qs` in Ghostty shows its output live |
| Hyprland config errors | the red bar at the top, or `hyprctl configerrors` |
| system and login | `journalctl -b -p warning`, the login screen: `journalctl -b -t frame-greeter -u greetd` |

Keep a text console in mind (Ctrl+Alt+F3): it always lets you log in and undo things.

## 1. Lockscreen and idle (no hypridle any more)

- [ ] Super+L locks, the password unlocks
- [ ] Preview then a real lock: `qs ipc call lock preview 8`, type the password, press
      Super+L within the 8 seconds; the real lock must stay until you type the password again
- [ ] Idle lock: set `idleLockMinutes: 1` and `idleScreenOffMinutes: 2` in
      `~/.config/quickshell/config/Config.qml`, wait; it locks after one minute, the screens
      go off after two, a key brings them back (set the values back afterwards)
- [ ] Stay awake in the control center: no idle lock while it is on
- [ ] `loginctl lock-session` locks
- [ ] Sleep: `: suspend` in the launcher (or `systemctl suspend`), wake up; the lockscreen is
      there right away, no flash of the desktop
      - while it runs, `systemd-inhibit --list` shows a delay lock by frameshell
      - nothing locks before sleep? `gdbus monitor --system --dest org.freedesktop.login1`
        must print `PrepareForSleep (true,)` when you suspend
- [ ] `hypridle` is not running any more (`pgrep -a hypridle` prints nothing); if your own
      `hyprland.lua` starts it, remove that line

## 2. Wallpapers (still pictures without swaybg)

- [ ] After login the picture you picked is there (`hyprctl layers` lists `qs-wallpaper`)
- [ ] Super+W, pick another picture: it fades in, no black gap
- [ ] A video wallpaper plays and is not covered by a picture; switching video → picture
      → video works
- [ ] A screen with nothing set shows the theme's background color
- [ ] Lock and unlock: the video or Wallpaper Engine scene runs again afterwards
- [ ] `pgrep -a swaybg` prints nothing

## 3. Clipboard history (frame-clip instead of cliphist)

- [ ] `pgrep -af "wl-paste --watch"` shows `frame-clip store`
- [ ] Copy some text, then a picture (a screenshot); Super+V lists both, the picture with a
      preview
- [ ] Enter copies an entry back (paste it somewhere), Shift+Enter deletes it
- [ ] Copy the same text twice: it shows once, at the top
- [ ] A copy from a password manager (KeePassXC, Bitwarden) does not show up
- [ ] Files: `ls ~/.cache/frameshell/clipboard`, at most 100

## 4. Launcher

- [ ] `# heart`, Shift+Enter: the emoji lands in a browser text field and in Ghostty
- [ ] `/ readme` finds files in your home, not in `.cache` or `node_modules`
- [ ] `t 1m test`: after a minute a notification with sound that stays until snooze or done
- [ ] `a test <in two minutes, e.g. 14:05>`: same for alarms
- [ ] Updates: a minute after login `↑ N` shows in the bar if there are updates; a click
      opens Ghostty with the update; afterwards the number is gone or smaller
- [ ] `s`, `d`, `c`, `;`, `?`, `ssh` still do what docs/shell.md says

## 5. Game mode

- [ ] Start a Steam game: after a few seconds "game mode on", animations and blur off,
      popups quiet, the wallpaper paused
      - nothing happens? `hyprctl clients | grep class` while the game runs; a Steam game
        shows `steam_app_<number>`, other games go into `gameClasses` in Config.qml
- [ ] Quit the game: "game mode off", everything as before
- [ ] With `goxlrGameProfile` set: the GoXLR loads that profile and the old one afterwards
      (never tried on a real GoXLR)

## 6. Screen recording

- [ ] Super+Shift+R, drag a region: the picker is red, then `● rec 0:01` counts in the bar
- [ ] Super+Shift+R again (or a click on `● rec`): "recording saved", the file in
      `~/Videos/recordings` (or your XDG videos folder) plays
- [ ] "copy" in the notification, then paste in Discord: the video is attached
- [ ] With two channels on in the audio panel: next to the video a `.tracks` folder with one
      `.flac` per channel and `tracks.json` (`ls ~/Videos/recordings/*.tracks`)
- [ ] "edit" in the notification (needs `sudo pacman -S qt6-multimedia-ffmpeg`): the editor
      window shows the video and one waveform row per channel; space plays with sound
- [ ] `c` at two places, click the middle piece, `del`: it is gone and playback jumps over it
- [ ] `b`, drag the box over something and play: it is blurred; "pixelate" turns it into blocks
- [ ] Drag a picture from Dolphin onto the preview, move it, pull its corner
- [ ] Mute a channel, "export": `<name>-edit.mp4` plays with the cuts, blur and picture and
      without the muted channel. If not: the error in the inspector, or `qs log | grep -i editor`
- [ ] A channel that is off: drag "sync" until the mic matches the picture
- [ ] Screenshot, "edit" in the notification: the picture editor; `b`, drag the box over a
      name, `c` and pull a corner, Ctrl+S: `<name>-edit.png` is blurred and cropped
- [ ] Super+G: screenshots and recordings in one grid, videos with a thumbnail and their length
- [ ] Ctrl+click three, "delete 3", "yes, delete": gone from the grid, in the trash with their
      `.tracks` folders (Dolphin: trash:/)
- [ ] Drop a folder with pictures on the media window: they show up; × under the grid takes it out
- [ ] Dolphin, right click a video: "Open with → frameshell editor"

## 7. GTK apps

- [ ] `frame install gtk` (part of the core setup on a new install)
- [ ] pavucontrol, a file dialog (Zen → save a page) or Nautilus: dark, the theme's colors,
      square corners, JetBrains Mono
- [ ] `gsettings get org.gnome.desktop.interface color-scheme` says `'prefer-dark'`
- [ ] `frame theme set matcha`, restart the app: green

## 8. Boot splash and console colors

- [ ] `frame boot`: it says whether the plymouth hook and `splash` are there, rebuilds the
      initramfs without errors
- [ ] Reboot: the splash is a frame with "frameshell", a progress line, in the theme
- [ ] With a LUKS disk: the password prompt is in that frame
- [ ] Ctrl+Alt+F3: the console has the theme's colors; `systemctl status frameshell-vtrgb`
      is green
- Back: `frame boot remove`

## 9. Login screen

- [ ] `frame login`, then `frame status` says "Login screen: frameshell greeter"
- [ ] Try it without a reboot: Ctrl+Alt+F3, log in, `sudo systemctl restart greetd`
- [ ] The frameshell login shows, the password logs you in to Hyprland
- [ ] A wrong password says so, the right one works afterwards
- Black screen or the old login? `journalctl -b -t frame-greeter -u greetd`, and
  `frame login remove` brings the distro's greeter back

## 10. Steam

- [ ] `frame install steam`, start Steam: the Frameshell theme is on (Steam → Millennium)
- [ ] A friend message or a friend coming online: the popup comes from the shell, not
      from Steam
- [ ] An achievement or a finished download shows as a shell notification

## 11. Canvas layout (only with `frame layout canvas`)

- [ ] Super+Ctrl+arrows moves the view, the minimap in the bar follows
- [ ] Super+wheel down: the overview of every monitor; a click there goes to that spot
- [ ] Two monitors: a click on the minimap of the second screen moves that screen, not
      the first
- [ ] Super+Ctrl+F: fullscreen on and off on the right screen
- [ ] `frame layout tiling`: dialogs come back on screen, big windows tile again

## 12. The frame command

- [ ] `frame theme set` without a name: the menu, ↑↓, typing `sa` jumps to sakura, Esc
      cancels
- [ ] Tab completion in a new fish: `frame th<Tab>`, `frame theme set <Tab>`
- [ ] `frame clean -n` goes through every item with its size and deletes nothing, then
      `frame clean` for real; keep the packages you use yourself (fd, for example)
- [ ] The Vesktop build: after `frame update vencord`, `~/.local/share/frameshell/vencord`
      has no `node_modules`, Vesktop still has ShellBridge (a DM shows as a shell popup)

## 13. Zen

- [ ] Zen opens the frameshell start page (clock, search); `yt lofi` in it searches
      YouTube
