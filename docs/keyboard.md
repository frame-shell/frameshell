# AULA F75 on Linux

`frame-keyboard` sets the F75's lighting and Fn keys without the Windows app. It is not part
of `frame` or the shell yet; the protocol below has to prove itself on the real board first.
Everything here was worked out from the vendor software and other people's notes.
**Nothing has been sent to a keyboard yet.**

Marks used below:

- **app**: read in the decompiled vendor app (`OemDrv.exe` from `AULA_F75_Setup_v2.0_20240509.zip`),
  with the function address
- **ini**: from the app's device files (`Dev/kb/1/KB.ini` = F75, `wired/` = F75 Wired, `F75KR/`)
- **L65 hw**: verified on hardware by [womier-l65-linux](https://github.com/deepan-alve/womier-l65-linux)
  (the Womier L65 is the same platform and uses the same vendor class, `CDevG5KB`)
- **OpenRGB**: OpenRGB's Sinowealth controller has an "AULA F75" entry for 258a:010c (MR !3062)
- **guess**: plausible, not confirmed anywhere

## Install and first test

```bash
sudo install -m 644 ~/frameshell/keyboard/udev/70-frameshell-aula-f75.rules /etc/udev/rules.d/
sudo udevadm control --reload-rules && sudo udevadm trigger   # then replug the keyboard
ln -s ~/frameshell/keyboard/.local/bin/frame-keyboard ~/.local/bin/
```

Test in this order and stop at the first surprise. Steps 1–3 only read, step 4 only touches
RAM, and from step 5 on the changes go to flash. Each of those writes saves the old block first.

1. `frame-keyboard list`: reads sysfs only. One line should end in `<- configuration interface`.
2. `frame-keyboard info --live`: the device id must be `03 00 00 00 00 cd`, and the config must
   end in `5a a5`. The Fn layer should match the factory list further down.
3. `frame-keyboard backup --live`: saves every block to `~/.local/state/frameshell/keyboard/`.
4. `frame-keyboard highlight --live q w e --seconds 3`: a live frame, nothing is saved. The old
   effect should come back afterwards; if not, run `frame-keyboard stop --live` or replug.
5. `frame-keyboard effect breathing -b 2 -s 2 --live`, then compare `info --live` with what you see.
6. `frame-keyboard fn f12=volup --live` (what that key does already), then something new.
7. `frame-keyboard colors --all off w=red a=red s=red d=red --live`, then `style split --live`.

Without `--live`, every command prints the packets it would send and stops there.

## Hardware

| | |
|---|---|
| Keyboard, USB cable | `258a:010c` (SinoWealth); MCU SH68F90A, labelled BYK916 (ini comment "K916", sinowisp) |
| 2.4 GHz dongle | `3554:fa09` ("Compx" receiver, Beken BK3632; app class `CDev3632`) |
| Bluetooth | no settings path in the app; for updates the app asks to switch to USB |
| Firmware image | **not in the zip**. The app downloads updates from its server ("Download FW", `cfgUPD`) |
| Model in the app | `Fw=24` (0x18) in KB.ini picks the class `CDevG5KB` (app 0x0040b690) |

The setup exe is Inno Setup 5.3.3 (unicode). Inside are `OemDrv.exe` (2.6 MB, 32-bit MFC C++,
statically linked, no .NET), `Cfg.ini`, `Dev/kb/{1,wired,F75KR}/KB.ini`, key images, language
XMLs and the "Cartoon"/"ET" animation files. The animation files are scripts for animations the
app draws on the PC and streams to the keyboard as live frames; music mode works the same way.
The app's internal name is `BYCOMBO4`.

## The connection (app 0x0048afa0, CDevG5KB::FindHIDDevice)

The app opens the HID collection with usage page `0xFF00`, usage `1` and a 520-byte (`0x208`)
feature report: interface 1 of the keyboard (**app**, **OpenRGB**). On Linux that is one of the
`hidraw` nodes of 258a:010c. `frame-keyboard list` finds it by usage page 0xFF00 and report ID 6
in the report descriptor (**guess**: the exact descriptor bytes are untested).

Before it uses a board, the app reads the board's id with command `0x82` and compares it with
`Psd` from KB.ini (app 0x0048c3c0):

| KB.ini | Psd | Name |
|---|---|---|
| `1` | `03 00 00 00 00 cd` | AULA F75 |
| `wired` | `03 00 00 00 00 e1` | AULA F75 Wired |
| `F75KR` | `03 00 00 00 01 91` | AULA F75 KR |

OpenRGB reads the model byte at offset 13 of the reply and knows `0xCD` as the AULA F75
(**OpenRGB**). `frame-keyboard` writes nothing unless the id is one of these three.

## Packet (report 6, 520 bytes)

```
06 CMD INDEX 00 PACKETS PACKET SIZE_LO SIZE_HI  <data, up to 512 bytes, zero padded>
```

- Report ID: `((nFw != 0x18) - 1 & 0xfd) + 9` = 6 for the F75 (**app**, in every AccessData function).
- Write: one `HidD_SetFeature`. Read: `SetFeature` with `CMD | 0x80` and no data, then
  `HidD_GetFeature`; the data comes back from byte 8 (**app** 0x0048b350, 0x0048b5d0).
- Longer data goes in 512-byte packets; `PACKETS` is the total, `PACKET` the number (**app**).
- No checksum on the cable (**app**). The app waits 20 ms before each SetFeature and GetFeature
  and tries 3 times, 70 ms apart (**app**).

| CMD | INDEX | Size | Content | Evidence |
|---|---|---|---|---|
| `03` / `83` | layer 0–3 | 512 | key layer: 128 × 4 bytes | app 0x0048b590, 0x0048b5d0, 0x0048da30 |
| `04` / `84` | 0 | 128 | lighting and system config | app 0x0048ba30, 0x0048ba80 |
| `05` / `85` | 0 | var. | macros (not used by the tool) | app 0x0048b7e0 |
| `06` / `86` | color group (0) | 384 | per-key colors ("Self-define") | app 0x0048bc80, 0x0048bce0 |
| `08` | 0 / 2 | 378 / 3 | live frame / stop | app 0x0048c550, music code 0x0047f1c0 |
| `0A` / `8A` | 0 | 512 | color table | app 0x0048c0d0, 0x0048c120 |
| `0B` | 0 | var. | screen parameters (not on the F75) | app 0x0048c370 |
| `0E` | 0 | var. | second live channel (light bar, not on the F75) | app 0x0048c580 |
| `11` | 0 | 1 | **device reset**, never sent by the tool | app 0x0048c320 |
| `82` | 1 | 6 | device id ("Psd") | app 0x0048c3c0 |
| `88` | 0 | var. | live data read-back | app 0x0048bef0 |

Report 5 (6 bytes) is the SinoWealth ISP/bootloader channel: `05 75 …` jumps into the
bootloader (**L65 hw**, sinowisp). Neither the app's normal paths nor this tool touch it.

## Config block (128 bytes, cmd 04)

The app reads the block, checks `5A A5` at 0x7E, changes its bytes and writes the whole block
back (CDevG5KB::ApplySetting 0x0048da30, FUN_0048d680). The tool works the same way.

| Offset | Meaning | Evidence |
|---|---|---|
| 0x03 | debounce stage − 1 | app; L65 hw |
| 0x09 | 1 when the selected effect is Self-define (`GaoshouIndex=18`, 0-based) | app, ini |
| 0x0A | firmware number of the effect (first column of `LedOpt`) | app (ini parser 0x00410a70) |
| 0x0B | `StartGp` (default 0x20) + selected color group | app |
| 0x12–0x15 | side strip (the F75 has none) | app; L65 hw |
| 0x16 | tap sensitivity, 0 = off | app; L65 hw |
| 0x18 | wireless sleep in half minutes (`SleepHW`: 2, 3, 4, 6, 8, 10, 20, 30, 40) | app, ini |
| 0x1A | knob mode (`WheelMode`) | app |
| 0x38, 0x39 | always `FF FF` | app |
| 0x38 + 2n | brightness of the effect at LedOpt position n | app (loop in FUN_0048d680) |
| 0x39 + 2n | speed << 4 \| color slot of the effect at position n | app |
| 0x7E–0x7F | `5A A5` | app checks it after every read |

Color slots 0–6 pick an RGB from the effect's row in the color table; 7 is "ColorFull"
(multicolor, `RandomVal`) (**app**). Brightness and speed go through `LightHW`/`SpeedHW` in
KB.ini. The F75 ini lists **ten** brightness levels (0–9) and five speeds (0–4), while the L65
used brightness 0–4. Whether the ten levels really are ten steps on the F75 is a **guess**.

### Effects (KB.ini `LedOpt`, columns "hw effect speed light direct random color")

| Pos n | Firmware | Name (tool) | Speed | Color | Vendor name |
|---|---|---|---|---|---|
| 1 | 1 | static | – | yes | Fixed_on |
| 2 | 2 | breathing | yes | yes | Respire |
| 3 | 3 | rainbow | yes | – | Rainbow |
| 4 | 4 | flash-away | yes | yes | Flash_away |
| 5 | 5 | raindrops | yes | yes | Raindrops |
| 6 | 6 | rainbow-wheel | yes | yes | Rainbow_wheel |
| 7 | 7 | ripples | yes | yes | Ripples_shining |
| 8 | 8 | stars | yes | yes | Stars_twinkle |
| 9 | 9 | shadow | yes | yes | Shadow_disappear |
| 10 | 10 | snake | yes | yes | Retro_snake |
| 11 | 11 | neon-stream | yes | yes | Neon_stream (factory) |
| 12 | 12 | reaction | yes | yes | Reaction |
| 13 | 13 | sine-wave | yes | yes | Sine_wave |
| 14 | 14 | scanning | yes | yes | Retinue scanning |
| 15 | 15 | windmill | yes | – | Rotating windmill |
| 16 | 16 | waterfall | yes | – | Colorful waterfall |
| 17 | 17 | blossoming | yes | – | Blossoming |
| 18 | 18 | storm | yes | yes | Rotating storm |
| 19 | 21 | self-define | – | – | Self-define (per-key) |
| 20 | 0 | off | – | – | OFF |

Firmware numbers and the speed and color columns are **ini**. The names next to the numbers
come from the L65 (**L65 hw**): its table uses the same numbers, and the F75 ini agrees on which
effects have no color (3, 15, 16, 17). The direction column is 0 for every effect, so **the F75
effects have no direction setting**.

## Color table (512 bytes, cmd 0A)

The table has a 21-byte row per LedOpt position n, at offset `n × 21`. Each row holds 7 RGB slots
in `RGBIndex` order (0,1,2 = R, G, B). Because KB.ini says `CRC=1`, the table is padded to 512
bytes with `5A A5` at 0x1FA (**app** 0x0048da30). So `CRC` is this end mark, **not a checksum**.
`effect … -c #rrggbb` writes the color into slot 0 of the effect's row and selects slot 0.

## Key layers (512 bytes, cmd 03, INDEX = layer)

The layers are 0 base, 1 FN1 (the Fn layer), 2 FN2 and 3 tap. The app writes all four
(`LayerMask=0`; **app** 0x0048da30). `MatrixLen=128` makes each layer 128 × 4 = **512 bytes**.
The L65 has 126 entries (504 bytes), the one real difference between the two boards. With
`CRC=1` the last entry is `00 00 5A A5` (**app** 0x0048d140). The app always rebuilds whole
layers. The tool reads a layer, changes single entries, writes it back and then rewrites the
config block, which is what committed the layers on the L65 (**L65 hw**).

Each entry is 4 bytes, `[type, mods, key2, key1]` (**app** keyinfo_to_hardware_code 0x0048c690).
0x00463150 turns KB.ini's `0xTTMMK2K1` notation into these bytes in this order.

| type | Meaning |
|---|---|
| `00` | keyboard: `key1` HID usage, `key2` second key, `mods` HID modifier bits (01 ctrl, 02 shift, 04 alt, 08 gui, 10–80 the right ones) |
| `02` | consumer usage `key2:key1` (`02 00 00 e9` volume up, `02 00 02 23` browser home) |
| `03` | macro (index into the macro block) |
| `05` | mouse and DPI functions |
| `07` | keyboard functions: `07 00 00 01` Win lock, `05/06/07` channel 1–3, `18/19/1A` modes, `04` and others unknown |
| `08` | lighting: `08 03 01 00` brighter, `08 03 02 00` darker, `08 04 01/02 00` speed, `08 02 00 00` next effect |
| `0D` | the Fn key (`0D 00 00 00`; `0D 01 00 00` = Fn2) |
| `00 00 00 00` | key off ("Disable") |

A modifier on its own is a keyboard entry with key1 = E0–E7. The app's VK→HID table at
0x00607280 maps VK_LSHIFT to E1, and so on.

**Slots** are `column × 6 + row`, the last field of each `K<n>` line in KB.ini: Esc 0, ` 1,
Tab 2, Caps 3, LShift 4, LCtrl 5, 1 7, Q 8 … Fn 53, knob press 84, Right 89. The full list is
`SLOTS` in `frame-keyboard`. OpenRGB's F75 LED map uses the same numbers (**OpenRGB**). The ini
has no right Alt and no ISO keys (`<>` and `#`), so their slots are unknown.

### Factory Fn layer of the F75 (KB.ini `[FN1]`)

| Key | Entry | Does |
|---|---|---|
| Esc | `07 00 00 04` | keyboard function 4 (probably factory reset; **guess**) |
| F1 / F2 | `02 00 02 23` / `02 00 01 8a` | browser home / mail |
| F3 / F4 | `00 04 00 2b` / `00 08 00 08` | Alt+Tab / Win+E |
| F5 / F6 | `08 03 02 00` / `08 03 01 00` | lighting darker / brighter |
| F7–F12 | `02 00 00 b6/cd/b5/e2/ea/e9` | previous, play, next, mute, vol−, vol+ |
| ` | `07 00 00 08` | keyboard function 8 |
| 1 / 2 / 3 | `07 00 00 05/06/07` | Bluetooth channel 1–3 (**guess** from the L65 notes) |
| Q / W / E | `07 00 00 19/18/1a` | modes; the app's own help text calls Fn+W "Windows mode" |
| Tab | `08 02 00 00` | next effect |
| U / I / O | Print, Scroll Lock, Pause | |
| Delete / End | Insert / Home | |
| G / B | `07 00 00 0a` / `07 00 00 11` | unknown |
| Win | `07 00 00 01` | Win lock |
| ↑ ↓ / ← → | `08 03 01/02 00` / `08 04 02/01 00` | brightness / speed |
| \ / LShift | `08 00 00 00` / `08 00 00 01` | lighting (on/off? **guess**) |
| knob press | `07 00 00 1d` | keyboard function 0x1D |

`frame-keyboard fn --reset <key>` puts these back. The tool never changes the Fn key itself,
and it leaves the knob alone unless `--allow-knob` is given.

## Per-key colors (cmd 06, "Self-define")

The app sends `MatrixLen × 3` = 384 bytes per color group: an R plane, a G plane and a B plane
of 126 bytes each (stride 0x7E, `GameRGBIndex=0,1,2`) plus 6 spare bytes. INDEX is the color
group; the F75 has one (`GaoshouGroupNum=1`) (**app** 0x0048da30). The config then selects
effect 21 with 0x09 = 1. These colors live in flash, so they should not change all the time.

## Live frames (cmd 08)

A frame is 378 bytes, 126 × R, G, B interleaved, INDEX 0, sent 7 ms after the previous packet.
The app's music code (0x0047f1c0) sends size 0x17A, and **OpenRGB** sends the same header,
`06 08 00 00 01 00 7a 01`. To stop, the app sends INDEX 2 with `00 00 00` (**app**; **L65 hw**).
Frames stay in RAM. OpenRGB repeats the frame every second because otherwise the board falls
back to its effect (**OpenRGB**). `frame-keyboard highlight` repeats it every 0.5 s and sends
the stop at the end. That fits the hotkey overlay: start `highlight --live --hold <keys>` when
Super goes down and stop the process when it comes up.

## 2.4 GHz dongle (written down, not implemented)

Class `CDev3632` (app 0x00486260 write, 0x00486500 read, 0x00486e40 send). It uses 20-byte
**output reports** with ID `0x13` on the collection with usage page `0xFF02`, usage 2:

```
13 CMD NPKG IDX (OPER<<4 | LEN) <14 data bytes> SUM
```

`SUM` is the low byte of the sum of bytes 0–18 (**app**: the loop adds 20 bytes while byte 19 is
still 0). Writes use OPER 1, and the dongle acknowledges every packet. On a "crc" or timeout
reply the app retries a few times. The commands (**app**) are `01`/`41` key layer, `02`/`42`
per-key colors (SetGame), `03` macros (OPER 6), `04`/`44` config, `06` reset, `09`/`49` color
table, `0A`/`4A` on-board/battery and `0B` screen. The L65 project found that per-key colors and
live frames do not get through the dongle (**L65 hw**), although the app has the `02` path.
Going wireless is a later step that needs its own testing.

## Left out on purpose

- Firmware: the zip has none, and custom firmware (for example the experimental SMK port for
  the F75) can brick the board. The ISP bootloader (report 5) is off limits.
- Macros, the reset command (`11`) and any write over the dongle.
- `frame` and the shell. Once the steps above work, the next step is a `keyboard` package for
  `frame install` (stow has to skip `udev/`). After that, `frame theme set` can call
  `frame-keyboard style …` and the hotkey overlay can call `highlight --hold`.

## Sources

- Vendor app: `AULA_F75_Setup_v2.0_20240509.zip` → Inno Setup → `app/OemDrv.exe`, decompiled with Ghidra 12.1.4
- [womier-l65-linux](https://github.com/deepan-alve/womier-l65-linux): `docs/L65-protocol.md`, `linux/l65ctl.py`
- OpenRGB, `Controllers/SinowealthController` (AULA F75 = model 0xCD on 258a:010c), MR !3062; dongle draft MR !3027
- [sinowisp](https://github.com/carlossless/sinowealth-kb-tool): Aula F75 = SH68F90A / BYK916
