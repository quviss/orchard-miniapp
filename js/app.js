// Мини-приложение магазина: навигация, экраны, корзина, чат поддержки.

const tg = window.Telegram && window.Telegram.WebApp;
const inTG = !!(tg && tg.initData);

// ───── утилиты ─────
const $ = sel => document.querySelector(sel);
const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const rub = n => n.toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₽';
const byId = id => PRODUCTS.find(p => p.id === id);
const catById = id => CATEGORIES.find(c => c.id === id);

const haptic = {
  tap() { tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred('light'); },
  select() { tg && tg.HapticFeedback && tg.HapticFeedback.selectionChanged(); },
  ok() { tg && tg.HapticFeedback && tg.HapticFeedback.notificationOccurred('success'); },
  err() { tg && tg.HapticFeedback && tg.HapticFeedback.notificationOccurred('error'); },
};

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* приватный режим — просто не сохраняем */ } },
};

const I = {
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
  if (col.img) return [].concat(col.img).map(src => `<img src="${src}" alt="${esc(p.name)}" loading="lazy">`);
  if (p.img) return [].concat(p.img).map(src => `<img src="${src}" alt="${esc(p.name)}" loading="lazy">`);
  const n = Art.views(p.art);
  return Array.from({ length: n }, (_, v) => Art.render(p.art, col.c, v));
}
const thumb = (p, ci = 0) => imgs(p, ci)[0];

