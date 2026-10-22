// Writes the animated README previews from the theme files:
//   .github/themes.svg   `frame theme set` in a terminal, a small desktop recoloring beside it
//   .github/install.svg  a `frame install` run, line by line
// Run from the repo root: node .github/scripts/previews.js
// Plain SVG with CSS animations, so GitHub plays them inside <img> without any script.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const order = ['periwinkle', 'sakura', 'matcha', 'ember', 'lagoon', 'mono'];
// The themes live in frame-shell/cli; an installed frame command has them, FRAME_THEMES points elsewhere
const themeDir = process.env.FRAME_THEMES || path.join(require('os').homedir(), '.local/share/frameshell/cli/themes');
const themes = order.map(id => Object.assign({ id }, JSON.parse(fs.readFileSync(path.join(themeDir, id + '.json'), 'utf8'))));
const font = "ui-monospace, 'JetBrains Mono', SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";
const roles = Object.keys(themes[0].colors);

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Theme switch ─────────────────────────────────────────────

function themesSvg() {
  const W = 1280, H = 580, n = themes.length, loop = n * 2.6, seg = 100 / n;
  const pct = x => x.toFixed(2) + '%';

  // Every role gets a fill, stroke and stop-color animation that steps through the themes
  function steps(prop, role) {
    let out = '';
    themes.forEach((t, i) => {
      const c = t.colors[role];
      out += `${pct(i * seg)}{${prop}:${c}}${pct((i + 1) * seg - 2.5)}{${prop}:${c}}`;
    });
    return out + `100%{${prop}:${themes[0].colors[role]}}`;
  }
  // A slot is visible while its theme is on; "late" parts appear a moment after the command
  function slot(i, delay) {
    const a = i * seg + delay, b = (i + 1) * seg - 0.4, first = a === 0 ? 1 : 0;
    let k = `0%{opacity:${first}}`;
    if (a > 0) k += `${pct(a - 0.01)}{opacity:0}${pct(a)}{opacity:1}`;
    k += `${pct(b)}{opacity:1}${pct(b + 0.01)}{opacity:0}`;
    if (b + 0.01 < 99.98) k += `99.98%{opacity:0}`;
    return k + `100%{opacity:${first}}`;
  }

  let css = `text{font-family:${font};font-size:15px}.b{font-weight:700}`;
  for (const r of roles) {
    css += `@keyframes f-${r}{${steps('fill', r)}}@keyframes s-${r}{${steps('stroke', r)}}@keyframes c-${r}{${steps('stop-color', r)}}`;
    css += `.f-${r}{animation:f-${r} ${loop}s infinite}.s-${r}{fill:none;animation:s-${r} ${loop}s infinite}.c-${r}{animation:c-${r} ${loop}s infinite}`;
  }
  themes.forEach((t, i) => {
    css += `@keyframes cmd${i}{${slot(i, 0)}}@keyframes out${i}{${slot(i, 4)}}`;
    css += `.cmd${i}{opacity:0;animation:cmd${i} ${loop}s infinite}.out${i}{opacity:0;animation:out${i} ${loop}s infinite}`;
  });
  // The marker under the theme squares hops from one to the next
  let hop = '';
  themes.forEach((t, i) => { hop += `${pct(i * seg)}{transform:translateX(${i * 30}px)}${pct((i + 1) * seg - 2.5)}{transform:translateX(${i * 30}px)}`; });
  css += `@keyframes hop{${hop}100%{transform:translateX(0)}}.hop{animation:hop ${loop}s infinite}`;

  const o = [];
  o.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t">`);
  o.push(`<title id="t">frame theme set: the desktop in all six themes</title>`);
  o.push(`<style>${css}</style>`);
  o.push(`<defs><radialGradient id="glow" cx="0.7" cy="0.65" r="0.75"><stop offset="0" class="c-primary" stop-opacity="0.35"/><stop offset="1" class="c-primary" stop-opacity="0"/></radialGradient>`);
  o.push(`<clipPath id="card"><rect width="${W}" height="${H}" rx="22"/></clipPath></defs>`);
  o.push(`<g clip-path="url(#card)"><rect width="${W}" height="${H}" class="f-bg"/>`);

  // Labeled frame: the label sits on a background patch that cuts the top line
  function frame(x, y, w, h, label, stroke, labelRole) {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="s-${stroke}" stroke-width="1.5"/>`;
    if (label) {
      s += `<rect x="${x + 14}" y="${y - 9}" width="${label.length * 9.2 + 14}" height="18" class="f-bg"/>`;
      s += `<text x="${x + 21}" y="${y + 5}" class="f-${labelRole || stroke}">${esc(label)}</text>`;
    }
    return s;
  }
  // A line of colored spans: [[role, text], …]
  function line(x, y, parts, cls) {
    return `<text x="${x}" y="${y}"${cls ? ` class="${cls}"` : ''}>` + parts.map(([r, t]) => `<tspan class="f-${r}">${esc(t)}</tspan>`).join('') + `</text>`;
  }

  // Terminal on the left
  o.push(frame(40, 52, 450, 456, '~/frameshell', 'surface2', 'primary'));
  const tx = 64;
  themes.forEach((t, i) => {
    const name = t.name;
    o.push(`<g class="cmd${i}">`);
    o.push(line(tx, 96, [['frame', '┌['], ['secondary', '~/frameshell'], ['frame', ']─['], ['primary', 'main'], ['frame', ']']]));
    o.push(line(tx, 120, [['frame', '└─'], ['primary', '❯ '], ['text', `frame theme set ${t.id}`]]));
    o.push(`</g><g class="out${i}">`);
    o.push(line(tx, 162, [['primary', '● '], ['text', `Theme ${name}`]], 'b'));
    o.push(line(tx, 188, [['warn', '  ↻ '], ['textDim', '13 color files written']]));
    o.push(line(tx, 214, [['ok', '  ✓ '], ['textDim', 'Quickshell reloads on its own']]));
    o.push(line(tx, 240, [['ok', '  ✓ '], ['textDim', 'Hyprland window colors reloaded']]));
    o.push(line(tx, 266, [['ok', '  ✓ '], ['textDim', 'Spotify theme applied']]));
    o.push(line(tx, 292, [['muted', '    new shells and Ghostty windows follow']]));
    o.push(line(tx, 330, [['ok', 'Done. '], ['textDim', `frameshell now uses ${name}.`]]));
    o.push(line(tx, 372, [['frame', '┌['], ['secondary', '~/frameshell'], ['frame', ']─['], ['primary', 'main'], ['frame', ']']]));
    o.push(line(tx, 396, [['frame', '└─'], ['primary', '❯ ']]));
    o.push(`<rect x="${tx + 40}" y="383" width="9" height="17" class="f-secondary"/>`);
    o.push(`</g>`);
  });
  // One square per theme, the marker on the current one
  themes.forEach((t, i) => o.push(`<rect x="${tx + i * 30}" y="452" width="18" height="18" fill="${t.colors.primary}"/>`));
  // Own group: one element can only run one animation, and the marker needs two
  o.push(`<g class="hop"><rect x="${tx - 4}" y="448" width="26" height="26" class="s-text" stroke-width="1.5"/></g>`);
  themes.forEach((t, i) => o.push(`<text x="${tx + n * 30 + 10}" y="466" class="cmd${i} f-muted">${esc(t.id)} · ${esc(t.description)}</text>`));

  // Small desktop on the right
  const dx = 520, dy = 52, dw = 720, dh = 456;
  o.push(`<rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" fill="url(#glow)"/>`);
  o.push(`<rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" class="s-surface2" stroke-width="1"/>`);
  // Bar
  o.push(`<rect x="${dx + 10}" y="${dy + 10}" width="${dw - 20}" height="30" class="f-bg"/><rect x="${dx + 10}" y="${dy + 10}" width="${dw - 20}" height="30" class="s-surface2" stroke-width="1.2"/>`);
  for (let k = 0; k < 5; k++) o.push(`<rect x="${dx + 22 + k * 22}" y="${dy + 17}" width="16" height="16" class="${k === 0 ? 'f-primary' : 'f-surface2'}"/>`);
  o.push(`<text x="${dx + dw / 2}" y="${dy + 30}" text-anchor="middle" class="f-text">09:41 <tspan class="f-muted">mon 19 oct</tspan></text>`);
  o.push(line(dx + dw - 130, dy + 30, [['frame', '['], ['muted', 'cpu '], ['textDim', '12%'], ['frame', ']─['], ['muted', 'de'], ['frame', ']']]));
  // Terminal window with a fastfetch-like block
  const wx = dx + 10, wy = dy + 58;
  o.push(`<rect x="${wx}" y="${wy}" width="330" height="378" class="f-bg" fill-opacity="0.85"/>` + frame(wx, wy, 330, 378, 'ghostty', 'primary'));
  o.push(`<rect x="${wx + 16}" y="${wy + 26}" width="92" height="92" class="s-frame" stroke-dasharray="4 3"/>`);
  o.push(`<text x="${wx + 62}" y="${wy + 76}" text-anchor="middle" class="f-muted" style="font-size:11px">logo.png</text>`);
  const kv = [['os', 'CachyOS'], ['wm', 'Hyprland'], ['shell', 'fish'], ['term', 'ghostty']];
  o.push(line(wx + 124, wy + 40, [['secondary', 'vxnsin'], ['muted', '@'], ['primary', 'frameshell']]));
  kv.forEach(([k, v], j) => o.push(line(wx + 124, wy + 64 + j * 20, [['primary', k.padEnd(7)], ['textDim', v]])));
  themes.forEach((t, i) => o.push(line(wx + 124, wy + 144, [['primary', 'theme  '], ['textDim', t.id]], `cmd${i}`)));
  ['danger', 'ok', 'warn', 'primary', 'accent', 'secondary'].forEach((r, j) => o.push(`<rect x="${wx + 16 + j * 22}" y="${wy + 170}" width="16" height="16" class="f-${r}"/>`));
  o.push(line(wx + 16, wy + 228, [['frame', '┌['], ['secondary', '~'], ['frame', ']']]));
  o.push(line(wx + 16, wy + 250, [['frame', '└─'], ['primary', '❯ '], ['text', 'nvim notes.md']]));
  // Control center
  const cx = dx + 356, cy = dy + 58;
  o.push(`<rect x="${cx}" y="${cy}" width="354" height="206" class="f-bg" fill-opacity="0.92"/>` + frame(cx, cy, 354, 206, 'control', 'primary'));
  [['wi-fi', 1], ['silent', 0], ['game', 1]].forEach(([label, on], j) => {
    const x = cx + 16 + j * 110;
    if (on) o.push(`<rect x="${x}" y="${cy + 24}" width="100" height="34" class="f-primary" fill-opacity="0.16"/>`);
    o.push(`<rect x="${x}" y="${cy + 24}" width="100" height="34" class="s-${on ? 'primary' : 'surface2'}" stroke-width="1.2"/>`);
    o.push(`<text x="${x + 12}" y="${cy + 46}" class="f-${on ? 'text' : 'muted'}">${label}</text>`);
  });
  [['music', 48, false], ['chat', 70, true], ['game', 62, false]].forEach(([label, v, muted], j) => {
    const y = cy + 92 + j * 34;
    o.push(`<text x="${cx + 16}" y="${y}" class="f-muted">${label}</text>`);
    o.push(`<rect x="${cx + 92}" y="${y - 7}" width="190" height="5" class="f-surface2"/>`);
    o.push(`<rect x="${cx + 92}" y="${y - 7}" width="${190 * v / 100}" height="5" class="f-${muted ? 'frame' : 'secondary'}"/>`);
    o.push(`<text x="${cx + 338}" y="${y}" text-anchor="end" class="f-${muted ? 'danger' : 'textDim'}">${muted ? 'muted' : v + '%'}</text>`);
  });
  // Incoming call
  const nx = cx, ny = cy + 226;
  o.push(`<rect x="${nx}" y="${ny}" width="354" height="92" class="f-bg"/>` + frame(nx, ny, 354, 92, 'discord · call', 'accent'));
  o.push(`<rect x="${nx + 16}" y="${ny + 22}" width="38" height="38" class="f-accent"/><text x="${nx + 35}" y="${ny + 47}" text-anchor="middle" class="f-bg b">M</text>`);
  o.push(`<text x="${nx + 68}" y="${ny + 36}" class="f-text b">mira is calling</text><text x="${nx + 68}" y="${ny + 56}" class="f-textDim">direct call · ringing</text>`);
  o.push(`<rect x="${nx + 68}" y="${ny + 66}" width="66" height="20" class="s-ok"/><text x="${nx + 101}" y="${ny + 81}" text-anchor="middle" class="f-ok" style="font-size:13px">accept</text>`);
  o.push(`<rect x="${nx + 142}" y="${ny + 66}" width="70" height="20" class="s-danger"/><text x="${nx + 177}" y="${ny + 81}" text-anchor="middle" class="f-danger" style="font-size:13px">decline</text>`);
  // OSD
  const ox = cx + 52, oy = dy + dh - 64;
  o.push(`<rect x="${ox}" y="${oy}" width="250" height="40" class="f-bg"/>` + frame(ox, oy, 250, 40, 'goxlr · music', 'primary'));
  o.push(`<rect x="${ox + 16}" y="${oy + 21}" width="170" height="5" class="f-surface2"/><rect x="${ox + 16}" y="${oy + 21}" width="105" height="5" class="f-secondary"/>`);
  o.push(`<text x="${ox + 234}" y="${oy + 28}" text-anchor="end" class="f-text">62%</text>`);

  o.push(`</g></svg>`);
  return o.join('\n') + '\n';
}

// ── Install run ──────────────────────────────────────────────
// Output of a simulated `frame install` on a fresh CachyOS home, shortened

function installSvg() {
  const c = themes[0].colors;
  const lines = [
    [['frame', '┌['], ['secondary', '~'], ['frame', ']']],
    [['frame', '└─'], ['primary', '❯ '], ['text', 'curl -fsSL https://frame-shell.github.io/install.sh | bash']],
    [],
    [['primary', '  frame  '], ['muted', 'frameshell · CachyOS · Hyprland']],
    [['muted', '  Packages: ghostty fish starship fastfetch spicetify vencord quickshell hypr wallpaper zed dolphin zen']],
    [['text', '  Install and link these? [Y/n] y']],
    [['primary', '● '], ['text', 'Dependencies']],
    [['muted', '  Missing: stow ghostty starship chafa spicetify-cli vesktop quickshell zed dolphin zen-browser-bin …']],
    [['primary', '● '], ['text', 'Theme']],
    [['text', '  Which theme? (switch any time: frame theme set <name>)']],
    [['primary', '    1 '], ['text', 'periwinkle  '], ['muted', 'blue-violet   '], ['primary', '2 '], ['text', 'ember  '], ['muted', 'orange   '], ['primary', '3 '], ['text', 'lagoon  '], ['muted', 'teal   …']],
    [['text', '  Pick 1-6 [1] 1']],
    [['ok', '  ✓ '], ['text', 'Theme Periwinkle: 13 color files, 13 rewritten']],
    [['primary', '● '], ['text', 'quickshell']],
    [['ok', '  ✓ '], ['text', 'Config linked']],
    [['warn', '  ! '], ['text', 'Other notification daemons found: mako']],
    [['text', '  Turn them off? [Y/n] y']],
    [['ok', '  ✓ '], ['text', 'Turned off: mako (frame restore brings them back)']],
    [['primary', '● '], ['text', 'hypr']],
    [['ok', '  ✓ '], ['text', 'Added to hyprland.conf: source = ~/.config/hypr/frame/shell.conf']],
    [['primary', '● '], ['text', 'frame command']],
    [['ok', '  ✓ '], ['text', 'frame is now available as a command (~/.local/bin/frame)']],
    [],
    [['ok', 'Done. '], ['text', 'Open a new terminal to see the changes.']]
  ];
  const W = 1280, lh = 21, top = 70, H = top + lines.length * lh + 44, loop = 14, end = 92;
  // Section headings take a little longer, like the real run
  const shown = [];
  let t = 0.6;
  for (const l of lines) {
    shown.push(t);
    t += l.length === 0 ? 0.1 : l[0][1].startsWith('●') ? 0.55 : 0.32;
  }
  let css = `text{font-family:${font};font-size:14px;white-space:pre}`;
  shown.forEach((s, i) => {
    const p = s / loop * 100;
    css += `@keyframes l${i}{0%,${(p - 0.01).toFixed(2)}%{opacity:0}${p.toFixed(2)}%,${end}%{opacity:1}${end + 1}%,100%{opacity:0}}.l${i}{opacity:0;animation:l${i} ${loop}s infinite}`;
  });
  const o = [];
  o.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t">`);
  o.push(`<title id="t">frame install on a fresh CachyOS</title><style>${css}</style>`);
  o.push(`<clipPath id="card"><rect width="${W}" height="${H}" rx="22"/></clipPath><g clip-path="url(#card)">`);
  o.push(`<rect width="${W}" height="${H}" fill="${c.bg}"/>`);
  o.push(`<rect x="28" y="28" width="${W - 56}" height="${H - 56}" fill="none" stroke="${c.surface2}" stroke-width="1.5"/>`);
  o.push(`<rect x="44" y="20" width="96" height="16" fill="${c.bg}"/><text x="52" y="33" fill="${c.primary}">ghostty</text>`);
  lines.forEach((l, i) => {
    if (!l.length) return;
    o.push(`<text x="48" y="${top + i * lh}" class="l${i}">` + l.map(([r, s]) => `<tspan fill="${c[r]}">${esc(s)}</tspan>`).join('') + `</text>`);
  });
  o.push(`</g></svg>`);
  return o.join('\n') + '\n';
}

fs.writeFileSync(path.join(root, '.github', 'themes.svg'), themesSvg());
fs.writeFileSync(path.join(root, '.github', 'install.svg'), installSvg());
console.log('wrote .github/themes.svg and .github/install.svg');
