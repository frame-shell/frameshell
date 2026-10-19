# Spotify in the launcher

Type `s ` in the launcher (Super+Space) to control Spotify and search it. The launcher
reaches Spotify in one of three ways and picks the best one that works:

| Way | Setup | Search | Play / queue | Controls |
|---|---|---|---|---|
| Spicetify extension | none, comes with `frame install spicetify` | yes | yes | yes, with like |
| Web API | your own Spotify app, once (below) | yes | yes, on any device | yes, with like |
| MPRIS | none | no | play only | yes, without like |

The info pane shows which one is in use ("via spotify client", "via web api", "via mpris").
Without Spotify running, the controls go to whatever else plays (browser, mpv).

## Commands

| Type | Does |
|---|---|
| `s` | the controls as a list |
| `s daft punk` | tracks, artists, albums and playlists; your own playlists come first |
| `s play daft punk` | the same search, Enter plays |
| `s play`, `s pause`, `s toggle` | play, pause, either |
| `s next` / `s n`, `s prev` / `s p` | next or previous track |
| `s forward`, `s f 30`, `s fw 1m 10s` | forward, 10 seconds without a time |
| `s back`, `s b 30`, `s rw 2m` | back, 10 seconds without a time |
| `s 1:10`, `s 90s` | jump to that point in the track |
| `s shuffle`, `s repeat`, `s like` | toggle shuffle, cycle repeat (off, all, track), like or unlike |

Times can be written as `1m 10s`, `1m10s`, `90s`, `90` or `1:10`. Enter plays a result,
Shift+Enter puts a track in the queue. A control word also searches, so `s next` shows
songs called "next" under the control row.

## Spicetify extension

`frame install spicetify` (and every `frame update spicetify`) puts two extensions into
Spotify: `frameshell.js`, which does the work, and `frameshell-token.js`, a random token
the shell checks so no web page can pose as Spotify. Spotify connects to the shell on
`127.0.0.1:48931` as soon as both run.

To see whether it works: `spicetify enable-devtools`, restart Spotify, open the DevTools
(Ctrl+Shift+I) and look for `[frameshell] connected to the shell` in the console.

The search uses Spotify's own quick search inside the client. Spotify renames its internals
now and then; when that happens the extension falls back to the Web API with the client's
own login, and the console says which one failed.

## Web API

Needed only when the extension does not connect, or to control Spotify on another device
(phone, speaker). It takes about five minutes, once.

1. Open [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard), log in
   with your Spotify account and click **Create app**.
2. Fill in:
   - **App name** and **App description**: anything, e.g. "frameshell"
   - **Redirect URI**: `http://127.0.0.1:8888/callback`, exactly like this. Spotify does
     not accept `localhost` here, it has to be the IP.
   - **Which API/SDKs are you planning to use?**: tick **Web API**

   Accept the terms and save.
3. Open the app's **Settings** and copy the **Client ID**. You do not need the client
   secret; the login uses PKCE, which works without one.
4. In a terminal:

   ```bash
   frame spotify login
   ```

   Paste the Client ID. A browser opens with Spotify's consent page; allow access. Spotify
   then sends you to `http://127.0.0.1:8888/callback?code=…` and that page does not load.
   That is expected: copy the whole address from the address bar and paste it into the
   terminal.
5. Check it:

   ```bash
   frame spotify status
   ```

   It prints your name and plan. The launcher picks the Web API up the next time you type `s `.

The tokens live in `~/.local/state/frameshell/spotify.json`, readable only by you. They
renew themselves; `frame spotify logout` deletes them. To take the access back completely,
remove the app under [spotify.com/account/apps](https://www.spotify.com/account/apps/).

Things Spotify decides, not frameshell:

- Controlling playback through the Web API needs **Premium**. Search works without it.
- A new app runs in **development mode**: only you and the people you add under
  **User Management** in the dashboard can log in with it. For your own desktop that is all
  you need.
- The app can only play on a device that is on. With Spotify closed everywhere, `s play`
  says "no Spotify device found".

The app asks for these scopes: reading and changing playback, the current track, your
private playlists, and reading and changing your liked songs (for `s like`).

## When something does not work

| Problem | Fix |
|---|---|
| "via mpris" although Spicetify is installed | run `frame update spicetify`, restart Spotify, check the DevTools console |
| console: "wrong token" | `frame install spicetify` writes the token again |
| console: the socket is refused or blocked | Spotify blocked the local connection; use the Web API |
| "search needs Spotify connected" | neither extension nor Web API works: see the two sections above |
| "token rejected" | `frame spotify login` again |
| "not allowed" on play | the account has no Premium (Web API only) |
| port 48931 is taken | change `spotifyPort` in `quickshell/.config/quickshell/config/Config.qml` and `PORT` in `spicetify/.config/spicetify/Extensions/frameshell.js`, then `frame update spicetify` |
