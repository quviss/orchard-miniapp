// Cache the existing catalog photographs byte-for-byte for same-origin canvas rendering.
import fs from 'node:fs/promises';
import vm from 'node:vm';
import crypto from 'node:crypto';
const ctx=vm.createContext({});
vm.runInContext(await fs.readFile('js/data.js','utf8'),ctx);
vm.runInContext(await fs.readFile('js/photos.js','utf8')+'\nthis.photos=PHOTOS;',ctx);
const urls=[...new Set(Object.values(ctx.photos).flat(2).filter(src=>src.startsWith('https://')))];
await fs.mkdir('img/originals',{recursive:true});
const mapping={};const failures=[];let index=0;
async function worker(){
 while(index<urls.length){
  const url=urls[index++];
  const file='img/originals/'+crypto.createHash('sha256').update(url).digest('hex').slice(0,20)+'.jpg';
  try{
   try{await fs.access(file);mapping[url]=file;continue;}catch{}
   const res=await fetch(url,{signal:AbortSignal.timeout(20000)});
   if(!res.ok)throw Error(String(res.status));
   const bytes=Buffer.from(await res.arrayBuffer());
   if(!/^image\//.test(res.headers.get('content-type')||''))throw Error('not image');
   await fs.writeFile(file,bytes);mapping[url]=file;
  }catch(e){failures.push({url,status:e.message});}
 }
}
await Promise.all(Array.from({length:6},worker));
await fs.writeFile('js/photo-assets.js','// Original image bytes cached locally; source URLs remain in photos.js.\nconst PHOTO_ASSETS = '+JSON.stringify(mapping,null,2)+';\n');
console.log(JSON.stringify({cached:Object.keys(mapping).length,total:urls.length,failed:failures.length,examples:failures.slice(0,4)},null,2));
