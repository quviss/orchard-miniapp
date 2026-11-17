const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function bridge(sdk) {
  const props={}; const events={}; const win={Telegram:sdk ? {WebApp:sdk}:undefined,matchMedia:()=>({matches:false,addEventListener:(e,f)=>events[e]=f}),addEventListener(){}};
  const ctx=vm.createContext({window:win,document:{documentElement:{style:{setProperty:(k,v)=>props[k]=v}}},module:{exports:{}}});
  if(fs.existsSync('js/telegram-bridge.js')) vm.runInContext(fs.readFileSync('js/telegram-bridge.js','utf8'),ctx);
  return {api:ctx.module.exports,props,events};
}
test('ordinary browser and partial old SDK start without unsupported calls',()=>{
  for(const sdk of [undefined,{initData:'demo',version:'6.0'},{initData:'demo',ready(){throw Error('unsupported')}}]) {
    const {api}=bridge(sdk);assert.equal(typeof api.init,'function');assert.doesNotThrow(()=>api.init(()=>{},()=>{}));assert.doesNotThrow(()=>api.back(true));assert.doesNotThrow(()=>api.colors(true));
  }
});
test('Telegram back, theme and safe area updates remain wired',()=>{
  const events={};let ready=0,expanded=0,back,shown=0,themes=0;
  const sdk={initData:'signed',version:'9.0',ready(){ready++},expand(){expanded++},BackButton:{onClick:f=>back=f,show(){shown++},hide(){}},onEvent:(e,f)=>events[e]=f,safeAreaInset:{top:24,bottom:16},contentSafeAreaInset:{top:8,bottom:4},isVersionAtLeast:()=>true,disableVerticalSwipes(){}};
  const {api,props}=bridge(sdk);assert.equal(typeof api.init,'function');let popped=0;
  api.init(()=>popped++,()=>themes++);api.back(true);back();events.themeChanged();
  assert.equal(ready,1);assert.equal(expanded,1);assert.equal(shown,1);assert.equal(popped,1);assert.equal(themes,1);
  assert.equal(props['--tg-safe-top'],'24px');assert.equal(props['--tg-content-top'],'8px');
  sdk.safeAreaInset.bottom=28;events.safeAreaChanged();assert.equal(props['--tg-safe-bottom'],'28px');
});
test('failed native Back never claims usable navigation',()=>{
  const {api}=bridge({initData:'signed',isVersionAtLeast:()=>true,BackButton:{onClick(){},hide(){},show(){throw Error('unsupported')}}});
  api.init(()=>{},()=>{});assert.equal(api.back(true),false);
});
