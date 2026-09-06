// Pahlawan Angka — KSSR Year 4 curriculum hardening v3.58.0
// Final D4 content wrapper. Loaded after kssr-assessment-depth-v3.22.0.js.
(function(){
'use strict';
const banks=window.PAQuestionBanks||{},prior=banks.d4;if(typeof prior!=='function')return;
const V='3.58.0',choose=a=>pick(a),rand=(a,b)=>R(a,b);
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b]}return a||1};
const frac=(n,d)=>{const g=gcd(n,d);n/=g;d/=g;if(n>=d){const w=Math.floor(n/d),r=n%d;return r?`${w} ${r}/${d}`:String(w)}return `${n}/${d}`};
const rm=n=>moneyFmtUpper(Number(Number(n).toFixed(2)));
const mark=(q,id,competency,archetype,representation='symbolic',demand='procedure',context='general')=>{
 q.source='kssr-year4-v3.58.0';q.competencyId=competency;q.archetypeId=archetype;q.representation=representation;q.demand=demand;q.contextId=context;q.familyKey=id;
 return q;
};
const wrong=(ans,step=1,tag='operation')=>[N(ans+step,tag),N(Math.max(0,ans-step),tag),N(ans+step*2,tag)];
const hundredGrid=pct=>{let s='';for(let i=0;i<100;i++)s+=`<span style="width:9px;height:9px;border:1px solid #9aa8c3;background:${i<pct?'#ffd36d':'#f3f6fb'};box-sizing:border-box"></span>`;return `<div role="img" aria-label="${pct} daripada 100 petak berlorek" style="width:90px;display:grid;grid-template-columns:repeat(10,9px);margin:2px auto 10px">${s}</div>`};
const angleSvg=t=>{const r=t==='sudut tegak'?['M50 58 L50 18','M50 58 L88 58']:t==='sudut tirus'?['M50 58 L50 18','M50 58 L82 34']:['M50 58 L50 18','M50 58 L16 78'];return `<svg viewBox="0 0 100 100" width="110" height="110" role="img" aria-label="Rajah sudut" style="display:block;margin:0 auto 8px"><path d="${r[0]}" stroke="#405072" stroke-width="5" fill="none"/><path d="${r[1]}" stroke="#405072" stroke-width="5" fill="none"/></svg>`};
const lineSvg=parallel=>parallel?'<svg viewBox="0 0 160 90" width="170" role="img" aria-label="Dua garis selari" style="display:block;margin:0 auto 8px"><line x1="20" y1="30" x2="140" y2="30" stroke="#405072" stroke-width="5"/><line x1="20" y1="60" x2="140" y2="60" stroke="#405072" stroke-width="5"/></svg>':'<svg viewBox="0 0 160 90" width="170" role="img" aria-label="Dua garis serenjang" style="display:block;margin:0 auto 8px"><line x1="20" y1="45" x2="140" y2="45" stroke="#405072" stroke-width="5"/><line x1="80" y1="10" x2="80" y2="80" stroke="#405072" stroke-width="5"/></svg>';

