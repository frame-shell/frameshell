# frameshell – fish setup and Starship prompt; the colors are in frameshell-colors.fish
# Lives in conf.d so CachyOS's own config.fish stays untouched.

# The frame command lives in ~/.local/bin (no-op when it is already in PATH)
fish_add_path --global --path ~/.local/bin

status is-interactive; or return

if type -q starship
    starship init fish | source
end

# Greeting: fastfetch with your logo (~/.config/fastfetch/config.jsonc)
function fish_greeting
    type -q fastfetch; and fastfetch
end
