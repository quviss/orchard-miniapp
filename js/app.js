// Мини-приложение магазина: навигация, экраны, корзина, чат поддержки.

const tg = TelegramBridge.sdk;
const inTG = TelegramBridge.active;
const DEFAULT_PRODUCTS = JSON.parse(JSON.stringify(PRODUCTS));
let catalogError = null;
function loadCatalog() {
  let result;
  try { result = Catalog.read(localStorage, DEFAULT_PRODUCTS, CATEGORIES); }
  catch (e) { result = {products: DEFAULT_PRODUCTS, error: e.message}; }
  PRODUCTS.splice(0, PRODUCTS.length, ...result.products);
  catalogError = result.error;
}
loadCatalog();
const visibleProducts = () => PRODUCTS.filter(p => !p.hidden);

// ───── утилиты ─────
const $ = sel => document.querySelector(sel);
const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const rub = n => n.toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₽';
const byId = id => PRODUCTS.find(p => p.id === id);
const catById = id => CATEGORIES.find(c => c.id === id);

const haptic = {
  tap() { TelegramBridge.call(inTG && tg.HapticFeedback, 'impactOccurred', 'light'); },
  select() { TelegramBridge.call(inTG && tg.HapticFeedback, 'selectionChanged'); },
  ok() { TelegramBridge.call(inTG && tg.HapticFeedback, 'notificationOccurred', 'success'); },
  err() { TelegramBridge.call(inTG && tg.HapticFeedback, 'notificationOccurred', 'error'); },
};

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* приватный режим — просто не сохраняем */ } },
};

const I = {
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
  compare: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M5 20V10M12 20V4M19 20V7M2 20h20"/></svg>',
  leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M19 3C8 2 2 8 5 15s15 5 14-12Z"/><path d="m4 21 11-12"/></svg>',
  store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1 12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v6c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6z"/><path d="m9 12 2 2 4-4"/></svg>',
  card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/></svg>',
  swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  tg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 4.3 18.4 19c-.2 1-.9 1.3-1.7.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.8 8.7-7.9c.4-.3-.1-.5-.6-.2L6.4 12.9l-4.6-1.4c-1-.3-1-1 .2-1.5L20.2 3c.8-.3 1.6.2 1.3 1.3z"/></svg>',
};

// ───── цены и наличие ─────
const oldPrice = (price, disc) => Math.ceil(price / (1 - disc) / 1000) * 1000 - 10;
const priceOf = (p, oi, si) => p.opt.items[oi].p + (p.sim ? SIM[si].p : 0);
const inStock = p => p.colors.some(c => c.q > 0);
function stockInfo(q) {
  if (q === 0) return { cls: 'warn', t: 'Под заказ · 3–5 дней' };
  if (q <= 2) return { cls: 'warn', t: `Осталось ${q} шт.` };
  return { cls: 'ok', t: 'В наличии' };
}
function imgs(p, ci) {
  const col = p.colors[ci];
  if (col.img) return [].concat(col.img).map(src => `<img src="${esc(src)}" data-fallback="${p.id}" data-ci="${ci}" alt="${esc(p.name)}"${src.includes('_AV2') ? ' class="cover"' : ''} loading="lazy">`);
  if (p.img) return [].concat(p.img).map(src => `<img src="${esc(src)}" data-fallback="${p.id}" data-ci="${ci}" alt="${esc(p.name)}" loading="lazy">`);
  const n = Art.views(p.art);
  return Array.from({ length: n }, (_, v) => Art.render(p.art, col.c, v));
}
const thumb = (p, ci = 0) => imgs(p, ci)[0];

// ───── состояние ─────
function readIds(key) {
  const ids = store.get(key, []);
  return Array.isArray(ids) ? [...new Set(ids)].filter(id => visibleProducts().some(p => p.id === id)) : [];
}
const S = {
  stack: [{ v: 'home' }],
  tab: 'home',
  cart: Catalog.cleanCart(store.get('cart', []), PRODUCTS),
  favorites: readIds('orchard.favorites'),
  recent: readIds('orchard.recent'),
  compare: Catalog.cleanCompare(readIds('orchard.compare'), PRODUCTS),
  filters: {},
  form: store.get('form', { name: '', phone: '', delivery: 0, address: '', pay: 0, comment: '' }),
  chat: [],
  q: '',
};
const saveCart = () => store.set('cart', S.cart);
const cartCount = () => S.cart.reduce((s, i) => s + i.qty, 0);
const cartTotal = () => S.cart.reduce((s, i) => { const p = byId(i.pid); return p ? s + priceOf(p, i.oi, i.si) * i.qty : s; }, 0);
const cur = () => S.stack[S.stack.length - 1];

// ───── навигация ─────
function push(route) {
  cur().y = window.scrollY;
  S.stack.push(route);
  if (route.v === 'product') { S.recent = [route.id, ...S.recent.filter(id => id !== route.id)].slice(0, 8); store.set('orchard.recent', S.recent); }
  render(true);
  window.scrollTo(0, 0);
}
function back() {
  if (S.stack.length < 2) return;
  S.stack.pop();
  render(true);
  window.scrollTo(0, cur().y || 0);
}
function switchTab(tab) {
  if (S.tab === tab && S.stack.length === 1) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  S.tab = tab;
  S.stack = [{ v: tab }];
  render(true);
  window.scrollTo(0, 0);
}
function rerender() {
  const y = window.scrollY;
  render(false);
  window.scrollTo(0, y);
}

// ───── компоненты ─────
function topbar(title) {
  return `<div class="topbar"><button class="backbtn" data-act="back">${I.back}Назад</button><div class="title">${esc(title)}</div><div class="spacer"></div></div>`;
}