// ───── состояние ─────
const S = {
  stack: [{ v: 'home' }],
  tab: 'home',
  cart: store.get('cart', []),
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

function card(p) {
  const base = p.opt.items[0].p;
  const st = inStock(p) ? '<div class="st ok">В наличии</div>' : '<div class="st warn">Под заказ</div>';
  const badge = p.old ? `<span class="badge sale">−${Math.round(p.old * 100)}%</span>` : p.isNew ? '<span class="badge">Новинка</span>' : '';
  const sw = p.colors.length > 1 ? p.colors.slice(0, 6).map(c => `<i style="background:${c.c}"></i>`).join('') : '';
  return `<button class="pcard" data-act="open" data-id="${p.id}">
    ${badge}
    <div class="img">${thumb(p, firstAvailable(p))}</div>
    <div class="sw">${sw}</div>
    <div class="nm">${esc(p.name)}</div>
    <div class="pr">от ${rub(base)}${p.old ? `<s>${rub(oldPrice(base, p.old))}</s>` : ''}</div>
    ${st}
  </button>`;
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
    const hero = HERO.map(h => {
      const p = byId(h.id);
      return `<div class="slide ${h.cls}" data-act="open" data-id="${p.id}" data-ci="${h.color}">
        <div class="kicker">${h.kicker}</div><h2>${h.title}</h2><p>${h.text}</p>
        <div class="cta"><span class="pill-btn">Купить</span><span class="pill-btn light">от ${rub(p.opt.items[0].p)}</span></div>
        <div class="art">${thumb(p, h.color)}</div>
      </div>`;
    }).join('');
    const cats = CATEGORIES.map(c => {
      const p = PRODUCTS.find(x => x.cat === c.id);
      return `<button class="cat" data-act="cat" data-id="${c.id}"><div class="ic">${thumb(p, 0)}</div>${esc(c.name)}</button>`;
    }).join('');
    const news = PRODUCTS.filter(p => p.isNew).slice(0, 4).map(card).join('');
    const hits = PRODUCTS.filter(p => p.hit).slice(0, 6).map(card).join('');
    const rows = CATEGORIES.map(c => `
      <div class="section-h"><h3>${esc(c.name)}</h3><button data-act="cat" data-id="${c.id}">Все</button></div>
      <div class="grid">${PRODUCTS.filter(p => p.cat === c.id).slice(0, 4).map(card).join('')}</div>`).join('');

    return `
      <header class="home-head">
        <div><div class="eyebrow">${esc(CONFIG.tagline)}</div><h1>${esc(CONFIG.storeName)}</h1></div>
        <button class="round-btn" data-act="tab" data-id="search" aria-label="Поиск">${I.search}</button>
      </header>
      <div class="hero" id="hero">${hero}</div>
      <div class="dots" id="hero-dots">${HERO.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>
      <div class="cats">${cats}</div>
      <div class="section-h"><h3>Новинки</h3></div>
      <div class="grid">${news}</div>
      <div class="section-h"><h3>Почему мы</h3></div>
      <div class="perks">
        <button class="perk" data-act="faq" data-i="1">${I.shield}<b>Гарантия 1 год</b><span>Только оригинал</span></button>
        <button class="perk" data-act="faq" data-i="0">${I.truck}<b>Доставка за 2 часа</b><span>По Москве</span></button>
        <button class="perk" data-act="faq" data-i="3">${I.card}<b>Рассрочка 0%</b><span>На 6–12 месяцев</span></button>
        <button class="perk" data-act="faq" data-i="2">${I.swap}<b>Trade-in</b><span>Сдайте старое</span></button>
      </div>
      <div class="section-h"><h3>Хиты продаж</h3></div>
      <div class="grid">${hits}</div>
      ${rows}
      <div class="foot">${esc(CONFIG.storeName)} · ${esc(CONFIG.address)}<br>${esc(CONFIG.hours)}</div>`;
  },

  cat(r) {
    const c = catById(r.id);
    r.f = r.f || 'all';
    r.s = r.s || 'pop';
    let list = PRODUCTS.filter(p => p.cat === c.id);
    if (r.f === 'stock') list = list.filter(inStock);
    if (r.f === 'sale') list = list.filter(p => p.old);
    if (r.s === 'asc') list = [...list].sort((a, b) => a.opt.items[0].p - b.opt.items[0].p);
    if (r.s === 'desc') list = [...list].sort((a, b) => b.opt.items[0].p - a.opt.items[0].p);
    const chip = (k, v, t) => `<button class="chip ${r[k] === v ? 'on' : ''}" data-act="filter" data-k="${k}" data-v="${v}">${t}</button>`;
    return `${topbar(c.name)}
      <h1 class="page-title">${esc(c.name)}</h1>
      <p class="page-sub">${list.length} ${plural(list.length, 'модель', 'модели', 'моделей')}</p>
      <div class="chips">
        ${chip('f', 'all', 'Все')}${chip('f', 'stock', 'В наличии')}${chip('f', 'sale', 'Со скидкой')}
        ${chip('s', 'pop', 'Популярные')}${chip('s', 'asc', 'Дешевле')}${chip('s', 'desc', 'Дороже')}
      </div>
      <div class="grid">${list.map(card).join('') || '<p class="hint">Ничего не нашлось</p>'}</div>`;
  },

  product(r) {
    const p = byId(r.id);
    if (r.ci == null) { r.ci = firstAvailable(p); r.oi = 0; r.si = 0; }
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

    return `${topbar('')}
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
    return `<div class="searchbox"><label>${I.search}<input id="q" type="search" placeholder="Поиск по магазину" value="${esc(S.q)}" autocomplete="off"></label></div>
      <div id="results">${searchResults()}</div>`;
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
      <h1 class="page-title">Оформление</h1>
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
      <div class="buybar"><div class="sum"><small>К оплате</small><b>${rub(total + (total >= 30000 || f.delivery === 0 ? 0 : 500))}</b></div><button class="btn" data-act="submit">Подтвердить заказ</button></div>`;
  },

  done(r) {
    return `<div class="done"><div class="check">${I.check}</div>
        <h1>Заказ №${r.no} оформлен</h1>
        <p>Спасибо${S.form.name ? ', ' + esc(S.form.name) : ''}! Менеджер свяжется с вами в течение 15 минут, чтобы подтвердить детали.</p>
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
        <div><b>Поддержка ${esc(CONFIG.storeName)}</b><small>● онлайн · отвечаем за 5 минут</small></div>
        <button class="round-btn" data-act="manager" aria-label="Написать менеджеру" style="color:var(--accent)">${I.tg}</button>
      </div>
      <div class="msgs" id="msgs">${S.chat.map(msgHtml).join('')}</div>
      </div>
      <div class="composer">
        <div class="chips">${FAQ.map((f, i) => `<button class="chip" data-act="faq" data-i="${i}">${f.q}</button>`).join('')}</div>
        <form id="composer"><input id="msg" placeholder="Сообщение" autocomplete="off"><button type="submit" aria-label="Отправить">${I.send}</button></form>
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

function searchResults() {
  const q = S.q.trim().toLowerCase();
  if (!q) {
    const pop = ['iPhone 18 Pro', 'AirPods', 'MacBook', 'PlayStation', 'Dyson', 'Galaxy'];
    return `<p class="hint">Популярные запросы</p><div class="chips" style="flex-wrap:wrap">${pop.map(t => `<button class="chip" data-act="q" data-v="${t}">${t}</button>`).join('')}</div>
      <div class="section-h" style="padding-top:12px"><h3>Категории</h3></div>
      <div class="info-card">${CATEGORIES.map(c => `<button class="row link-row" data-act="cat" data-id="${c.id}"><div class="t">${esc(c.name)}<small>${PRODUCTS.filter(p => p.cat === c.id).length} моделей</small></div>${I.chev}</button>`).join('')}</div>`;
  }
  const words = q.split(/\s+/);
  const list = PRODUCTS.filter(p => {
    const hay = (p.name + ' ' + p.sub + ' ' + catById(p.cat).name + ' ' + p.colors.map(c => c.n).join(' ')).toLowerCase();
    return words.every(w => hay.includes(w));
  });
  if (!list.length) return `<div class="empty"><div class="big">${I.search}</div><h2>Ничего не нашли</h2><p>Попробуйте другой запрос или спросите в поддержке — привезём под заказ.</p></div>`;
  return `<p class="hint">Найдено: ${list.length}</p><div class="grid">${list.map(card).join('')}</div>`;
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
  if (tg && tg.BackButton) S.stack.length > 1 ? tg.BackButton.show() : tg.BackButton.hide();
  bindView(r);
}

function renderBottom(r) {
  const el = $('#bottom');
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
  const tabs = [['home', 'Магазин', I.store], ['search', 'Поиск', I.search], ['cart', 'Корзина', I.bag], ['support', 'Поддержка', I.chat]];
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
    if (!S.q) setTimeout(() => q.focus(), 300);
  }
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
  else S.cart.push({ pid: p.id, ci: r.ci, oi: r.oi, si: r.si, qty: 1 });
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
  return 'Спасибо за вопрос! Передал его менеджеру — он ответит здесь в течение 5 минут. Если срочно — нажмите кнопку Telegram вверху.';
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
      const route = { v: 'product', id: el.dataset.id };
      if (el.dataset.ci) Object.assign(route, { ci: +el.dataset.ci, oi: 0, si: 0 });
      push(route);
      break;
    }
    case 'cat': haptic.tap(); push({ v: 'cat', id: el.dataset.id }); break;
    case 'tab': haptic.select(); switchTab(el.dataset.id); break;
    case 'back': back(); break;
    case 'filter': haptic.select(); r[el.dataset.k] = el.dataset.v; rerender(); break;
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
  if (inTG) {
    const bg = dark ? '#000000' : '#f5f5f7';
    try { tg.setHeaderColor(bg); tg.setBackgroundColor(bg); tg.setBottomBarColor && tg.setBottomBarColor(bg); } catch (e) { /* старые клиенты */ }
  }
}

if (inTG) {
  document.documentElement.classList.add('tg');
  tg.ready();
  tg.expand();
  if (tg.isVersionAtLeast && tg.isVersionAtLeast('7.7')) tg.disableVerticalSwipes();
  tg.BackButton.onClick(back);
  tg.onEvent('themeChanged', applyTheme);
  const u = tg.initDataUnsafe && tg.initDataUnsafe.user;
  if (u && !S.form.name) S.form.name = u.first_name || '';
} else {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
}
applyTheme();
render(false);
