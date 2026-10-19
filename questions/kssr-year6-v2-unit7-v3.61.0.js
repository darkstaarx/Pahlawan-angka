// Year 6 Curriculum Bank v2 — Unit 7: Koordinat, Nisbah dan Kadaran
(function(){
'use strict';
const RT=window.PAY6V2Runtime;if(!RT)return;
const {GEN,Nq,choose,rand,q,mark,chooseMode,bandModes,stage,coord,table,gcd,who,distinct}=RT;
const ratioStr=(a,b)=>{const g=gcd(a,b);return (a/g)+':'+(b/g)};
const pt=()=>({x:rand(0,8),y:rand(0,8)});

function localCoordMap(spec){
 const W=360,H=360,left=34,top=22,right=22,bottom=34,cw=(W-left-right)/8,ch=(H-top-bottom)/8;
 const px=x=>left+x*cw,py=y=>top+(8-y)*ch;
 let g='';
 for(let x=0;x<=8;x++)g+=`<line x1="${px(x)}" y1="${top}" x2="${px(x)}" y2="${H-bottom}" stroke="#d8e2ef" stroke-width="1"/>`;
 for(let y=0;y<=8;y++)g+=`<line x1="${left}" y1="${py(y)}" x2="${W-right}" y2="${py(y)}" stroke="#d8e2ef" stroke-width="1"/>`;
 const points=spec.points.map(p=>`<circle cx="${px(p.x)}" cy="${py(p.y)}" r="7" fill="#ffca62" stroke="#263b5d" stroke-width="2"/><text x="${px(p.x)}" y="${py(p.y)-10}" text-anchor="middle" font-size="11" font-weight="800" fill="#263b5d">${p.label}</text>`).join('');
 const axes=`<line x1="${left}" y1="${py(0)}" x2="${W-right}" y2="${py(0)}" stroke="#526987" stroke-width="2"/><line x1="${left}" y1="${top}" x2="${left}" y2="${py(0)}" stroke="#526987" stroke-width="2"/>`;
 const ticks=[...Array(9)].map((_,x)=>`<text x="${px(x)}" y="${H-20}" text-anchor="middle" font-size="12" fill="#526987">${x}</text>`).join('');
 const yt=[...Array(9)].map((_,y)=>`<text x="16" y="${py(y)+3}" text-anchor="middle" font-size="12" fill="#526987">${y}</text>`).join('');
 const legend=spec.points.map(p=>`<span style="display:inline-block;margin-right:9px"><b>${p.label}</b> = ${p.name}</span>`).join('');
 return `<div><svg viewBox="0 0 ${W} ${H}" width="360" height="360" role="img" aria-label="Peta koordinat grid 0 hingga 8 pada kedua-dua paksi" style="display:block;max-width:100%;height:auto;margin:0 auto 5px;background:#f8fbff;border:1px solid #b9c9dc;border-radius:8px">${g}${axes}${points}${ticks}${yt}<text x="${W-20}" y="${H-7}" font-size="12" fill="#526987">x</text><text x="12" y="12" font-size="12" fill="#526987">y</text></svg><div style="font-size:11px;line-height:1.45;text-align:center">${legend}</div></div>`;
}
function coordMapSpec(mode){
 const layouts=[[[1,1],[3,4],[5,1],[6,5],[8,2]],[[1,4],[2,1],[4,3],[7,1],[8,5]],[[1,2],[3,5],[4,1],[6,3],[8,4]],[[1,5],[2,2],[5,4],[7,2],[8,1]]];
 const names=['Perpustakaan','Kantin','Dewan','Makmal','Taman'];
 const xy=choose(layouts), ns=names.slice().sort(()=>Math.random()-.5);
 return {mode,scale:choose([2,3,5]),points:xy.map((v,i)=>({x:v[0],y:v[1],label:String.fromCharCode(65+i),name:ns[i]})),from:null,to:null,target:null,movements:null,math:null};
}
function coordPair(spec,unequal){
 const pairs=[];for(const a of spec.points)for(const b of spec.points)if(a!==b){const dx=Math.abs(b.x-a.x),dy=Math.abs(b.y-a.y);if(dx&&dy&&(!unequal||dx!==dy))pairs.push([a,b])}
 return choose(pairs);
}
function tupleWrongs(p){
 const out=[],seen=new Set([`(${p.x},${p.y})`]);
 [[p.y,p.x],[p.x+1,p.y],[p.x,p.y+1],[p.x-1,p.y],[p.x,p.y-1]].forEach(v=>{if(v[0]>=0&&v[0]<=8&&v[1]>=0&&v[1]<=8){const s=`(${v[0]},${v[1]})`;if(!seen.has(s)){seen.add(s);out.push(s)}}});
 return out.slice(0,3);
}
function mapMark(out,id,mode,rep,demand,s,spec,targets){out.coordMapSpec=spec;return mark(out,id,'7.1.1',mode,rep,demand,s,targets)}
function dirText(dx,dy){return `${Math.abs(dx)} petak ${dx<0?'ke kiri':'ke kanan'} dan ${Math.abs(dy)} petak ${dy<0?'ke bawah':'ke atas'}`}
function pairText(h,v){return `mengufuk ${h} km, mencancang ${v} km`}
function pairWrongs(h,v,scale){return [...new Set([pairText(v,h),pairText(h+scale,v),pairText(h,v+scale),pairText(h+scale,v+scale),pairText(Math.max(scale,h-scale),v)])].filter(x=>x!==pairText(h,v)).slice(0,3)}

GEN['7.1.1']=function(id,s){
 const mode=chooseMode(id,'7.1.1',bandModes(
  s,
  ['map_coordinate','map_destination','petak_scale','direction','missing_point'],
  ['map_destination','map_distances','map_scaled_destination','petak_scale','direction','missing_point','cm_scale','representative_scale','route'],
  ['map_distances','map_scaled_destination','cm_scale','representative_scale','route','scale_reverse','route_compare','coord_error']
  ));
 if(mode==='map_coordinate'){
  const spec=coordMapSpec(mode),p=choose(spec.points), answer=`(${p.x},${p.y})`, wrong=tupleWrongs(p); spec.target=p.label;
  return mapMark(q(localCoordMap(spec)+'Apakah koordinat bagi '+p.name+'? ',answer,wrong.map(x=>Nq(x,'coord')),'Baca nilai x dahulu, kemudian nilai y.','Tahun 6 · Koordinat Peta'),id,mode,'visual',stage(s)===3?'reasoning':'application',s,spec,['coord','visual_reading']);
 }
 if(mode==='map_destination'){
  const spec=coordMapSpec(mode),[from,to]=coordPair(spec,false),dx=to.x-from.x,dy=to.y-from.y; spec.from=from.label;spec.to=to.label;spec.target=to.label;spec.movements={dx,dy};spec.math={horizontalPetak:Math.abs(dx),verticalPetak:Math.abs(dy)};
  const wrong=spec.points.filter(p=>p!==to).slice(0,3).map(p=>Nq(p.name,'coord'));
  return mapMark(q(localCoordMap(spec)+'Dari '+from.name+', bergerak '+dirText(dx,dy)+'. Di manakah destinasi itu?',to.name,wrong,'Ikut perubahan mengufuk pada x dan mencancang pada y.','Tahun 6 · Destinasi Peta'),id,mode,'visual',stage(s)===3?'reasoning':'application',s,spec,['coord','direction','map_reasoning']);
 }
 if(mode==='map_distances'){
  const spec=coordMapSpec(mode),[from,to]=coordPair(spec,true),dx=Math.abs(to.x-from.x),dy=Math.abs(to.y-from.y),h=dx*spec.scale,v=dy*spec.scale,answer=pairText(h,v); spec.from=from.label;spec.to=to.label;spec.target=to.label;spec.movements={dx:to.x-from.x,dy:to.y-from.y};spec.math={horizontalPetak:dx,verticalPetak:dy,horizontalKm:h,verticalKm:v};
  const wrong=pairWrongs(h,v,spec.scale);
  return mapMark(q(localCoordMap(spec)+'Antara '+from.name+' dan '+to.name+', jika 1 petak = '+spec.scale+' km, berapakah jarak sebenar bagi pasangan mengufuk dan mencancang? Nyatakan kedua-duanya dalam km.',answer,wrong.map(x=>Nq(x,'scale')),'Kira beza x dan y, kemudian darab setiap satu dengan skala '+spec.scale+' km bagi satu petak.','Tahun 6 · Jarak Mengufuk dan Mencancang'),id,mode,'visual','reasoning',s,spec,['coord','scale','distance_pair','swap_error']);
 }
 if(mode==='map_scaled_destination'){
  const spec=coordMapSpec(mode),[from,to]=coordPair(spec,true),dx=Math.abs(to.x-from.x),dy=Math.abs(to.y-from.y),h=dx*spec.scale,v=dy*spec.scale,answer=to.name; spec.from=from.label;spec.to=to.label;spec.target=to.label;spec.movements={dx:to.x-from.x,dy:to.y-from.y};spec.math={horizontalPetak:dx,verticalPetak:dy,horizontalKm:h,verticalKm:v};
  const wrong=spec.points.filter(p=>p!==to).slice(0,3).map(p=>Nq(p.name,'coord'));
  return mapMark(q(localCoordMap(spec)+'Skala peta ialah 1 petak = '+spec.scale+' km. Dari '+from.name+', Hana bergerak '+h+' km '+(to.x<from.x?'ke kiri':'ke kanan')+' dan '+v+' km '+(to.y<from.y?'ke bawah':'ke atas')+'. Ke manakah Hana pergi?',answer,wrong,'Bahagi setiap jarak dengan skala untuk mendapatkan bilangan petak, kemudian ikut arah pergerakan.','Tahun 6 · Destinasi Berskala'),id,mode,'visual','reasoning',s,spec,['coord','scale','direction','map_reasoning']);
 }
 if(mode==='petak_scale'){
  const sc=choose([2,3,4,5,10]),dx=rand(2,7),dir=choose(['mengufuk','mencancang']),ans=dx*sc;
  return mark(q('Jarak '+dir+' antara dua titik pada satah Cartes ialah '+dx+' unit. Jika 1 unit mewakili '+sc+' km, berapakah jarak sebenar antara kedua-dua titik?',ans+' km',distinct(ans+' km',[dx+' km',(ans+sc)+' km',(dx+sc)+' km'],'scale'),'Darab bilangan unit dengan skala.','Tahun 6 · Jarak Berskala'),id,'7.1.1',mode,'verbal','application',s,['coord','scale']);
 }
 if(mode==='direction'){
  let A,B;do{A=pt();B=pt()}while(A.x===B.x||A.y===B.y);
  const dx=B.x-A.x,dy=B.y-A.y,h=x=>Math.abs(x)+' petak '+(x<0?'kiri':'kanan'),v=y=>Math.abs(y)+' petak '+(y<0?'bawah':'atas'),ans=h(dx)+', '+v(dy);
  return mark(q(coord([{x:A.x,y:A.y,label:'A'},{x:B.x,y:B.y,label:'B'}])+'Apakah pergerakan yang betul dari titik A ke titik B?',ans,distinct(ans,[h(-dx)+', '+v(dy),h(dx)+', '+v(-dy),Math.abs(dy)+' petak '+(dx<0?'kiri':'kanan')+', '+Math.abs(dx)+' petak '+(dy<0?'bawah':'atas'),B.x+' petak kanan, '+B.y+' petak atas'],'coord'),'Banding perubahan x dan perubahan y.','Tahun 6 · Arah Koordinat'),id,'7.1.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['coord','direction']);
 }
 if(mode==='missing_point'){
  let A,dx,dy;do{A=pt();dx=rand(-4,4);dy=rand(-4,4)}while(!dx||!dy||A.x+dx<0||A.x+dx>8||A.y+dy<0||A.y+dy>8);
  const B={x:A.x+dx,y:A.y+dy},t=(x,y)=>'('+x+', '+y+')',ans=t(B.x,B.y);
  return mark(q('Titik A berada pada '+t(A.x,A.y)+'. Titik B ialah '+Math.abs(dx)+' unit ke '+(dx<0?'kiri':'kanan')+' dan '+Math.abs(dy)+' unit ke '+(dy<0?'bawah':'atas')+' dari titik A. Apakah koordinat titik B?',ans,distinct(ans,[t(A.x+dx,A.y-dy),t(A.x+dy,A.y+dx),t(A.x-dx,A.y+dy),t(B.y,B.x),t(A.x-dx,A.y-dy),t(B.x+1,B.y)],'coord'),(dx<0?'Tolak ':'Tambah ')+Math.abs(dx)+' pada x dan '+(dy<0?'tolak ':'tambah ')+Math.abs(dy)+' pada y.','Tahun 6 · Titik Hilang'),id,'7.1.1',mode,'verbal',stage(s)===3?'reasoning':'application',s,['coord','inverse']);
 }
 if(mode==='cm_scale'){
  const sc=choose([2,3,4,5,8,10]),cm=rand(3,12),ans=cm*sc,[p1,p2]=choose([['A','B'],['P','Q'],['Kampung Baru','Pekan'],['sekolah','perpustakaan']]);
  return mark(q(table(['Skala peta','Jarak '+p1+' ke '+p2+' pada peta'],[['1 cm mewakili '+sc+' km',cm+' cm']])+'Berapakah jarak sebenar, dalam km, dari '+p1+' ke '+p2+'?',ans+' km',distinct(ans+' km',[(cm+sc)+' km',cm+' km',(ans+sc)+' km'],'scale'),cm+' × '+sc+' km.','Tahun 6 · Skala Peta'),id,'7.1.1',mode,'story',stage(s)===3?'reasoning':'application',s,['coord','scale']);
 }
 if(mode==='representative_scale'){
  const k=choose([1,2,5]),cm=rand(2,12),km=cm*k,ratio=k*100000;
  return mark(q('Skala sebuah peta ialah 1 : '+ratio.toLocaleString('en-US')+'. Jarak antara dua tempat pada peta ialah '+cm+' cm. Berapakah jarak sebenar antara dua tempat itu?',km+' km',distinct(km+' km',[(km*100)+' m',(km*10)+' km',(km*100)+' km'],'scale'),'1 : '+ratio.toLocaleString('en-US')+' bermaksud 1 cm mewakili '+k+' km.','Tahun 6 · Skala Wakilan'),id,'7.1.1',mode,'story',stage(s)===3?'reasoning':'application',s,['coord','scale','unit_conversion']);
 }
 if(mode==='route'){
  let A,Bx,Cy;do{A=pt();Bx=rand(0,8);Cy=rand(0,8)}while(Bx===A.x||Cy===A.y);
  const sc=choose([2,3,5,10]),h=Math.abs(Bx-A.x),v=Math.abs(Cy-A.y),ans=(h+v)*sc;
  return mark(q(coord([{x:A.x,y:A.y,label:'A'},{x:Bx,y:A.y,label:'B'},{x:Bx,y:Cy,label:'C'}],sc)+'Laluan A → B → C. Berapakah jumlah jarak perjalanan?',ans+' km',distinct(ans+' km',[(h+v)+' km',(h*v*sc)+' km',(ans+sc)+' km'],'coord'),'A→B = '+h+' unit, B→C = '+v+' unit; jumlah '+(h+v)+' unit × '+sc+' km.','Tahun 6 · Laluan Koordinat Berskala'),id,'7.1.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['coord','scale','route']);
 }
 if(mode==='scale_reverse'){
  const sc=choose([2,3,4,5,10]),x1=rand(0,3),d=rand(2,5),y=rand(0,8),km=d*sc;
  return mark(q('Jarak sebenar dari A('+x1+', '+y+') ke B('+(x1+d)+', '+y+') ialah '+km+' km. Berapakah jarak sebenar yang diwakili oleh 1 unit?',sc+' km',distinct(sc+' km',[d+' km',(km*d)+' km',km+' km'],'scale'),'Beza x = '+d+' unit; '+km+' ÷ '+d+'.','Tahun 6 · Menentukan Skala'),id,'7.1.1',mode,'verbal','reasoning',s,['coord','scale','inverse']);
 }
 if(mode==='route_compare'){
  const a=rand(5,10),b=a+choose([-3,-2,2,3]),sc=choose([2,3,5]),short=a<b?'A→B→D':'A→C→D',diff=Math.abs(a-b)*sc,ans=short+', lebih pendek '+diff+' km';
  return mark(q(table(['Laluan','Bilangan unit'],[['A→B→D',a],['A→C→D',b]])+'Satu unit mewakili '+sc+' km. Laluan manakah lebih pendek dan berapakah bezanya?',ans,distinct(ans,[(short==='A→B→D'?'A→C→D':'A→B→D')+', lebih pendek '+diff+' km',short+', lebih pendek '+Math.abs(a-b)+' km','kedua-duanya sama'],'route'),'Beza '+Math.abs(a-b)+' unit × '+sc+' km.','Tahun 6 · Membanding Laluan'),id,'7.1.1',mode,'table','reasoning',s,['coord','route','compare']);
 }
 let A,B;do{A=pt();B=pt()}while(A.x===B.x||A.y===B.y);
 const dx=Math.abs(B.x-A.x),dy=Math.abs(B.y-A.y),name=who(),only=choose(['x','y']),said=only==='x'?dx:dy;
 return mark(q(name+' mengira jarak dari A('+A.x+', '+A.y+') ke B('+B.x+', '+B.y+') sebagai '+said+' unit dengan hanya melihat perubahan '+only+'. Berapakah jumlah unit yang betul bagi laluan mengufuk kemudian mencancang?',(dx+dy)+' unit',distinct((dx+dy)+' unit',[said+' unit',(only==='x'?dy:dx)+' unit',(dx*dy)+' unit'],'coord'),'Perubahan x = '+dx+' dan perubahan y = '+dy+'.','Tahun 6 · Analisis Laluan Koordinat'),id,'7.1.1',mode,'verbal','reasoning',s,['coord','error_analysis']);
};

GEN['7.2.1']=function(id,s){
 const mode=chooseMode(id,'7.2.1',bandModes(
  s,
  ['simplify','equivalent','same_unit'],
  ['simplify','equivalent','same_unit','length_units','mass_units','liquid_units','money_ratio'],
  ['length_units','mass_units','liquid_units','ratio_compare','ratio_error','ratio_from_total']
 ));
 const k=rand(2,9);let x,y;do{x=rand(1,9);y=rand(1,9)}while(x===y||gcd(x,y)!==1);
 if(mode==='simplify'){const ans=x+':'+y;return mark(q('Ringkaskan nisbah '+(x*k)+' : '+(y*k)+'.',ans,distinct(ans,[(x*2)+':'+(y*2)===(x*k)+':'+(y*k)?(x*3)+':'+(y*3):(x*2)+':'+(y*2),y+':'+x,(x*k)+':'+(y*k)],'ratio'),'Bahagi kedua-dua bahagian dengan faktor sepunya terbesar, '+k+'.','Tahun 6 · Nisbah Termudah'),id,'7.2.1',mode,'symbolic',stage(s)===1?'procedure':'application',s,['ratio']);}
 if(mode==='equivalent'){const ans=(x*k)+':'+(y*k);return mark(q('Antara berikut, yang manakah nisbah setara bagi '+x+' : '+y+'?',ans,distinct(ans,[(x+k)+':'+(y+k),(x*k)+':'+(y*(k+1)),(y*k)+':'+(x*k)],'ratio'),'Darab kedua-dua bahagian dengan nombor yang sama.','Tahun 6 · Nisbah Setara'),id,'7.2.1',mode,'symbolic',stage(s)===1?'concept':'application',s,['ratio']);}
 const UNITS={same_unit:[['kg','g',1000]],length_units:[['m','cm',100],['km','m',1000]],mass_units:[['kg','g',1000]],liquid_units:[['ℓ','mℓ',1000]]};
 if(UNITS[mode]){
  const [big,small,f]=choose(UNITS[mode]),bigFirst=choose([true,false]),bv=choose([0.5,1,1.5,2,2.5,3,4]),sv=f*bv/choose([2,3,4,5,8].filter(d=>(f*bv)%d===0)),A=bigFirst?bv+' '+big:sv+' '+small,B=bigFirst?sv+' '+small:bv+' '+big,ans=bigFirst?ratioStr(bv*f,sv):ratioStr(sv,bv*f),rev=ans.split(':').reverse().join(':');
  return mark(q('Tulis nisbah '+A+' kepada '+B+' dalam bentuk termudah.',ans,distinct(ans,[rev,(bigFirst?bv+':'+sv:sv+':'+bv),ans.split(':').map(v=>v*2).join(':')],'ratio'),'Tukar kepada unit yang sama ('+small+') dahulu.','Tahun 6 · Nisbah dan Unit'),id,'7.2.1',mode,'verbal',stage(s)===3?'reasoning':'application',s,['ratio','unit_conversion']);
 }
 if(mode==='money_ratio'){const ans=x+':'+y;return mark(q('Tulis nisbah RM'+(x*k)+' kepada RM'+(y*k)+' dalam bentuk termudah.',ans,distinct(ans,[(x*k)+':'+(y*k),y+':'+x,(x*2)+':'+(y*2)],'ratio'),'Bahagi kedua-duanya dengan '+k+'.','Tahun 6 · Nisbah Wang'),id,'7.2.1',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['ratio','money']);}
 if(mode==='ratio_compare'){
  let a1,b1,a2,b2;do{a1=rand(1,5);b1=rand(2,8);a2=rand(1,5);b2=rand(2,8)}while(a1*(a2+b2)===a2*(a1+b1)||gcd(a1,b1)!==1||gcd(a2,b2)!==1);
  const [m1,m2]=choose([['sirap','air'],['oren','air'],['gula','tepung'],['cat merah','cat putih']]),ans=a1/(a1+b1)>a2/(a2+b2)?'Campuran A':'Campuran B';
  return mark(q(table(['Campuran',m1+' : '+m2],[['A',a1+' : '+b1],['B',a2+' : '+b2]])+'Campuran manakah yang mempunyai bahagian '+m1+' lebih besar?',ans,distinct(ans,['Campuran A','Campuran B','sama','tidak boleh dibanding'],'ratio'),'Banding '+a1+'/'+(a1+b1)+' dengan '+a2+'/'+(a2+b2)+'.','Tahun 6 · Membanding Nisbah'),id,'7.2.1',mode,'verbal','reasoning',s,['ratio','compare']);
 }
 if(mode==='ratio_error'){const add=rand(1,4),name=who();return mark(q(name+' berkata '+(x*2)+' : '+(y*2)+' setara dengan '+(x*2+add)+' : '+(y*2+add)+' kerana kedua-duanya ditambah '+add+'. Adakah '+name+' betul?','salah',[Nq('betul','ratio'),Nq('betul jika nombor genap','ratio'),Nq('tidak boleh dinilai','ratio')],'Nisbah setara perlu didarab atau dibahagi dengan nombor yang sama.','Tahun 6 · Analisis Nisbah Setara'),id,'7.2.1',mode,'verbal','reasoning',s,['ratio','error_analysis']);}
 const [p1,p2]=who(2),item=choose(['guli','pelekat','setem','kad']),tot=(x+y)*k,ans=x*k;
 return mark(q('Nisbah bilangan '+item+' '+p1+' kepada bilangan '+item+' '+p2+' ialah '+x+' : '+y+'. Jumlah '+item+' mereka ialah '+tot+'. Berapakah bilangan '+item+' '+p1+'?',ans,distinct(ans,[y*k,k,tot-x],'ratio'),'Jumlah bahagian = '+(x+y)+'; satu bahagian = '+k+'.','Tahun 6 · Nisbah daripada Jumlah'),id,'7.2.1',mode,'story','reasoning',s,['ratio','partition']);
};

GEN['7.3.1']=function(id,s){
 const mode=chooseMode(id,'7.3.1',bandModes(
  s,
  ['direct','table'],
  ['direct','table','recipe','unit_rate','missing'],
  ['recipe','unit_rate','missing','compare_rates','proportion_error','reverse']
 ));
 const n1=rand(2,8),f=rand(2,6),per=choose([2,3,4,5,6,7,8,12,15,25]);
 if(mode==='direct'){let x,y;do{x=rand(1,6);y=rand(1,6)}while(x===y||gcd(x,y)!==1);const [c1,c2]=choose([['tin cat merah','tin cat biru'],['murid lelaki','murid perempuan'],['biji epal','biji oren'],['kerusi','meja']]),ans=y*f;return mark(q('Nisbah bilangan '+c1+' kepada bilangan '+c2+' ialah '+x+' : '+y+'. Jika terdapat '+(x*f)+' '+c1+', berapakah bilangan '+c2+'?',ans,distinct(ans,[x*f+y-x,x*y*f,y+f],'proportion'),'Faktor = '+(x*f)+' ÷ '+x+' = '+f+'.','Tahun 6 · Kadaran'),id,'7.3.1',mode,'symbolic','application',s,['proportion']);}
 if(mode==='table'){const a=rand(2,7),b=rand(2,9),ans=b*f;return mark(q(table(['A','B'],[[a,b],[a*f,'?']])+'Lengkapkan jadual kadaran.',ans,distinct(ans,[b+a*f-a,a*f,b*(f+1)],'proportion'),a+' → '+(a*f)+' ialah × '+f+'.','Tahun 6 · Jadual Kadaran'),id,'7.3.1',mode,'table',stage(s)===3?'reasoning':'application',s,['proportion','table']);}
 if(mode==='recipe'){const ppl=rand(2,6),g=per*ppl*10,want=ppl*f,ans=g*f,item=choose(['tepung','gula','beras','mentega']);return mark(q(table(['Bilangan orang',item[0].toUpperCase()+item.slice(1)],[[String(ppl),g+' g'],[String(want),'?']])+'Berapakah jisim '+item+', dalam g, untuk '+want+' orang?',ans,distinct(ans,[g+want-ppl,g*want,ans/2],'proportion'),g+' ÷ '+ppl+' = '+(g/ppl)+' g seorang.','Tahun 6 · Kadaran Resipi'),id,'7.3.1',mode,'story',stage(s)===3?'reasoning':'application',s,['proportion','context']);}
 if(mode==='unit_rate'){const each=choose([1.5,2,2.5,3,4]),n2=n1+rand(2,8),ans=String(Number((each*n2).toFixed(2)));return mark(q(table(['Bilangan botol','Isi padu air'],[[String(n1),String(Number((each*n1).toFixed(2)))+' ℓ'],[String(n2),'?']])+'Berapakah isi padu air, dalam ℓ, untuk mengisi '+n2+' botol yang sama?',ans+' ℓ',distinct(ans+' ℓ',[String(Number((each*n1+n2-n1).toFixed(2)))+' ℓ',String(Number((each*n1*n2).toFixed(2)))+' ℓ',String(Number((each*(n2+1)).toFixed(2)))+' ℓ'],'proportion'),'Cari isi padu sebotol dahulu: '+each+' ℓ.','Tahun 6 · Kadar Unit'),id,'7.3.1',mode,'story',stage(s)===3?'reasoning':'application',s,['proportion','unit_rate']);}
 if(mode==='missing'){const item=choose(['buku','pen','bekas pensel','buah epal']),n2=n1*f,cost=per*n1,have=per*n2;return mark(q(table(['Bilangan '+item,'Harga'],[[String(n1),'RM'+cost],['?','RM'+have]])+'Berapakah bilangan '+item+' yang boleh dibeli dengan RM'+have+'?',n2,distinct(n2,[n2-1,n2+2,have-cost],'proportion'),'Harga seunit = RM'+per+'.','Tahun 6 · Nilai Hilang Kadaran'),id,'7.3.1',mode,'story',stage(s)===3?'reasoning':'application',s,['proportion','inverse']);}
 if(mode==='compare_rates'){
  let pa,na,pb,nb;do{na=rand(3,8);nb=rand(5,12);pa=na*rand(2,6)*0.5;pb=nb*rand(2,6)*0.5}while(pa/na===pb/nb||nb===na);
  const ans=pa/na<pb/nb?'Pakej A':'Pakej B',item=choose(['botol air','tin minuman','buku latihan','batang pensel']);
  return mark(q(table(['Pakej','Bilangan '+item,'Harga'],[['A',String(na),'RM'+pa.toFixed(2)],['B',String(nb),'RM'+pb.toFixed(2)]])+'Pakej manakah lebih murah bagi setiap '+item+'?',ans,distinct(ans,['Pakej A','Pakej B','sama','tidak boleh dibanding'],'proportion'),'A = RM'+(pa/na).toFixed(2)+' seunit; B = RM'+(pb/nb).toFixed(2)+' seunit.','Tahun 6 · Membanding Kadar'),id,'7.3.1',mode,'story','reasoning',s,['proportion','compare']);
 }
 if(mode==='proportion_error'){const m=rand(2,5),price=per*m,mult=rand(2,3),name=who(),wrong=price+m*(mult-1),ans='salah, '+(m*mult)+' m berharga RM'+(price*mult);return mark(q(name+' berkata jika '+m+' m kain berharga RM'+price+', maka '+(m*mult)+' m kain berharga RM'+wrong+'. Adakah '+name+' betul?',ans,distinct(ans,['betul','salah, RM'+(price*mult+per),'salah, RM'+(price+mult)],'proportion'),'Panjang '+mult+' kali ganda, harga juga '+mult+' kali ganda.','Tahun 6 · Analisis Kadaran'),id,'7.3.1',mode,'verbal','reasoning',s,['proportion','error_analysis']);}
 const t1=rand(2,6)*5,made=rand(2,8),mult=rand(2,4),item=choose(['bekas','kotak','beg kertas','cawan kertas']);
 return mark(q(table(['Masa','Bilangan '+item],[[t1+' minit',String(made)],[(t1*mult)+' minit','?']])+'Sebuah mesin membuat '+item+' pada kadar yang sama. Berapakah bilangan '+item+' dalam '+(t1*mult)+' minit?',made*mult,distinct(made*mult,[made+t1*(mult-1),made*mult+made,made*t1],'proportion'),'Masa '+mult+' kali ganda, bilangan juga '+mult+' kali ganda.','Tahun 6 · Kadaran Songsang kepada Kuantiti'),id,'7.3.1',mode,'story','reasoning',s,['proportion','inverse']);
};

GEN['7.4.1']=function(id,s){
 const mode=chooseMode(id,'7.4.1',bandModes(
  s,
  ['route_problem','ratio_problem','proportion_problem'],
  ['route_problem','ratio_problem','proportion_problem','map_budget','recipe_route'],
  ['map_budget','recipe_route','compare_plans','multi_constraint','claim','reverse_problem']
 ));
 if(mode==='route_problem'){const u1=rand(2,7),u2=rand(2,7),sc=choose([2,3,5,10]),ans=(u1+u2)*sc;return mark(q(table(['Perjalanan','Jarak pada satah Cartes'],[['A ke B',u1+' unit'],['B ke C',u2+' unit']])+'Satu unit mewakili '+sc+' km. Berapakah jumlah jarak, dalam km, dari A ke C melalui B?',ans+' km',distinct(ans+' km',[(u1+u2)+' km',(u1*u2*sc)+' km',(ans+sc)+' km'],'route'),'('+u1+' + '+u2+') × '+sc+'.','Tahun 6 · Masalah Koordinat Berskala'),id,'7.4.1',mode,'story','application',s,['coord','scale']);}
 if(mode==='ratio_problem'){let x,y;do{x=rand(1,5);y=rand(2,7)}while(x===y||gcd(x,y)!==1);const k=rand(2,6),tot=(x+y)*k,[a,b]=choose([['jus','air'],['susu','air'],['simen','pasir'],['cat merah','cat putih']]);return mark(q('Nisbah '+a+' kepada '+b+' dalam satu campuran ialah '+x+' : '+y+'. Jumlah campuran itu ialah '+tot+' ℓ. Berapakah isi padu '+a+', dalam ℓ?',(x*k)+' ℓ',distinct((x*k)+' ℓ',[(y*k)+' ℓ',k+' ℓ',(tot-x)+' ℓ'],'ratio'),'Jumlah bahagian = '+(x+y)+'; satu bahagian = '+k+' ℓ.','Tahun 6 · Masalah Nisbah'),id,'7.4.1',mode,'story','application',s,['ratio','partition']);}
 const per=choose([3,4,5,6,8,12]),n1=rand(2,6),n2=n1+rand(2,8);
 if(mode==='proportion_problem'){const item=choose(['keping tiket','buah buku','kotak susu','beg tepung']);return mark(q(table(['Bilangan '+item,'Harga'],[[String(n1),'RM'+per*n1],[String(n2),'?']])+'Berapakah harga '+n2+' '+item+'?','RM'+per*n2,distinct('RM'+per*n2,['RM'+(per*n1+n2-n1),'RM'+per*n1*n2,'RM'+per*(n2+1)],'proportion'),'RM'+per+' setiap satu; '+n2+' × RM'+per+'.','Tahun 6 · Masalah Kadaran'),id,'7.4.1',mode,'story','application',s,['proportion']);}
 if(mode==='map_budget'){const cm=rand(3,12),sc=choose([2,3,4,5]),cost=choose([1,2,3]),km=cm*sc,ans=km*cost;return mark(q(table(['Butiran','Nilai'],[['Jarak pada peta',cm+' cm'],['Skala','1 cm mewakili '+sc+' km'],['Kos perjalanan','RM'+cost+' setiap km']])+'Berapakah jumlah kos perjalanan itu?','RM'+ans,distinct('RM'+ans,['RM'+km,'RM'+cm*cost,'RM'+(ans+cost*sc)],'scale'),'Jarak sebenar = '+km+' km; kos = '+km+' × RM'+cost+'.','Tahun 6 · Skala dan Kos'),id,'7.4.1',mode,'story',stage(s)===3?'reasoning':'application',s,['scale','multi_step']);}
 if(mode==='recipe_route'){const d=choose([2,3,4,5]),b=rand(1,4),k=rand(2,6),ans=b*k;return mark(q(table(['Jarak','Botol air'],[[d+' km',String(b)],[(d*k)+' km','?']])+'Berapakah bilangan botol air yang perlu dibawa untuk '+(d*k)+' km?',ans,distinct(ans,[b+d*k-d,d*k,ans+b],'proportion'),(d*k)+' ÷ '+d+' = '+k+' kumpulan; '+k+' × '+b+' botol.','Tahun 6 · Kadaran dalam Perjalanan'),id,'7.4.1',mode,'story',stage(s)===3?'reasoning':'application',s,['proportion','route']);}
 if(mode==='compare_plans'){let da,db,ca,cb;do{da=rand(10,30);db=da-rand(2,6);ca=choose([1.5,2,2.5]);cb=ca+choose([0.5,1])}while(da*ca===db*cb);const A=da*ca,B=db*cb,ans=A<B?'Pelan A, RM'+A.toFixed(2):'Pelan B, RM'+B.toFixed(2);return mark(q(table(['Pelan','Jarak','Kos setiap km'],[['A',da+' km','RM'+ca.toFixed(2)],['B',db+' km','RM'+cb.toFixed(2)]])+'Pelan manakah lebih murah?',ans,distinct(ans,[A<B?'Pelan B, RM'+B.toFixed(2):'Pelan A, RM'+A.toFixed(2),'kedua-duanya sama','Pelan B kerana jaraknya lebih pendek'],'decision'),'Kira jumlah kos, bukan jarak sahaja.','Tahun 6 · Membanding Pelan Perjalanan'),id,'7.4.1',mode,'table','reasoning',s,['route','decision']);}
 if(mode==='multi_constraint'){let x,y;do{x=rand(1,4);y=rand(2,5)}while(x===y||gcd(x,y)!==1);const part=rand(2,5),red=x*part,cap=choose([2,4,5]).toString(),tot=(x+y)*part,fullBox=Math.floor(tot/Number(cap));return mark(q('Cat merah dan cat biru dicampurkan dengan nisbah '+x+' : '+y+'. Terdapat '+red+' ℓ cat merah. Setiap bekas memuatkan '+cap+' ℓ cat campuran. Berapakah bilangan maksimum bekas yang dapat diisi penuh?',fullBox+' bekas',distinct(fullBox+' bekas',[Math.floor(red/Number(cap))+' bekas',(fullBox+1)+' bekas',tot+' bekas'],'ratio'),'Jumlah campuran = '+tot+' ℓ; '+tot+' ÷ '+cap+'.','Tahun 6 · Masalah Nisbah Pelbagai Langkah'),id,'7.4.1',mode,'story','reasoning',s,['ratio','multi_step']);}
 if(mode==='claim'){const k=choose([1,2,5]),ratio=k*100000,name=who(),said=choose([k*10,k*100]),ans='salah, 1 cm = '+k+' km';return mark(q(name+' berkata skala 1 : '+ratio.toLocaleString('en-US')+' bermaksud 1 cm pada peta mewakili '+said+' km. Adakah '+name+' betul?',ans,distinct(ans,['betul','salah, 1 cm = '+(k*10)+' km','salah, 1 cm = '+(k*100)+' m'],'scale'),ratio.toLocaleString('en-US')+' cm = '+k+' km.','Tahun 6 · Menilai Skala'),id,'7.4.1',mode,'verbal','reasoning',s,['scale','error_analysis']);}
 const sc=choose([2,3,4,5,8]),cm=rand(3,10),km=cm*sc;
 return mark(q('Jalan sepanjang '+km+' km diwakili oleh garis '+cm+' cm pada sebuah peta. Apakah skala peta itu?','1 cm mewakili '+sc+' km',distinct('1 cm mewakili '+sc+' km',['1 cm mewakili '+cm+' km','1 cm mewakili '+km+' km','1 cm mewakili '+(sc+1)+' km','1 cm mewakili '+(sc*2)+' km'],'scale'),km+' ÷ '+cm+' = '+sc+' km bagi setiap cm.','Tahun 6 · Masalah Skala Songsang'),id,'7.4.1',mode,'story','reasoning',s,['scale','inverse']);
};

document.documentElement?.setAttribute('data-y6-v2-unit7','3.61.0');
})();
