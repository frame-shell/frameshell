#!/usr/bin/env bash
# demo/preview.sh – records a tour of frameshell as an mp4.
#
# Plays through the desktop on one monitor while wf-recorder films it: launcher, terminal,
# the themed apps (Zen, Zed, Dolphin, Discord) laid out on the canvas with glides between
# them, the overview, control center, a notification, the hotkey sheet, a wallpaper switch,
# the screenshot tool and the lockscreen (its preview mode, nothing gets locked). Spotify keeps playing; its sink is recorded as the soundtrack.
#
#   demo/preview.sh [out.mp4]        record to ~/Videos/frameshell-preview-<date>.mp4
#   NO_RECORD=1 demo/preview.sh      only play the tour (to check timing)
#   MON=HDMI-A-1 demo/preview.sh     another monitor
#
# Every window that is on the monitor before the tour is parked on a special workspace
# and comes back afterwards; Zen, Zed and Vesktop are borrowed if they run, otherwise
# started. Needs wf-recorder (VAAPI), wtype, jq, grim is not needed.
set -euo pipefail

MON=${MON:-DP-2}
OUT=${1:-$HOME/Videos/frameshell-preview-$(date +%Y%m%d-%H%M%S).mp4}
RECORD=1
[[ ${NO_RECORD:-0} == 1 ]] && RECORD=0
REC=$(command -v wf-recorder || true)
[[ -n $REC ]] || REC="$HOME/.local/bin/wf-recorder"
WORKSHOP="$HOME/.local/share/Steam/steamapps/workshop/content/431960"
STATE="${XDG_STATE_HOME:-$HOME/.local/state}/frameshell/canvas"
# A second wallpaper for the switch scene (Mushoku Tensei video); the one set before comes back
DEMO_WALLPAPER=${DEMO_WALLPAPER:-$WORKSHOP/2435955045}

# ── Helpers ───────────────────────────────────────────────────

say() { printf '  %s\n' "$*" >&2; }
lua() { hyprctl eval "$1" >/dev/null; }
ipc() { qs ipc call "$@" >/dev/null; }
cursor() { hyprctl dispatch "hl.dsp.cursor.move({ x = $1, y = $2 })" >/dev/null; }
# Typing like a person: 70 ms between keys
type_text() { wtype -d "${2:-70}" -- "$1"; }
key() { wtype -k "$1"; }
clients() { hyprctl clients -j; }
geom() { clients | jq -r --arg a "$1" '.[] | select(.address==$a) | "\(.at[0]) \(.at[1]) \(.size[0]) \(.size[1]) \(.workspace.id)"'; }
addr_of_class() { clients | jq -r --arg c "$1" '.[] | select(.class==$c) | .address' | head -n 1; }
# Window address of the first class in the list that is open
first_open() { local c a; for c in "$@"; do a=$(addr_of_class "$c"); [[ -n $a ]] && { echo "$a"; return 0; }; done; return 1; }

# Waits for a window of that class (a regex) that was not there before:
# wait_new "<addresses before>" "<class>". Other things may open windows meanwhile.
wait_new() {
    local before=" $1 " class=$2 i a
    for ((i = 0; i < 150; i++)); do
        for a in $(clients | jq -r --arg c "$class" '.[] | select(.class | test($c; "i")) | .address'); do
            [[ $before == *" $a "* ]] || { echo "$a"; return 0; }
        done
        sleep 0.1
    done
    return 1
}

# Monitor in layout coordinates and the camera of its workspace at the start. A point
# (sx, sy) on the screen as it is now has the global canvas coordinate G(sx, sy); the
# windows are laid out and the view glides in those coordinates, so a later camera does
# not matter.
# read fails on empty input, which set -e would turn into a silent exit
read -r MX MY MW MH WS < <(hyprctl monitors -j | jq -r --arg m "$MON" '.[] | select(.name==$m) | "\(.x) \(.y) \(.width / .scale | floor) \(.height / .scale | floor) \(.activeWorkspace.id)"') || true
[[ -n ${WS:-} ]] || { echo "monitor $MON not found" >&2; exit 1; }
read -r CAMX CAMY < <(awk -v id="$WS" '$1 == id { print $2, $3; found = 1 } END { if (!found) print 0, 0 }' "$STATE" 2>/dev/null || echo "0 0")
gx() { echo $((MX + CAMX + $1)); }
gy() { echo $((MY + CAMY + $1)); }