function card(p, filters = {}) {
  if (!filters || typeof filters !== 'object') filters = {};
  const offer = Catalog.offers(p, filters).sort((a,b) => a.price-b.price)[0] || {price:p.opt.items[0].p,oi:0,si:0};
  const base = offer.price;
  const st = inStock(p) ? '<div class="st ok">В наличии</div>' : '<div class="st warn">Под заказ</div>';
  const badge = p.old ? `<span class="badge sale">−${Math.round(p.old * 100)}%</span>` : p.isNew ? '<span class="badge">Новинка</span>' : '';
  const sw = p.colors.length > 1 ? p.colors.slice(0, 6).map(c => `<i style="background:${c.c}"></i>`).join('') : '';
  return `<article class="pcard">
    <button class="product-link" data-act="open" data-id="${p.id}" data-oi="${offer.oi}" data-si="${offer.si}" aria-label="Открыть ${esc(p.name)}">
      ${badge}<div class="img">${thumb(p, firstAvailable(p))}</div><div class="sw">${sw}</div>
      <div class="nm">${esc(p.name)}</div><div class="card-sub">${esc(p.sub)}</div>
      <div class="pr">от ${rub(base)}</div>${p.old ? `<s class="old-price">${rub(oldPrice(base, p.old))}</s>` : ''}${st}
    </button>
    <button class="favorite-btn ${S.favorites.includes(p.id) ? 'selected' : ''}" data-act="favorite" data-id="${p.id}" aria-label="${S.favorites.includes(p.id) ? 'Убрать из избранного' : 'В избранное'}: ${esc(p.name)}" aria-pressed="${S.favorites.includes(p.id)}">${I.heart}</button>
    <button class="compare-btn ${S.compare.includes(p.id) ? 'selected' : ''}" data-act="compare-toggle" data-id="${p.id}" aria-pressed="${S.compare.includes(p.id)}">${I.compare}${S.compare.includes(p.id) ? 'В сравнении' : 'Сравнить'}</button>
  </article>`;
}
const firstAvailable = p => Math.max(0, p.colors.findIndex(c => c.q > 0));

// ───── экраны ─────
const HERO = [
  { id: 'iphone-18-pro', cls: 'light', kicker: 'Новинка', title: 'iPhone 18 Pro', text: 'Pro во всём. Теперь в цвете бургунди.', color: 3 },
  { id: 'iphone-duo', cls: 'cool', kicker: 'Уже в продаже', title: 'iPhone Duo', text: 'Первый складной iPhone.', color: 1 },
  { id: 'ps5-pro', cls: 'warm', kicker: 'Хит', title: 'PlayStation 5 Pro', text: 'Игры в 8K и 120 FPS.', color: 0 },
];

