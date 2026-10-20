# Tab completion for frame (frameshell) in fish. Linked to ~/.config/fish/completions
# by `frame install` and `frame update`; the lists come from `frame __complete`.

function __frame_list
    frame __complete $argv 2>/dev/null
end

set -l commands install update remove backup restore theme grub boot goxlr login wallpaper spotify layout status clean help

complete -c frame -f
complete -c frame -s n -l dry-run -d "print what would happen, change nothing"
complete -c frame -s y -l yes -d "do not ask for confirmation"

complete -c frame -n "not __fish_seen_subcommand_from $commands" -a install -d "install dependencies and link configs"
complete -c frame -n "not __fish_seen_subcommand_from $commands" -a update -d "pull, back up, relink, re-apply themes"
complete -c frame -n "not __fish_seen_subcommand_from $commands" -a remove -d "unlink configs"
complete -c frame -n "not __fish_seen_subcommand_from $commands" -a backup -d "snapshot configs and app settings"
complete -c frame -n "not __fish_seen_subcommand_from $commands" -a restore -d "list backups or put one back"
complete -c frame -n "not __fish_seen_subcommand_from $commands" -a theme -d "list, set or check the theme"
complete -c frame -n "not __fish_seen_subcommand_from $commands" -a grub -d "theme the GRUB boot menu"
complete -c frame -n "not __fish_seen_subcommand_from $commands" -a boot -d "boot splash and console colors"
complete -c frame -n "not __fish_seen_subcommand_from $commands" -a goxlr -d "GoXLR lights in the theme's colors"
complete -c frame -n "not __fish_seen_subcommand_from $commands" -a login -d "the lockscreen look as the login screen"
complete -c frame -n "not __fish_seen_subcommand_from $commands" -a wallpaper -d "wallpaper backends"
complete -c frame -n "not __fish_seen_subcommand_from $commands" -a spotify -d "Spotify Web API for the launcher"
complete -c frame -n "not __fish_seen_subcommand_from $commands" -a layout -d "tiling or the infinite canvas"
complete -c frame -n "not __fish_seen_subcommand_from $commands" -a status -d "what is linked and what is missing"
complete -c frame -n "not __fish_seen_subcommand_from $commands" -a clean -d "free disk space"
complete -c frame -n "not __fish_seen_subcommand_from $commands" -a help -d "all commands"

complete -c frame -n "__fish_seen_subcommand_from install update backup" -a "(__frame_list packages)"
complete -c frame -n "__fish_seen_subcommand_from remove" -a "(__frame_list installed)"
complete -c frame -n "__fish_seen_subcommand_from restore" -a "latest (__frame_list backups)"

# theme: the actions, and the names (frame theme sakura works too); after set only names
complete -c frame -n "__fish_seen_subcommand_from theme; and not __fish_seen_subcommand_from list ls set use pick check" -a "list set check" -d action
complete -c frame -n "__fish_seen_subcommand_from theme; and not __fish_seen_subcommand_from list ls check" -a "(__frame_list themes)" -d theme

complete -c frame -n "__fish_seen_subcommand_from grub boot login" -a "install remove"
complete -c frame -n "__fish_seen_subcommand_from layout" -a "tiling canvas"
complete -c frame -n "__fish_seen_subcommand_from spotify" -a "login logout status"
complete -c frame -n "__fish_seen_subcommand_from wallpaper; and not __fish_seen_subcommand_from list set option backend apply pause resume stop" -a "list set option backend apply pause resume stop"
complete -c frame -n "__fish_seen_subcommand_from wallpaper; and __fish_seen_subcommand_from backend" -a "both mpv image"
complete -c frame -n "__fish_seen_subcommand_from wallpaper; and __fish_seen_subcommand_from set" -F