place() { lua "frame_canvas.move_to('$1', $(gx "$2"), $(gy "$3"))"; }
size() { lua "frame_canvas.resize_to('$1', $2, $3)"; }
# Glide so that screen point (sx, sy) of the start layout is in the middle
glide() { lua "frame_canvas.look_at($(gx "$1"), $(gy "$2"))"; }
focus() { hyprctl dispatch "hl.dsp.focus({ window = 'address:$1' })" >/dev/null; }
to_stash() { hyprctl dispatch "hl.dsp.window.move({ workspace = 'special:preview', follow = false, window = 'address:$1' })" >/dev/null; }
# Moving a window onto a special workspace opens that workspace on the monitor (blur over
# everything); this closes it again
close_special() {
    local line name x y w h cx cy
    read -r cx cy < <(hyprctl cursorpos | tr -d ',')
    while read -r name x y w h; do
        # toggle_special acts on the focused monitor, so the cursor goes there first
        cursor $((x + w / 2)) $((y + h / 2))
        hyprctl dispatch "hl.dsp.workspace.toggle_special({ name = 'preview' })" >/dev/null
    done < <(hyprctl monitors -j | jq -r '.[] | select(.specialWorkspace.name == "special:preview") | "\(.name) \(.x) \(.y) \(.width) \(.height)"')
    cursor "$cx" "$cy"
}
# Back from the parking workspace; the canvas API only sees windows on a visible workspace
unpark() { hyprctl dispatch "hl.dsp.window.move({ workspace = '$WS', follow = false, window = 'address:$1' })" >/dev/null; }
close_win() { hyprctl dispatch "hl.dsp.window.close({ window = 'address:$1' })" >/dev/null; }

# ── Stage ─────────────────────────────────────────────────────

# Spots on the start screen; the windows are 1408x936 like new windows are
WIN_W=1408 WIN_H=936
TX=$(((MW - WIN_W) / 2)) TY=$(((MH - WIN_H) / 2 - 40))   # terminal: middle
ZX=$((MW + 200)) ZY=$TY                                 # Zen: right of the screen
EX=$((-WIN_W - 300)) EY=$TY                             # Zed: left
DX=$TX DY=$((MH + 240))                                 # Dolphin: below
VX=$ZX VY=$DY                                           # Discord: bottom right
center_of() { echo "$(($1 + WIN_W / 2)) $(($2 + WIN_H / 2))"; }

declare -a PARKED=() PARKED_GEOM=()
declare -a BORROWED=() BORROWED_GEOM=()
declare -a OPENED=()
WALLPAPER_BEFORE=""
MATURE_BEFORE=""
RECPID=""
RAW=""

cleanup() {
    set +e
    say "putting things back"
    [[ -n $RECPID ]] && kill -INT "$RECPID" 2>/dev/null
    ipc launcher close; ipc overview close; ipc controlcenter close; ipc hotkeys close; ipc wallpapers close; ipc screenshot close
    [[ -n $WALLPAPER_BEFORE && -e $WALLPAPER_BEFORE ]] && "$HOME/.local/bin/frame-wallpaper" set "$WALLPAPER_BEFORE" >/dev/null 2>&1
    [[ -n $MATURE_BEFORE ]] && "$HOME/.local/bin/frame-wallpaper" option mature "$MATURE_BEFORE" >/dev/null 2>&1
    local a
    for a in "${OPENED[@]}"; do close_win "$a"; done
    # The camera back where it was, then every window to its old place
    read -r cx cy < <(awk -v id="$WS" '$1 == id { print $2, $3; found = 1 } END { if (!found) print 0, 0 }' "$STATE" 2>/dev/null || echo "0 0")
    lua "frame_canvas.pan($((CAMX - cx)), $((CAMY - cy)))"
    local i g
    for i in "${!BORROWED[@]}"; do
        read -r x y w h ws <<<"${BORROWED_GEOM[$i]}"
        hyprctl dispatch "hl.dsp.window.move({ workspace = '$ws', follow = false, window = 'address:${BORROWED[$i]}' })" >/dev/null
        hyprctl dispatch "hl.dsp.window.move({ x = $x, y = $y, window = 'address:${BORROWED[$i]}' })" >/dev/null
    done
    for i in "${!PARKED[@]}"; do
        read -r x y w h ws <<<"${PARKED_GEOM[$i]}"
        hyprctl dispatch "hl.dsp.window.move({ workspace = '$ws', follow = false, window = 'address:${PARKED[$i]}' })" >/dev/null
        hyprctl dispatch "hl.dsp.window.move({ x = $x, y = $y, window = 'address:${PARKED[$i]}' })" >/dev/null
    done
    close_special
    [[ -n $RECPID ]] && wait "$RECPID" 2>/dev/null
    if ((RECORD)) && [[ -f $OUT ]]; then
        printf '\n  %s\n' "$OUT" >&2
    elif ((RECORD)) && [[ -f ${RAW:-} ]]; then
        printf '\n  raw recording: %s\n' "$RAW" >&2
    fi
}
trap cleanup EXIT

