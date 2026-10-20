# Tab completion for frame (frameshell) in bash. Linked to
# ~/.local/share/bash-completion/completions/frame by `frame install` and `frame update`
# (needs the bash-completion package); the lists come from `frame __complete`.

_frame() {
    local cur=${COMP_WORDS[COMP_CWORD]} prev=${COMP_WORDS[COMP_CWORD - 1]} cmd=${COMP_WORDS[1]:-} words=""

    if [[ $cur == -* ]]; then
        words="-n --dry-run -y --yes"
    elif ((COMP_CWORD == 1)); then
        words=$(frame __complete commands 2>/dev/null)
    else
        case $cmd in
            install | update | backup) words=$(frame __complete packages 2>/dev/null) ;;
            remove) words=$(frame __complete installed 2>/dev/null) ;;
            restore) words="latest $(frame __complete backups 2>/dev/null)" ;;
            theme)
                if ((COMP_CWORD == 2)); then
                    words="list set check $(frame __complete themes 2>/dev/null)"
                elif [[ $prev == set || $prev == use || $prev == pick ]]; then
                    words=$(frame __complete themes 2>/dev/null)
                fi
                ;;
            grub | boot | login) words="install remove" ;;
            layout) words="tiling canvas" ;;
            spotify) words="login logout status" ;;
            wallpaper)
                if ((COMP_CWORD == 2)); then
                    words="list set option backend apply pause resume stop"
                elif [[ $prev == backend ]]; then
                    words="both mpv image"
                elif [[ $prev == set ]]; then
                    mapfile -t COMPREPLY < <(compgen -f -- "$cur")
                    return
                fi
                ;;
        esac
    fi
    mapfile -t COMPREPLY < <(compgen -W "$words" -- "$cur")
}
complete -F _frame frame
