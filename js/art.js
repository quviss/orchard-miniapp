// Векторные иллюстрации устройств. Используются, пока у товара нет фото,
// и перекрашиваются под выбранный цвет.

const Art = (() => {
  let uid = 0;

  function rgb(hex) {
    const h = hex.replace('#', '');
    return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
  }
  // amt > 0 — светлее, amt < 0 — темнее
  function sh(hex, amt) {
    const out = rgb(hex).map(v => {
      const t = amt > 0 ? 255 : 0;
      return Math.round(v + (t - v) * Math.abs(amt));
    });
    return '#' + out.map(v => v.toString(16).padStart(2, '0')).join('');
  }
  function lum(hex) {
    const [r, g, b] = rgb(hex);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  function grad(c, a = 0.14, b = -0.1, dir = 'x') {
    const id = 'g' + (++uid);
    const xy = dir === 'x' ? 'x1="0" y1="0" x2="1" y2="0.35"' : 'x1="0" y1="0" x2="0" y2="1"';
    return {
      id,
      def: `<linearGradient id="${id}" ${xy}><stop offset="0" stop-color="${sh(c, a)}"/><stop offset="0.55" stop-color="${c}"/><stop offset="1" stop-color="${sh(c, b)}"/></linearGradient>`,
    };
  }
  function wallpaper(c) {
    const id = 'w' + (++uid);
    const base = lum(c) > 0.75 ? sh(c, -0.35) : c;
    return {
      id,
      def: `<linearGradient id="${id}" x1="0" y1="0" x2="0.6" y2="1"><stop offset="0" stop-color="${sh(base, 0.35)}"/><stop offset="0.5" stop-color="${base}"/><stop offset="1" stop-color="${sh(base, -0.55)}"/></linearGradient>`,
    };
  }
  function edge(c) { return sh(c, lum(c) > 0.6 ? -0.18 : -0.35); }
  function svg(defs, body) {
    return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${defs}</defs>${body}</svg>`;
  }
  function lens(x, y, r, c) {
    return `<circle cx="${x}" cy="${y}" r="${r + 1.5}" fill="${sh(c, -0.25)}"/>` +
      `<circle cx="${x}" cy="${y}" r="${r}" fill="#16171b"/>` +
      `<circle cx="${x}" cy="${y}" r="${r * 0.55}" fill="#0a0e1c"/>` +
      `<circle cx="${x - r * 0.25}" cy="${y - r * 0.28}" r="${r * 0.18}" fill="#5a6a90" opacity=".8"/>`;
  }
  function shadow(cx, cy, rx) {
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="6" fill="#000" opacity=".08"/>`;
  }

  // ───── телефоны ─────
  function phoneBack(k, c) {
    const g = grad(c);
    const clip = 'c' + (++uid);
    const rx = k === 'samsung' ? 12 : 24;
    let d = g.def + `<clipPath id="${clip}"><rect x="95" y="20" width="110" height="258" rx="${rx}"/></clipPath>`;
    let b = shadow(150, 284, 50);
    b += `<rect x="95" y="20" width="110" height="258" rx="${rx}" fill="url(#${g.id})" stroke="${edge(c)}" stroke-width="1.5"/>`;
    if (k === 'pro') {
      b += `<g clip-path="url(#${clip})"><rect x="90" y="18" width="120" height="82" fill="${sh(c, -0.07)}"/><rect x="90" y="99" width="120" height="1.2" fill="${sh(c, -0.2)}" opacity=".5"/></g>`;
      b += `<rect x="101" y="27" width="64" height="66" rx="17" fill="${sh(c, -0.12)}"/>`;
      b += lens(118, 44, 10, c) + lens(118, 76, 10, c) + lens(147, 60, 10, c);
      b += `<circle cx="148" cy="37" r="3.5" fill="#f4efdc"/><circle cx="185" cy="40" r="2.5" fill="${sh(c, -0.3)}"/>`;
    } else if (k === 'air') {
      b += `<rect x="101" y="29" width="98" height="26" rx="13" fill="${sh(c, -0.09)}"/>`;
      b += lens(116, 42, 8, c) + `<circle cx="136" cy="42" r="3" fill="#f4efdc"/><circle cx="184" cy="42" r="2.4" fill="${sh(c, -0.3)}"/>`;
    } else if (k === 'base') {
      b += `<rect x="102" y="27" width="32" height="64" rx="16" fill="${sh(c, -0.08)}"/>`;
      b += lens(118, 43, 10, c) + lens(118, 75, 10, c) + `<circle cx="142" cy="34" r="3" fill="#f4efdc"/>`;
    } else if (k === 'e') {
      b += `<rect x="102" y="27" width="32" height="32" rx="10" fill="${sh(c, -0.08)}"/>`;
      b += lens(118, 43, 10, c) + `<circle cx="142" cy="34" r="3" fill="#f4efdc"/>`;
    } else if (k === 'samsung') {
      b += lens(115, 44, 10, c) + lens(115, 73, 10, c) + lens(115, 102, 10, c);
      b += lens(140, 44, 6, c) + `<circle cx="140" cy="62" r="3" fill="#f4efdc"/>`;
    }
    return svg(d, b);
  }

  function phoneFront(k, c) {
    const w = wallpaper(c);
    const rx = k === 'samsung' ? 12 : 24;
    let b = shadow(150, 284, 50);
    b += `<rect x="95" y="20" width="110" height="258" rx="${rx}" fill="${sh(c, -0.15)}"/>`;
    b += `<rect x="97" y="22" width="106" height="254" rx="${rx - 2}" fill="#0b0b0d"/>`;
    b += `<rect x="101" y="26" width="98" height="246" rx="${rx - 5}" fill="url(#${w.id})"/>`;
    b += k === 'samsung'
      ? `<circle cx="150" cy="35" r="3.5" fill="#000"/>`
      : `<rect x="133" y="32" width="34" height="11" rx="5.5" fill="#000"/>`;
    b += `<text x="150" y="70" text-anchor="middle" font-family="-apple-system,Inter,sans-serif" font-size="9" fill="#fff" opacity=".85">понедельник, 26 октября</text>`;
    b += `<text x="150" y="104" text-anchor="middle" font-family="-apple-system,Inter,sans-serif" font-size="38" font-weight="600" fill="#fff">9:41</text>`;
    b += `<rect x="132" y="262" width="36" height="3" rx="1.5" fill="#fff" opacity=".8"/>`;
    return svg(w.def, b);
  }

  function fold(c, view) {
    if (view === 1) {
      const g = grad(c);
      let b = shadow(150, 270, 52) + `<rect x="92" y="38" width="116" height="226" rx="22" fill="url(#${g.id})" stroke="${edge(c)}" stroke-width="1.5"/>`;
      b += `<rect x="100" y="46" width="34" height="96" rx="17" fill="${sh(c, -0.1)}"/>` + lens(117, 64, 9, c) + lens(117, 94, 9, c) + lens(117, 124, 6, c);
      return svg(g.def, b);
    }
    const w = wallpaper(c);
    let b = shadow(150, 268, 105);
    b += `<rect x="40" y="48" width="220" height="214" rx="20" fill="${sh(c, -0.15)}"/>`;
    b += `<rect x="43" y="51" width="214" height="208" rx="18" fill="#0b0b0d"/>`;
    b += `<rect x="48" y="56" width="204" height="198" rx="14" fill="url(#${w.id})"/>`;
    b += `<rect x="149.5" y="56" width="1" height="198" fill="#fff" opacity=".18"/>`;
    b += `<text x="150" y="132" text-anchor="middle" font-family="-apple-system,Inter,sans-serif" font-size="40" font-weight="600" fill="#fff">9:41</text>`;
    return svg(w.def, b);
  }

  function flip(c, view) {
    if (view === 1) return phoneFront('samsung', c);
    const g = grad(c);
    let b = shadow(150, 238, 52) + `<rect x="95" y="72" width="110" height="160" rx="20" fill="url(#${g.id})" stroke="${edge(c)}" stroke-width="1.5"/>`;
    b += `<rect x="101" y="78" width="98" height="78" rx="14" fill="#0e0e10"/>`;
    b += lens(116, 94, 8, '#333') + lens(140, 94, 8, '#333');
    b += `<text x="178" y="140" text-anchor="middle" font-family="-apple-system,Inter,sans-serif" font-size="14" font-weight="600" fill="#fff">9:41</text>`;
    b += `<rect x="95" y="160" width="110" height="1.5" fill="${sh(c, -0.25)}"/>`;
    return svg(g.def, b);
  }

  // ───── компьютеры и планшеты ─────
  function laptop(c, view) {
    const g = grad(c, 0.12, -0.12, 'y');
    if (view === 1) {
      let b = shadow(150, 226, 110) + `<rect x="40" y="62" width="220" height="156" rx="12" fill="url(#${g.id})" stroke="${edge(c)}" stroke-width="1.5"/>`;
      b += `<circle cx="150" cy="140" r="12" fill="${sh(c, lum(c) > 0.5 ? -0.08 : 0.1)}"/>`;
      return svg(g.def, b);
    }
    const w = wallpaper(c);
    let b = shadow(150, 226, 132);
    b += `<rect x="44" y="50" width="212" height="146" rx="10" fill="#0d0d0f" stroke="${edge(c)}" stroke-width="1.5"/>`;
    b += `<rect x="51" y="57" width="198" height="132" rx="4" fill="url(#${w.id})"/>`;
    b += `<rect x="138" y="57" width="24" height="5" rx="2.5" fill="#0d0d0f"/>`;
    b += `<path d="M22 197 H278 L272 212 Q270 216 264 216 H36 Q30 216 28 212 Z" fill="url(#${g.id})" stroke="${edge(c)}" stroke-width="1"/>`;
    b += `<rect x="130" y="197" width="40" height="5" rx="2.5" fill="${sh(c, -0.15)}"/>`;
    return svg(g.def + w.def, b);
  }

  function tablet(c, view, mini) {
    const W = mini ? 136 : 168, H = mini ? 206 : 240;
    const x = 150 - W / 2, y = 150 - H / 2;
    if (view === 1) {
      const g = grad(c);
      let b = shadow(150, y + H + 6, W / 2) + `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="18" fill="url(#${g.id})" stroke="${edge(c)}" stroke-width="1.5"/>`;
      b += `<rect x="${x + 10}" y="${y + 10}" width="22" height="22" rx="7" fill="${sh(c, -0.1)}"/>` + lens(x + 21, y + 21, 6, c);
      return svg(g.def, b);
    }
    const w = wallpaper(c);
    let b = shadow(150, y + H + 6, W / 2);
    b += `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="18" fill="${c}" stroke="${edge(c)}" stroke-width="1.5"/>`;
    b += `<rect x="${x + 3}" y="${y + 3}" width="${W - 6}" height="${H - 6}" rx="15" fill="#0b0b0d"/>`;
    b += `<rect x="${x + 10}" y="${y + 10}" width="${W - 20}" height="${H - 20}" rx="9" fill="url(#${w.id})"/>`;
    b += `<text x="150" y="${y + 62}" text-anchor="middle" font-family="-apple-system,Inter,sans-serif" font-size="30" font-weight="600" fill="#fff">9:41</text>`;
    return svg(w.def, b);
  }

  // ───── часы и аудио ─────
  function watch(c, view, ultra) {
    const g = grad(c, 0.2, -0.15);
    const band = ultra ? (lum(c) > 0.5 ? '#d9772f' : '#3b4a3c') : sh(c, lum(c) > 0.6 ? -0.06 : 0.12);
    const rx = ultra ? 24 : 34;
    let b = shadow(150, 292, 40);
    b += `<rect x="114" y="6" width="72" height="90" rx="10" fill="${band}"/><rect x="114" y="206" width="72" height="88" rx="10" fill="${band}"/>`;
    b += `<rect x="94" y="78" width="112" height="144" rx="${rx}" fill="url(#${g.id})" stroke="${edge(c)}" stroke-width="1.5"/>`;
    b += `<rect x="206" y="118" width="8" height="26" rx="3" fill="${sh(c, -0.1)}"/>`;
    if (ultra) b += `<rect x="86" y="120" width="8" height="30" rx="3" fill="#e2702a"/>`;
    b += `<rect x="102" y="86" width="96" height="128" rx="${rx - 8}" fill="#000"/>`;
    if (view === 1) {
      b += `<circle cx="150" cy="150" r="34" fill="none" stroke="#ff2d55" stroke-width="7" stroke-dasharray="170 220" transform="rotate(-90 150 150)" stroke-linecap="round"/>`;
      b += `<circle cx="150" cy="150" r="24" fill="none" stroke="#a8ff3c" stroke-width="7" stroke-dasharray="110 200" transform="rotate(-90 150 150)" stroke-linecap="round"/>`;
      b += `<circle cx="150" cy="150" r="14" fill="none" stroke="#2fd7ff" stroke-width="7" stroke-dasharray="70 200" transform="rotate(-90 150 150)" stroke-linecap="round"/>`;
    } else {
      b += `<text x="150" y="146" text-anchor="middle" font-family="-apple-system,Inter,sans-serif" font-size="32" font-weight="600" fill="#fff">10:09</text>`;
      b += `<text x="150" y="168" text-anchor="middle" font-family="-apple-system,Inter,sans-serif" font-size="11" fill="#ff9f0a">ПН 26</text>`;
    }
    return svg(g.def, b);
  }

  function airpods(c, view, pro) {
    const id = 'a' + (++uid);
    const d = `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e4e4e8"/></linearGradient>`;
    if (view === 1) {
      const bud = (x, flipX) => `<g transform="translate(${x} 70) scale(${flipX} 1)"><ellipse cx="0" cy="40" rx="30" ry="34" fill="url(#${id})" stroke="#d0d0d6"/><rect x="-10" y="60" width="20" height="${pro ? 90 : 120}" rx="10" fill="url(#${id})" stroke="#d0d0d6"/><ellipse cx="10" cy="44" rx="10" ry="12" fill="#2b2b2f" opacity=".85"/></g>`;
      return svg(d, shadow(150, 262, 90) + bud(110, 1) + bud(190, -1));
    }
    const W = pro ? 150 : 128, H = pro ? 112 : 124;
    const x = 150 - W / 2, y = 150 - H / 2;
    let b = shadow(150, y + H + 8, W / 2);
    b += `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="${pro ? 34 : 42}" fill="url(#${id})" stroke="#d2d2d8" stroke-width="1.5"/>`;
    b += `<path d="M${x + 2} ${y + H * 0.36} H${x + W - 2}" stroke="#cfcfd5" stroke-width="1.5"/>`;
    b += `<circle cx="150" cy="${y + H * 0.66}" r="3" fill="#7bd77b"/>`;
    return svg(d, b);
  }

  function headphones(c, view) {
    const g = grad(c, 0.2, -0.15, 'y');
    let b = shadow(150, 268, 100);
    b += `<path d="M78 160 V120 Q78 40 150 40 Q222 40 222 120 V160" fill="none" stroke="${sh(c, -0.12)}" stroke-width="16" stroke-linecap="round"/>`;
    b += `<path d="M86 150 V122 Q86 52 150 52 Q214 52 214 122 V150" fill="none" stroke="${sh(c, 0.35)}" stroke-width="10" stroke-linecap="round" opacity=".9"/>`;
    b += `<rect x="70" y="146" width="18" height="34" rx="6" fill="#c8c8cc"/><rect x="212" y="146" width="18" height="34" rx="6" fill="#c8c8cc"/>`;
    b += `<rect x="46" y="166" width="64" height="96" rx="28" fill="url(#${g.id})" stroke="${edge(c)}"/>`;
    b += `<rect x="190" y="166" width="64" height="96" rx="28" fill="url(#${g.id})" stroke="${edge(c)}"/>`;
    if (view === 1) b += `<rect x="58" y="178" width="40" height="72" rx="20" fill="${sh(c, -0.35)}"/><rect x="202" y="178" width="40" height="72" rx="20" fill="${sh(c, -0.35)}"/>`;
    return svg(g.def, b);
  }

  // ───── игры ─────
  function console_(c, view, pro, digital) {
    const id = 'p' + (++uid);
    const d = `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e6e6ea"/></linearGradient>`;
    let b = shadow(150, 284, 70);
    if (view === 1) return svg(d, shadow(150, 270, 60) + gamepadBody('#f4f4f4'));
    b += `<path d="M96 28 Q120 20 138 24 V276 Q118 280 92 272 Q100 150 96 28 Z" fill="url(#${id})" stroke="#d4d4da"/>`;
    b += `<path d="M204 28 Q180 20 162 24 V276 Q182 280 208 272 Q200 150 204 28 Z" fill="url(#${id})" stroke="#d4d4da"/>`;
    b += `<rect x="138" y="22" width="24" height="256" rx="6" fill="#18181b"/>`;
    b += `<rect x="146" y="40" width="8" height="2" rx="1" fill="#3b82f6"/>`;
    if (pro) {
      b += `<rect x="92" y="108" width="46" height="9" fill="#18181b"/><rect x="162" y="108" width="46" height="9" fill="#18181b"/>`;
      b += `<rect x="92" y="186" width="46" height="9" fill="#18181b"/><rect x="162" y="186" width="46" height="9" fill="#18181b"/>`;
    } else {
      b += `<path d="M95 150 H138 M162 150 H205" stroke="#d4d4da" stroke-width="1.5"/>`;
    }
    if (!digital && !pro) b += `<rect x="128" y="190" width="3" height="60" rx="1.5" fill="#bdbdc4"/>`;
    return svg(d, b);
  }

  function gamepadBody(c) {
    const dark = lum(c) < 0.6;
    const core = dark ? sh(c, -0.25) : '#1c1c1f';
    let b = `<path d="M70 120 Q80 90 120 92 H180 Q220 90 230 120 L258 210 Q266 244 238 246 Q220 248 206 222 L192 196 H108 L94 222 Q80 248 62 246 Q34 244 42 210 Z" fill="${c}" stroke="${sh(c, -0.2)}" stroke-width="1.5"/>`;
    b += `<path d="M118 96 H182 L176 150 Q150 162 124 150 Z" fill="${core}"/>`;
    b += `<circle cx="120" cy="182" r="15" fill="#222"/><circle cx="180" cy="182" r="15" fill="#222"/>`;
    b += `<circle cx="120" cy="182" r="9" fill="#3a3a3e"/><circle cx="180" cy="182" r="9" fill="#3a3a3e"/>`;
    b += `<path d="M84 136 h10 v-10 h8 v10 h10 v8 h-10 v10 h-8 v-10 h-10 Z" fill="${dark ? '#ddd' : '#8a8a90'}"/>`;
    for (const [x, y] of [[214, 124], [202, 136], [226, 136], [214, 148]]) b += `<circle cx="${x}" cy="${y}" r="5" fill="${dark ? '#ddd' : '#8a8a90'}"/>`;
    return b;
  }
  function gamepad(c, view) {
    return svg('', shadow(150, 262, 100) + gamepadBody(c));
  }

  // ───── Dyson ─────
  function dryer(c, view) {
    const g = grad(c, 0.25, -0.2);
    let b = shadow(150, 282, 34);
    b += `<rect x="134" y="150" width="32" height="124" rx="14" fill="url(#${g.id})" stroke="${edge(c)}"/>`;
    b += `<rect x="134" y="150" width="32" height="40" rx="10" fill="${sh(c, -0.15)}"/>`;
    b += `<circle cx="150" cy="100" r="66" fill="url(#${g.id})" stroke="${edge(c)}" stroke-width="1.5"/>`;
    b += `<circle cx="150" cy="100" r="40" fill="${view === 1 ? sh(c, -0.4) : 'var(--img-bg, #f5f5f7)'}" stroke="${sh(c, -0.25)}" stroke-width="3"/>`;
    b += `<circle cx="150" cy="100" r="54" fill="none" stroke="#e8c4b8" stroke-width="4" opacity=".8"/>`;
    return svg(g.def, b);
  }
  function styler(c, view) {
    const g = grad(c, 0.25, -0.2);
    let b = shadow(150, 284, 30);
    b += `<rect x="133" y="120" width="34" height="156" rx="17" fill="url(#${g.id})" stroke="${edge(c)}"/>`;
    b += `<rect x="135" y="28" width="30" height="96" rx="15" fill="${view === 1 ? '#c9a27a' : sh(c, 0.2)}" stroke="${edge(c)}"/>`;
    for (let i = 0; i < 6; i++) b += `<rect x="139" y="${40 + i * 12}" width="22" height="3" rx="1.5" fill="${sh(c, -0.2)}" opacity=".5"/>`;
    b += `<rect x="140" y="160" width="20" height="6" rx="3" fill="${sh(c, -0.3)}"/>`;
    return svg(g.def, b);
  }
  function vacuum(c, view) {
    const g = grad(c, 0.2, -0.2);
    let b = shadow(150, 282, 70);
    b += `<path d="M196 56 L120 252" stroke="#8a8f99" stroke-width="12" stroke-linecap="round"/>`;
    b += `<rect x="70" y="244" width="110" height="26" rx="10" fill="#2b2d33"/><rect x="76" y="262" width="98" height="4" rx="2" fill="#5ef06a" opacity=".9"/>`;
    b += `<rect x="176" y="30" width="54" height="96" rx="20" fill="#9aa0aa" stroke="#7b818b"/>`;
    b += `<circle cx="203" cy="60" r="26" fill="url(#${g.id})" stroke="${edge(c)}"/>`;
    b += `<rect x="214" y="96" width="34" height="58" rx="12" fill="url(#${g.id})" stroke="${edge(c)}"/>`;
    b += `<circle cx="203" cy="60" r="9" fill="#7a2bd6"/>`;
    return svg(g.def, b);
  }

  // views — сколько ракурсов у типа устройства
  function views(spec) {
    return ['gamepad'].includes(spec.t) ? 1 : 2;
  }

  function render(spec, color, view = 0) {
    const c = color || spec.c || '#d0d0d4';
    switch (spec.t) {
      case 'phone': return view === 1 ? phoneFront(spec.k, c) : phoneBack(spec.k, c);
      case 'fold': return fold(c, view);
      case 'flip': return flip(c, view);
      case 'laptop': return laptop(c, view);
      case 'tablet': return tablet(c, view, spec.mini);
      case 'watch': return watch(c, view, spec.ultra);
      case 'airpods': return airpods(c, view, spec.pro);
      case 'headphones': return headphones(c, view);
      case 'console': return console_(c, view, spec.pro, spec.digital);
      case 'gamepad': return gamepad(c, view);
      case 'dryer': return dryer(c, view);
      case 'styler': return styler(c, view);
      case 'vacuum': return vacuum(c, view);
    }
    return svg('', '');
  }

  return { render, views, sh, lum };
})();
