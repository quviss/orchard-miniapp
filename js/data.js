// Настройки магазина и каталог. Всё, что меняется под конкретного продавца, — здесь.

const CONFIG = {
  storeName: 'Orchard',
  tagline: 'Оригинальная техника',
  city: 'Москва',
  address: 'ул. Тверская, 12, ТЦ «Галерея», 2 этаж',
  hours: 'Ежедневно 10:00–22:00',
  phone: '+7 (999) 123-45-67',
  // username менеджера в Telegram без @. Пусто — в демо покажем уведомление.
  manager: '',
};

const CATEGORIES = [
  { id: 'iphone', name: 'iPhone', art: { t: 'phone', k: 'pro', c: '#c9dbe6' } },
  { id: 'mac', name: 'Mac', art: { t: 'laptop', c: '#c6d5e2' } },
  { id: 'ipad', name: 'iPad', art: { t: 'tablet', c: '#a8bcd3' } },
  { id: 'watch', name: 'Watch', art: { t: 'watch', c: '#e9d9bd' } },
  { id: 'airpods', name: 'AirPods', art: { t: 'airpods', c: '#ffffff' } },
  { id: 'samsung', name: 'Samsung', art: { t: 'phone', k: 'samsung', c: '#5a4e7c' } },
  { id: 'playstation', name: 'PlayStation', art: { t: 'console', c: '#ffffff' } },
  { id: 'dyson', name: 'Dyson', art: { t: 'dryer', c: '#5f78a8' } },
];

const SIM = [
  { t: 'eSIM', p: 0 },
  { t: 'nano-SIM + eSIM', p: 4000 },
];

