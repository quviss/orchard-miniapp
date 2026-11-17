/* Optional Telegram capabilities must never prevent the static demo from opening. */
(function() {
  const sdk = window.Telegram && window.Telegram.WebApp;
  let backRegistered=false;
  const active = !!(sdk && sdk.initData);
  function call(target, name, ...args) {
    try { if(target && typeof target[name]==='function') return target[name](...args); } catch (_) { /* older client */ }
  }
  function supports(version) { return active && !!call(sdk,'isVersionAtLeast',version); }
  function syncInsets() {
    for(const [prefix,inset] of [['safe',sdk && sdk.safeAreaInset],['content',sdk && sdk.contentSafeAreaInset]]) {
      for(const edge of ['top','bottom','left','right']) {
        const n=active && inset && Number.isFinite(inset[edge]) ? Math.max(0,inset[edge]) : 0;
        document.documentElement.style.setProperty(`--tg-${prefix}-${edge}`,n+'px');
      }
    }
  }
  const api={sdk,active,call,supports,syncInsets,
    init(onBack,onTheme) {
      if(active) {
        call(sdk,'ready');call(sdk,'expand');
        if(supports('7.7')) call(sdk,'disableVerticalSwipes');
        const b=sdk.BackButton;
        if(supports('6.1') && b && ['onClick','show','hide'].every(k=>typeof b[k]==='function')) {
          try {b.onClick(onBack);backRegistered=true;} catch(_) {backRegistered=false;}
        }
        call(sdk,'onEvent','themeChanged',onTheme);
        for(const name of ['safeAreaChanged','contentSafeAreaChanged','viewportChanged']) call(sdk,'onEvent',name,syncInsets);
      } else {
        const media=window.matchMedia('(prefers-color-scheme: dark)');
        call(media,'addEventListener','change',onTheme);
      }
      syncInsets();
    },
    back(visible) {
      if(!active || !backRegistered) return false;
      try {sdk.BackButton[visible ? 'show':'hide']();return true;} catch(_) {return false;}
    },
    colors(dark) {
      if(!active) return;
      const bg=dark ? '#111111':'#f5f5f5';
      if(supports('6.1')) {call(sdk,'setHeaderColor',bg);call(sdk,'setBackgroundColor',bg);}
      if(supports('7.10')) call(sdk,'setBottomBarColor',bg);
    }
  };
  if(typeof module==='object' && module.exports) module.exports=api;
  else window.TelegramBridge=api;
})();