# Soundtrack: the sink Spotify plays into, else the default sink
audio_source() {
    local sink
    sink=$(pactl list sink-inputs 2>/dev/null | awk '/^Sink Input #/ { s = "" } /^\tSink: / { s = $2 } /application.name = "Spotify"/ { print s; exit }')
    if [[ -n $sink ]]; then
        pactl list short sinks | awk -v id="$sink" '$1 == id { print $2 ".monitor" }'
    else
        echo "$(pactl get-default-sink).monitor"
    fi
}

say "preparing the stage on $MON (workspace $WS, camera $CAMX $CAMY)"
WALLPAPER_BEFORE=$("$HOME/.local/bin/frame-wallpaper" state | jq -r --arg m "$MON" '.screens[$m].path // .screens["*"].path // ""')
# Workshop wallpapers rated Mature stay out of the picker while the camera runs
MATURE_BEFORE=$("$HOME/.local/bin/frame-wallpaper" state | jq -r 'if .mature == false then false else true end')
"$HOME/.local/bin/frame-wallpaper" option mature false >/dev/null
ipc launcher close; ipc overview close; ipc controlcenter close; ipc wallpapers close; ipc hotkeys close

# Borrow Zen, Zed and Vesktop if they run; anything else on the monitor is parked
ZEN=$(first_open zen || true)
ZED=$(first_open dev.zed.Zed || true)
VESKTOP=$(first_open vesktop || true)
for a in $ZEN $ZED $VESKTOP; do
    BORROWED+=("$a")
    BORROWED_GEOM+=("$(geom "$a")")
done
while read -r a; do
    [[ " ${BORROWED[*]} " == *" $a "* ]] && continue
    PARKED+=("$a")
    PARKED_GEOM+=("$(geom "$a")")
    to_stash "$a"
done < <(clients | jq -r --argjson ws "$WS" '.[] | select(.workspace.id == $ws) | .address')
close_special
say "parked ${#PARKED[@]} windows, borrowed ${#BORROWED[@]}"

# Spotify plays on
busctl --user call org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player Play >/dev/null 2>&1 || true

