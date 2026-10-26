// Официальные фото товаров. Для каждого товара — массив по цветам (в том же порядке, что в data.js),
// в каждом — один или несколько ракурсов. Товары без фото (Dyson) показываются иллюстрациями.

const PHOTOS = (() => {
  const apple = n => `https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/${n}?wid=640&hei=640&fmt=jpeg&qlt=85`;
  const samsung = p => `https://images.samsung.com/is/image/samsung/p6pim/us/${p}?$684_547_JPG$`;
  const ps = n => `https://gmedia.playstation.com/is/image/SIEPDC/${n}`;

  // основной вид + крупный план камер
  const iphone = (model, date, colors) => colors.map(c => [
    apple(`${model}-finish-select-${c}-${date}`), apple(`${model}-finish-select-${c}-${date}_AV2`),
  ]);
  const s26 = (code, id) => [samsung(`s2602/gallery/us-galaxy-s26-ultra-s948-sm-s948u${code}-${id}`), samsung(`s2602/gallery/us-galaxy-s26-ultra-s948-sm-s948u${code}-${id + 1}`)];
  const fold = (path, id) => [samsung(`f2607/gallery/${path}-${id}`), samsung(`f2607/gallery/${path}-${id + 1}`)];

  return {
    'iphone-18-pro-max': iphone('iphone-18-pro-max', '202609', ['black', 'silver', 'glacier', 'burgundy']),
    'iphone-18-pro': iphone('iphone-18-pro', '202609', ['black', 'silver', 'glacier', 'burgundy']),
    'iphone-duo': iphone('iphone-duo', '202609', ['star-white', 'night-sky']),
    'iphone-air': iphone('iphone-air', '202509', ['spaceblack', 'cloudwhite', 'lightgold', 'skyblue']),
    'iphone-17': iphone('iphone-17', '202509', ['black', 'white', 'mistblue', 'sage', 'lavender']),
    'iphone-17e': iphone('iphone-17e', '202603', ['black', 'white', 'softpink']),

    'macbook-air-13': ['skyblue', 'silver', 'starlight', 'midnight'].map(c => [apple(`mba13-${c}-select-202503`)]),
    'macbook-air-15': ['skyblue', 'silver', 'starlight', 'midnight'].map(c => [apple(`mba15-${c}-select-202503`)]),
    'macbook-pro-14': ['spaceblack', 'silver'].map(c => [apple(`mbp14-${c}-cto-hero-202410`)]),
    'macbook-neo': ['silver', 'blush', 'citrus', 'indigo'].map(c => [apple(`macbook-neo-${c}-cto-hero-202603`)]),

    'ipad-pro-11': ['spaceblack', 'silver'].map(c => [apple(`ipad-pro-11-select-wifi-${c}-202405`)]),
    'ipad-air-11': ['spacegray', 'blue', 'purple', 'starlight'].map(c => [apple(`ipad-air-select-11in-wifi-${c}-202405`)]),
    'ipad-mini': ['midnight', 'starlight'].map(c => [apple(`ipad-mini-finish-select-wifi-${c}-202610`)]),

    'watch-ultra-4': ['natural', 'black'].map(c => [apple(`watch-case-49-titanium-${c}-ultra4_VW_PF`)]),
    'watch-series-12': ['black-nc', 'spacegray-cell', 'lightgold-nc', 'darkbronze-cell'].map(c => [apple(`watch-case-42-aluminum-${c}-s12_VW_PF`)]),
    'watch-se-3': ['midnight', 'starlight'].map(c => [apple(`watch-case-44-aluminum-${c}-nc-se3_VW_PF`)]),

    'airpods-pro-3': [[apple('airpods-pro-3-hero-select-202509')]],
    'airpods-5': [[apple('airpods-5-select-202609')]],
    'airpods-max': ['midnight', 'starlight', 'blue', 'purple', 'orange'].map(c => [apple(`airpods-max-select-202409-${c}`)]),

    'galaxy-s26-ultra': [s26('zkaxaa', 550993324), s26('zwaxaa', 550994233), s26('zvaxaa', 550993899), s26('lbaxaa', 550992879), s26('zsaxaa', 550993694), s26('zdaxaa', 550993139)],
    'galaxy-z-fold8': [
      fold('us-galaxy-z-fold8-f971-600257-sm-f971uzkaxaa', 553841306),
      fold('us-galaxy-z-fold8-f971-sm-f971uzwaxaa', 553838055),
      fold('us-galaxy-z-fold8-f971-600257-sm-f971ulvaxaa', 553840950),
    ],
    'galaxy-z-flip8': [
      fold('us-galaxy-zflip8-f776-sm-f776uzkaxaa', 553843334),
      fold('us-galaxy-zflip8-f776-sm-f776uzwaxaa', 553843692),
      fold('us-galaxy-zflip8-f776-sm-f776uliaxaa', 553843013),
    ],

    'ps5-pro': [[ps('ps5-pro-dualsense-image-block-01-en-16aug24')]],
    'ps5-slim': [[ps('ps5-slim-edition-left-image-block-01-en-24jun24')]],
    'ps5-slim-digital': [[ps('ps5-slim-digital-edition-right-image-block-01-en-24jun24')]],
    'dualsense': [[ps('dualsense-controller-product-thumbnail-01-en-14sep21')]],
  };
})();

for (const p of PRODUCTS) {
  const set = PHOTOS[p.id];
  if (set) p.colors.forEach((c, i) => { if (set[i]) c.img = set[i]; });
}
