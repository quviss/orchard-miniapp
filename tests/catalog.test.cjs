const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync('js/data.js','utf8') + '\nthis.products=PRODUCTS;this.categories=CATEGORIES;', context);
const products = JSON.parse(JSON.stringify(context.products));
const categories = JSON.parse(JSON.stringify(context.categories));
const C = fs.existsSync('js/catalog-core.js') ? require('../js/catalog-core.js') : {};
// Catch loss of Russian aliases and searches against configuration labels.
test('Russian names and storage queries find matching devices', () => {
  assert.equal(typeof C.query, 'function');
  assert.ok(C.query(products,{q:'айфон 18 про 512'}).some(p=>p.id==='iphone-18-pro'));
  assert.ok(C.query(products,{q:'макбук'}).some(p=>p.id==='macbook-air-13'));
  assert.equal(C.query(products,{q:'несуществующий товар'}).length,0);
});
test('budget, memory and SIM must match the same configuration', () => {
  assert.equal(typeof C.query, 'function');
  assert.equal(C.query(products,{cat:'iphone',memory:'512 ГБ',max:150000}).some(p=>p.id==='iphone-18-pro'),false);
  assert.equal(C.query(products,{cat:'iphone',memory:'256 ГБ',max:141000,sim:'physical'}).some(p=>p.id==='iphone-18-pro'),false);
  assert.equal(C.query(products,{memory:'512 ГБ',max:160000}).some(p=>p.id==='iphone-18-pro'),true);
  assert.equal(C.query(products,{min:200000,max:100000}).length,0);
});
test('hidden models never appear and price sorting uses matching variant', () => {
  assert.equal(typeof C.query, 'function');
  const input = structuredClone(products); input[0].hidden=true;
  assert.equal(C.query(input,{}).some(p=>p.id===input[0].id),false);
  const list=C.query(products,{sort:'asc',max:100000});
  assert.ok(list.length>0);
  assert.equal(list[0].id,'dualsense');
});
test('import rejects duplicate IDs, unsafe images, broken prices and invalid categories atomically', () => {
  assert.equal(typeof C.validate, 'function');
  const valid={version:1,products}; assert.ok(C.validate(valid,categories).length);
  for(const mutate of [p=>p.push(p[0]),p=>p[0].opt.items[0].p=-1,p=>p[0].cat='unknown',p=>p[0].colors[0].img=['javascript:alert(1)'],p=>p[0].colors=[],p=>p[0].old=1,p=>p[0].colors[0].q=1.5]) {
    const p=structuredClone(products);mutate(p);assert.throws(()=>C.validate({version:1,products:p},categories));
  }
  assert.throws(()=>C.validate({version:99,products},categories));
});
test('catalog roundtrip and failed storage leave the prior snapshot intact', () => {
  assert.equal(typeof C.write, 'function');
  const values=new Map(); const storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
  const edited=structuredClone(products); edited[0].name='Моя модель';
  C.write(storage,edited,categories);
  assert.equal(C.read(storage,products,categories).products[0].name,'Моя модель');
  assert.throws(()=>C.write({setItem(){throw Error('quota')}},edited,categories),/quota/);
  values.set(C.KEY,'{broken');
  const result=C.read(storage,products,categories);
  assert.equal(result.products[0].name,'iPhone 18 Pro Max');assert.ok(result.error);
});
test('stale cart is repaired after catalog edits without invalid indices', () => {
  assert.equal(typeof C.cleanCart, 'function');
  const cart=[{pid:products[0].id,ci:0,oi:0,si:0,qty:2},{pid:products[0].id,ci:100,oi:0,si:0,qty:1},{pid:'missing',ci:0,oi:0,si:0,qty:1},{pid:products[0].id,ci:0,oi:0,si:0,qty:-1}];
  assert.equal(C.cleanCart(cart,products).length,1);
  assert.equal(C.cleanCart(cart,products)[0].qty,2);
  assert.deepEqual(C.cleanCart({},products),[]);
});
test('comparison keeps at most three models from a single category', () => {
  assert.equal(typeof C.toggleCompare, 'function');
  assert.deepEqual(C.toggleCompare(['iphone-18-pro','iphone-17','iphone-air'],'iphone-18-pro-max',products),{ids:['iphone-18-pro','iphone-17','iphone-air'],error:'limit'});
  assert.equal(C.toggleCompare(['iphone-18-pro'],'macbook-air-13',products).error,'category');
  assert.deepEqual(C.toggleCompare(['iphone-18-pro'],'iphone-18-pro',products).ids,[]);
});
test('saving keeps device-specific illustration types and flags',()=>{
  const valid=C.validate({version:1,products},categories);
  assert.equal(valid.find(p=>p.id==='dualsense').art.t,'gamepad');
  assert.equal(valid.find(p=>p.id==='galaxy-z-flip8').art.t,'flip');
  assert.equal(valid.find(p=>p.id==='ps5-slim-digital').art.digital,true);
  assert.equal(valid.find(p=>p.id==='watch-ultra-4').art.ultra,true);
});
test('cart keeps chosen variant when admin reorders options or colors and drops removed choices',()=>{
  const p=structuredClone(products[0]);
  const cart=C.cleanCart([{pid:p.id,ci:1,oi:1,si:0,qty:1}],[p]);
  const edited=structuredClone(p);edited.colors.reverse();edited.opt.items.reverse();
  const kept=C.cleanCart(cart,[edited]);
  assert.equal(kept.length,1);
  assert.equal(edited.colors[kept[0].ci].n,'Серебристый');
  assert.equal(edited.opt.items[kept[0].oi].t,'512 ГБ');
  edited.colors=edited.colors.filter(c=>c.n!=='Серебристый');
  assert.equal(C.cleanCart(cart,[edited]).length,0);
});
test('duplicate configuration or color names cannot make cart identity ambiguous',()=>{
  for(const mutate of [p=>p[0].opt.items.push({...p[0].opt.items[0]}),p=>p[0].colors.push({...p[0].colors[0]})]) {
    const p=structuredClone(products);mutate(p);assert.throws(()=>C.validate({version:1,products:p},categories));
  }
});
test('mixed-category saved comparisons are repaired before toggling',()=>{
  const result=C.toggleCompare(['iphone-18-pro','macbook-air-13'],'iphone-17',products);
  assert.deepEqual(result.ids,['iphone-18-pro','iphone-17']);
});
