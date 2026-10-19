# Roxy Dark – Syntaxfarben für fish und Starship-Prompt
# Liegt in conf.d, damit die config.fish von CachyOS unangetastet bleibt.

status is-interactive; or return

set -g fish_color_normal dce6ff
set -g fish_color_command 8fb0f0
set -g fish_color_keyword b394f5
set -g fish_color_param dce6ff
set -g fish_color_option 8fb0f0
set -g fish_color_quote 6ee0b6
set -g fish_color_redirection 5ccfe6
set -g fish_color_end 7a89b3
set -g fish_color_operator 4a7fe0
set -g fish_color_escape 5ccfe6
set -g fish_color_error ff6b8a
set -g fish_color_comment 56658f
set -g fish_color_autosuggestion 56658f
set -g fish_color_valid_path --underline
set -g fish_color_cancel ff6b8a
set -g fish_color_search_match --background=1a2447
set -g fish_color_selection --background=1a2447

set -g fish_pager_color_prefix 4a7fe0 --bold
set -g fish_pager_color_completion dce6ff
set -g fish_pager_color_description 7a89b3
set -g fish_pager_color_progress 7a89b3
set -g fish_pager_color_selected_background --background=1a2447

if type -q starship
    starship init fish | source
end
