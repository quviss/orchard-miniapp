const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function app({sdk,stored={}}={}) {
  const elements=new Map();
  const handlers={};
  function element(){return {innerHTML:'',hidden:false,dataset:{},classList:{add(){},remove(){},toggle(){}},style:{setProperty(){}},addEventListener(){},children:[]};}
  for(const id of ['view','bottom','tabbar','toast']) elements.set(id,element());
  const values=new Map(Object.entries(stored));
  const ctx=vm.createContext({
    document:{querySelector:s=>s==='#different' && elements.get('view').innerHTML.includes('id="different"') ? element() : elements.get(s.slice(1))||null,querySelectorAll:()=>[],createElement:()=>element(),body:{classList:{toggle(){}},appendChild:el=>elements.set(el.id,el)},documentElement:{dataset:{},classList:{add(){},toggle(){}},style:{setProperty(){}}},addEventListener:(name,fn)=>handlers[name]=fn},
    localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},
    matchMedia:()=>({matches:false,addEventListener(){}}),addEventListener(){},scrollTo(){},scrollY:0,setTimeout:()=>0,clearTimeout(){},Telegram:sdk?{WebApp:sdk}:undefined
  });
  vm.runInContext('this.window=this;',ctx);
  for(const path of ['data','photos','art','catalog-core','telegram-bridge','app']) vm.runInContext(fs.readFileSync('js/'+path+'.js','utf8'),ctx,{filename:path+'.js'});
  return {ctx,elements,run:code=>vm.runInContext(code,ctx),click:dataset=>handlers.click({target:{closest:()=>({dataset})}})};
}
test('actual storefront starts, selects configurations and navigates with old Telegram',()=>{
  for(const sdk of [undefined,{initData:'demo',version:'6.0'},{initData:'demo',version:'9.0',colorScheme:'dark',isVersionAtLeast:()=>true,BackButton:{show(){throw Error('old')},hide(){},onClick(){}},onEvent(){},ready(){},expand(){}}]) {
    const a=app({sdk});assert.match(a.elements.get('view').innerHTML,/Orchard/);
    a.run("push({v:'product',id:'iphone-18-pro',oi:1,si:1});addToCart(cur());switchTab('cart');");
    assert.match(a.elements.get('view').innerHTML,/512 ГБ/);
    assert.match(a.elements.get('view').innerHTML,/163.990/);
    a.run("push({v:'product',id:'iphone-17'});back();");assert.match(a.elements.get('view').innerHTML,/Корзина/);
  }
});
test('demo checkout accepts valid sample details without sending an order',()=>{
  const a=app();
  a.run("push({v:'product',id:'iphone-18-pro'});addToCart(cur());S.form={name:'Демо',phone:'+7 900 000-00-00',delivery:0,address:'',pay:0,comment:''};submitOrder();");
  assert.equal(a.run('cur().v'),'done');
  assert.match(a.elements.get('view').innerHTML,/Заказ не отправлен/);
});
test('empty imported catalog keeps home and saved pages usable',()=>{
  const a=app({stored:{'orchard.catalog.v1':JSON.stringify({version:1,products:[]}),cart:JSON.stringify([{pid:'missing',ci:0,oi:0,si:0,qty:1}])}});
  assert.match(a.elements.get('view').innerHTML,/Новая коллекция скоро/);
  assert.equal(a.run('S.cart.length'),0);a.run("switchTab('saved');");assert.match(a.elements.get('view').innerHTML,/То, что вам нравится/);
});
test('clearing the last compared model leaves a usable empty comparison',()=>{
  const a=app();a.run("S.compare=['iphone-18-pro'];push({v:'compare'});S.compare=[];render(false);");
  assert.match(a.elements.get('view').innerHTML,/Сравните перед выбором/);
});
test('catalog refresh removes stale product routes beneath comparison before Back',()=>{
  const a=app();
  a.run("push({v:'product',id:'iphone-18-pro'});S.compare=['iphone-18-pro'];push({v:'compare'});localStorage.setItem(Catalog.KEY,JSON.stringify({version:1,products:PRODUCTS.filter(p=>p.id!=='iphone-18-pro')}));refreshCatalog();back();");
  assert.equal(a.run('cur().v'),'home');
});
test('saved comparisons discard category mismatches at startup and after admin changes',()=>{
  const a=app({stored:{'orchard.compare':JSON.stringify(['iphone-18-pro','macbook-air-13'])}});
  assert.equal(a.run('S.compare.length'),1);
  a.run("S.compare=['iphone-18-pro','iphone-17'];const edited=JSON.parse(JSON.stringify(PRODUCTS));edited.find(p=>p.id==='iphone-17').cat='samsung';localStorage.setItem(Catalog.KEY,JSON.stringify({version:1,products:edited}));refreshCatalog();");
  assert.equal(a.run('S.compare.length'),1);
});

test('the primary card action adds the displayed configuration to cart',()=>{
  const a=app();a.click({act:'quick-add',id:'iphone-18-pro',ci:'0',oi:'1',si:'1'});
  assert.equal(a.run('S.cart.length'),1);
  assert.equal(a.run('S.cart[0].oi'),1);assert.equal(a.run('S.cart[0].si'),1);
  assert.match(a.run("card(byId('iphone-18-pro'),{memory:'512 ГБ',sim:'physical'})"),/В корзине/);
});