// colors: n — название, c — цвет для иллюстрации, q — остаток (0 = под заказ), img — фото (подставляются из js/photos.js)
// opt: варианты памяти/комплектации с ценой. old — скидка от «старой» цены, доля.
const PRODUCTS = [
  // ───── iPhone ─────
  {
    id: 'iphone-18-pro-max', cat: 'iphone', name: 'iPhone 18 Pro Max', isNew: true, hit: true,
    sub: 'A20 Pro · 6,9″ · 48 Мп ×3', art: { t: 'phone', k: 'pro' }, sim: true,
    colors: [
      { n: 'Чёрный', c: '#2b2b2d', q: 4 }, { n: 'Серебристый', c: '#e3e4e6', q: 6 },
      { n: 'Ледяной', c: '#c9dbe6', q: 2 }, { n: 'Бургунди', c: '#6b2a3a', q: 3 },
    ],
    opt: { label: 'Память', items: [
      { t: '256 ГБ', p: 154990 }, { t: '512 ГБ', p: 174990 }, { t: '1 ТБ', p: 204990 }, { t: '2 ТБ', p: 249990 },
    ] },
    specs: [['Экран', '6,9″ Super Retina XDR, ProMotion 120 Гц'], ['Чип', 'A20 Pro'], ['Камера', '48 Мп Fusion + 48 Мп сверхширик + 48 Мп телефото 5×'], ['Корпус', 'Алюминий, Ceramic Shield 2'], ['Разъём', 'USB-C (USB 3)'], ['Защита', 'IP68']],
    box: 'iPhone, кабель USB-C',
  },
  {
    id: 'iphone-18-pro', cat: 'iphone', name: 'iPhone 18 Pro', isNew: true, hit: true,
    sub: 'A20 Pro · 6,3″ · 48 Мп ×3', art: { t: 'phone', k: 'pro' }, sim: true,
    colors: [
      { n: 'Чёрный', c: '#2b2b2d', q: 5 }, { n: 'Серебристый', c: '#e3e4e6', q: 3 },
      { n: 'Ледяной', c: '#c9dbe6', q: 7 }, { n: 'Бургунди', c: '#6b2a3a', q: 1 },
    ],
    opt: { label: 'Память', items: [
      { t: '256 ГБ', p: 139990 }, { t: '512 ГБ', p: 159990 }, { t: '1 ТБ', p: 189990 }, { t: '2 ТБ', p: 234990 },
    ] },
    specs: [['Экран', '6,3″ Super Retina XDR, ProMotion 120 Гц'], ['Чип', 'A20 Pro'], ['Камера', '48 Мп Fusion + 48 Мп сверхширик + 48 Мп телефото 5×'], ['Корпус', 'Алюминий, Ceramic Shield 2'], ['Разъём', 'USB-C (USB 3)'], ['Защита', 'IP68']],
    box: 'iPhone, кабель USB-C',
  },
  {
    id: 'iphone-duo', cat: 'iphone', name: 'iPhone Duo', isNew: true,
    sub: 'Первый складной iPhone', art: { t: 'fold' }, sim: false,
    colors: [{ n: 'Звёздный белый', c: '#f1efe9', q: 1 }, { n: 'Ночное небо', c: '#1f2a44', q: 0 }],
    opt: { label: 'Память', items: [
      { t: '256 ГБ', p: 229990 }, { t: '512 ГБ', p: 249990 }, { t: '1 ТБ', p: 289990 }, { t: '2 ТБ', p: 354990 },
    ] },
    specs: [['Экран', '7,8″ внутренний + 5,5″ внешний'], ['Чип', 'A20 Pro'], ['Камера', '48 Мп Fusion + 48 Мп сверхширик'], ['Корпус', 'Титан, шарнир из Liquid Metal'], ['SIM', 'eSIM']],
    box: 'iPhone Duo, кабель USB-C',
  },
  {
    id: 'iphone-air', cat: 'iphone', name: 'iPhone Air', old: 0.12,
    sub: 'Самый тонкий iPhone · 5,6 мм', art: { t: 'phone', k: 'air' }, sim: false,
    colors: [
      { n: 'Космический чёрный', c: '#1c1c1e', q: 3 }, { n: 'Облачный белый', c: '#f4f4f2', q: 5 },
      { n: 'Светлое золото', c: '#efe2c8', q: 2 }, { n: 'Небесно-голубой', c: '#cfe1ef', q: 4 },
    ],
    opt: { label: 'Память', items: [{ t: '256 ГБ', p: 89990 }, { t: '512 ГБ', p: 106990 }, { t: '1 ТБ', p: 124990 }] },
    specs: [['Экран', '6,5″ Super Retina XDR, ProMotion'], ['Чип', 'A19 Pro'], ['Камера', '48 Мп Fusion'], ['Толщина', '5,6 мм'], ['SIM', 'eSIM']],
    box: 'iPhone, кабель USB-C',
  },
  {
    id: 'iphone-17', cat: 'iphone', name: 'iPhone 17', hit: true,
    sub: 'A19 · 6,3″ · 120 Гц', art: { t: 'phone', k: 'base' }, sim: true,
    colors: [
      { n: 'Чёрный', c: '#232325', q: 9 }, { n: 'Белый', c: '#f5f5f3', q: 6 }, { n: 'Туманно-голубой', c: '#a9bfd6', q: 4 },
      { n: 'Шалфей', c: '#b5bfa3', q: 2 }, { n: 'Лавандовый', c: '#d5c8e6', q: 5 },
    ],
    opt: { label: 'Память', items: [{ t: '256 ГБ', p: 79990 }, { t: '512 ГБ', p: 99990 }] },
    specs: [['Экран', '6,3″ Super Retina XDR, ProMotion 120 Гц'], ['Чип', 'A19'], ['Камера', '48 Мп Fusion + 48 Мп сверхширик'], ['Фронталка', '18 Мп Center Stage'], ['Защита', 'IP68']],
    box: 'iPhone, кабель USB-C',
  },
  {
    id: 'iphone-17e', cat: 'iphone', name: 'iPhone 17e',
    sub: 'Доступный iPhone на A19', art: { t: 'phone', k: 'e' }, sim: true,
    colors: [{ n: 'Чёрный', c: '#232325', q: 6 }, { n: 'Белый', c: '#f5f5f3', q: 4 }, { n: 'Нежно-розовый', c: '#f3d3d6', q: 3 }],
    opt: { label: 'Память', items: [{ t: '128 ГБ', p: 54990 }, { t: '256 ГБ', p: 64990 }, { t: '512 ГБ', p: 84990 }] },
    specs: [['Экран', '6,1″ Super Retina XDR'], ['Чип', 'A19'], ['Камера', '48 Мп Fusion'], ['Защита', 'IP68']],
    box: 'iPhone, кабель USB-C',
  },

  // ───── Mac ─────
  {
    id: 'macbook-air-13', cat: 'mac', name: 'MacBook Air 13″', hit: true,
    sub: 'Чип M5 · до 18 ч работы', art: { t: 'laptop' },
    colors: [
      { n: 'Небесно-голубой', c: '#c6d5e2', q: 3 }, { n: 'Серебристый', c: '#e3e4e6', q: 5 },
      { n: 'Сияющая звезда', c: '#ece3d4', q: 2 }, { n: 'Тёмная ночь', c: '#2e3642', q: 4 },
    ],
    opt: { label: 'Конфигурация', items: [{ t: '16 ГБ · 512 ГБ', p: 109990 }, { t: '24 ГБ · 1 ТБ', p: 139990 }] },
    specs: [['Экран', '13,6″ Liquid Retina'], ['Чип', 'Apple M5, 10 ядер CPU'], ['Автономность', 'до 18 часов'], ['Вес', '1,24 кг'], ['Порты', '2× Thunderbolt 4, MagSafe, 3,5 мм']],
    box: 'MacBook Air, адаптер питания, кабель USB-C – MagSafe 3',
  },
  {
    id: 'macbook-air-15', cat: 'mac', name: 'MacBook Air 15″',
    sub: 'Чип M5 · большой экран', art: { t: 'laptop' },
    colors: [
      { n: 'Небесно-голубой', c: '#c6d5e2', q: 2 }, { n: 'Серебристый', c: '#e3e4e6', q: 3 },
      { n: 'Сияющая звезда', c: '#ece3d4', q: 0 }, { n: 'Тёмная ночь', c: '#2e3642', q: 4 },
    ],
    opt: { label: 'Конфигурация', items: [{ t: '16 ГБ · 512 ГБ', p: 129990 }, { t: '24 ГБ · 1 ТБ', p: 159990 }] },
    specs: [['Экран', '15,3″ Liquid Retina'], ['Чип', 'Apple M5'], ['Автономность', 'до 18 часов'], ['Вес', '1,51 кг'], ['Звук', '6 динамиков']],
    box: 'MacBook Air, адаптер питания, кабель USB-C – MagSafe 3',
  },
  {
    id: 'macbook-pro-14', cat: 'mac', name: 'MacBook Pro 14″',
    sub: 'M5, M5 Pro или M5 Max', art: { t: 'laptop', dark: true },
    colors: [{ n: 'Космический чёрный', c: '#2c2c2e', q: 3 }, { n: 'Серебристый', c: '#e3e4e6', q: 2 }],
    opt: { label: 'Конфигурация', items: [
      { t: 'M5 · 16 ГБ · 1 ТБ', p: 179990 }, { t: 'M5 Pro · 24 ГБ · 1 ТБ', p: 239990 }, { t: 'M5 Max · 36 ГБ · 1 ТБ', p: 349990 },
    ] },
    specs: [['Экран', '14,2″ Liquid Retina XDR, 120 Гц'], ['Автономность', 'до 24 часов'], ['Порты', '3× Thunderbolt 5, HDMI, SDXC, MagSafe'], ['Вес', '1,55 кг']],
    box: 'MacBook Pro, адаптер питания, кабель USB-C – MagSafe 3',
  },
  {
    id: 'macbook-neo', cat: 'mac', name: 'MacBook Neo', isNew: true,
    sub: 'Самый доступный Mac', art: { t: 'laptop' },
    colors: [
      { n: 'Серебристый', c: '#e3e4e6', q: 5 }, { n: 'Румяный', c: '#ecc9c4', q: 3 },
      { n: 'Цитрус', c: '#e6e29a', q: 4 }, { n: 'Индиго', c: '#3f4a7a', q: 2 },
    ],
    opt: { label: 'Конфигурация', items: [{ t: '8 ГБ · 256 ГБ', p: 64990 }, { t: '8 ГБ · 512 ГБ', p: 79990 }] },
    specs: [['Экран', '13″ Liquid Retina'], ['Чип', 'A18 Pro'], ['Автономность', 'до 16 часов'], ['Вес', '1,2 кг']],
    box: 'MacBook Neo, адаптер питания, кабель USB-C',
  },

  // ───── iPad ─────
  {
    id: 'ipad-pro-11', cat: 'ipad', name: 'iPad Pro 11″',
    sub: 'M5 · Ultra Retina XDR (OLED)', art: { t: 'tablet' },
    colors: [{ n: 'Космический чёрный', c: '#2c2c2e', q: 3 }, { n: 'Серебристый', c: '#e3e4e6', q: 4 }],
    opt: { label: 'Память', items: [{ t: '256 ГБ · Wi‑Fi', p: 99990 }, { t: '512 ГБ · Wi‑Fi', p: 119990 }, { t: '512 ГБ · Wi‑Fi + Cellular', p: 139990 }] },
    specs: [['Экран', '11″ Ultra Retina XDR, OLED, 120 Гц'], ['Чип', 'Apple M5'], ['Толщина', '5,3 мм'], ['Поддержка', 'Apple Pencil Pro, Magic Keyboard']],
    box: 'iPad Pro, кабель USB-C',
  },
  {
    id: 'ipad-air-11', cat: 'ipad', name: 'iPad Air 11″', hit: true,
    sub: 'Чип M4 · Liquid Retina', art: { t: 'tablet' },
    colors: [
      { n: 'Серый космос', c: '#6d6e72', q: 5 }, { n: 'Голубой', c: '#a8bcd3', q: 3 },
      { n: 'Фиолетовый', c: '#c8bcd9', q: 2 }, { n: 'Сияющая звезда', c: '#ece3d4', q: 4 },
    ],
    opt: { label: 'Память', items: [{ t: '128 ГБ · Wi‑Fi', p: 59990 }, { t: '256 ГБ · Wi‑Fi', p: 69990 }, { t: '512 ГБ · Wi‑Fi', p: 89990 }] },
    specs: [['Экран', '11″ Liquid Retina'], ['Чип', 'Apple M4'], ['Камера', '12 Мп'], ['Поддержка', 'Apple Pencil Pro']],
    box: 'iPad Air, кабель USB-C',
  },
  {
    id: 'ipad-mini', cat: 'ipad', name: 'iPad mini',
    sub: 'Новое поколение · 8,3″', art: { t: 'tablet', mini: true }, isNew: true,
    colors: [
      { n: 'Тёмная ночь', c: '#2e3642', q: 3 }, { n: 'Сияющая звезда', c: '#ece3d4', q: 2 },
    ],
    opt: { label: 'Память', items: [{ t: '128 ГБ · Wi‑Fi', p: 49990 }, { t: '256 ГБ · Wi‑Fi', p: 59990 }] },
    specs: [['Экран', '8,3″'], ['Поддержка', 'Apple Pencil Pro'], ['Вес', 'около 300 г']],
    box: 'iPad mini, кабель USB-C',
  },

  // ───── Watch ─────
  {
    id: 'watch-ultra-4', cat: 'watch', name: 'Apple Watch Ultra 4', isNew: true,
    sub: 'Титан · 49 мм · до 42 ч', art: { t: 'watch', ultra: true },
    colors: [{ n: 'Натуральный титан', c: '#c9c2b6', q: 3 }, { n: 'Чёрный титан', c: '#1f1f21', q: 4 }],
    opt: { label: 'Ремешок', items: [{ t: 'Trail Loop', p: 89990 }, { t: 'Alpine Loop', p: 89990 }, { t: 'Ocean Band', p: 89990 }] },
    specs: [['Корпус', 'Титан, 49 мм'], ['Экран', 'Широкоугольный OLED, 3000 нит'], ['Автономность', 'до 42 часов'], ['Защита', 'WR100, дайвинг до 40 м'], ['Связь', 'Спутниковая SOS']],
    box: 'Часы, ремешок, магнитная зарядка USB-C',
  },
  {
    id: 'watch-series-12', cat: 'watch', name: 'Apple Watch Series 12', isNew: true, hit: true,
    sub: 'Алюминий · 42 или 46 мм', art: { t: 'watch' },
    colors: [
      { n: 'Чёрный', c: '#1d1d1f', q: 6 }, { n: 'Серый космос', c: '#5e6066', q: 3 },
      { n: 'Светлое золото', c: '#e9d9bd', q: 4 }, { n: 'Бронза', c: '#a8794f', q: 2 },
    ],
    opt: { label: 'Размер', items: [{ t: '42 мм', p: 42990 }, { t: '46 мм', p: 46990 }] },
    specs: [['Корпус', 'Алюминий'], ['Экран', 'Always-On Retina LTPO3'], ['Здоровье', 'ЭКГ, давление, сон, SpO₂'], ['Автономность', 'до 24 часов']],
    box: 'Часы, спортивный ремешок, зарядка USB-C',
  },
  {
    id: 'watch-se-3', cat: 'watch', name: 'Apple Watch SE 3', old: 0.08,
    sub: 'Лучшее начало с Apple Watch', art: { t: 'watch' },
    colors: [{ n: 'Тёмная ночь', c: '#2e3642', q: 5 }, { n: 'Сияющая звезда', c: '#ece3d4', q: 4 }],
    opt: { label: 'Размер', items: [{ t: '40 мм', p: 26990 }, { t: '44 мм', p: 29990 }] },
    specs: [['Корпус', 'Алюминий'], ['Экран', 'Always-On Retina'], ['Чип', 'S10'], ['Автономность', 'до 18 часов']],
    box: 'Часы, спортивный ремешок, зарядка USB-C',
  },

  // ───── AirPods ─────
  {
    id: 'airpods-pro-3', cat: 'airpods', name: 'AirPods Pro 3', hit: true, old: 0.12,
    sub: 'Шумоподавление ×2 · пульс', art: { t: 'airpods', pro: true },
    colors: [{ n: 'Белый', c: '#ffffff', q: 12 }],
    opt: { label: 'Комплектация', items: [{ t: 'Кейс MagSafe (USB-C)', p: 23990 }] },
    specs: [['Шумоподавление', 'Активное, адаптивный режим'], ['Датчики', 'Пульс во время тренировок'], ['Автономность', 'до 8 ч (до 30 ч с кейсом)'], ['Защита', 'IP57'], ['Перевод', 'Живой перевод речи']],
    box: 'Наушники, кейс, амбушюры XXS–L, кабель USB-C',
  },
  {
    id: 'airpods-5', cat: 'airpods', name: 'AirPods 5', isNew: true,
    sub: 'Новое поколение · H3', art: { t: 'airpods' },
    colors: [{ n: 'Белый', c: '#ffffff', q: 9 }],
    opt: { label: 'Кейс', items: [{ t: 'Обычный (USB-C)', p: 13990 }, { t: 'С беспроводной зарядкой', p: 15990 }] },
    specs: [['Чип', 'Apple H3'], ['Звук', 'Пространственное аудио'], ['Автономность', 'до 6 ч (до 30 ч с кейсом)'], ['Защита', 'IP54']],
    box: 'Наушники, кейс, кабель USB-C',
  },
  {
    id: 'airpods-max', cat: 'airpods', name: 'AirPods Max',
    sub: 'Полноразмерные · USB-C', art: { t: 'headphones' },
    colors: [
      { n: 'Тёмная ночь', c: '#3a3f4b', q: 2 }, { n: 'Сияющая звезда', c: '#e9e4da', q: 3 },
      { n: 'Синий', c: '#8aa4c8', q: 1 }, { n: 'Фиолетовый', c: '#b8a9cf', q: 0 }, { n: 'Оранжевый', c: '#e8a07a', q: 2 },
    ],
    opt: { label: 'Комплектация', items: [{ t: 'С чехлом Smart Case', p: 54990 }] },
    specs: [['Шумоподавление', 'Активное'], ['Звук', 'Пространственное, Lossless по USB-C'], ['Автономность', 'до 20 часов']],
    box: 'Наушники, чехол Smart Case, кабель USB-C',
  },

  // ───── Samsung ─────
  {
    id: 'galaxy-s26-ultra', cat: 'samsung', name: 'Galaxy S26 Ultra', hit: true,
    sub: 'Snapdragon 8 Elite Gen 5 · S Pen', art: { t: 'phone', k: 'samsung' },
    colors: [
      { n: 'Чёрный', c: '#26272a', q: 4 }, { n: 'Белый', c: '#f2f2f0', q: 3 }, { n: 'Кобальтовый фиолетовый', c: '#5a4e7c', q: 5 },
      { n: 'Небесно-голубой', c: '#b9cfe3', q: 2 }, { n: 'Серебристый', c: '#bfc1c4', q: 0 }, { n: 'Розовое золото', c: '#e8c9c0', q: 1 },
    ],
    opt: { label: 'Память', items: [{ t: '12 / 256 ГБ', p: 119990 }, { t: '12 / 512 ГБ', p: 134990 }, { t: '16 ГБ / 1 ТБ', p: 164990 }] },
    specs: [['Экран', '6,9″ Dynamic AMOLED 2X, 120 Гц'], ['Камера', '200 Мп + 50 Мп + 50 Мп 5× + 12 Мп'], ['Аккумулятор', '5000 мА·ч, 60 Вт'], ['Стилус', 'S Pen в комплекте'], ['Защита', 'IP68']],
    box: 'Смартфон, S Pen, кабель USB-C',
  },
  {
    id: 'galaxy-z-fold8', cat: 'samsung', name: 'Galaxy Z Fold8', isNew: true,
    sub: 'Складной · 8″ внутри', art: { t: 'fold' },
    colors: [{ n: 'Графит', c: '#3a3b3d', q: 2 }, { n: 'Кремовый', c: '#ece6da', q: 3 }, { n: 'Лавандовый', c: '#c9c0de', q: 1 }],
    opt: { label: 'Память', items: [{ t: '12 / 256 ГБ', p: 169990 }, { t: '12 / 512 ГБ', p: 184990 }, { t: '16 ГБ / 1 ТБ', p: 214990 }] },
    specs: [['Экран', '8″ внутренний + 6,5″ внешний'], ['Камера', '200 Мп основная'], ['Толщина', '8,9 мм в сложенном виде'], ['Защита', 'IP48']],
    box: 'Смартфон, кабель USB-C',
  },
  {
    id: 'galaxy-z-flip8', cat: 'samsung', name: 'Galaxy Z Flip8', isNew: true,
    sub: 'Компактная раскладушка', art: { t: 'flip' },
    colors: [{ n: 'Графит', c: '#3a3b3d', q: 4 }, { n: 'Кремовый', c: '#ece6da', q: 2 }, { n: 'Розовый', c: '#f0c7cf', q: 5 }],
    opt: { label: 'Память', items: [{ t: '12 / 256 ГБ', p: 89990 }, { t: '12 / 512 ГБ', p: 99990 }] },
    specs: [['Экран', '6,9″ внутренний + 4,1″ внешний FlexWindow'], ['Камера', '50 Мп + 12 Мп'], ['Защита', 'IP48']],
    box: 'Смартфон, кабель USB-C',
  },

  // ───── PlayStation ─────
  {
    id: 'ps5-pro', cat: 'playstation', name: 'PlayStation 5 Pro', hit: true,
    sub: '2 ТБ · 8K · PSSR', art: { t: 'console', pro: true },
    colors: [{ n: 'Белый', c: '#f4f4f4', q: 3 }],
    opt: { label: 'Комплектация', items: [{ t: 'Без дисковода', p: 79990 }, { t: 'С дисководом', p: 89990 }] },
    specs: [['Накопитель', 'SSD 2 ТБ'], ['Графика', 'Улучшенный GPU, трассировка лучей, PSSR'], ['Вывод', 'до 8K, 120 FPS'], ['Связь', 'Wi‑Fi 7']],
    box: 'Консоль, DualSense, кабели HDMI и питания',
  },
  {
    id: 'ps5-slim', cat: 'playstation', name: 'PlayStation 5 Slim', old: 0.08,
    sub: '1 ТБ · с дисководом', art: { t: 'console' },
    colors: [{ n: 'Белый', c: '#f4f4f4', q: 7 }],
    opt: { label: 'Комплектация', items: [{ t: 'Стандарт', p: 54990 }, { t: '+ второй DualSense', p: 61990 }] },
    specs: [['Накопитель', 'SSD 1 ТБ'], ['Привод', 'Ultra HD Blu-ray'], ['Вывод', '4K, до 120 FPS']],
    box: 'Консоль, DualSense, кабели HDMI и питания',
  },
  {
    id: 'ps5-slim-digital', cat: 'playstation', name: 'PlayStation 5 Slim Digital',
    sub: '1 ТБ · без дисковода', art: { t: 'console', digital: true },
    colors: [{ n: 'Белый', c: '#f4f4f4', q: 5 }],
    opt: { label: 'Комплектация', items: [{ t: 'Стандарт', p: 46990 }, { t: '+ второй DualSense', p: 53990 }] },
    specs: [['Накопитель', 'SSD 1 ТБ'], ['Привод', 'Нет (можно докупить)'], ['Вывод', '4K, до 120 FPS']],
    box: 'Консоль, DualSense, кабели HDMI и питания',
  },
  {
    id: 'dualsense', cat: 'playstation', name: 'DualSense',
    sub: 'Беспроводной геймпад', art: { t: 'gamepad' },
    colors: [{ n: 'Белый', c: '#f4f4f4', q: 10 }],
    opt: { label: 'Комплектация', items: [{ t: 'Геймпад', p: 7490 }] },
    specs: [['Отдача', 'Тактильная + адаптивные курки'], ['Связь', 'Bluetooth, USB-C'], ['Автономность', 'до 12 часов']],
    box: 'Геймпад, кабель USB-C',
  },

  // ───── Dyson ─────
  {
    id: 'dyson-airwrap', cat: 'dyson', name: 'Dyson Airwrap Co‑anda 2x', hit: true,
    sub: 'Мультистайлер · 6 насадок', art: { t: 'styler' },
    colors: [
      { n: 'Яшмовая слива', c: '#6b2f4a', q: 3 }, { n: 'Розовый румянец', c: '#e8b4a8', q: 4 }, { n: 'Прусский синий', c: '#2b3d5c', q: 2 },
    ],
    opt: { label: 'Комплектация', items: [{ t: 'Для длинных волос', p: 54990 }, { t: 'Для кудрявых волос', p: 54990 }] },
    specs: [['Мощность', 'Мотор Hyperdymium, 2× поток воздуха'], ['Насадки', '6 шт., эффект Коанда'], ['Нагрев', 'Умный контроль, до 150 °C']],
    box: 'Стайлер, насадки, кейс',
  },
  {
    id: 'dyson-supersonic', cat: 'dyson', name: 'Dyson Supersonic Nural',
    sub: 'Фен с датчиком расстояния', art: { t: 'dryer' },
    colors: [{ n: 'Барвинок / розовый', c: '#5f78a8', q: 4 }, { n: 'Керамика / топаз', c: '#3f7b77', q: 2 }],
    opt: { label: 'Комплектация', items: [{ t: '5 насадок', p: 44990 }] },
    specs: [['Мотор', 'Dyson V9, 110 000 об/мин'], ['Режимы', 'Защита кожи головы, память настроек'], ['Насадки', '5 магнитных']],
    box: 'Фен, 5 насадок, подставка',
  },
  {
    id: 'dyson-v15', cat: 'dyson', name: 'Dyson V15 Detect Absolute',
    sub: 'Беспроводной пылесос · лазер', art: { t: 'vacuum' },
    colors: [{ n: 'Жёлтый / никель', c: '#e8c33a', q: 3 }],
    opt: { label: 'Комплектация', items: [{ t: 'Absolute', p: 69990 }] },
    specs: [['Мощность всасывания', '240 АВт'], ['Автономность', 'до 60 минут'], ['Фишки', 'Лазерная подсветка пыли, датчик частиц']],
    box: 'Пылесос, 2 щётки, насадки, док-станция',
  },
];

const FAQ = [
  { q: 'Доставка', a: 'По Москве — курьером за 2 часа, 500 ₽ (бесплатно от 30 000 ₽). По России — СДЭК, 1–4 дня. Можно забрать самовывозом из магазина.' },
  { q: 'Гарантия', a: 'Вся техника новая и оригинальная. Даём собственную гарантию 1 год, на Apple — ещё и официальную международную гарантию производителя.' },
  { q: 'Trade-in', a: 'Принимаем ваш старый iPhone, iPad или Mac в зачёт нового. Пришлите модель, память и состояние — оценим за 5 минут.' },
  { q: 'Рассрочка', a: 'Рассрочка 0% на 6 или 12 месяцев без переплат, оформление за 10 минут по паспорту. Также можно оплатить «Долями».' },
  { q: 'Оригинал?', a: 'Да, только оригинальная техника в запечатанных коробках. Перед покупкой можно проверить серийный номер на сайте производителя.' },
  { q: 'Адрес', a: `${CONFIG.address}. ${CONFIG.hours}.` },
];
