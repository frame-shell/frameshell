# Themes

Every app gets its colors from one theme file in `themes/`. Switch all of them at once:

```bash
frame theme list         # the themes, the active one marked
frame theme set sakura   # rewrite every color file and reload what can reload
```

| Theme | Colors | primary | bg |
|---|---|---|---|
| `periwinkle` (default) | blue-violet | `#5d6fe8` | `#0b0c1f` |
| `sakura` | pink | `#f06aa8` | `#1a0d17` |
| `matcha` | green | `#5fd39a` | `#0c1410` |
| `ember` | orange | `#f08a3c` | `#170f0a` |
| `lagoon` | teal | `#3fc7d9` | `#08141a` |
| `mono` | black and white; only errors, warnings and success keep a faint tint | `#ededed` | `#0a0a0a` |

All themes share the same roles: `bg`, `surface`, `surface2`, `shadow`, `primary`,
`secondary`, `accent`, `text`, `textDim`, `muted`, `frame`, `danger`, `warn`, `ok`, plus 16
terminal colors (`ansi`) and the fonts. A new theme is one more JSON file with these keys.

`frame install` asks for a theme once. After `frame theme set …`, Quickshell, Zed and
Hyprland's window borders change right away; Spotify gets the theme applied again; new
Ghostty windows and new shells pick it up; Dolphin and Zen need a restart; GRUB needs
`frame grub` (sudo).

## How the files are made

Each app file with colors has a template in `themes/templates/<package>/<path>` with
placeholders like `{{colors.primary}}`, `{{ansi.4}}` or `{{colors.surface2|lighten:8|bare}}`.
`frame theme` fills them in and writes `<package>/<path>`, which Stow links as usual.
Steps can be chained:

| Step | Result for `#5d6fe8` |
|---|---|
| `lighten:N`, `darken:N` | N percent of white or black mixed in |
| `mix:<key>:N` | N percent of another palette color mixed in, e.g. `mix:colors.text:20` |
| `bare` | `5d6fe8` |
| `rgb` | `93,111,232` |
| `argb` | `#ff5d6fe8` |
| `alpha:XX` | `#5d6fe8XX` (XX in hex) |

The written files are git-ignored, so switching themes never shows up as a change in the
repo; `frame install` and `frame update` write them before linking. Edit the template,
never the output. `frame theme check` only reports files that do not match the active theme.

Generated: Quickshell (`config/Theme.qml`), Ghostty, fish syntax colors, Starship, Spotify
(`color.ini`), Vesktop, Hyprland window borders, Zed, Dolphin (KDE color scheme and qt6ct
palette), Zen and GRUB (`theme.txt`; `frame grub` draws the 1px frame images itself).
