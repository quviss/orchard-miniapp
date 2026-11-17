/* Browser-local catalog studio. No credentials, network writes or real orders. */
'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone=v=>JSON.parse(JSON.stringify(v));
const original=clone(PRODUCTS);
let loaded;
try { loaded=Catalog.read(localStorage,original,CATEGORIES); } catch(e) { loaded={products:clone(original),error:e.message}; }
let products=loaded.products, selected=null, draft=null, isNew=false, dirty=false, listFilter='all';
function status(text,error=false) { const el=$('#studio-status');el.textContent=text;el.classList.toggle('error',error); }
if(loaded.error) status('Сохранённый каталог не прочитан. Открыта исходная версия; экспортируйте изменения перед закрытием.',true);
function theme() {
  const dark=TelegramBridge.isDark();
  document.documentElement.dataset.theme=dark?'dark':'light';TelegramBridge.colors(dark);
}
TelegramBridge.init(()=>leaveStudio(),theme);TelegramBridge.back(true);theme();
function ask(title,copy) {
  return new Promise(resolve=>{
    const dialog=$('#confirm-dialog');$('#confirm-title').textContent=title;$('#confirm-copy').textContent=copy;
    dialog.returnValue='cancel';dialog.addEventListener('close',()=>resolve(dialog.returnValue==='confirm'),{once:true});dialog.showModal();
  });
}
async function discard() { return !dirty || await ask('Есть несохранённые изменения','Продолжить без сохранения изменений в редакторе?'); }
async function leaveStudio() { if(await discard()) location.href='index.html'; }
document.querySelectorAll('a[href="index.html"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();leaveStudio();}));
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
function thumb(p) {
  const c=p.colors[0],src=c.img ? [].concat(c.img)[0] : p.img ? [].concat(p.img)[0] : null;
  return src ? `<img src="${esc(PhotoBackground.source(src))}" data-original="${esc(src)}" alt="" data-fallback="${p.id}" loading="lazy">` : Art.render(p.art,c.c,0);
}
function renderList() {
  const q=Catalog.normalize($('#admin-search').value);
  const list=products.filter(p=>(!q || Catalog.normalize(p.name).includes(q)) && (listFilter==='all' || (listFilter==='hidden' ? p.hidden : !p.hidden)));
  $('#product-count').textContent=products.length+' моделей';
  $('#product-list').innerHTML=list.map(p=>`<button class="studio-list-item ${selected===p.id?'active':''}" data-select="${p.id}"><div class="studio-thumb">${thumb(p)}</div><div><b>${esc(p.name)}</b><small>${p.hidden?'Скрыт':'На витрине'} · от ${Math.min(...p.opt.items.map(o=>o.p)).toLocaleString('ru-RU')} ₽</small></div></button>`).join('') || '<p class="editor-hint">По этому запросу товаров нет.</p>';
  document.querySelectorAll('[data-list-filter]').forEach(b=>b.classList.toggle('active',b.dataset.listFilter===listFilter));
}
function optionRow(o) {return `<div class="editor-row options"><label>Название<input data-option="t" value="${esc(o.t)}" required maxlength="100" placeholder="256 ГБ"></label><label>Цена, ₽<input data-option="p" value="${o.p}" type="number" min="0" max="100000000" required></label><button class="row-delete" type="button" data-remove="options" aria-label="Удалить комплектацию">×</button></div>`;}
function colorRow(c) {return `<div class="editor-row colors"><label>Название цвета<input data-color="n" value="${esc(c.n)}" required maxlength="80"></label><label>Цвет<input data-color="c" value="${c.c}" type="color"></label><label>Остаток<input data-color="q" value="${c.q}" type="number" min="0" max="100000" step="1" required></label><button class="row-delete" type="button" data-remove="colors" aria-label="Удалить цвет">×</button><label class="image-field">Фото: HTTPS-ссылки, по одной на строке<textarea data-color="img" rows="2" placeholder="Необязательно — есть иллюстрация">${esc([].concat(c.img||[]).join('\n'))}</textarea></label></div>`;}
function specRow(row) {return `<div class="editor-row specs"><label>Характеристика<input data-spec="k" value="${esc(row[0])}" required maxlength="1000"></label><label>Значение<input data-spec="v" value="${esc(row[1])}" required maxlength="1000"></label><button class="row-delete" type="button" data-remove="specs" aria-label="Удалить характеристику">×</button></div>`;}
function editor() {
  const p=draft;
  $('#editor').innerHTML=`<div class="editor-heading"><div><span class="eyebrow">${isNew?'Новая модель':'Карточка товара'}</span><h2>${esc(p.name||'Новый товар')}</h2></div>${!isNew?'<button class="text-button" id="duplicate-product">Дублировать ↗</button>':''}</div><form id="product-form" class="editor-form">
    <div class="editor-fields"><label class="full">Название<input name="name" value="${esc(p.name)}" maxlength="120" required placeholder="Название модели"></label><label class="full">Короткое описание<input name="sub" value="${esc(p.sub)}" maxlength="300" placeholder="Ключевые особенности"></label><label>ID товара<input name="id" value="${esc(p.id)}" pattern="[a-z0-9][a-z0-9-]*" maxlength="80" ${isNew?'':'readonly'} required></label><label>Категория<select name="cat">${CATEGORIES.map(c=>`<option value="${c.id}" ${c.id===p.cat?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label><label>Название выбора версии<input name="optLabel" value="${esc(p.opt.label)}" maxlength="80" required></label><label>Скидка, %<input name="discount" value="${Math.round((p.old||0)*100)}" type="number" min="0" max="99" step="1" required></label></div>
    <div class="editor-flags"><label><input name="isNew" type="checkbox" ${p.isNew?'checked':''}> Новинка</label><label><input name="hit" type="checkbox" ${p.hit?'checked':''}> Выбор Orchard</label><label><input name="hidden" type="checkbox" ${p.hidden?'checked':''}> Скрыть с витрины</label><label><input name="sim" type="checkbox" ${p.sim?'checked':''}> Выбор SIM (+4 000 ₽)</label></div>
    <section class="editor-section"><div class="editor-section-head"><h3>Комплектации и цены</h3><button class="text-button" type="button" data-add="options">+ Добавить</button></div><p>Например, объём памяти или набор аксессуаров.</p><div id="option-rows">${p.opt.items.map(optionRow).join('')}</div></section>
    <section class="editor-section"><div class="editor-section-head"><h3>Цвета и наличие</h3><button class="text-button" type="button" data-add="colors">+ Добавить</button></div><p>Остаток 0 означает «под заказ». В макете остатки общие для всех версий одного цвета.</p><div id="color-rows">${p.colors.map(colorRow).join('')}</div></section>
    <section class="editor-section"><div class="editor-section-head"><h3>Характеристики</h3><button class="text-button" type="button" data-add="specs">+ Добавить</button></div><div id="spec-rows">${p.specs.map(specRow).join('')}</div><label>В комплекте<textarea name="box" rows="2" maxlength="1000">${esc(p.box)}</textarea></label></section>
    <div class="editor-save"><span id="save-hint">${isNew?'Новый товар ещё не сохранён':'Изменения сохраняются локально'}</span><button class="btn" type="submit">Сохранить товар</button></div></form>`;
  $('#product-form').addEventListener('input',()=>{dirty=true;$('#save-hint').textContent='Есть несохранённые изменения';});
  $('#product-form').addEventListener('change',()=>{dirty=true;$('#save-hint').textContent='Есть несохранённые изменения';});
  $('#product-form').addEventListener('submit',save);
  if($('#duplicate-product')) $('#duplicate-product').addEventListener('click',duplicate);
}
function collect() {
  const form=$('#product-form'),f=new FormData(form),p=clone(draft);
  for(const key of ['name','sub','id','cat','box']) p[key]=String(f.get(key)||'').trim();
  for(const key of ['isNew','hit','hidden','sim']) p[key]=f.has(key);
  p.old=Number(f.get('discount'))/100;
  p.opt={label:String(f.get('optLabel')).trim(),items:[...document.querySelectorAll('#option-rows .editor-row')].map(row=>({t:row.querySelector('[data-option="t"]').value.trim(),p:Number(row.querySelector('[data-option="p"]').value)}))};
  p.colors=[...document.querySelectorAll('#color-rows .editor-row')].map(row=>{const c={n:row.querySelector('[data-color="n"]').value.trim(),c:row.querySelector('[data-color="c"]').value,q:Number(row.querySelector('[data-color="q"]').value)};const imgs=row.querySelector('[data-color="img"]').value.split('\n').map(v=>v.trim()).filter(Boolean);if(imgs.length)c.img=imgs;return c;});
  p.specs=[...document.querySelectorAll('#spec-rows .editor-row')].map(row=>[row.querySelector('[data-spec="k"]').value.trim(),row.querySelector('[data-spec="v"]').value.trim()]);
  if(p.cat!==draft.cat) p.art=clone(CATEGORIES.find(c=>c.id===p.cat).art);
  return p;
}
function persist(next) {
  // Write first: failed storage never mutates the list the visitor is editing.
  const saved=Catalog.write(localStorage,next,CATEGORIES);
  products=saved;
}
function save(e) {
  e.preventDefault();
  try {
    const p=collect();
    if(isNew && products.some(x=>x.id===p.id)) throw Error('Такой ID уже есть. Укажите уникальный ID.');
    const next=isNew?[...products,p]:products.map(x=>x.id===selected?p:x);
    persist(next);selected=p.id;draft=clone(products.find(x=>x.id===selected));isNew=false;dirty=false;renderList();editor();status('Сохранено. Изменения доступны на витрине в этом браузере.');
  } catch(e) {status('Не удалось сохранить: '+e.message,true);$('#studio-status').scrollIntoView({behavior:'smooth',block:'center'});}
}
async function select(id) {
  if(!await discard())return;
  const p=products.find(p=>p.id===id);if(!p)return;
  selected=id;draft=clone(p);isNew=false;dirty=false;editor();renderList();
  if(innerWidth<801) $('#editor').scrollIntoView({behavior:'smooth',block:'start'});
}
function uniqueId(base) {let id=base,n=2;while(products.some(p=>p.id===id))id=base+'-'+n++;return id;}
async function newProduct() {
  if(!await discard())return;
  selected=null;isNew=true;dirty=true;
  draft={id:uniqueId('new-model'),name:'',sub:'',cat:'iphone',art:{t:'phone',k:'pro'},colors:[{n:'Чёрный',c:'#252b28',q:1}],opt:{label:'Память',items:[{t:'256 ГБ',p:0}]},specs:[],box:'',sim:false};
  renderList();editor();$('#product-form [name="name"]').focus();
}
async function duplicate() {
  // Duplicate the current draft, preserving edits instead of silently discarding them.
  const p=collect();p.id=uniqueId(p.id+'-copy');p.name=(p.name+' — копия').slice(0,120);p.hidden=true;
  draft=p;selected=null;isNew=true;dirty=true;editor();renderList();status('Копия скрыта с витрины. Отредактируйте и сохраните её.');
}
$('#new-product').addEventListener('click',newProduct);
$('#admin-search').addEventListener('input',renderList);
document.addEventListener('click',e=>{
  const selectButton=e.target.closest('[data-select]');if(selectButton)select(selectButton.dataset.select);
  const filter=e.target.closest('[data-list-filter]');if(filter){listFilter=filter.dataset.listFilter;renderList();}
  const add=e.target.closest('[data-add]');if(add){
    const type=add.dataset.add;
    const container=$({options:'#option-rows',colors:'#color-rows',specs:'#spec-rows'}[type]);
    if(container.children.length >= (type==='specs'?40:20)) {status('Достигнут лимит строк.',true);return;}
    container.insertAdjacentHTML('beforeend',type==='options'?optionRow({t:'',p:0}):type==='colors'?colorRow({n:'',c:'#dddddd',q:0}):specRow(['','']));dirty=true;$('#save-hint').textContent='Есть несохранённые изменения';
  }
  const remove=e.target.closest('[data-remove]');if(remove){
    const row=remove.closest('.editor-row');if(remove.dataset.remove!=='specs' && row.parentElement.children.length<=1){status('Оставьте хотя бы одну комплектацию и один цвет.',true);return;}
    row.remove();dirty=true;$('#save-hint').textContent='Есть несохранённые изменения';
  }
});
$('#export-catalog').addEventListener('click',()=>{
  try {
    const valid=Catalog.validate({version:1,products},CATEGORIES);
    const blob=new Blob([JSON.stringify({version:1,products:valid},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='orchard-catalog.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    status(dirty?'Экспортирован сохранённый каталог. Несохранённый товар в файл не включён.':'Экспортирован сохранённый каталог.');
  }catch(e){status('Экспорт не выполнен: '+e.message,true);}
});
$('#import-catalog').addEventListener('change',async e=>{
  const file=e.target.files[0];e.target.value='';if(!file)return;
  try {
    if(file.size>5*1024*1024)throw Error('Файл слишком большой. Лимит — 5 МБ.');
    const next=Catalog.validate(JSON.parse(await file.text()),CATEGORIES);
    if(!await ask('Заменить локальный каталог?',`Будет загружено моделей: ${next.length}. Текущие данные и несохранённые правки заменятся. Сначала можно отменить и экспортировать каталог.`))return;
    persist(next);selected=null;draft=null;dirty=false;isNew=false;renderList();$('#editor').innerHTML='<div class="editor-empty"><h2>Каталог импортирован</h2><p>Выберите модель для редактирования.</p></div>';status('Импортировано моделей: '+products.length+'.');
  }catch(error){status('Импорт не выполнен: '+error.message,true);}
});
$('#reset-catalog').addEventListener('click',async()=>{
  if(!await ask('Восстановить исходный каталог?','Локальные изменения и несохранённые правки будут заменены исходными товарами. Для резервной копии сначала экспортируйте JSON.'))return;
  try {persist(clone(original));selected=null;draft=null;dirty=false;isNew=false;renderList();$('#editor').innerHTML='<div class="editor-empty"><h2>Чистый лист</h2><p>Исходный каталог восстановлен.</p></div>';status('Исходный каталог восстановлен.');}catch(e){status('Не удалось восстановить: '+e.message,true);}
});
document.addEventListener('error',e=>{
  const img=e.target;if(!img.dataset || !img.dataset.fallback)return;
  const p=products.find(p=>p.id===img.dataset.fallback);if(!p)return;
  const attempted=JSON.parse(img.dataset.attempted || '[]');attempted.push(img.dataset.original || img.getAttribute('src'));img.dataset.attempted=JSON.stringify(attempted);
  const next=Catalog.nextPhoto(p.colors[0].img || p.img,attempted);
  if(next){img.dataset.original=next;delete img.dataset.transparent;img.src=PhotoBackground.source(next);return;}
  const label=document.createElement('span');label.className='photo-unavailable';label.textContent='Фото недоступно';img.replaceWith(label);
},true);
renderList();
