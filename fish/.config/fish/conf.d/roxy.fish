# Periwinkle – fish syntax colors and Starship prompt
# Lives in conf.d so CachyOS's own config.fish stays untouched.

# The roxy command lives in ~/.local/bin (no-op when it is already in PATH)
fish_add_path --global --path ~/.local/bin

status is-interactive; or return

set -g fish_color_normal e1e4ff
set -g fish_color_command 93a4f7
set -g fish_color_keyword a48cf2
set -g fish_color_param e1e4ff
set -g fish_color_option 93a4f7
set -g fish_color_quote 6ee0b6
set -g fish_color_redirection 5ccfe6
set -g fish_color_end 8086b8
set -g fish_color_operator 5d6fe8
set -g fish_color_escape 5ccfe6
set -g fish_color_error ff6b9a
set -g fish_color_comment 545b96
set -g fish_color_autosuggestion 545b96
set -g fish_color_valid_path --underline
set -g fish_color_cancel ff6b9a
set -g fish_color_search_match --background=1e2256
set -g fish_color_selection --background=1e2256

set -g fish_pager_color_prefix 5d6fe8 --bold
set -g fish_pager_color_completion e1e4ff
set -g fish_pager_color_description 8086b8
set -g fish_pager_color_progress 8086b8
set -g fish_pager_color_selected_background --background=1e2256

if type -q starship
    starship init fish | source
end

# Greeting: fastfetch with your logo (~/.config/fastfetch/config.jsonc)
function fish_greeting
    type -q fastfetch; and fastfetch
end
