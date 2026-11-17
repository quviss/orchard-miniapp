/* Shared, dependency-free catalog behavior for the storefront and local studio. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Catalog = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const KEY = 'orchard.catalog.v1';
  const clone = value => JSON.parse(JSON.stringify(value));
  const aliases = {айфон:'iphone',айфоны:'iphone',про:'pro',макбук:'macbook',мак:'mac',айпад:'ipad',эйр:'air',аир:'air',эйрподс:'airpods',аирподс:'airpods',самсунг:'samsung',галакси:'galaxy',плейстейшн:'playstation',дайсон:'dyson',черный:'black',белый:'white'};
  function normalize(text) {
    return String(text || '').toLowerCase().replace(/ё/g,'е').replace(/[^\p{L}\p{N}]+/gu,' ').trim().split(/\s+/).map(w=>aliases[w] || w).join(' ');
  }
  function offers(p, f = {}) {
    const simPrices = p.sim ? (f.sim === 'physical' ? [4000] : f.sim === 'esim' ? [0] : [0,4000]) : [0];
    if (f.sim === 'physical' && !p.sim) return [];
    if (f.sim === 'esim' && !p.sim && !/esim/i.test(p.specs.map(row=>row.join(' ')).join(' '))) return [];
    return p.opt.items.flatMap((o, oi) => {
      if (f.memory && normalize(o.t) !== normalize(f.memory)) return [];
      return simPrices.map(extra=>({price:o.p+extra,oi,si:extra ? 1 : 0}));
    }).filter(o=>(f.min === '' || f.min == null || o.price>=Number(f.min)) && (f.max === '' || f.max == null || o.price<=Number(f.max)));
  }
  function query(products, f = {}) {
    const words=normalize(f.q).split(' ').filter(Boolean);
    const list=products.filter(p=>!p.hidden && (!f.cat || f.cat==='all' || p.cat===f.cat) && (!f.stock || p.colors.some(c=>c.q>0)) && (!f.sale || p.old>0) && offers(p,f).length && words.every(w=>normalize([p.name,p.sub,p.cat,p.cat==='samsung'?'Samsung':'',p.colors.map(c=>c.n).join(' '),p.opt.items.map(o=>o.t).join(' ')].join(' ')).includes(w)));
    const min=p=>Math.min(...offers(p,f).map(o=>o.price));
    if(f.sort==='asc') list.sort((a,b)=>min(a)-min(b));
    if(f.sort==='desc') list.sort((a,b)=>min(b)-min(a));
    if(!f.sort || f.sort==='pop') list.sort((a,b)=>Number(!!b.hit)-Number(!!a.hit));
    return list;
  }
  function imageURL(url) {
    return typeof url === 'string' && url.length<=2048 && !/[<>"'\s\\]/.test(url) && (/^https:\/\//i.test(url) || /^img\/[\w/.-]+$/.test(url));
  }
  function validate(payload, categories) {
    if(!payload || payload.version!==1 || !Array.isArray(payload.products) || payload.products.length>500) throw Error('Нужен файл каталога Orchard версии 1, до 500 товаров.');
    const ids=new Set();
    const text=(s,max=300)=>typeof s==='string' && s.trim().length>0 && s.length<=max;
    const money=n=>Number.isFinite(n) && n>=0 && n<=100000000;
    const check=(ok,msg)=>{if(!ok) throw Error(msg);};
    return payload.products.map((p,index)=>{
      const prefix=`Товар ${index+1}: `;
      check(p && typeof p==='object',prefix+'неверный формат.');
      check(text(p.id,80) && /^[a-z0-9][a-z0-9-]*$/.test(p.id) && !ids.has(p.id),prefix+'ID должен быть уникальным (латиница, цифры, дефис).');ids.add(p.id);
      check(text(p.name,120) && typeof p.sub==='string' && p.sub.length<=300,prefix+'проверьте название и описание.');
      check(categories.some(c=>c.id===p.cat),prefix+'неизвестная категория.');
      check(Array.isArray(p.colors) && p.colors.length>0 && p.colors.length<=20,prefix+'нужен хотя бы один цвет (до 20).');
      check(p.opt && text(p.opt.label,80) && Array.isArray(p.opt.items) && p.opt.items.length>0 && p.opt.items.length<=20,prefix+'нужна хотя бы одна комплектация (до 20).');
      check(p.opt.items.every(o=>o && text(o.t,100) && money(o.p)),prefix+'проверьте названия и цены комплектаций.');
      check(p.colors.every(c=>c && text(c.n,80) && /^#[a-f0-9]{6}$/i.test(c.c) && Number.isInteger(c.q) && c.q>=0 && c.q<=100000),prefix+'проверьте цвета и целые неотрицательные остатки.');
      check(new Set(p.colors.map(c=>c.n.trim())).size===p.colors.length,prefix+'названия цветов должны отличаться.');
      check(new Set(p.opt.items.map(o=>o.t.trim())).size===p.opt.items.length,prefix+'названия комплектаций должны отличаться.');
      for(const c of p.colors) if(c.img!==undefined) check((typeof c.img==='string' || Array.isArray(c.img)) && [].concat(c.img).length<=8 && [].concat(c.img).every(imageURL),prefix+'фото: HTTPS-ссылка или файл в img/.');
      if(p.img!==undefined) check((typeof p.img==='string' || Array.isArray(p.img)) && [].concat(p.img).length<=8 && [].concat(p.img).every(imageURL),prefix+'некорректное фото.');
      check(p.old==null || (Number.isFinite(p.old) && p.old>=0 && p.old<1),prefix+'скидка должна быть от 0 до 99%.');
      check(Array.isArray(p.specs) && p.specs.length<=40 && p.specs.every(r=>Array.isArray(r) && r.length===2 && r.every(s=>text(s,1000))),prefix+'некорректные характеристики.');
      check(typeof p.box==='string' && p.box.length<=1000,prefix+'некорректная комплектация.');
      const category=categories.find(c=>c.id===p.cat);
      const art=p.art && ['phone','laptop','tablet','watch','airpods','console','dryer','fold','vacuum','headphones','gamepad','flip','styler'].includes(p.art.t) ? {t:p.art.t,...(typeof p.art.k==='string' && /^[a-z0-9-]{1,30}$/.test(p.art.k) ? {k:p.art.k}: {})} : clone(category.art);
      for(const flag of ['pro','digital','mini','ultra','dark']) if(p.art && typeof p.art[flag]==='boolean') art[flag]=p.art[flag];
      // Explicit fields only: importing a file never introduces executable HTML or arbitrary properties.
      return {id:p.id,name:p.name.trim(),sub:p.sub,cat:p.cat,art,sim:!!p.sim,isNew:!!p.isNew,hit:!!p.hit,hidden:!!p.hidden,old:p.old||0,opt:{label:p.opt.label,items:p.opt.items.map(o=>({t:o.t.trim(),p:o.p}))},colors:p.colors.map(c=>({n:c.n.trim(),c:c.c,q:c.q,...(c.img ? {img:clone(c.img)} : {})})),specs:clone(p.specs),box:p.box,...(p.img ? {img:clone(p.img)}:{})};
    });
  }
  function read(storage, defaults, categories) {
    try { const raw=storage.getItem(KEY); return {products:raw ? validate(JSON.parse(raw),categories) : clone(defaults),error:null}; }
    catch(error) {return {products:clone(defaults),error:error.message};}
  }
  function write(storage, products, categories) {
    const valid=validate({version:1,products},categories);
    storage.setItem(KEY,JSON.stringify({version:1,products:valid}));
    return valid;
  }
  function cleanCart(cart, products) {
    if(!Array.isArray(cart)) return [];
    return cart.flatMap(i=>{
      if(!i || !Number.isInteger(i.qty) || i.qty<=0 || i.qty>999) return [];
      const p=products.find(p=>p.id===i.pid && !p.hidden);
      if(!p) return [];
      const variant=i.variant;
      const ci=variant ? p.colors.findIndex(c=>c.n===variant.color) : i.ci;
      const oi=variant ? p.opt.items.findIndex(o=>o.t===variant.option) : i.oi;
      if(!Number.isInteger(ci) || ci<0 || ci>=p.colors.length || !Number.isInteger(oi) || oi<0 || oi>=p.opt.items.length || !Number.isInteger(i.si) || i.si<0 || i.si>=(p.sim?2:1)) return [];
      return [{pid:p.id,ci,oi,si:i.si,qty:i.qty,variant:{color:p.colors[ci].n,option:p.opt.items[oi].t}}];
    });
  }
  function cleanCompare(ids,products) {
    const visible=products.filter(p=>!p.hidden);
    ids=Array.isArray(ids) ? [...new Set(ids)].filter(id=>visible.some(p=>p.id===id)) : [];
    const first=visible.find(p=>p.id===ids[0]);
    return first ? ids.filter(id=>visible.find(p=>p.id===id).cat===first.cat).slice(0,3) : [];
  }
  function toggleCompare(ids,id,products) {
    const visible=products.filter(p=>!p.hidden);
    ids=cleanCompare(ids,products);
    if(ids.includes(id)) return {ids:ids.filter(x=>x!==id)};
    const p=visible.find(p=>p.id===id); if(!p) return {ids,error:'missing'};
    if(ids.length>=3) return {ids,error:'limit'};
    if(ids.length && visible.find(p=>p.id===ids[0]).cat!==p.cat) return {ids,error:'category'};
    return {ids:[...ids,id]};
  }
  return {KEY,normalize,offers,query,imageURL,validate,read,write,cleanCart,cleanCompare,toggleCompare};
});