const VIEWS = {
  home() {
    const featured = visibleProducts().find(p => p.id === 'iphone-18-pro') || visibleProducts()[0];
    const cats = CATEGORIES.map(c => {
      const p = visibleProducts().find(x => x.cat === c.id);
      return `<button class="cat" data-act="cat" data-id="${c.id}"><div class="ic">${p ? thumb(p,0) : Art.render(c.art, c.art.c, 0)}</div>${esc(c.name)}</button>`;
    }).join('');
    const picks = visibleProducts().filter(p => p.hit).slice(0,4);
    const news = visibleProducts().filter(p => p.isNew && !picks.includes(p)).slice(0,4);
    return `<header class="home-head">
      <div class="brand-lockup"><div class="brand-mark">${I.leaf}</div><div><h1>${esc(CONFIG.storeName)}</h1><div class="brand-caption">Техника для вашего ритма</div></div></div>
      <span class="demo-tag">Демо</span></header>
      <button class="home-search" data-act="tab" data-id="search">${I.search}<span>Какую технику ищем?</span><span class="search-hint">Найти</span></button>
      ${catalogError ? '<p class="hint storage-warning">Сохранённый каталог не прочитан. Показана исходная версия.</p>' : ''}
      ${featured ? `<section class="feature-card"><div class="feature-copy"><span class="eyebrow">В центре внимания</span><h2>${esc(featured.name)}</h2><p>${esc(featured.sub)}</p><button class="feature-cta" data-act="open" data-id="${featured.id}">Смотреть модель ${I.chev}</button><span class="feature-price">от ${rub(featured.opt.items[0].p)}</span></div><div class="feature-art">${thumb(featured,Math.min(3,featured.colors.length-1))}</div><span class="feature-index">ORCHARD / SELECTED</span></section>` : '<div class="empty"><h2>Новая коллекция скоро</h2><p>Добавьте товары в управление каталогом.</p></div>'}
      <div class="section-h"><h3>Что вам интересно?</h3><span class="section-note">${visibleProducts().length} моделей</span></div><div class="cats">${cats}</div>
      <div class="discovery-banner"><div>${I.compare}<b>Найдите свою модель</b><p>Сравните характеристики и выберите то, что подходит вам.</p></div><button data-act="tab" data-id="search">Подобрать ${I.chev}</button></div>
      ${picks.length ? `<div class="section-h"><div><span class="eyebrow">Выбор Orchard</span><h3>Стоит присмотреться</h3></div><button data-act="tab" data-id="search">Весь каталог ${I.chev}</button></div><div class="grid">${picks.map(p=>card(p)).join('')}</div>` : ''}
      ${news.length ? `<div class="section-h"><h3>Новые открытия</h3></div><div class="hscroll">${news.map(p=>card(p)).join('')}</div>` : ''}
      ${S.recent.length ? `<div class="section-h"><h3>Вы смотрели</h3></div><div class="hscroll">${S.recent.slice(0,4).map(id=>byId(id)).filter(p=>p && !p.hidden).map(p=>card(p)).join('')}</div>` : ''}
      <footer class="store-footer"><div class="footer-brand">${I.leaf} ${esc(CONFIG.storeName)}</div><p>Демонстрационный каталог техники.<br>Покупки и обращения не отправляются.</p><a href="admin.html">Управление каталогом ${I.chev}</a><span>Сделано для Telegram</span></footer>`;
  },

  cat(r) {
    const c = catById(r.id);
    r.filters = r.filters || {cat:r.id};
    return `${topbar(c.name)}<div class="catalog-heading"><span class="eyebrow">Коллекция Orchard</span><h1>${esc(c.name)}</h1><p>Выберите то, что подходит именно вам.</p></div>${filterControls(r.filters, true)}<div id="results">${catalogResults(r.filters)}</div>`;
  },

  product(r) {
    const p = byId(r.id);
    if (r.ci == null) r.ci = firstAvailable(p);
    r.ci = Math.max(0, Math.min(r.ci, p.colors.length-1));
    r.oi = Math.max(0, Math.min(r.oi || 0, p.opt.items.length-1));
    r.si = p.sim ? Math.min(r.si || 0, 1) : 0;
    const col = p.colors[r.ci];
    const price = priceOf(p, r.oi, r.si);
    const st = stockInfo(col.q);
    const slides = imgs(p, r.ci);
    const badge = p.old ? `<span class="badge sale">−${Math.round(p.old * 100)}%</span>` : p.isNew ? '<span class="badge">Новинка</span>' : '';

    const swatches = p.colors.map((c, i) =>
      `<button class="swatch ${i === r.ci ? 'on' : ''} ${c.q ? '' : 'out'}" style="background:${c.c}" data-act="color" data-i="${i}" aria-label="${esc(c.n)}"></button>`).join('');
    const opts = p.opt.items.map((o, i) =>
      `<button class="${i === r.oi ? 'on' : ''}" data-act="opt" data-i="${i}"><b>${esc(o.t)}</b><span>${rub(o.p + (p.sim ? SIM[r.si].p : 0))}</span></button>`).join('');
    const sims = p.sim ? `<div class="opt-block"><div class="opt-label">SIM-карта</div><div class="seg">${SIM.map((s, i) =>
      `<button class="${i === r.si ? 'on' : ''}" data-act="sim" data-i="${i}"><b>${s.t}</b><span>${s.p ? '+ ' + rub(s.p) : 'Базовая цена'}</span></button>`).join('')}</div></div>` : '';

    const delivery = col.q
      ? `<div class="row">${I.truck}<div class="t">Доставка сегодня<small>Курьером за 2 часа · бесплатно от 30 000 ₽</small></div></div>
         <div class="row">${I.pin}<div class="t">Самовывоз сегодня<small>${esc(CONFIG.address)}</small></div></div>`
      : `<div class="row">${I.truck}<div class="t">Привезём под заказ за 3–5 дней<small>Предоплата не нужна</small></div></div>`;

    return `${topbar(catById(p.cat).name)}
      <div class="product-toolbar"><button class="chip ${S.favorites.includes(p.id) ? 'on' : ''}" data-act="favorite" data-id="${p.id}" aria-pressed="${S.favorites.includes(p.id)}">${I.heart} Избранное</button><button class="chip ${S.compare.includes(p.id) ? 'on' : ''}" data-act="compare-toggle" data-id="${p.id}" aria-pressed="${S.compare.includes(p.id)}">${I.compare} Сравнить</button>${S.compare.length ? '<button class="text-button" data-act="compare-open">К сравнению →</button>' : ''}</div>
      <div class="gallery-wrap">
        ${badge}
        <div class="gallery" id="gallery">${slides.map(s => `<div class="g">${s}</div>`).join('')}</div>
        ${slides.length > 1 ? `<div class="dots" id="gallery-dots">${slides.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>` : ''}
      </div>
      <div class="pd">
        <h1>${esc(p.name)}</h1>
        <div class="sub">${esc(p.sub)}</div>
        <div class="stock ${st.cls}">${st.t}</div>
        <div class="price"><b>${rub(price)}</b>${p.old ? `<s>${rub(oldPrice(price, p.old))}</s><span class="disc">−${Math.round(p.old * 100)}%</span>` : ''}</div>
        <div class="installment">или ${rub(Math.ceil(price / 12))}/мес в рассрочку 0%</div>
        ${p.colors.length > 1 ? `<div class="opt-block"><div class="opt-label">Цвет <span>· ${esc(col.n)}</span></div><div class="swatches">${swatches}</div></div>` : ''}
        <div class="opt-block"><div class="opt-label">${esc(p.opt.label)}</div><div class="seg ${p.opt.items.length === 1 ? 'one' : ''}">${opts}</div></div>
        ${sims}
      </div>
      <div class="info-card">${delivery}
        <div class="row">${I.shield}<div class="t">Гарантия 1 год<small>Новый, оригинал, запечатан</small></div></div>
      </div>
      <div class="info-card"><h4>Характеристики</h4>${p.specs.map(([k, v]) => `<div class="spec"><div class="k">${esc(k)}</div><div class="v">${esc(v)}</div></div>`).join('')}
        <div class="spec"><div class="k">В комплекте</div><div class="v">${esc(p.box)}</div></div>
      </div>
      <div class="info-card"><button class="row link-row" data-act="ask">${I.chat}<div class="t">Задать вопрос о товаре<small>Ответим в чате за пару минут</small></div>${I.chev}</button></div>`;
  },

  search() {
    return `<div class="catalog-heading"><span class="eyebrow">Найдите своё</span><h1>Каталог</h1></div><div class="searchbox"><label>${I.search}<input id="q" type="search" placeholder="Модель, бренд или память" aria-label="Поиск по магазину" value="${esc(S.q)}" autocomplete="off"><button data-act="clear-search" aria-label="Очистить поиск">×</button></label></div>${filterControls(S.filters)}<div id="results">${catalogResults({...S.filters,q:S.q})}</div>`;
  },

  saved() {
    const list = S.favorites.map(byId).filter(p=>p && !p.hidden);
    return `<div class="catalog-heading"><span class="eyebrow">Ваша коллекция</span><h1>Избранное</h1><p>Сохраните интересное, чтобы вернуться позже.</p></div>${list.length ? `<div class="grid">${list.map(p=>card(p)).join('')}</div>` : `<div class="empty"><div class="big">${I.heart}</div><h2>То, что вам нравится</h2><p>Нажмите на сердечко у модели — и она будет здесь.</p><button class="btn" data-act="tab" data-id="search">В каталог</button></div>`}${S.recent.length ? `<div class="section-h"><h3>Недавно смотрели</h3></div><div class="grid">${S.recent.map(byId).filter(p=>p && !p.hidden).map(p=>card(p)).join('')}</div>` : ''}`;
  },

  compare(r) {
    const list = S.compare.map(byId).filter(p=>p && !p.hidden);
    if (!list.length) return `${topbar('Сравнение')}<div class="empty"><div class="big">${I.compare}</div><h2>Сравните перед выбором</h2><p>Добавьте до трёх моделей одной категории.</p><button class="btn" data-act="tab" data-id="search">Выбрать модели</button></div>`;
    const keys = [...new Set(list.flatMap(p=>p.specs.map(row=>row[0])))];
    const rows = [['Память / версия',list.map(p=>p.opt.items.map(o=>o.t).join(', '))],['Наличие',list.map(p=>inStock(p) ? 'В наличии':'Под заказ')],...keys.map(k=>[k,list.map(p=>(p.specs.find(row=>row[0]===k)||[])[1] || '—')])];
    const shown = r.different ? rows.filter(([,values])=>new Set(values).size>1) : rows;
    return `${topbar('Сравнение')}<div class="catalog-heading"><span class="eyebrow">Выбирайте осознанно</span><h1>Детали решают</h1><p>Цены указаны за начальную комплектацию.</p></div><div class="compare-options"><label><input type="checkbox" id="different" ${r.different ? 'checked':''}> Только различия</label><button class="text-button" data-act="compare-clear">Очистить</button></div><div class="comparison-scroll" tabindex="0" aria-label="Таблица сравнения"><table class="comparison"><thead><tr><th scope="col">${esc(catById(list[0].cat).name)}<small>До 3 моделей</small></th>${list.map(p=>`<th scope="col"><button class="compare-remove" data-act="compare-toggle" data-id="${p.id}" aria-label="Убрать из сравнения ${esc(p.name)}">×</button><button class="compare-product" data-act="open" data-id="${p.id}"><div class="compare-image">${thumb(p,firstAvailable(p))}</div><b>${esc(p.name)}</b><span>от ${rub(p.opt.items[0].p)}</span></button></th>`).join('')}</tr></thead><tbody>${shown.map(([k,values])=>`<tr class="${new Set(values).size>1 ? 'diff-row':''}"><th scope="row">${esc(k)}</th>${values.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${list.length===1 ? '<p class="hint">Добавьте ещё одну модель этой категории для сравнения.</p>' : !shown.length ? '<p class="hint">По указанным характеристикам различий нет.</p>' : ''}<div class="wrap"><button class="btn block ghost" data-act="cat" data-id="${list[0].cat}">Добавить модель</button></div>`;
  },

  cart() {
    if (!S.cart.length) {
      return `<h1 class="page-title">Корзина</h1>
        <div class="empty"><div class="big">${I.bag}</div><h2>Здесь пока пусто</h2><p>Добавьте товары из каталога — они появятся здесь.</p>
        <button class="btn" data-act="tab" data-id="home">Перейти в магазин</button></div>`;
    }
    const items = S.cart.map((it, idx) => {
      const p = byId(it.pid);
      if (!p) return '';
      const variant = [p.colors.length > 1 ? p.colors[it.ci].n : '', p.opt.items[it.oi].t, p.sim ? SIM[it.si].t : ''].filter(Boolean).join(' · ');
      return `<div class="citem">
        <button class="img" data-act="open" data-id="${p.id}">${thumb(p, it.ci)}</button>
        <div class="info"><div class="nm">${esc(p.name)}</div><div class="vr">${esc(variant)}</div>
          <div class="bottom"><div class="pr">${rub(priceOf(p, it.oi, it.si) * it.qty)}</div>
            <div class="stepper"><button data-act="qty" data-i="${idx}" data-d="-1" aria-label="Меньше">${I.minus}</button><span>${it.qty}</span><button data-act="qty" data-i="${idx}" data-d="1" aria-label="Больше">${I.plus}</button></div>
          </div></div></div>`;
    }).join('');
    const total = cartTotal();
    return `<h1 class="page-title">Корзина</h1>
      <p class="page-sub">${cartCount()} ${plural(cartCount(), 'товар', 'товара', 'товаров')}</p>
      <div class="info-card">${items}</div>
      <div class="info-card" style="padding:10px 16px">
        <div class="sumrow"><span>Товары</span><span>${rub(total)}</span></div>
        <div class="sumrow"><span>Доставка</span><span>${total >= 30000 ? 'Бесплатно' : rub(500)}</span></div>
        <div class="sumrow total"><span>Итого</span><span>${rub(total + (total >= 30000 ? 0 : 500))}</span></div>
      </div>
      <div class="wrap" style="margin-top:16px"><button class="btn block" data-act="checkout">Оформить заказ</button></div>`;
  },

  checkout() {
    const f = S.form;
    const total = cartTotal();
    const seg = (key, labels) => `<div class="seg3">${labels.map((t, i) => `<button class="${f[key] === i ? 'on' : ''}" data-act="form-seg" data-k="${key}" data-i="${i}">${t}</button>`).join('')}</div>`;
    return `${topbar('Оформление')}
      <h1 class="page-title">Пример оформления</h1><p class="demo-notice">Это макет. Заказ и данные никуда не отправляются. Используйте вымышленные контакты.</p>
      <div class="info-card">
        <label class="field" id="f-name"><span>Имя</span><input data-f="name" value="${esc(f.name)}" placeholder="Как к вам обращаться" autocomplete="name"></label>
        <label class="field" id="f-phone"><span>Телефон</span><input data-f="phone" value="${esc(f.phone)}" placeholder="+7 900 000-00-00" inputmode="tel" autocomplete="tel"></label>
      </div>
      <div class="wrap">${seg('delivery', ['Самовывоз', 'Курьер', 'СДЭК'])}</div>
      <div class="info-card">
        ${f.delivery === 0
          ? `<div class="row">${I.pin}<div class="t">${esc(CONFIG.address)}<small>${esc(CONFIG.hours)} · заберёте сегодня</small></div></div>`
          : `<label class="field" id="f-address"><span>Адрес доставки</span><input data-f="address" value="${esc(f.address)}" placeholder="Город, улица, дом, квартира"></label>`}
      </div>
      <div class="wrap">${seg('pay', ['На месте', 'Онлайн', 'Рассрочка'])}</div>
      <div class="info-card"><label class="field"><span>Комментарий</span><textarea data-f="comment" rows="2" placeholder="Удобное время, вопросы">${esc(f.comment)}</textarea></label></div>
      <div class="buybar"><div class="sum"><small>К оплате</small><b>${rub(total + (total >= 30000 || f.delivery === 0 ? 0 : 500))}</b></div><button class="btn" data-act="submit">Показать результат</button></div>`;
  },

  done(r) {
    return `<div class="done"><div class="check">${I.check}</div>
        <h1>Демо-заказ №${r.no}</h1>
        <p>Спасибо${S.form.name ? ', ' + esc(S.form.name) : ''}! Это пример экрана подтверждения. Заказ не отправлен, списаний нет.</p>
      </div>
      <div class="info-card" style="padding:10px 16px">
        <div class="sumrow"><span>Товаров</span><span>${r.count}</span></div>
        <div class="sumrow"><span>Получение</span><span>${['Самовывоз', 'Курьер', 'СДЭК'][S.form.delivery]}</span></div>
        <div class="sumrow total"><span>Сумма</span><span>${rub(r.total)}</span></div>
      </div>
      <div class="wrap" style="margin-top:16px;display:grid;gap:10px">
        <button class="btn block" data-act="tab" data-id="home">Вернуться в магазин</button>
        <button class="btn block ghost" data-act="tab" data-id="support">Написать в поддержку</button>
      </div>`;
  },

  support() {
    if (!S.chat.length) {
      S.chat.push({ me: false, t: `Здравствуйте! Я помощник магазина ${CONFIG.storeName}.\nПодскажу по наличию, доставке, гарантии и рассрочке. Выберите тему ниже или напишите вопрос.`, at: now() });
    }
    return `<div class="chat-page">
      <div class="chat-head"><div class="ava">${esc(CONFIG.storeName[0])}</div>
        <div><b>Поддержка ${esc(CONFIG.storeName)}</b><small>Демо-помощник · готовые ответы</small></div>
        <button class="round-btn" data-act="manager" aria-label="Написать менеджеру" style="color:var(--accent)">${I.tg}</button>
      </div>
      <div class="msgs" id="msgs">${S.chat.map(msgHtml).join('')}</div>
      </div>`;
  },
};

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
const now = () => new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
const msgHtml = m => m.typing
  ? '<div class="msg bot typing"><i></i><i></i><i></i></div>'
  : `<div class="msg ${m.me ? 'me' : 'bot'}">${esc(m.t)}<time>${m.at}</time></div>`;

function filterControls(f, categoryOnly = false) {
  const options = (items, value) => items.map(([v,t])=>`<option value="${esc(v)}" ${String(value||'')===String(v) ? 'selected':''}>${esc(t)}</option>`).join('');
  const models = categoryOnly ? visibleProducts().filter(p=>p.cat===f.cat) : visibleProducts();
  const memories = [...new Set(models.flatMap(p=>p.opt.items.map(o=>o.t)).filter(t=>/ГБ|ТБ/i.test(t)))];
  const count = Object.entries(f).filter(([k,v])=>v && (!categoryOnly || k!=='cat') && k!=='open').length;
  return `<details class="filters" ${f.open ? 'open':''}><summary>${I.swap}<span>Фильтры${count ? ` · ${count}`:''}</span><span class="filter-summary">Под ваш запрос</span>${I.chev}</summary><form id="catalog-filter"><div class="filter-fields">
    ${categoryOnly ? `<input type="hidden" name="cat" value="${esc(f.cat)}">` : `<label>Категория<select name="cat">${options([['','Вся техника'],...CATEGORIES.map(c=>[c.id,c.name])],f.cat)}</select></label>`}
    <label>Память<select name="memory">${options([['','Любая'],...memories.map(t=>[t,t])],f.memory)}</select></label>
    <label>Цена от, ₽<input name="min" type="number" min="0" max="100000000" inputmode="numeric" value="${esc(f.min||'')}" placeholder="0"></label>
    <label>Цена до, ₽<input name="max" type="number" min="0" max="100000000" inputmode="numeric" value="${esc(f.max||'')}" placeholder="Без ограничений"></label>
    <label>SIM<select name="sim">${options([['','Любая'],['esim','eSIM'],['physical','nano-SIM + eSIM']],f.sim)}</select></label>
    <label>Порядок<select name="sort">${options([['','Рекомендуем'],['asc','Сначала дешевле'],['desc','Сначала дороже']],f.sort)}</select></label>
    </div><div class="filter-checks"><label><input name="stock" type="checkbox" ${f.stock ? 'checked':''}> В наличии</label><label><input name="sale" type="checkbox" ${f.sale ? 'checked':''}> Со скидкой</label><button type="button" class="text-button" data-act="reset-filters">Сбросить</button></div><button class="btn block filter-apply" type="submit">Показать модели</button></form></details>`;
}
function catalogResults(f) {
  const list = Catalog.query(PRODUCTS,f);
  const conflict = f.min && f.max && Number(f.min)>Number(f.max);
  return `<div class="results-head" aria-live="polite"><span>${list.length} ${plural(list.length,'модель','модели','моделей')}</span><span>В коллекции Orchard</span></div>${list.length ? `<div class="grid">${list.map(p=>card(p,f)).join('')}</div>` : `<div class="empty"><div class="big">${I.search}</div><h2>${conflict ? 'Проверьте диапазон цены' : 'Пока ничего не нашлось'}</h2><p>${conflict ? 'Цена «от» должна быть меньше цены «до».' : 'Попробуйте другой запрос или уберите часть фильтров.'}</p><button class="btn ghost" data-act="reset-filters">Сбросить фильтры</button></div>`}`;
}
function currentFilters() { return cur().v==='cat' ? cur().filters : S.filters; }
function searchResults() { return catalogResults({...S.filters,q:S.q}); }
function renderCompareTray() {
  let tray = $('#compare-tray');
  if (!tray) { tray=document.createElement('div'); tray.id='compare-tray'; document.body.appendChild(tray); }
  const visible = S.compare.length>0 && !['product','checkout','compare'].includes(cur().v);
  tray.hidden=!visible;
  document.body.classList.toggle('has-compare',visible);
  tray.innerHTML=visible ? `<div><b>Сравнение</b><small>${S.compare.length} из 3 моделей · ${esc(catById(byId(S.compare[0]).cat).name)}</small></div><button class="btn" data-act="compare-open">Сравнить ${S.compare.length}</button><button class="tray-clear" data-act="compare-clear" aria-label="Очистить сравнение">×</button>` : '';
}

// ───── отрисовка ─────
const NO_TABBAR = ['product', 'checkout'];

function render(animate) {
  const r = cur();
  const view = $('#view');
  view.innerHTML = VIEWS[r.v](r);
  view.classList.toggle('no-tabbar', NO_TABBAR.includes(r.v));
  if (animate) { view.classList.remove('enter'); void view.offsetWidth; view.classList.add('enter'); }
  renderBottom(r);
  renderTabbar(r);
  document.documentElement.classList.toggle('tg-native-back', TelegramBridge.back(S.stack.length > 1));
  renderCompareTray();
  bindView(r);
}

function renderBottom(r) {
  const el = $('#bottom');
  if (r.v === 'support') {
    el.innerHTML = `<div class="composer">
        <div class="chips">${FAQ.map((f, i) => `<button class="chip" data-act="faq" data-i="${i}">${f.q}</button>`).join('')}</div>
        <form id="composer"><input id="msg" placeholder="Сообщение" autocomplete="off"><button type="submit" aria-label="Отправить">${I.send}</button></form>
      </div>`;
    return;
  }
  if (r.v !== 'product') { el.innerHTML = ''; return; }
  const p = byId(r.id);
  const price = priceOf(p, r.oi, r.si);
  const inCart = S.cart.some(i => i.pid === p.id && i.ci === r.ci && i.oi === r.oi && i.si === r.si);
  const variant = [p.colors.length > 1 ? p.colors[r.ci].n : '', p.opt.items[r.oi].t].filter(Boolean).join(' · ');
  el.innerHTML = `<div class="buybar"><div class="sum"><small>${esc(variant)}</small><b>${rub(price)}</b></div>
    ${inCart ? `<button class="btn in-cart" data-act="tab" data-id="cart">${I.check}В корзине</button>` : `<button class="btn" data-act="add">${p.colors[r.ci].q ? 'В корзину' : 'Заказать'}</button>`}</div>`;
}

function renderTabbar(r) {
  const bar = $('#tabbar');
  bar.classList.toggle('hidden', NO_TABBAR.includes(r.v));
  const n = cartCount();
  const tabs = [['home', 'Магазин', I.store], ['search', 'Поиск', I.search], ['saved', 'Избранное', I.heart], ['cart', 'Корзина', I.bag], ['support', 'Поддержка', I.chat]];
  bar.innerHTML = tabs.map(([id, t, ic]) => `<button class="${S.tab === id ? 'on' : ''}" data-act="tab" data-id="${id}">${ic}${t}${id === 'cart' && n ? `<span class="cnt">${n}</span>` : ''}</button>`).join('');
}

// синхронизация точек под каруселями
function syncDots(scroller, dots) {
  if (!scroller || !dots) return;
  scroller.addEventListener('scroll', () => {
    const i = Math.round(scroller.scrollLeft / scroller.clientWidth);
    [...dots.children].forEach((d, k) => d.classList.toggle('on', k === i));
  }, { passive: true });
}

function bindView(r) {
  syncDots($('#hero'), $('#hero-dots'));
  syncDots($('#gallery'), $('#gallery-dots'));
  if (r.v === 'search') {
    const q = $('#q');
    q.addEventListener('input', () => { S.q = q.value; $('#results').innerHTML = searchResults(); });
    // Keep the keyboard closed until the visitor taps search.
  }
  const filterForm = $('#catalog-filter');
  if (filterForm) {
    const update = (close) => {
      const f = Object.fromEntries(new FormData(filterForm));
      f.stock = filterForm.elements.stock.checked;
      f.sale = filterForm.elements.sale.checked;
      f.open = !close;
      if (r.v === 'cat') r.filters = f; else S.filters = f;
      if(close) rerender();
      else $('#results').innerHTML = catalogResults({...f,q:r.v==='search' ? S.q : ''});
    };
    filterForm.addEventListener('submit', e=>{e.preventDefault(); update(true);});
    filterForm.addEventListener('change', ()=>update(false));
    filterForm.closest('details').addEventListener('toggle', e=>{currentFilters().open=e.target.open;});
  }
  if (r.v === 'compare' && $('#different')) $('#different').addEventListener('change', e=>{r.different=e.target.checked;rerender();});
  if (r.v === 'checkout') {
    document.querySelectorAll('[data-f]').forEach(inp => inp.addEventListener('input', () => {
      S.form[inp.dataset.f] = inp.value;
      inp.closest('.field').classList.remove('err');
      store.set('form', S.form);
    }));
  }
  if (r.v === 'support') {
    $('#composer').addEventListener('submit', e => {
      e.preventDefault();
      const inp = $('#msg');
      const t = inp.value.trim();
      if (!t) return;
      inp.value = '';
      say(t);
    });
    scrollChat();
  }
}

// ───── действия ─────
function toast(text) {
  const el = $('#toast');
  el.innerHTML = I.check + esc(text);
  el.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('show'), 1800);
}

function addToCart(r) {
  const p = byId(r.id);
  const same = S.cart.find(i => i.pid === p.id && i.ci === r.ci && i.oi === r.oi && i.si === r.si);
  if (same) same.qty++;
  else S.cart.push({ pid: p.id, ci: r.ci, oi: r.oi, si: r.si, qty: 1, variant: {color:p.colors[r.ci].n,option:p.opt.items[r.oi].t} });
  saveCart();
  haptic.ok();
  toast('Добавлено в корзину');
  renderBottom(r);
  renderTabbar(r);
}

function submitOrder() {
  const f = S.form;
  const bad = [];
  if (!f.name.trim()) bad.push('f-name');
  if ((f.phone.match(/\d/g) || []).length < 10) bad.push('f-phone');
  if (f.delivery !== 0 && !f.address.trim()) bad.push('f-address');
  if (bad.length) {
    bad.forEach(id => $('#' + id) && $('#' + id).classList.add('err'));
    haptic.err();
    if (tg && tg.showAlert && inTG) tg.showAlert('Заполните, пожалуйста, обязательные поля');
    return;
  }
  const total = cartTotal() + (cartTotal() >= 30000 || f.delivery === 0 ? 0 : 500);
  const done = { v: 'done', no: String(Math.floor(10000 + Math.random() * 89999)), count: cartCount(), total };
  S.cart = [];
  saveCart();
  haptic.ok();
  S.stack = [done];
  render(true);
  window.scrollTo(0, 0);
}

function scrollChat() { window.scrollTo(0, document.body.scrollHeight); }

function botReply(text) {
  const t = text.toLowerCase();
  const rules = [
    [/доставк|курьер|привез|сдэк/, 0], [/гарант|ремонт|сервис/, 1], [/trade|трейд|сдать|обмен/, 2],
    [/рассроч|кредит|долям|частям/, 3], [/оригинал|подделк|реплик|настоящ/, 4], [/адрес|где вы|магазин|самовывоз|забрать/, 5],
  ];
  for (const [re, i] of rules) if (re.test(t)) return FAQ[i].a;
  if (/налич|есть ли|остал/.test(t)) return 'Наличие видно прямо в карточке товара. Если нужного цвета нет — привезём под заказ за 3–5 дней без предоплаты.';
  if (/скидк|дешевл|торг/.test(t)) return 'При оплате наличными или переводом — дополнительная скидка 2%. Также действует trade-in.';
  return 'Это демонстрационный помощник. Я могу показать ответы о доставке, гарантии и выборе техники. Сообщения менеджеру здесь не отправляются.';
}

function say(text, answer) {
  S.chat.push({ me: true, t: text, at: now() });
  S.chat.push({ typing: true });
  if (cur().v === 'support') { $('#msgs').innerHTML = S.chat.map(msgHtml).join(''); scrollChat(); }
  haptic.tap();
  setTimeout(() => {
    S.chat = S.chat.filter(m => !m.typing);
    S.chat.push({ me: false, t: answer || botReply(text), at: now() });
    if (cur().v === 'support') { $('#msgs').innerHTML = S.chat.map(msgHtml).join(''); scrollChat(); }
    haptic.select();
  }, 900 + Math.random() * 600);
}

function openManager() {
  if (CONFIG.manager && tg && inTG) tg.openTelegramLink('https://t.me/' + CONFIG.manager);
  else if (CONFIG.manager) window.open('https://t.me/' + CONFIG.manager, '_blank');
  else if (tg && inTG) tg.showAlert('В демо-версии чат с менеджером не подключён. В рабочей версии здесь откроется диалог с продавцом в Telegram.');
  else alert('В демо-версии чат с менеджером не подключён.');
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  const r = cur();
  switch (act) {
    case 'open': {
      haptic.tap();
      const route = { v: 'product', id: el.dataset.id, oi: +(el.dataset.oi || 0), si: +(el.dataset.si || 0) };
      if (el.dataset.ci) Object.assign(route, { ci: +el.dataset.ci });
      push(route);
      break;
    }
    case 'favorite': {
      const id=el.dataset.id;
      S.favorites=S.favorites.includes(id) ? S.favorites.filter(x=>x!==id) : [...S.favorites,id];
      store.set('orchard.favorites',S.favorites); haptic.select(); rerender(); break;
    }
    case 'compare-toggle': {
      const result=Catalog.toggleCompare(S.compare,el.dataset.id,PRODUCTS);
      if(result.error) {toast(result.error==='limit' ? 'Можно сравнить до 3 моделей' : 'Выберите модели одной категории'); break;}
      S.compare=result.ids;store.set('orchard.compare',S.compare);haptic.select();rerender();break;
    }
    case 'compare-open': push({v:'compare'});break;
    case 'compare-clear': S.compare=[];store.set('orchard.compare',[]);rerender();break;
    case 'reset-filters': if(r.v==='cat') r.filters={cat:r.id}; else {S.filters={};S.q='';} rerender();break;
    case 'clear-search': S.q='';$('#q').value='';$('#results').innerHTML=searchResults();$('#q').focus();break;
    case 'cat': haptic.tap(); push({ v: 'cat', id: el.dataset.id }); break;
    case 'tab': haptic.select(); switchTab(el.dataset.id); break;
    case 'back': back(); break;
    case 'filter': haptic.select(); r[el.dataset.k] = el.dataset.v; rerender(); break;
    case 'price-sort': haptic.select(); r.s = r.s === 'asc' ? 'desc' : 'asc'; rerender(); break;
    case 'color': haptic.select(); r.ci = +el.dataset.i; rerender(); break;
    case 'opt': haptic.select(); r.oi = +el.dataset.i; rerender(); break;
    case 'sim': haptic.select(); r.si = +el.dataset.i; rerender(); break;
    case 'add': addToCart(r); break;
    case 'qty': {
      const it = S.cart[+el.dataset.i];
      it.qty += +el.dataset.d;
      if (it.qty <= 0) S.cart.splice(+el.dataset.i, 1);
      saveCart(); haptic.select(); rerender();
      break;
    }
    case 'checkout': haptic.tap(); push({ v: 'checkout' }); break;
    case 'form-seg': haptic.select(); S.form[el.dataset.k] = +el.dataset.i; store.set('form', S.form); rerender(); break;
    case 'submit': submitOrder(); break;
    case 'q': S.q = el.dataset.v; $('#q').value = S.q; $('#results').innerHTML = searchResults(); break;
    case 'faq': {
      const f = FAQ[+el.dataset.i];
      if (r.v !== 'support') switchTab('support');
      say(f.q, f.a);
      break;
    }
    case 'ask': {
      const p = byId(r.id);
      const col = p.colors[r.ci];
      const variant = [p.colors.length > 1 ? col.n : '', p.opt.items[r.oi].t].filter(Boolean).join(', ');
      switchTab('support');
      say(`Здравствуйте! Интересует ${p.name} (${variant}).`,
        col.q ? `Да, ${p.name} в этой комплектации есть в наличии — ${col.q} шт. Можем отложить на сутки или привезти сегодня. Оформить?` : `Этого цвета сейчас нет на складе, но привезём за 3–5 дней без предоплаты. Оформить заказ?`);
      break;
    }
    case 'manager': openManager(); break;
  }
});

// ───── тема и Telegram ─────
function applyTheme() {
  const dark = inTG ? tg.colorScheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  TelegramBridge.colors(dark);
}

if (inTG) {
  document.documentElement.classList.add('tg');
  const u = tg.initDataUnsafe && tg.initDataUnsafe.user;
  if (u && !S.form.name) S.form.name = u.first_name || '';
}
TelegramBridge.init(back, applyTheme);
// If the SDK fails or is too old, the in-page back control stays usable.
// render() hides the in-page back control only after a successful native call.
// Remote device photos may disappear; preserve a useful catalog with existing vector art.
document.addEventListener('error', e => {
  const img=e.target;
  if (!img.dataset || !img.dataset.fallback) return;
  const p=byId(img.dataset.fallback);
  if (!p) return;
  const template=document.createElement('template');
  template.innerHTML=Art.render(p.art,p.colors[+img.dataset.ci || 0].c,0);
  img.replaceWith(template.content.firstElementChild);
}, true);
function refreshCatalog() {
  loadCatalog();
  S.cart=Catalog.cleanCart(S.cart,PRODUCTS);saveCart();
  for(const key of ['favorites','recent','compare']) S[key]=S[key].filter(id=>visibleProducts().some(p=>p.id===id));
  S.compare=Catalog.cleanCompare(S.compare, PRODUCTS);
  S.stack=S.stack.filter(r=>r.v!=='product' || visibleProducts().some(p=>p.id===r.id));
  if(!S.stack.length) {S.tab='home';S.stack=[{v:'home'}];}
  render(false);
}
window.addEventListener('pageshow', e=>{if(e.persisted) refreshCatalog();});
window.addEventListener('storage', e=>{if(e.key===Catalog.KEY || e.key===null) refreshCatalog();});
applyTheme();
render(false);