function fractionQ(id){
 const mode=choose(['improper','mixed','add3','subtract','combined','quantity']),d=choose([2,3,4,5,6,8,10]);
 if(mode==='improper'){const w=rand(1,4),n=rand(1,d-1),im=w*d+n;return mark(Q(`Tukar <b>${im}/${d}</b> kepada nombor bercampur.`,`${w} ${n}/${d}`,[N(`${w+1} ${n}/${d}`,'fraction'),N(`${w} ${d}/${n}`,'fraction'),N(`${im-d}/${d}`,'fraction')],'Bahagi pengangka dengan penyebut; baki menjadi pengangka.','Tahun 4 · Pecahan Tak Wajar',true,true),id,'2.1.1','improper_to_mixed') }
 if(mode==='mixed'){const w=rand(1,4),n=rand(1,d-1),im=w*d+n;return mark(Q(`Tukar <b>${w} ${n}/${d}</b> kepada pecahan tak wajar.`,`${im}/${d}`,[N(`${w+n}/${d}`,'fraction'),N(`${w*d-n}/${d}`,'fraction'),N(`${im}/${d+1}`,'fraction')],'Darab nombor bulat dengan penyebut, kemudian tambah pengangka.','Tahun 4 · Nombor Bercampur',true,true),id,'2.1.1','mixed_to_improper') }
 if(mode==='quantity'){const n=rand(1,d-1),qty=d*rand(3,12),ans=qty*n/d;return mark(Q(`<b>${n}/${d}</b> daripada ${qty} ialah?`,ans,[N(qty/d,'fraction'),N(qty*n,'operation'),N(qty-n,'operation')],'Bahagi kuantiti mengikut penyebut, kemudian darab pengangka.','Tahun 4 · Pecahan daripada Kuantiti',true,true),id,'2.1.5','fraction_quantity','symbolic','application') }
 const a=rand(1,d-1),b=rand(1,d-1),c=rand(1,d-1);
 if(mode==='add3'){return mark(Q(`${a}/${d} + ${b}/${d} + ${c}/${d} = ?`,frac(a+b+c,d),[N(frac(a+b,d),'fraction'),N(frac(a+b+c,d+1),'fraction'),N(frac(a*b*c,d),'fraction')],'Penyebut sama: tambah pengangka, kemudian ringkaskan.','Tahun 4 · Tambah Pecahan',true,true),id,'2.1.2','fraction_add_three','symbolic','application') }
 if(mode==='subtract'){const hi=Math.max(a,b),lo=Math.min(a,b);return mark(Q(`${hi}/${d} − ${lo}/${d} = ?`,frac(hi-lo,d),[N(frac(hi+lo,d),'operation'),N(frac(hi-lo,d+1),'fraction'),N(frac(Math.max(1,hi-lo+1),d),'fraction')],'Penyebut sama: tolak pengangka.','Tahun 4 · Tolak Pecahan',true,true),id,'2.1.3','fraction_subtract') }
 let total=a+b-c;if(total<=0)return fractionQ(id);return mark(Q(`${a}/${d} + ${b}/${d} − ${c}/${d} = ?`,frac(total,d),[N(frac(a+b+c,d),'operation'),N(frac(total,d+1),'fraction'),N(frac(Math.max(1,total-1),d),'fraction')],'Tambah dan tolak mengikut urutan.','Tahun 4 · Operasi Bergabung Pecahan',true,true),id,'2.1.4','fraction_combined','symbolic','application');
}
function decimalQ(id){
 const mode=choose(['add3','subtract2','multiply','divide']);
 if(mode==='multiply'){const a=rand(1,9999)/1000,b=choose([2,3,4,5,6,7,8,9,10,100,1000]),ans=tidyNumber(a*b,3);return mark(Q(`${a.toFixed(3)} × ${b} = ?`,String(ans),[N(String(tidyNumber(ans+.1,3)),'decimal'),N(String(tidyNumber(ans+.01,3)),'decimal'),N(String(tidyNumber(a+b,3)),'operation')],'Darab nilai perpuluhan dan semak kedudukan titik.','Tahun 4 · Darab Perpuluhan',true,true),id,'2.2.3','decimal_multiply') }
 if(mode==='divide'){const b=choose([2,4,5,10,100,1000]),ans=rand(1,500)/100,a=tidyNumber(ans*b,3);return mark(Q(`${a} ÷ ${b} = ?`,String(tidyNumber(ans,3)),[N(String(tidyNumber(ans+.1,3)),'decimal'),N(String(tidyNumber(ans*10,3)),'decimal'),N(String(tidyNumber(a-b,3)),'operation')],'Bahagi dan semak kedudukan titik perpuluhan.','Tahun 4 · Bahagi Perpuluhan',true,true),id,'2.2.4','decimal_divide') }
 let a=rand(100,9000)/1000,b=rand(10,2500)/1000,c=rand(10,1200)/1000;
 if(mode==='subtract2'){if(a<b+c)a=b+c+rand(100,1000)/1000;const ans=tidyNumber(a-b-c,3);return mark(Q(`${a.toFixed(3)} − ${b.toFixed(3)} − ${c.toFixed(3)} = ?`,ans.toFixed(3),[N((ans+.1).toFixed(3),'decimal'),N((ans+.01).toFixed(3),'decimal'),N(Math.max(0,ans-.01).toFixed(3),'decimal')],'Selarikan titik perpuluhan dan tolak satu demi satu.','Tahun 4 · Tolak Perpuluhan',true,true),id,'2.2.2','decimal_subtract_two','symbolic','application') }
 const ans=tidyNumber(a+b+c,3);return mark(Q(`${a.toFixed(3)} + ${b.toFixed(3)} + ${c.toFixed(3)} = ?`,ans.toFixed(3),[N((ans+.1).toFixed(3),'decimal'),N((ans+.01).toFixed(3),'decimal'),N(Math.max(0,ans-.01).toFixed(3),'decimal')],'Selarikan titik perpuluhan dan tambah hingga tiga nilai.','Tahun 4 · Tambah Perpuluhan',true,true),id,'2.2.1','decimal_add_three','symbolic','application');
}
function percentQ(id){
 const pairs=[[1,10,10],[1,5,20],[1,4,25],[3,10,30],[2,5,40],[1,2,50],[3,5,60],[3,4,75],[4,5,80],[9,10,90]],p=choose(pairs),n=p[0],d=p[1],pct=p[2],mode=choose(['f2p','p2f','grid','quantity','story']);
 if(mode==='f2p')return mark(Q(`Tukarkan <b>${n}/${d}</b> kepada peratus.`,`${pct}%`,[N(`${Math.max(0,pct-10)}%`,'percent'),N(`${Math.min(100,pct+10)}%`,'percent'),N(`${n*d}%`,'percent')],'Cari pecahan setara daripada 100.','Tahun 4 · Pecahan kepada Peratus',true,true),id,'2.3.1','fraction_to_percent','symbolic','concept','percent');
 if(mode==='p2f')return mark(Q(`Tukarkan <b>${pct}%</b> kepada pecahan termudah.`,frac(pct,100),[N(`${pct}/10`,'fraction'),N(`100/${pct}`,'fraction'),N(frac(Math.max(1,pct-10),100),'fraction')],'Peratus bermaksud per seratus; ringkaskan pecahan.','Tahun 4 · Peratus kepada Pecahan',true,true),id,'2.3.1','percent_to_fraction','symbolic','concept','percent');
 if(mode==='grid'){const g=choose([10,20,30,40,50,60,70,80,90]);return mark(Q(`${hundredGrid(g)}Berapakah peratus petak yang berlorek?`,`${g}%`,[N(`${100-g}%`,'percent'),N(`${g/10}%`,'percent'),N(String(g),'percent')],'Daripada 100 petak, bilangan petak berlorek terus menunjukkan peratus.','Tahun 4 · Petak Seratus',true,true),id,'2.3.1','hundred_grid_percent','visual','concept','percent') }
 const qty=d*choose([4,6,8,10,12,20]),part=qty*n/d;
 if(mode==='quantity')return mark(Q(`<b>${pct}%</b> daripada ${qty} objek ialah?`,part,[N(qty-part,'percent'),N(pct,'percent'),N(qty/d,'fraction')],'Tukar peratus kepada pecahan yang setara, kemudian cari bahagiannya.','Tahun 4 · Peratus daripada Kuantiti',true,true),id,'2.3.2','percent_of_quantity','symbolic','application','percent');
 return mark(Q(`Dalam sebuah bakul ada ${qty} biji buah. <b>${pct}%</b> daripadanya ialah epal. Berapa biji epal?`,part,[N(qty-part,'percent'),N(qty/d,'fraction'),N(pct,'percent')],'Cari nilai peratus daripada jumlah buah.','Tahun 4 · Masalah Peratus',true,true),id,'2.4.1','percent_story','story','application','daily');
}
function moneyQ4(id){
 const mode=choose(['add3','sub2','mul','div','combined','record']);
 if(mode==='add3'){const a=rand(1000,40000)/100,b=rand(500,25000)/100,c=rand(500,20000)/100,ans=a+b+c;return mark(Q(`${rm(a)} + ${rm(b)} + ${rm(c)} = ?`,rm(ans),[N(rm(ans+10),'money'),N(rm(Math.abs(a-b)),'operation'),N(rm(a+b),'money')],'Tambah hingga tiga nilai wang.','Tahun 4 · Tambah Wang',true,true),id,'3.1.1','money_add_three') }
 if(mode==='sub2'){const a=rand(30000,90000)/100,b=rand(3000,20000)/100,c=rand(1000,10000)/100,ans=a-b-c;if(ans<0)return moneyQ4(id);return mark(Q(`${rm(a)} − ${rm(b)} − ${rm(c)} = ?`,rm(ans),[N(rm(a-b),'money'),N(rm(a+b+c),'operation'),N(rm(ans+10),'money')],'Tolak dua nilai wang daripada satu nilai.','Tahun 4 · Tolak Wang',true,true),id,'3.1.2','money_subtract_two') }
 if(mode==='mul'){const q=rand(2,20),u=rand(200,3000)/100,ans=u*q;return mark(Q(`${rm(u)} × ${q} = ?`,rm(ans),[N(rm(u+q),'operation'),N(rm(ans+u),'money'),N(rm(u),'money')],'Darab nilai wang dengan nombor hingga dua digit.','Tahun 4 · Darab Wang',true,true),id,'3.1.3','money_multiply') }
 if(mode==='div'){const d=choose([2,4,5,10,20,25]),each=rand(200,3000)/100,total=each*d;return mark(Q(`${rm(total)} ÷ ${d} = ?`,rm(each),[N(rm(total-d),'operation'),N(rm(each+1),'money'),N(rm(total),'money')],'Bahagi nilai wang kepada kumpulan sama banyak.','Tahun 4 · Bahagi Wang',true,true),id,'3.1.4','money_divide') }
 if(mode==='combined'){const a=rand(10000,50000)/100,b=rand(2000,15000)/100,c=rand(1000,10000)/100,ans=a+b-c;return mark(Q(`${rm(a)} + ${rm(b)} − ${rm(c)} = ?`,rm(ans),[N(rm(a+b+c),'operation'),N(rm(a+b),'money'),N(rm(ans+10),'money')],'Selesaikan operasi bergabung tambah dan tolak.','Tahun 4 · Operasi Bergabung Wang',true,true),id,'3.2.1','money_combined','symbolic','application','money') }
 const income=choose([50,60,80,100]),save=choose([10,15,20]),spend=choose([20,25,30,40]),left=income-save-spend;return mark(Q(`Wang diterima RM${income}, simpan RM${save}, belanja RM${spend}. Berapa baki yang belum diperuntukkan?`,rm(left),[N(rm(income-spend),'money'),N(rm(save+spend),'operation'),N(rm(income),'money')],'Bezakan wang diterima, disimpan dan dibelanjakan.','Tahun 4 · Simpanan dan Perbelanjaan',true,true),id,'3.3','money_record','story','reasoning','money');
}
function timeQ(id){
 const mode=choose(['clock24','duration','estimate','relationship','operation']);
 if(mode==='clock24'){const h=rand(13,23),m=choose([0,15,30,45]);return mark(Q(`Pukul ${h-12}:${String(m).padStart(2,'0')} petang dalam sistem 24 jam ialah?`,`${h}:${String(m).padStart(2,'0')}`,[N(`${h-12}:${String(m).padStart(2,'0')}`,'time'),N(`${h}:00`,'time'),N(`${h+1}:${String(m).padStart(2,'0')}`,'time')],'Selepas 12 tengah hari, tambah 12 pada jam.','Tahun 4 · Sistem 24 Jam',true,true),id,'4.1.1','time_24h') }
 if(mode==='duration'){const st=rand(7,18)*60+choose([0,15,30,45]),dur=choose([35,45,60,75,90,120]),en=st+dur,fmt=x=>`${Math.floor(x/60)}:${String(x%60).padStart(2,'0')}`;return mark(Q(`Aktiviti bermula ${fmt(st)} dan tamat ${fmt(en)}. Berapakah tempohnya?`,`${dur} minit`,[N(`${dur+15} minit`,'time'),N(`${Math.max(15,dur-15)} minit`,'time'),N(`${en} minit`,'time')],'Cari beza antara masa tamat dengan masa mula.','Tahun 4 · Tempoh Masa',true,true),id,'4.2.1','time_duration','story','application') }
 if(mode==='estimate')return mark(Q('Anggaran munasabah untuk satu sesi perhimpunan sekolah ialah?',choose(['25 minit','30 minit']),[N('2 minit','time'),N('5 jam','time'),N('24 jam','time')],'Gunakan pengalaman masa harian untuk membuat anggaran.','Tahun 4 · Anggaran Masa',true,true),id,'4.3.1','time_estimate','story','reasoning');
 if(mode==='relationship'){const x=choose([['1 dekad',10],['1 abad',100],['1 alaf',1000],['2 abad',200]]);return mark(Q(`<b>${x[0]}</b> = ? tahun`,x[1],wrong(x[1],10,'time'),'Gunakan hubungan alaf, abad, dekad dan tahun.','Tahun 4 · Perkaitan Masa',true,true),id,'4.4.1','time_relationship') }
 const a=rand(2,6),b=rand(1,4),c=rand(1,3),ans=a+b-c;return mark(Q(`${a} hari + ${b} hari − ${c} hari = ? hari`,ans,wrong(ans,1,'time'),'Samakan unit sebelum tambah atau tolak.','Tahun 4 · Operasi Masa',true,true),id,'4.5.1','time_operation','symbolic','application');
}
function measureQ(id){
 const mode=choose(['mm_cm','km_m','length_op','mass','liquid']);
 if(mode==='mm_cm'){const cm=rand(2,90),mm=cm*10;return mark(Q(`${mm} mm = ? cm`,cm,[N(mm,'unit'),N(cm*10,'unit'),N(Math.max(1,cm-1),'unit')],'10 mm = 1 cm.','Tahun 4 · Milimeter dan Sentimeter',true,true),id,'5.1.2-5.1.3','mm_cm') }
 if(mode==='km_m'){const km=rand(1,9),m=km*1000;return mark(Q(`${km} km = ? m`,m,[N(km*100,'unit'),N(km,'unit'),N(m+100,'unit')],'1 km = 1000 m.','Tahun 4 · Meter dan Kilometer',true,true),id,'5.1.2-5.1.3','km_m') }
 if(mode==='length_op'){const a=rand(100,500),b=rand(50,300),c=rand(20,100),ans=a+b+c;return mark(Q(`${a} mm + ${b} mm + ${c} mm = ? mm`,ans,wrong(ans,10,'unit'),'Pastikan semua unit sama sebelum mengira.','Tahun 4 · Operasi Panjang',true,true),id,'5.1.6-5.1.9','length_operation','symbolic','application') }
 if(mode==='mass'){const kg=rand(1,9),g=kg*1000;return mark(Q(`${kg} kg = ? g`,g,[N(kg*100,'unit'),N(kg,'unit'),N(g+100,'unit')],'1 kg = 1000 g.','Tahun 4 · Jisim',true,true),id,'5.2','mass_convert') }
 const L=rand(1,9),ml=L*1000;return mark(Q(`${L} L = ? mL`,ml,[N(L*100,'unit'),N(L,'unit'),N(ml+100,'unit')],'1 L = 1000 mL.','Tahun 4 · Isi Padu Cecair',true,true),id,'5.3','liquid_convert');
}
function spaceQ(id){
 const mode=choose(['angle','lines','perimeter','area','volume','story']);
 if(mode==='angle'){const t=choose(['sudut tegak','sudut tirus','sudut cakah']);return mark(Q(`${angleSvg(t)}Apakah jenis sudut yang ditunjukkan?`,t,['sudut tegak','sudut tirus','sudut cakah'].filter(x=>x!==t).concat(['garis selari']).slice(0,3).map(x=>N(x,'shape')),'Banding bukaan sudut dengan sudut tegak.','Tahun 4 · Sudut',true,true),id,'6.1.1','angle_type','visual','concept','space') }
 if(mode==='lines'){const p=Math.random()<.5,ans=p?'garis selari':'garis serenjang';return mark(Q(`${lineSvg(p)}Hubungan dua garis ini ialah?`,ans,[N(p?'garis serenjang':'garis selari','shape'),N('garis melengkung','shape'),N('tiada hubungan','shape')],'Garis selari tidak bertemu; garis serenjang membentuk sudut tegak.','Tahun 4 · Garis',true,true),id,'6.2.1','line_relationship','visual','concept','space') }
 if(mode==='perimeter'){const sides=choose([5,6,7,8]),side=rand(2,9),ans=sides*side;return mark(Q(`Poligon sekata mempunyai ${sides} sisi, setiap sisi ${side} cm. Perimeter?`,`${ans} cm`,[N(`${side*side} cm`,'area'),N(`${sides+side} cm`,'operation'),N(`${ans+side} cm`,'shape')],'Perimeter ialah jumlah semua sisi.','Tahun 4 · Perimeter Poligon',true,true),id,'6.3.1','polygon_perimeter') }
 if(mode==='area'){const b=choose([4,6,8,10,12]),h=choose([2,4,6,8]),ans=b*h/2;return mark(Q(`Segi tiga bersudut tegak mempunyai tapak ${b} cm dan tinggi ${h} cm. Luas?`,`${ans} cm²`,[N(`${b*h} cm²`,'area'),N(`${b+h} cm²`,'operation'),N(`${2*(b+h)} cm²`,'area')],'Luas segi tiga = 1/2 × tapak × tinggi.','Tahun 4 · Luas',true,true),id,'6.3.2','triangle_area') }
 if(mode==='volume'){const l=rand(2,8),w=rand(2,6),h=rand(2,5),ans=l*w*h;return mark(Q(`Kuboid berukuran ${l} cm × ${w} cm × ${h} cm. Isi padu?`,`${ans} cm³`,[N(`${l*w} cm³`,'area'),N(`${2*(l+w+h)} cm³`,'area'),N(`${ans+h} cm³`,'area')],'Isi padu kuboid = panjang × lebar × tinggi.','Tahun 4 · Isi Padu Pepejal',true,true),id,'6.4.1','cuboid_volume') }
 const l=rand(5,12),w=rand(3,9),ans=2*(l+w);return mark(Q(`Aina mahu memasang reben mengelilingi kad ${l} cm × ${w} cm. Berapa reben minimum diperlukan?`,`${ans} cm`,[N(`${l*w} cm`,'area'),N(`${l+w} cm`,'operation'),N(`${ans+w} cm`,'shape')],'“Mengelilingi” meminta perimeter.','Tahun 4 · Masalah Ruang',true,true),id,'6.5.1','space_story','story','application','space');
}
function dataQ(id){
 const labels=['Isnin','Selasa','Rabu','Khamis'],vals=labels.map(()=>rand(5,25)),mode=choose(['read','difference','total','construct']);
 if(mode==='construct'){const i=rand(0,3);return mark(Q(`Jika jadual menunjukkan ${labels[i]} = ${vals[i]}, palang ${labels[i]} pada carta berskala 1 unit perlu mencapai nilai berapa?`,vals[i],[N(vals[(i+1)%4],'data'),N(vals[i]+2,'data'),N(Math.max(0,vals[i]-2),'data')],'Ketinggian palang mesti sama dengan nilai data.','Tahun 4 · Membina Carta Palang',true,true),id,'8.1.1','construct_bar','verbal','application','data') }
 const vis=barChart(labels,vals);
 if(mode==='read'){const i=rand(0,3);return mark(Q(`${vis}Berapakah nilai bagi <b>${labels[i]}</b>?`,vals[i],[N(vals[(i+1)%4],'data'),N(vals[i]+2,'data'),N(Math.max(0,vals[i]-2),'data')],'Baca label dan skala carta.','Tahun 4 · Tafsir Carta',true,true),id,'8.1.2','read_bar','visual','concept','data') }
 if(mode==='difference'){const hi=Math.max(...vals),lo=Math.min(...vals),ans=hi-lo;return mark(Q(`${vis}Berapakah beza nilai tertinggi dengan nilai terendah?`,ans,[N(hi,'data'),N(lo,'data'),N(hi+lo,'operation')],'Kenal pasti nilai tertinggi dan terendah, kemudian tolak.','Tahun 4 · Tafsir Data',true,true),id,'8.1.2','data_difference','visual','application','data') }
 const ans=vals.reduce((a,b)=>a+b,0);return mark(Q(`${vis}Berapakah jumlah semua data?`,ans,[N(Math.max(...vals),'data'),N(ans-vals[0],'operation'),N(ans+5,'data')],'Tambah semua nilai pada carta.','Tahun 4 · Tafsir Data',true,true),id,'8.1.2','data_total','visual','application','data');
}
banks.d4=function(id,s,shift){
 let q=null;
 if(id==='D4.FRAC')q=fractionQ(id);
 else if(id==='D4.DEC')q=decimalQ(id);
 else if(id==='D4.PERCENT')q=percentQ(id);
 else if(id==='D4.MONEY')q=moneyQ4(id);
 else if(id==='D4.TIME')q=timeQ(id);
 else if(id==='D4.MEASURE')q=measureQ(id);
 else if(id==='D4.PERIM')q=spaceQ(id);
 else if(id==='D4.DATA')q=dataQ(id);
 return q||prior(id,s,shift);
};
window.PAKSSRYear4={version:V};
document.documentElement?.setAttribute('data-kssr-year4',V);
})();