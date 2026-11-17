const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const P=fs.existsSync('js/photo-background.js') ? require('../js/photo-background.js') : {};
test('only edge-connected white background becomes transparent; white product interiors remain',()=>{
 assert.equal(typeof P.removeBackground,'function');
 const width=7,height=7,pixels=new Uint8ClampedArray(width*height*4).fill(255);
 for(let y=1;y<=5;y++)for(let x=1;x<=5;x++)if(x===1||x===5||y===1||y===5){const i=(y*width+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=80;}
 const out=P.removeBackground(pixels,width,height);
 assert.equal(out[3],0);assert.equal(out[(3*width+3)*4+3],255);assert.equal(out[(1*width+1)*4+3],255);
 assert.equal(out[(1*width+1)*4],80);assert.equal(pixels[3],255);
});
test('colored bright device pixels are preserved',()=>{
 assert.equal(typeof P.removeBackground,'function');
 const data=new Uint8ClampedArray([255,255,255,255,250,220,230,255,255,255,255,255]);
 const out=P.removeBackground(data,3,1);assert.equal(out[7],255);assert.equal(out[4],250);assert.equal(out[5],220);
});
