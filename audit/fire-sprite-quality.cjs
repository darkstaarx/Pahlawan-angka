const sharp=require('sharp'),fs=require('fs'),assert=require('assert');
(async()=>{const results=[];for(const id of ['aurora','ketupatKura','kumbangManggis','harimauBunga','arnabKekLapis','durianKerbau']){
 const source=`assets/pets/evolution/fire/${id}/companion-idle-v1.webp`,{data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.equal(info.width,1024);assert.equal(info.height,512);const bounds=[];
 for(let frame=0;frame<2;frame++){let l=512,r=-1,t=512,b=-1;
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){const a=data[(y*1024+x+frame*512)*4+3];if(a>16){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}}
  assert(l>=22&&r<=489&&t>=22&&b<=489,'safe transparent margin '+id);assert(Math.abs((l+r)/2-255.5)<1,'frame centre '+id);bounds.push({l,r,t,b});
 }
 assert(Math.abs(bounds[0].b-bounds[1].b)<=1,'feet jump '+id);assert(Math.abs((bounds[0].b-bounds[0].t)-(bounds[1].b-bounds[1].t))<=4,'frame scale jump '+id);
 const happy=await sharp(`assets/pets/evolution/fire/${id}/happy-v1.webp`).metadata();assert.equal(happy.width,512);assert.equal(happy.height,512);assert(happy.hasAlpha);
 results.push({id,bounds,bytes:fs.statSync(source).size});
}fs.writeFileSync('audit/fire-sprite-quality.json',JSON.stringify(results,null,2));console.log('PASS: six transparent WebP atlases, two 512px frames each, clean cell margins, matching feet/centres and consistent size; six inventory sprites.');})().catch(e=>{console.error(e);process.exit(1)});
