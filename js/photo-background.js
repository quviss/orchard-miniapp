/* Display original photo pixels with an alpha mask; never redraw or replace the product. */
(function(root,factory){const api=factory();if(typeof module==='object' && module.exports)module.exports=api;else root.PhotoBackground=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  function removeBackground(pixels,width,height){
    const out=new Uint8ClampedArray(pixels),seen=new Uint8Array(width*height),queue=new Uint32Array(width*height);let head=0,tail=0;
    function visit(n){
      if(seen[n])return;seen[n]=1;
      const i=n*4,r=out[i],g=out[i+1],b=out[i+2];
      if(Math.min(r,g,b)>=246 && Math.max(r,g,b)-Math.min(r,g,b)<=10){queue[tail++]=n;out[i+3]=0;}
    }
    for(let x=0;x<width;x++){visit(x);visit((height-1)*width+x);}
    for(let y=0;y<height;y++){visit(y*width);visit(y*width+width-1);}
    while(head<tail){const n=queue[head++],x=n%width,y=Math.floor(n/width);if(x>0)visit(n-1);if(x+1<width)visit(n+1);if(y>0)visit(n-width);if(y+1<height)visit(n+width);}
    return out;
  }
  function source(url){return typeof PHOTO_ASSETS!=='undefined' && PHOTO_ASSETS[url] || url;}
  const cache=new Map();
  function render(img){
    if(!img || img.tagName!=='IMG' || !img.dataset.original || img.dataset.transparent==='true' || !img.naturalWidth)return;
    const original=img.dataset.original;
    if(!cache.has(original)){
      cache.set(original,new Promise(resolve=>setTimeout(()=>{
        try{
          const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
          const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
          const data=ctx.getImageData(0,0,canvas.width,canvas.height);data.data.set(removeBackground(data.data,canvas.width,canvas.height));ctx.putImageData(data,0,0);
          resolve(canvas.toDataURL('image/png'));
        }catch(_){resolve(null);}
      },0)));
    }
    cache.get(original).then(url=>{
      if(!url || img.dataset.original!==original)return;
      img.dataset.transparent='true';img.classList.add('photo-transparent');img.src=url;
    });
  }
  if(typeof document!=='undefined')document.addEventListener('load',e=>render(e.target),true);
  return {removeBackground,source,render};
});