# Missing apps are started now so their first paint is not in the film.
# open_app <class regex> <command…> prints the new window's address
open_app() {
    local class=$1 before a
    shift
    before=$(clients | jq -r '.[].address' | tr '\n' ' ')
    "$@" >/dev/null 2>&1 &
    disown
    a=$(wait_new "$before" "$class") || { say "no window from: $*"; return 1; }
    echo "$a"
}
ZEN_URL=${ZEN_URL:-https://hyprland.org}
if [[ -z $ZEN ]]; then ZEN=$(open_app '^zen$' zen-browser "$ZEN_URL"); OPENED+=("$ZEN"); else zen-browser "$ZEN_URL" >/dev/null 2>&1 & disown; fi
if [[ -z $ZED ]]; then ZED=$(open_app 'zed' zeditor "$HOME/frameshell"); OPENED+=("$ZED"); fi
if [[ -z $VESKTOP ]]; then VESKTOP=$(open_app 'vesktop' vesktop); OPENED+=("$VESKTOP"); fi
# Park the borrowed ones too until their scene
for a in $ZEN $ZED $VESKTOP; do to_stash "$a"; done
close_special
sleep 0.5

# ── Film ──────────────────────────────────────────────────────

if ((RECORD)); then
    mkdir -p "$(dirname "$OUT")"
    src=$(audio_source)
    say "recording $MON with audio from $src"
    RAW="${OUT%.mp4}-raw.mp4"
    "$REC" -o "$MON" -c h264_vaapi -d /dev/dri/renderD128 -r 60 -p qp=20 --audio="$src" -f "$RAW" >/dev/null 2>&1 &
    RECPID=$!
    sleep 1.5
fi

# 1 · the empty desk
close_special
cursor $((MX + MW / 2)) $((MY + MH / 2))
sleep 2

# 2 · launcher: apps, calculator, Spotify, Discord, emoji
ipc launcher open; sleep 0.9
type_text "zen"; sleep 1.8
ipc launcher close; sleep 0.5
ipc launcher mode "= 2560 * 1440 / 1000"; sleep 2.2
ipc launcher close; sleep 0.4
ipc launcher mode "s "; sleep 2.4
ipc launcher close; sleep 0.4
ipc launcher mode "d "; sleep 2.4
ipc launcher close; sleep 0.4
ipc launcher mode "# heart"; sleep 2
ipc launcher close; sleep 0.8

# 3 · terminal in the middle: fish greets with fastfetch, then the theme list
# fish explicitly: this script may run from another shell, and Ghostty takes $SHELL
TERM_ADDR=$(open_app 'ghostty' env SHELL=/bin/fish ghostty)
OPENED+=("$TERM_ADDR")
size "$TERM_ADDR" $WIN_W $WIN_H
place "$TERM_ADDR" $TX $TY
focus "$TERM_ADDR"
sleep 2.4
type_text "frame theme list" 60; key Return
sleep 3.2

# 4 · the other apps around it on the canvas, then glides
DOLPHIN=$(open_app 'dolphin' dolphin "$HOME")
OPENED+=("$DOLPHIN")
for pair in "$ZEN $ZX $ZY" "$ZED $EX $EY" "$DOLPHIN $DX $DY" "$VESKTOP $VX $VY"; do
    read -r a x y <<<"$pair"
    unpark "$a"
    size "$a" $WIN_W $WIN_H
    place "$a" "$x" "$y"
done
sleep 1.5
for pair in "$ZX $ZY" "$VX $VY" "$DX $DY" "$EX $EY"; do
    read -r x y <<<"$pair"
    read -r cx cy <<<"$(center_of "$x" "$y")"
    glide "$cx" "$cy"
    sleep 2.6
done
read -r cx cy <<<"$(center_of "$TX" "$TY")"
glide "$cx" "$cy"
sleep 1.6

# 5 · overview: everything on the canvas at once
ipc overview open; sleep 3.6
ipc overview close; sleep 1.2

# 6 · control center, a notification, the hotkey sheet
ipc controlcenter open; sleep 2.8
ipc controlcenter close; sleep 0.6
notify-send -a frameshell "frameshell" "a desktop for Hyprland: shell, launcher, canvas, themes" || true
sleep 2.8
ipc hotkeys open; sleep 3.2
ipc hotkeys close; sleep 0.8

# 7 · wallpapers: the picker, then a switch with its fade
ipc wallpapers open; sleep 1.4
key Right; sleep 0.5; key Right; sleep 0.8
ipc wallpapers close; sleep 0.6
[[ -e $DEMO_WALLPAPER ]] && "$HOME/.local/bin/frame-wallpaper" set "$DEMO_WALLPAPER" >/dev/null
sleep 3.4

# 8 · screenshot tool: the frozen screen, then back
ipc screenshot region; sleep 2.2
ipc screenshot close; sleep 1

# 9 · lockscreen: the preview locks nothing, a few typed dots, then the unlock animation
ipc lock preview 5; sleep 2.6
type_text "frameshell" 90; sleep 3.6

# 10 · out: the terminal in the middle, hold
glide "$cx" "$cy"
sleep 2.2

if [[ -n $RECPID ]]; then
    kill -INT "$RECPID"
    wait "$RECPID" || true
    RECPID=""
    # The raw VAAPI file is huge; a slower x264 pass makes a shareable one, the sound
    # evened out to a normal level
    say "encoding $OUT"
    ffmpeg -loglevel error -y -i "$RAW" -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart \
        -af loudnorm=I=-16:TP=-1.5:LRA=11 -c:a aac -b:a 160k "$OUT" && rm -f "$RAW"
fi
say "done"
