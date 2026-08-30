// Pahlawan Angka v3.18.1 — curriculum/content integrity guard.
// Loaded after all question/engine/parent code so it can enforce skill contracts
// without rewriting the existing question banks.
(function(){
  'use strict';
  const banks=window.PAQuestionBanks||{};
  const previous={};
  ['d1','d2t1','d2t2','d2t3','d2t4','d2t5','d2t6','d2t7','d2t8','d3','d4','d5','d6'].forEach(k=>previous[k]=banks[k]);

  const cleanText=x=>String(x??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  const igcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=b;b=a%b;a=t}return a||1};
  const frac=(n,d)=>{const g=igcd(n,d);return `${n/g}/${d/g}`};
  const uniqueInts=(count,min,max)=>{const out=[];while(out.length<count){const n=R(min,max);if(!out.includes(n))out.push(n)}return out};
  const moneyUpper=n=>typeof moneyFmtUpper==='function'?moneyFmtUpper(n):`RM${Number(n).toFixed(2).replace(/\.00$/,'')}`;
  const sessionRef=()=>{try{return typeof sess!=='undefined'?sess:(window.sess||null)}catch(_){return window.sess||null}};
  const recentModes=id=>((sessionRef()?.questionHistory)||[]).filter(x=>x.skillId===id).slice(-6).map(x=>String(x.archetypeId||'').replace(/^integrity_/,''));
  function rotate(id,modes){
    const recent=recentModes(id),last=recent.at(-1),pool=modes.filter(x=>x!==last),counts=Object.fromEntries(modes.map(x=>[x,recent.filter(y=>y===x).length]));
    return (pool.length?pool:modes).sort((a,b)=>counts[a]-counts[b]||Math.random()-.5)[0];
  }
  function mark(q,id,mode,rep='symbolic',demand='procedure',targets=[]){
    if(!q)return q;
    q.familyKey=id;
    q.competencyId=mode;
    q.archetypeId=`integrity_${mode}`;
    q.representation=rep;
    q.demand=demand;
    q.contextId=`comp:${mode}`;
    q.difficultyBand=demand==='reasoning'?4:demand==='application'?3:demand==='procedure'?2:1;
    q.misconceptionTargets=targets.length?targets:[q.wrong?.[0]?.tag||'generated'];
    return q;
  }

  // ---------- D1: keep the first number work genuinely introductory ----------
  function d1Repair(id,s,shift){
    if(id==='D1.N20'){
      const max=Number(s?.evidence||0)<3?9:20,mode=rotate(id,['number_compare','number_order','number_missing']),vals=uniqueInts(4,1,max);
      if(mode==='number_compare'){
        const ask=Math.random()<.5?'paling besar':'paling kecil',ans=ask==='paling besar'?Math.max(...vals):Math.min(...vals);
        return mark(Q(`Pilih nombor yang <b>${ask}</b>.<br><b>${vals.join(', ')}</b>`,ans,vals.filter(x=>x!==ans).slice(0,3).map(x=>N(x,'compare')),'Banding nilai nombor satu demi satu.','Tahun 1 · Nombor',true,shift),id,mode,'symbolic','concept',['compare']);
      }
      if(mode==='number_order'){
        const a=vals[0],b=vals[1],lo=Math.min(a,b),hi=Math.max(a,b);
        return mark(Q(`Susun daripada kecil kepada besar.<br><b>${a}, ${b}</b>`,`${lo}, ${hi}`,[N(`${hi}, ${lo}`,'compare'),N(`${a}, ${a}`,'compare'),N(`${b}, ${b}`,'compare')],'Nombor kecil ditulis dahulu.','Tahun 1 · Susun Nombor',true,true),id,mode,'verbal','concept',['compare']);
      }
      const a=R(1,Math.max(2,max-2)),ans=a+1;
      return mark(Q(`<b>${a}, ___, ${a+2}</b><br>Nombor yang hilang ialah?`,ans,[N(a,'pattern'),N(a+2,'pattern'),N(Math.min(max,a+3),'pattern')],'Kira satu-satu mengikut urutan.','Tahun 1 · Urutan Nombor',true,true),id,mode,'symbolic','procedure',['pattern']);
    }
    if(id==='D1.ADD20'){
      const a=R(1,15),b=R(1,20-a),ans=a+b;
      return mark(Q(`${a} + ${b} = ?`,ans,addDistractors(a,b,ans),'Gabungkan kedua-dua kumpulan. Jawapan tidak melebihi 20.','Tahun 1 · Tambah hingga 20',true,shift),id,'add_within20','symbolic','procedure',['operation']);
    }
    if(id==='D1.SUB20'){
      const a=R(2,20),b=R(1,a),ans=a-b;
      return mark(Q(`${a} − ${b} = ?`,ans,[N(ans+1,'same_end'),N(Math.max(0,ans-1),'place'),N(a+b,'operation')],'Mula dengan jumlah yang ada, kemudian keluarkan.','Tahun 1 · Tolak hingga 20',true,shift),id,'sub_within20','symbolic','procedure',['operation']);
    }
    return null;
  }

  // ---------- D2: restore the actual skill-specific KSSR competency ----------
  function d2Estimate(id){
    const real=R(23,87),ans=Math.round(real/10)*10,mode=rotate(id,['estimate_quantity','estimate_reasonable']);
    const visual=typeof dotsEstimateVisual==='function'?dotsEstimateVisual(real):'';
    if(mode==='estimate_quantity')return mark(Q(`${visual}Anggarkan bilangan objek. Pilih nilai yang paling hampir.`,ans,[N(ans-20,'estimate'),N(ans+20,'estimate'),N(ans+(ans<50?30:-30),'estimate')],'Anggaran ialah nilai hampir; lihat keseluruhan kumpulan, bukan kira tepat.','Tahun 2 · Menganggar',true,true),id,mode,'visual','concept',['estimate']);
    const choices=[ans,ans+40,Math.max(10,ans-40),real+17];
    return mark(Q(`Satu bekas kelihatan mempunyai kira-kira <b>${real}</b> manik. Anggaran puluh manakah paling munasabah?`,ans,choices.filter(x=>x!==ans).slice(0,3).map(x=>N(x,'estimate')),'Pilih nombor bulat yang paling dekat dengan kuantiti sebenar.','Tahun 2 · Anggaran Munasabah',true,true),id,mode,'story','application',['estimate']);
  }
  function d2Operation(id,s,shift){
    if(id==='D2.2.1'){
      const three=rotate(id,['add_two','add_three'])==='add_three';let a=R(100,650),b=R(20,250),c=three?R(10,100):0;while(a+b+c>1000){a=R(100,550);b=R(20,220);c=three?R(10,90):0}const ans=a+b+c;
      return mark(Q(`${a} + ${b}${three?` + ${c}`:''} = ?`,ans,addDistractors(a,b+c,ans),'Tambah mengikut nilai tempat. Jika 10 sa, tukar kepada 1 puluh.','Tahun 2 · Tambah hingga 1000',true,shift),id,three?'add_three':'add_two','symbolic','procedure',['place','operation']);
    }
    if(id==='D2.2.2'){
      const multi=rotate(id,['sub_one','sub_two'])==='sub_two';let a=R(300,999),b=R(20,Math.min(400,a-20)),c=multi?R(10,Math.min(180,Math.max(10,a-b))):0;if(a-b-c<0)return d2Operation(id,s,shift);const ans=a-b-c;
      return mark(Q(`${a} − ${b}${multi?` − ${c}`:''} = ?`,ans,[N(ans+10,'same_end'),N(a+b+c,'operation'),N(Math.max(0,a-b+c),'operation')],'Tolak satu nilai pada satu masa dan semak nilai tempat.','Tahun 2 · Tolak hingga 1000',true,shift),id,multi?'sub_two':'sub_one','symbolic','procedure',['place','operation']);
    }
    if(id==='D2.2.3'){
      const mode=rotate(id,['mul_groups','mul_fact','mul10']);
      if(mode==='mul10'){const a=R(1,9),ans=a*10;return mark(Q(`${a} × 10 = ?`,ans,[N(a,'operation'),N(a+10,'fact'),N(ans+10,'fact')],'Darab dengan 10 membentuk kumpulan puluh.','Tahun 2 · Darab dengan 10',true,true),id,mode,'symbolic','procedure',['fact']);}
      const a=R(2,9),b=R(2,9),ans=a*b;
      if(mode==='mul_groups')return mark(Q(`Ada <b>${a}</b> kumpulan dengan <b>${b}</b> objek setiap kumpulan. Berapakah jumlah objek?`,ans,[N(a+b,'operation'),N(ans+a,'fact'),N(Math.max(1,ans-b),'fact')],'Kumpulan sama banyak boleh ditambah berulang atau didarab.','Tahun 2 · Kumpulan Darab',true,true),id,mode,'story','concept',['fact','operation']);
      return mark(Q(`${a} × ${b} = ?`,ans,[N(a+b,'operation'),N(ans+a,'fact'),N(Math.max(1,ans-b),'fact')],'Gunakan fakta asas darab.','Tahun 2 · Fakta Darab',true,shift),id,mode,'symbolic','procedure',['fact']);
    }
    if(id==='D2.2.4'){
      const mode=rotate(id,['div_exact','div_remainder','div10']);
      if(mode==='div10'){
        const total=R(2,9)*10+pick([0,0,R(1,9)]),q=Math.floor(total/10),rem=total%10,ans=rem?`${q} baki ${rem}`:q;
        return mark(Q(`${total} ÷ 10 = ?`,ans,rem?[N(q,'division'),N(`${q+1} baki ${rem}`,'division'),N(`${q} baki ${Math.max(0,rem-1)}`,'division')]:[N(10,'division'),N(Math.max(1,q-1),'division'),N(q+1,'division')],'Bentuk kumpulan 10. Yang tinggal ialah baki.','Tahun 2 · Bahagi dengan 10',true,true),id,mode,'symbolic','procedure',['division']);
      }
      const divisor=R(2,9),q=R(2,9);
      if(mode==='div_remainder'){
        const rem=R(1,divisor-1),total=divisor*q+rem,ans=`${q} baki ${rem}`;
        return mark(Q(`${total} objek dibahagi kepada kumpulan <b>${divisor}</b>. Berapa kumpulan penuh dan baki?`,ans,[N(q,'division'),N(`${q+1} baki ${rem}`,'division'),N(`${q} baki ${Math.max(0,rem-1)}`,'division')],'Cari kumpulan penuh dahulu; objek yang tidak cukup satu kumpulan menjadi baki.','Tahun 2 · Bahagi Berbaki',true,true),id,mode,'story','application',['division']);
      }
      const total=divisor*q;
      return mark(Q(`${total} ÷ ${divisor} = ?`,q,[N(divisor,'operation'),N(q+1,'division'),N(Math.max(1,q-1),'division')],'Gunakan hubungan songsang darab dan bahagi.','Tahun 2 · Bahagi Tepat',true,shift),id,mode,'symbolic','procedure',['division','fact']);
    }
    if(id==='D2.2.5'){
      const mode=rotate(id,['problem_add','problem_sub','problem_mul','problem_div']);
      if(mode==='problem_add'){const a=R(80,450),b=R(20,350),ans=a+b;return mark(Q(`Hana ada ${a} pelekat. Ibunya memberi ${b} lagi. Berapakah jumlah pelekat?`,ans,addDistractors(a,b,ans),'“Memberi lagi” menambah jumlah.','Tahun 2 · Masalah Tambah',true,true),id,mode,'story','application',['operation']);}
      if(mode==='problem_sub'){const a=R(120,800),b=R(20,a-10),ans=a-b;return mark(Q(`Ali ada ${a} kad dan memberi ${b} kepada rakannya. Berapa kad yang tinggal?`,ans,[N(a+b,'operation'),N(b,'operation'),N(ans+10,'same_end')],'“Tinggal” selepas memberi memerlukan tolak.','Tahun 2 · Masalah Tolak',true,true),id,mode,'story','application',['operation']);}
      if(mode==='problem_mul'){const g=R(2,10),each=R(2,10),ans=g*each;return mark(Q(`Terdapat ${g} kotak. Setiap kotak mempunyai ${each} pensel. Berapakah jumlah pensel?`,ans,[N(g+each,'operation'),N(ans+g,'fact'),N(Math.max(1,ans-each),'fact')],'Kumpulan sama banyak menggunakan darab.','Tahun 2 · Masalah Darab',true,true),id,mode,'story','application',['operation','fact']);}
      const g=pick([2,4,5,10]),each=R(2,10),total=g*each;return mark(Q(`${total} gula-gula dibahagi sama rata kepada ${g} murid. Berapa setiap murid dapat?`,each,[N(g,'operation'),N(each+1,'division'),N(Math.max(1,each-1),'division')],'Bahagi jumlah kepada kumpulan sama rata.','Tahun 2 · Masalah Bahagi',true,true),id,mode,'story','application',['operation','division']);
    }
    return null;
  }
  function d2Money(id,s,shift){
    if(!/^D2\.4\.[1-7]$/.test(id)||typeof moneyQ!=='function')return null;
    const q=moneyQ(id,shift,s),mode={
      'D2.4.1':'money_value','D2.4.2':'money_add','D2.4.3':'money_sub','D2.4.4':'money_mul','D2.4.5':'money_div','D2.4.6':'money_saving','D2.4.7':'money_problem'
    }[id];
    return mark(q,id,mode,/svg|moneyVisual|moneyModel/i.test(String(q.prompt))?'visual':'story',id==='D2.4.1'?'concept':'application',['money','operation']);
  }
  function d2Time(id,s,shift){
    if(id==='D2.5.1'){
      const h=R(1,12),m=pick([0,5,10,15,20,25,30,35,40,45,50,55]),ans=`${h}:${String(m).padStart(2,'0')}`;
      return mark(Q(`${clockSvg(h,m)}Apakah waktu yang ditunjukkan oleh jam?`,ans,[N(`${h}:${String((m+5)%60).padStart(2,'0')}`,'time'),N(`${(h%12)+1}:${String(m).padStart(2,'0')}`,'time'),N(`${h}:${String((m+10)%60).padStart(2,'0')}`,'time')],'Jarum pendek menunjukkan jam; jarum panjang menunjukkan minit.','Tahun 2 · Baca Jam',true,true),id,'read_clock','visual','concept',['time']);
    }
    if(id==='D2.5.2'){
      const rel=rotate(id,['hour_minute','day_hour','week_day']);
      if(rel==='hour_minute'){const h=R(1,4),ans=h*60;return mark(Q(`${h} jam = ? minit`,ans,[N(h*30,'time'),N(h*24,'time'),N(ans+60,'time')],'1 jam = 60 minit.','Tahun 2 · Jam dan Minit',true,true),id,rel,'symbolic','procedure',['time']);}
      if(rel==='day_hour'){const d=R(1,4),ans=d*24;return mark(Q(`${d} hari = ? jam`,ans,[N(d*12,'time'),N(d*60,'time'),N(ans+24,'time')],'1 hari = 24 jam.','Tahun 2 · Hari dan Jam',true,true),id,rel,'symbolic','procedure',['time']);}
      const w=R(1,4),ans=w*7;return mark(Q(`${w} minggu = ? hari`,ans,[N(w*5,'time'),N(w*10,'time'),N(ans+7,'time')],'1 minggu = 7 hari.','Tahun 2 · Minggu dan Hari',true,true),id,rel,'symbolic','procedure',['time']);
    }
    if(id==='D2.5.3'){
      const startH=R(7,15),startM=pick([0,15,30,45]),dur=pick([15,30,45,60,90,120]),total=startH*60+startM+dur,endH=Math.floor(total/60),endM=total%60,ans=`${endH}:${String(endM).padStart(2,'0')}`;
      return mark(Q(`${timelineSvg(startH,startM,endH,endM,{showEnd:false})}Aktiviti bermula ${startH}:${String(startM).padStart(2,'0')} dan berlangsung ${dur} minit. Bilakah tamat?`,ans,[N(`${startH}:${String(startM).padStart(2,'0')}`,'time'),N(`${endH}:${String((endM+15)%60).padStart(2,'0')}`,'time'),N(`${Math.max(1,endH-1)}:${String(endM).padStart(2,'0')}`,'time')],'Gerakkan masa ke hadapan mengikut tempoh.','Tahun 2 · Masalah Masa',true,true),id,'elapsed_time','visual','application',['time']);
    }
    return null;
  }
  function d2Measure(id,s,shift){
    if(!['D2.6.1','D2.6.2','D2.6.3','D2.6.4'].includes(id))return null;
    if(id==='D2.6.1'){
      const mode=rotate(id,['read_ruler','unit_length','compare_length']);
      if(mode==='read_ruler'){const cm=R(2,19);return mark(Q(`${rulerSvg(cm)}Berapakah panjang garisan merah?`,`${cm} cm`,[N(`${cm+1} cm`,'unit'),N(`${Math.max(1,cm-1)} cm`,'unit'),N(`${cm} m`,'unit')],'Mula pada 0 dan baca hujung garisan.','Tahun 2 · Panjang',true,true),id,mode,'visual','concept',['unit']);}
      if(mode==='unit_length'){const item=pick([['pensel','cm'],['meja','cm'],['bilik darjah','m'],['koridor','m']]);return mark(Q(`Unit sesuai untuk mengukur ${item[0]}?`,item[1],[N(item[1]==='cm'?'m':'cm','unit'),N('kg','unit'),N('mL','unit')],'Objek pendek biasanya cm; jarak panjang biasanya m.','Tahun 2 · Unit Panjang',true,true),id,mode,'story','concept',['unit']);}
      const a=R(3,18),b=R(3,18);if(a===b)return d2Measure(id,s,shift);return mark(Q(`Pita A ${a} cm dan Pita B ${b} cm. Yang manakah lebih panjang?`,a>b?'A':'B',[N(a>b?'B':'A','compare'),N('Sama','compare'),N('Tidak tahu','generated')],'Banding nilai dalam unit yang sama.','Tahun 2 · Banding Panjang',true,true),id,mode,'story','application',['unit']);
    }
    if(id==='D2.6.2'){
      const mode=rotate(id,['read_scale','unit_mass','compare_mass']);
      if(mode==='read_scale'){const g=pick([100,200,300,400,500,600,700,800,900]);return mark(Q(`${scaleSvg(g)}Jarum penimbang menunjukkan berapa gram?`,`${g} g`,[N(`${Math.max(0,g-100)} g`,'unit'),N(`${Math.min(1000,g+100)} g`,'unit'),N(`${g} kg`,'unit')],'Baca senggatan pada skala dalam gram.','Tahun 2 · Jisim',true,true),id,mode,'visual','concept',['unit']);}
      if(mode==='unit_mass'){const item=pick([['pemadam','g'],['epal','g'],['beg beras','kg'],['beg sekolah','kg']]);return mark(Q(`Unit sesuai untuk jisim ${item[0]}?`,item[1],[N(item[1]==='g'?'kg':'g','unit'),N('cm','unit'),N('L','unit')],'Benda ringan biasanya g; benda lebih berat biasanya kg.','Tahun 2 · Unit Jisim',true,true),id,mode,'story','concept',['unit']);}
      const a=pick([100,200,300,400,500,600,700,800,900]),b=pick([100,200,300,400,500,600,700,800,900]);if(a===b)return d2Measure(id,s,shift);return mark(Q(`Bungkusan A ${a} g dan B ${b} g. Yang manakah lebih berat?`,a>b?'A':'B',[N(a>b?'B':'A','compare'),N('Sama','compare'),N('Tidak tahu','generated')],'Banding nilai dalam gram.','Tahun 2 · Banding Jisim',true,true),id,mode,'story','application',['unit']);
    }
    if(id==='D2.6.3'){
      const mode=rotate(id,['read_jug','unit_volume','compare_volume']);
      if(mode==='read_jug'){const ml=pick([100,200,300,400,500,600,700,800,900]);return mark(Q(`${cylinderSvg(ml)}Berapakah isi padu air?`,`${ml} mL`,[N(`${Math.max(0,ml-100)} mL`,'unit'),N(`${Math.min(1000,ml+100)} mL`,'unit'),N(`${ml} L`,'unit')],'Baca paras air pada senggatan silinder penyukat.','Tahun 2 · Isi Padu Cecair',true,true),id,mode,'visual','concept',['unit']);}
      if(mode==='unit_volume'){const item=pick([['ubat dalam sudu','mL'],['kotak jus kecil','mL'],['baldi air','L'],['botol air besar','L']]);return mark(Q(`Unit sesuai untuk isi padu ${item[0]}?`,item[1],[N(item[1]==='mL'?'L':'mL','unit'),N('kg','unit'),N('cm','unit')],'Jumlah kecil biasanya mL; bekas besar biasanya L.','Tahun 2 · Unit Cecair',true,true),id,mode,'story','concept',['unit']);}
      const a=pick([100,200,300,400,500,600,700,800,900]),b=pick([100,200,300,400,500,600,700,800,900]);if(a===b)return d2Measure(id,s,shift);return mark(Q(`Bekas A ${a} mL dan Bekas B ${b} mL. Yang manakah lebih banyak air?`,a>b?'A':'B',[N(a>b?'B':'A','compare'),N('Sama','compare'),N('Tidak tahu','generated')],'Banding nilai mL.','Tahun 2 · Banding Isi Padu',true,true),id,mode,'story','application',['unit']);
    }
    const domain=pick(['length','mass','volume']),op=Math.random()<.5?'add':'sub',unit=domain==='length'?'cm':domain==='mass'?'g':'mL',noun=domain==='length'?'pita':domain==='mass'?'bungkusan':'air';let a=R(30,120),b=R(10,Math.min(70,a));const ans=op==='add'?a+b:a-b;
    return mark(Q(`${noun} mempunyai ${a} ${unit}. ${op==='add'?`${b} ${unit} lagi ditambah`:`${b} ${unit} digunakan`}. Berapakah ${op==='add'?'jumlah':'baki'}?`,`${ans} ${unit}`,[N(`${op==='add'?a-b:a+b} ${unit}`,'operation'),N(`${a} ${unit}`,'unit'),N(`${ans} ${unit==='g'?'mL':'g'}`,'unit')],'Pilih operasi yang sesuai dan kekalkan unit.','Tahun 2 · Masalah Ukuran',true,true),id,'measure_problem','story','application',['unit','operation']);
  }
  function d2Data(id){
    const cats=shuffle(['Epal','Oren','Mangga','Pisang']);
    if(id==='D2.8.1'){
      const vals=uniqueInts(3,2,9),labels=cats.slice(0,3),idx=R(0,2),ans=vals[idx];
      return mark(Q(`${tallyTable(labels,vals)}Berdasarkan jadual gundalan, berapakah bilangan ${labels[idx]}?`,ans,[N(Math.max(1,ans-1),'data'),N(ans+1,'data'),N(vals[(idx+1)%3],'data')],'Setiap tanda gundalan mewakili satu item.','Tahun 2 · Gundalan',true,true),id,'tally_data','visual','concept',['data']);
    }
    if(id==='D2.8.2'){
      const vals=uniqueInts(4,2,10),idx=R(0,3),mode=rotate(id,['bar_read','bar_compare']);
      if(mode==='bar_read')return mark(Q(`${barChart(cats,vals)}Berapakah nilai bagi ${cats[idx]}?`,vals[idx],[N(vals[(idx+1)%4],'data'),N(vals[idx]+2,'data'),N(Math.max(0,vals[idx]-2),'data')],'Cari label kemudian baca tinggi palang.','Tahun 2 · Carta Palang',true,true),id,mode,'visual','concept',['data']);
      const mx=Math.max(...vals),ans=cats[vals.indexOf(mx)];return mark(Q(`${barChart(cats,vals)}Buah manakah paling banyak?`,ans,cats.filter(x=>x!==ans).slice(0,3).map(x=>N(x,'data')),'Cari palang tertinggi.','Tahun 2 · Tafsir Carta',true,true),id,mode,'visual','concept',['data']);
    }
    if(id==='D2.8.3'){
      const vals=uniqueInts(4,2,10),i=R(0,3),j=(i+1)%4,mode=rotate(id,['data_difference','data_sum','data_two_step']);
      if(mode==='data_difference'){const ans=Math.abs(vals[i]-vals[j]);return mark(Q(`${barChart(cats,vals)}Berapakah beza ${cats[i]} dan ${cats[j]}?`,ans,[N(vals[i]+vals[j],'operation'),N(Math.max(vals[i],vals[j]),'data'),N(ans+1,'data')],'Baca dua nilai, kemudian tolak nilai kecil daripada nilai besar.','Tahun 2 · Beza Data',true,true),id,mode,'visual','application',['data','operation']);}
      if(mode==='data_sum'){const ans=vals[i]+vals[j];return mark(Q(`${barChart(cats,vals)}Berapakah jumlah ${cats[i]} dan ${cats[j]}?`,ans,[N(Math.abs(vals[i]-vals[j]),'data'),N(Math.max(vals[i],vals[j]),'data'),N(ans+1,'data')],'Baca dua nilai dan tambah.','Tahun 2 · Jumlah Data',true,true),id,mode,'visual','application',['data','operation']);}
      const mx=Math.max(...vals),mn=Math.min(...vals),ans=mx-mn;return mark(Q(`${barChart(cats,vals)}Cari nilai paling banyak dan paling sedikit. Berapakah beza kedua-duanya?`,ans,[N(mx,'data'),N(mn,'data'),N(ans+2,'data')],'Cari palang tertinggi dan terendah, kemudian tolak.','Tahun 2 · Data 2 Langkah',true,true),id,mode,'visual','reasoning',['data','operation']);
    }
    return null;
  }
  function d2Repair(id,s,shift){
    if(id==='D2.1.5')return d2Estimate(id);
    const op=d2Operation(id,s,shift);if(op)return op;
    const money=d2Money(id,s,shift);if(money)return money;
    const time=d2Time(id,s,shift);if(time)return time;
    const measure=d2Measure(id,s,shift);if(measure)return measure;
    const data=d2Data(id);if(data)return data;
    return null;
  }

  // ---------- D3/D4 ----------
  function d3Repair(id,s,shift){
    if(id==='D3.SHAPE'){
      const mode=rotate(id,['shape_property','perimeter_rect','perimeter_missing']);
      if(mode==='shape_property'){
        const cfg=pick([['segi tiga',3,'triangle'],['segi empat sama',4,'square'],['segi empat tepat',4,'rectangle']]);
        return mark(Q(`${shapeSvg(cfg[2])}Berapakah bilangan sisi lurus bentuk ini?`,cfg[1],[N(Math.max(0,cfg[1]-1),'shape'),N(cfg[1]+1,'shape'),N(0,'shape')],'Kira sisi lurus pada bentuk.','Tahun 3 · Ciri Bentuk',true,true),id,mode,'visual','concept',['shape']);
      }
      const l=R(3,10),w=R(2,8),p=2*(l+w);
      if(mode==='perimeter_rect')return mark(Q(`Segi empat tepat panjang ${l} cm dan lebar ${w} cm. Perimeternya?`,`${p} cm`,[N(`${l*w} cm`,'area'),N(`${l+w} cm`,'operation'),N(`${p+2} cm`,'shape')],'Perimeter ialah jumlah semua sisi.','Tahun 3 · Perimeter',true,true),id,mode,'story','procedure',['shape','operation']);
      return mark(Q(`Perimeter segi empat tepat ialah ${p} cm dan panjangnya ${l} cm. Lebarnya?`,`${w} cm`,[N(`${p-l} cm`,'operation'),N(`${p/2} cm`,'shape'),N(`${l+w} cm`,'operation')],'Separuh perimeter = panjang + lebar.','Tahun 3 · Sisi Hilang',true,true),id,mode,'story','reasoning',['shape','operation']);
    }
    return null;
  }
  function d4Repair(id,s,shift){
    if(id==='D4.FRAC'){
      const mode=rotate(id,['fraction_equivalent','fraction_add','fraction_missing']);const d=pick([4,5,6,8,10]),n=R(1,d-1);
      if(mode==='fraction_equivalent'){const k=pick([2,3]);return mark(Q(`Pecahan setara bagi ${n}/${d} ialah?`,`${n*k}/${d*k}`,[N(`${n}/${d*k}`,'fraction'),N(`${n*k}/${d}`,'fraction'),N(`${n+k}/${d+k}`,'fraction')],'Darab pengangka dan penyebut dengan faktor yang sama.','Tahun 4 · Pecahan Setara',true,true),id,mode,'symbolic','procedure',['fraction']);}
      if(mode==='fraction_missing'){const k=pick([2,3]);return mark(Q(`${n}/${d} = ___/${d*k}`,n*k,[N(n+k,'fraction'),N(d*k,'fraction'),N(n*k+k,'fraction')],'Cari faktor pada penyebut dan gunakan faktor yang sama pada pengangka.','Tahun 4 · Pecahan Hilang',true,true),id,mode,'symbolic','reasoning',['fraction']);}
      const m=R(1,d-n),num=n+m;return mark(Q(`${fractionVisual(n,d)}${n}/${d} + ${m}/${d} = ?`,`${num}/${d}`,[N(`${num}/${d+1}`,'fraction'),N(`${n*m}/${d}`,'fraction'),N(`${num}/${m}`,'fraction')],'Penyebut sama: tambah pengangka sahaja.','Tahun 4 · Tambah Pecahan',true,true),id,mode,'visual','application',['fraction','operation']);
    }
    if(id==='D4.PERIM'){
      const mode=rotate(id,['perimeter_calc','perimeter_missing','perimeter_story']),l=R(4,12),w=R(3,10),p=2*(l+w);
      if(mode==='perimeter_calc')return mark(Q(`Segi empat tepat panjang ${l} cm dan lebar ${w} cm. Perimeter?`,`${p} cm`,[N(`${l*w} cm`,'area'),N(`${l+w} cm`,'operation'),N(`${p+4} cm`,'shape')],'Perimeter = 2 × (panjang + lebar).','Tahun 4 · Perimeter',true,true),id,mode,'story','procedure',['area','operation']);
      if(mode==='perimeter_missing')return mark(Q(`Perimeter segi empat tepat ${p} cm. Panjang ${l} cm. Lebar?`,`${w} cm`,[N(`${p-l} cm`,'operation'),N(`${p/2} cm`,'shape'),N(`${l+w} cm`,'operation')],'Bahagi perimeter dengan 2, kemudian tolak panjang.','Tahun 4 · Sisi Hilang',true,true),id,mode,'story','reasoning',['area','operation']);
      return mark(Q(`Aina mahu memasang reben mengelilingi kad ${l} cm × ${w} cm. Berapa cm reben minimum diperlukan?`,`${p} cm`,[N(`${l*w} cm`,'area'),N(`${l+w} cm`,'operation'),N(`${p+w} cm`,'area')],'“Mengelilingi” meminta perimeter, bukan luas.','Tahun 4 · Masalah Perimeter',true,true),id,mode,'story','application',['area','operation']);
    }
    if(id==='D4.DATA'){
      const vals=uniqueInts(4,8,30),labels=['Isnin','Selasa','Rabu','Khamis'],mode=rotate(id,['data_read','data_difference','data_total']);const i=R(0,3),j=(i+1)%4;
      if(mode==='data_read')return mark(Q(`${barChart(labels,vals)}Berapakah nilai ${labels[i]}?`,vals[i],[N(vals[j],'data'),N(vals[i]+2,'data'),N(vals[i]-2,'data')],'Baca label dan skala carta.','Tahun 4 · Baca Data',true,true),id,mode,'visual','concept',['data']);
      if(mode==='data_difference'){const ans=Math.abs(vals[i]-vals[j]);return mark(Q(`${barChart(labels,vals)}Apakah beza ${labels[i]} dan ${labels[j]}?`,ans,[N(vals[i]+vals[j],'operation'),N(Math.max(vals[i],vals[j]),'data'),N(ans+2,'data')],'Baca dua nilai dan cari beza.','Tahun 4 · Tafsir Data',true,true),id,mode,'visual','application',['data','operation']);}
      const ans=vals.reduce((a,b)=>a+b,0);return mark(Q(`${barChart(labels,vals)}Berapakah jumlah semua data?`,ans,[N(Math.max(...vals),'data'),N(ans-vals[i],'operation'),N(ans+5,'data')],'Tambah semua nilai berdasarkan skala carta.','Tahun 4 · Jumlah Data',true,true),id,mode,'visual','application',['data','operation']);
    }
    return null;
  }

  // ---------- D5 ----------
  function d5Repair(id,s,shift){
    if(id==='D5.MUL'){
      const mode=rotate(id,['mul_multi_digit','mul_story']),a=R(20,99),b=R(11,25),ans=a*b;
      return mark(Q(mode==='mul_story'?`${a} kotak mengandungi ${b} item setiap satu. Berapakah jumlah item?`:`${a} × ${b} = ?`,ans,[N(a+b,'operation'),N(ans+b,'fact'),N(Math.round(ans/100)*100,'fact')],'Pecahkan darab mengikut nilai tempat.','Tahun 5 · Darab Pelbagai Digit',true,true),id,mode,mode==='mul_story'?'story':'symbolic',mode==='mul_story'?'application':'procedure',['fact','operation']);
    }
    if(id==='D5.DIV'){
      const mode=rotate(id,['div_multi_digit','div_story']),b=pick([12,15,20,25]),q=R(12,40),a=b*q;
      return mark(Q(mode==='div_story'?`${a} item dibahagi sama rata kepada ${b} kumpulan. Berapa setiap kumpulan?`:`${a} ÷ ${b} = ?`,q,[N(b,'operation'),N(q+5,'division'),N(Math.max(1,q-5),'division')],'Gunakan hubungan darab-bahagi atau pecahkan nilai.','Tahun 5 · Bahagi Pelbagai Digit',true,true),id,mode,mode==='div_story'?'story':'symbolic',mode==='div_story'?'application':'procedure',['division']);
    }
    if(id==='D5.OPS'){
      const mode=rotate(id,['combined_mul_first','combined_brackets','combined_missing']),a=R(1000,9000),b=R(100,900),c=R(2,9);
      if(mode==='combined_mul_first'){const ans=a+b*c;return mark(Q(`${a} + ${b} × ${c} = ?`,ans,[N((a+b)*c,'operation'),N(a+b+c,'operation'),N(a*b+c,'operation')],'Darab dahulu, kemudian tambah.','Tahun 5 · Operasi Bergabung',true,true),id,mode,'symbolic','reasoning',['operation']);}
      if(mode==='combined_brackets'){const ans=(a+b)*c;return mark(Q(`(${a} + ${b}) × ${c} = ?`,ans,[N(a+b*c,'operation'),N(a+b+c,'operation'),N((a-b)*c,'operation')],'Selesaikan operasi dalam kurungan dahulu.','Tahun 5 · Kurungan',true,true),id,mode,'symbolic','reasoning',['operation']);}
      const ans=a+b*c;return mark(Q(`${a} + ___ × ${c} = ${ans}. Nombor yang hilang?`,b,[N(b+c,'operation'),N(ans-a,'operation'),N(Math.floor((ans-a)/c)+c,'operation')],'Asingkan bahagian darab menggunakan operasi songsang.','Tahun 5 · Operasi Bergabung Hilang',true,true),id,mode,'symbolic','reasoning',['operation']);
    }
    if(id==='D5.FRAC'){
      const mode=rotate(id,['fraction_add','fraction_simplify','fraction_story']),d=pick([4,5,8,10]),a=R(1,d-1),b=R(1,d-a),num=a+b,ans=frac(num,d);
      if(mode==='fraction_simplify'){const k=pick([2,3,4]),n=R(1,Math.max(1,d-1));return mark(Q(`Ringkaskan ${n*k}/${d*k}.`,frac(n*k,d*k),[N(`${n}/${d*k}`,'fraction'),N(`${n*k}/${d}`,'fraction'),N(`${n+k}/${d+k}`,'fraction')],'Bahagi pengangka dan penyebut dengan faktor sepunya.','Tahun 5 · Ringkas Pecahan',true,true),id,mode,'symbolic','procedure',['fraction']);}
      if(mode==='fraction_story')return mark(Q(`Aina menggunakan ${a}/${d} m reben dan kemudian ${b}/${d} m lagi. Berapa meter digunakan semuanya?`,ans,[N(`${num}/${d+1}`,'fraction'),N(`${a*b}/${d}`,'fraction'),N(`${num}/${Math.max(1,d-1)}`,'fraction')],'Penyebut sama: tambah pengangka, kemudian ringkaskan.','Tahun 5 · Masalah Pecahan',true,true),id,mode,'story','application',['fraction','operation']);
      return mark(Q(`${a}/${d} + ${b}/${d} = ?`,ans,[N(`${num}/${d}`,'fraction'),N(`${a*b}/${d}`,'fraction'),N(`${num}/${d+1}`,'fraction')],'Tambah pengangka dan ringkaskan jawapan.','Tahun 5 · Operasi Pecahan',true,true),id,mode,'symbolic','procedure',['fraction','operation']);
    }
    if(id==='D5.DEC'){
      const mode=rotate(id,['decimal_fraction','decimal_place','decimal_add','decimal_sub']),a=R(120,850)/100,b=R(10,300)/100;
      if(mode==='decimal_fraction'){const pair=pick([[1,2,'0.5'],[1,4,'0.25'],[3,4,'0.75'],[1,5,'0.2'],[2,5,'0.4'],[3,5,'0.6']]);return mark(Q(`Perpuluhan bagi ${pair[0]}/${pair[1]} ialah?`,pair[2],[N((Number(pair[2])+.1).toFixed(2).replace(/0$/,''),'decimal'),N(String(Number(pair[2])*10),'decimal'),N(Math.max(0,Number(pair[2])-.1).toFixed(2).replace(/0$/,''),'decimal')],'Tukarkan pecahan kepada nilai perpuluhan yang sama.','Tahun 5 · Pecahan dan Perpuluhan',true,true),id,mode,'symbolic','concept',['decimal','fraction']);}
      if(mode==='decimal_place'){const n=`${R(1,9)}.${R(1,9)}${R(1,9)}`,digit=n.at(-1);return mark(Q(`Nilai digit ${digit} pada tempat perseratus dalam ${n}?`,`${digit}/100`,[N(`${digit}/10`,'place'),N(digit,'digit_value'),N(`${digit}/1000`,'place')],'Digit kedua selepas titik ialah perseratus.','Tahun 5 · Nilai Perpuluhan',true,true),id,mode,'symbolic','concept',['decimal','place']);}
      const subtract=mode==='decimal_sub';let x=a,y=b;if(subtract&&y>x)[x,y]=[y,x];const ans=subtract?x-y:x+y,sym=subtract?'−':'+';return mark(Q(`${x.toFixed(2)} ${sym} ${y.toFixed(2)} = ?`,ans.toFixed(2),[N((ans+.1).toFixed(2),'decimal'),N(Math.max(0,ans-.1).toFixed(2),'decimal'),N((ans+.01).toFixed(2),'decimal')],'Selarikan titik perpuluhan hingga perseratus.','Tahun 5 · Operasi Perpuluhan',true,true),id,mode,'symbolic','procedure',['decimal','operation']);
    }
    if(id==='D5.MONEY'){
      const mode=rotate(id,['money_discount','money_discount_value','money_budget']),price=pick([40,60,80,100,120]),disc=pick([10,20,25,50]),discount=tidyNumber(price*disc/100),after=tidyNumber(price-discount);
      if(mode==='money_discount')return mark(Q(`Harga RM${price}. Diskaun ${disc}%. Harga selepas diskaun?`,moneyUpper(after),[N(moneyUpper(discount),'percent'),N(moneyUpper(price+discount),'operation'),N(moneyUpper(after+10),'money')],'Cari nilai diskaun, kemudian tolak daripada harga asal.','Tahun 5 · Diskaun',true,true),id,mode,'story','application',['money','percent']);
      if(mode==='money_discount_value')return mark(Q(`Diskaun ${disc}% bagi barang RM${price} ialah berapa?`,moneyUpper(discount),[N(moneyUpper(after),'money'),N(moneyUpper(price+discount),'operation'),N(moneyUpper(disc),'percent')],'Nilai diskaun = peratus × harga asal.','Tahun 5 · Nilai Diskaun',true,true),id,mode,'story','application',['money','percent']);
      const budget=pick([150,200,250]),spend=pick([55,75,95]),ans=budget-spend;return mark(Q(`Bajet RM${budget}. Selepas membelanjakan RM${spend}, berapa baki?`,moneyUpper(ans),[N(moneyUpper(spend),'money'),N(moneyUpper(budget+spend),'operation'),N(moneyUpper(ans+10),'money')],'Baki = bajet − perbelanjaan.','Tahun 5 · Bajet',true,true),id,mode,'story','application',['money','operation']);
    }
    if(id==='D5.AREA'){
      const mode=rotate(id,['area_rect','area_missing','area_story']),l=R(6,14),w=R(4,10),area=l*w;
      if(mode==='area_rect')return mark(Q(`Segi empat tepat panjang ${l} cm dan lebar ${w} cm. Luas?`,`${area} cm²`,[N(`${2*(l+w)} cm²`,'area'),N(`${l+w} cm²`,'operation'),N(`${area+w} cm²`,'area')],'Luas = panjang × lebar.','Tahun 5 · Luas',true,true),id,mode,'story','procedure',['area']);
      if(mode==='area_missing')return mark(Q(`Luas segi empat tepat ${area} cm². Panjang ${l} cm. Lebar?`,`${w} cm`,[N(`${area-l} cm`,'area'),N(`${l+w} cm`,'operation'),N(`${area/l+1} cm`,'area')],'Lebar = luas ÷ panjang.','Tahun 5 · Sisi daripada Luas',true,true),id,mode,'story','reasoning',['area','operation']);
      return mark(Q(`Sebuah kad berukuran ${l} cm × ${w} cm. Berapakah kawasan permukaannya?`,`${area} cm²`,[N(`${2*(l+w)} cm²`,'area'),N(`${l+w} cm²`,'operation'),N(`${area+l} cm²`,'area')],'Kawasan permukaan 2D meminta luas.','Tahun 5 · Masalah Luas',true,true),id,mode,'story','application',['area']);
    }
    if(id==='D5.DATA'){
      const mode=rotate(id,['data_average','data_missing_average','data_compare_average']),vals=uniqueInts(3,20,40),sum=vals.reduce((a,b)=>a+b,0),avg=Math.round(sum/3);
      if(mode==='data_average')return mark(Q(`${barChart(['A','B','C'],vals)}Purata terdekat bagi tiga nilai?`,avg,[N(Math.max(...vals),'data'),N(sum,'operation'),N(Math.round(sum/2),'data')],'Purata = jumlah ÷ bilangan data.','Tahun 5 · Purata',true,true),id,mode,'visual','application',['data','operation']);
      if(mode==='data_missing_average'){const target=R(20,40),known1=R(20,40),known2=R(20,40),average=Math.round((known1+known2+target)/3),total=average*3,missing=total-known1-known2;return mark(Q(`Purata 3 nilai ialah ${average}. Dua nilai ialah ${known1} dan ${known2}. Nilai ketiga?`,missing,[N(average,'data'),N(total,'operation'),N(Math.max(0,missing+3),'data')],'Jumlah = purata × bilangan data; kemudian tolak nilai yang diketahui.','Tahun 5 · Nilai Hilang Purata',true,true),id,mode,'symbolic','reasoning',['data','operation']);}
      const vals2=uniqueInts(3,20,40),avg2=Math.round(vals2.reduce((a,b)=>a+b,0)/3);return mark(Q(`Set A mempunyai purata ${avg}; Set B mempunyai purata ${avg2}. Set manakah mempunyai purata lebih tinggi?`,avg>avg2?'A':avg2>avg?'B':'Sama',[N(avg>avg2?'B':'A','data'),N('Sama','data'),N('Tidak dapat ditentukan','data')],'Banding nilai purata kedua-dua set.','Tahun 5 · Banding Purata',true,true),id,mode,'story','concept',['data']);
    }
    if(id==='D5.RATIO')return ratioRepair(id,5);
    if(id==='D5.RATE')return rateRepair(id,5);
    return null;
  }

  // ---------- D6 ----------
  function ratioRepair(id,grade){
    const mode=rotate(id,['ratio_equivalent','ratio_missing','ratio_simplify']),baseA=R(1,4),baseB=R(2,6),g=igcd(baseA,baseB),a=baseA/g,b=baseB/g,k=R(2,5);
    if(mode==='ratio_equivalent')return mark(Q(`Nisbah setara bagi ${a}:${b} ialah?`,`${a*k}:${b*k}`,[N(`${a+k}:${b+k}`,'ratio'),N(`${b*k}:${a*k}`,'ratio'),N(`${a}:${b*k}`,'ratio')],'Darab kedua-dua bahagian dengan faktor yang sama.',`Tahun ${grade} · Nisbah Setara`,true,true),id,mode,'symbolic','procedure',['ratio']);
    if(mode==='ratio_missing')return mark(Q(`${a}:${b} = ${a*k}:___`,b*k,[N(b+k,'ratio'),N(a*k,'ratio'),N(b,'ratio')],'Gunakan faktor yang sama pada kedua-dua bahagian.',`Tahun ${grade} · Nisbah Hilang`,true,true),id,mode,'symbolic','reasoning',['ratio']);
    return mark(Q(`Ringkaskan nisbah ${a*k}:${b*k}.`,`${a}:${b}`,[N(`${b}:${a}`,'ratio'),N(`${a*k-k}:${b*k-k}`,'ratio'),N(`${a}:${b*k}`,'ratio')],'Bahagi kedua-dua bahagian dengan faktor sepunya terbesar.',`Tahun ${grade} · Ringkas Nisbah`,true,true),id,mode,'symbolic','procedure',['ratio']);
  }
  function rateRepair(id,grade){
    const mode=rotate(id,['rate_unit','rate_scale','rate_missing']),packs=R(2,5),each=pick([2,3,4,5]),total=packs*each;
    if(mode==='rate_unit')return mark(Q(`${total} botol disusun sama rata dalam ${packs} kotak. Berapa botol satu kotak?`,each,[N(packs,'division'),N(total+packs,'operation'),N(each+1,'division')],'Cari nilai bagi satu unit.',`Tahun ${grade} · Kadar Unit`,true,true),id,mode,'story','concept',['ratio','division']);
    const k=R(2,4),ans=total*k;if(mode==='rate_scale')return mark(Q(`${packs} kotak mengandungi ${total} botol. Pada kadar sama, ${packs*k} kotak ada berapa botol?`,ans,[N(total+k,'ratio'),N(packs*k,'division'),N(ans-packs,'operation')],'Skalakan kedua-dua kuantiti dengan faktor sama.',`Tahun ${grade} · Kadaran`,true,true),id,mode,'story','application',['ratio']);
    return mark(Q(`${packs} kotak mengandungi ${total} botol. Jika ada ${total*k} botol pada kadar sama, berapa kotak diperlukan?`,packs*k,[N(packs+k,'ratio'),N(total*k,'division'),N(packs,'ratio')],'Cari faktor perubahan pada jumlah botol dan gunakan pada bilangan kotak.',`Tahun ${grade} · Kadaran Hilang`,true,true),id,mode,'story','reasoning',['ratio','division']);
  }
  function d6Repair(id,s,shift){
    if(id==='D6.NUMBERS'){
      const mode=rotate(id,['large_sequence','large_compare','large_round']),a=R(100000,900000),step=pick([25,50,100,250,500]);
      if(mode==='large_sequence'){const ans=a+step*3;return mark(Q(`${a}, ${a+step}, ${a+step*2}, ?`,ans,[N(ans-step,'pattern'),N(ans+step,'pattern'),N(a+3,'pattern')],'Cari beza yang tetap antara nombor besar.','Tahun 6 · Urutan Nombor',true,shift),id,mode,'symbolic','reasoning',['pattern']);}
      if(mode==='large_compare'){const b=R(100000,999999);return mark(Q(`Yang manakah lebih besar: ${a} atau ${b}?`,Math.max(a,b),[N(Math.min(a,b),'compare'),N(Math.abs(a-b),'operation'),N(a+b,'operation')],'Banding digit dari nilai tempat paling kiri.','Tahun 6 · Banding Nombor Besar',true,true),id,mode,'symbolic','concept',['compare','place']);}
      const n=R(100000,999999),ans=Math.round(n/1000)*1000;return mark(Q(`Bundarkan ${n} kepada ribu terdekat.`,ans,[N(Math.floor(n/1000)*1000,'round'),N(Math.ceil(n/1000)*1000,'round'),N(Math.round(n/100)*100,'round')],'Lihat nilai ratus untuk menentukan bundaran ribu.','Tahun 6 · Bundar Nombor Besar',true,true),id,mode,'symbolic','procedure',['round','place']);
    }
    if(id==='D6.OPS'){
      const mode=rotate(id,['combined_mul_first','combined_div_first','combined_brackets','combined_missing']),a=R(40,900),b=R(10,90),c=R(2,9);
      if(mode==='combined_mul_first'){const ans=a+b*c;return mark(Q(`${a} + ${b} × ${c} = ?`,ans,[N((a+b)*c,'operation'),N(a+b+c,'operation'),N(a*b+c,'operation')],'Darab dahulu, kemudian tambah.','Tahun 6 · Operasi Bergabung',true,true),id,mode,'symbolic','reasoning',['operation']);}
      if(mode==='combined_div_first'){const q=R(3,20),div=pick([2,4,5,10]),total=q*div,ans=a+q;return mark(Q(`${a} + ${total} ÷ ${div} = ?`,ans,[N((a+total)/div,'operation'),N(a+total-div,'operation'),N(a+total,'operation')],'Bahagi dahulu, kemudian tambah.','Tahun 6 · Operasi Bergabung',true,true),id,mode,'symbolic','reasoning',['operation','division']);}
      if(mode==='combined_brackets'){const ans=(a+b)*c;return mark(Q(`(${a} + ${b}) × ${c} = ?`,ans,[N(a+b*c,'operation'),N(a+b+c,'operation'),N((a-b)*c,'operation')],'Selesaikan kurungan dahulu.','Tahun 6 · Tertib Operasi',true,true),id,mode,'symbolic','reasoning',['operation']);}
      const ans=a+b*c;return mark(Q(`${a} + ___ × ${c} = ${ans}. Nombor hilang?`,b,[N(b+c,'operation'),N(ans-a,'operation'),N(Math.floor((ans-a)/c)+1,'operation')],'Gunakan operasi songsang selepas mengikut tertib operasi.','Tahun 6 · Operasi Hilang',true,true),id,mode,'symbolic','reasoning',['operation']);
    }
    if(id==='D6.FRAC'){
      const mode=rotate(id,['mixed_to_improper','improper_to_mixed','fraction_operation','fraction_compare']),d=pick([3,4,5,6,8,10]),whole=R(1,5),n=R(1,d-1),improper=whole*d+n;
      if(mode==='mixed_to_improper')return mark(Q(`Tukar ${whole} ${n}/${d} kepada pecahan tak wajar.`,`${improper}/${d}`,[N(`${whole+n}/${d}`,'fraction'),N(`${whole*d-n}/${d}`,'fraction'),N(`${whole}/${n+d}`,'fraction')],'Darab nombor bulat dengan penyebut, kemudian tambah pengangka.','Tahun 6 · Pecahan Tak Wajar',true,true),id,mode,'symbolic','procedure',['fraction']);
      if(mode==='improper_to_mixed')return mark(Q(`Tukar ${improper}/${d} kepada nombor bercampur.`,`${whole} ${n}/${d}`,[N(`${n} ${whole}/${d}`,'fraction'),N(`${whole+1} ${n}/${d}`,'fraction'),N(`${whole} ${d}/${n}`,'fraction')],'Bahagi pengangka dengan penyebut; baki menjadi pengangka.','Tahun 6 · Nombor Bercampur',true,true),id,mode,'symbolic','procedure',['fraction']);
      if(mode==='fraction_operation'){const a=R(1,d-1),b=R(1,d-a),ans=frac(a+b,d);return mark(Q(`${a}/${d} + ${b}/${d} = ?`,ans,[N(`${a+b}/${d+1}`,'fraction'),N(`${a*b}/${d}`,'fraction'),N(`${a+b}/${Math.max(1,d-1)}`,'fraction')],'Tambah pengangka, kekalkan penyebut, kemudian ringkaskan.','Tahun 6 · Operasi Pecahan',true,true),id,mode,'symbolic','application',['fraction','operation']);}
      let n2=R(1,d-1);while(n2===n)n2=R(1,d-1);const ans=n>n2?`${n}/${d}`:`${n2}/${d}`;return mark(Q(`Yang manakah lebih besar: ${n}/${d} atau ${n2}/${d}?`,ans,[N(ans===`${n}/${d}`?`${n2}/${d}`:`${n}/${d}`,'fraction'),N(`${d}/${Math.max(n,n2)}`,'fraction'),N('Sama','fraction')],'Penyebut sama: banding pengangka.','Tahun 6 · Banding Pecahan',true,true),id,mode,'symbolic','concept',['fraction']);
    }
    if(id==='D6.RATIO')return ratioRepair(id,6);
    if(id==='D6.MONEY'){
      const mode=rotate(id,['budget_multistep','budget_reverse','budget_compare']),budget=pick([200,250,300,400]),spend=pick([85,120,145]),save=pick([20,30,40]),available=budget-spend-save;
      if(mode==='budget_multistep')return mark(Q(`Aiman ada RM${budget}. Dia belanja RM${spend}, kemudian simpan RM${save} dalam tabung yang tidak boleh digunakan. Berapa wang masih boleh dibelanjakan?`,moneyUpper(available),[N(moneyUpper(budget-spend),'money'),N(moneyUpper(spend+save),'operation'),N(moneyUpper(available+10),'same_end')],`Tolak belanja dan simpanan: ${budget} − ${spend} − ${save}.`,'Tahun 6 · Bajet Berbilang Langkah',true,true),id,mode,'story','reasoning',['money','operation']);
      if(mode==='budget_reverse'){const need=budget-spend;return mark(Q(`Selepas berbelanja RM${spend}, baki Ali ialah RM${need}. Berapakah wang asalnya?`,moneyUpper(budget),[N(moneyUpper(need-spend),'money'),N(moneyUpper(need),'money'),N(moneyUpper(budget+spend),'operation')],'Wang asal = baki + perbelanjaan.','Tahun 6 · Bajet Songsang',true,true),id,mode,'story','reasoning',['money','operation']);}
      const alt=available+pick([10,20,30]);return mark(Q(`Pelan A meninggalkan RM${available} untuk dibelanjakan dan Pelan B RM${alt}. Pelan mana memberi baki lebih besar?`,alt>available?'B':'A',[N(alt>available?'A':'B','money'),N('Sama','money'),N('Tidak dapat ditentukan','money')],'Banding baki selepas semua komitmen.','Tahun 6 · Banding Bajet',true,true),id,mode,'story','application',['money']);
    }
    if(id==='D6.TIME'){
      const mode=rotate(id,['speed_time','speed_distance','speed_rate']),speed=pick([40,50,60,70,80,90,100]),minutes=pick([30,60,90,120,150,180]),dist=tidyNumber(speed*minutes/60),fmt=m=>m%60===0?`${m/60} jam`:`${Math.floor(m/60)} jam ${m%60} minit`;
      if(mode==='speed_time')return mark(Q(`Sebuah kereta bergerak ${dist} km pada ${speed} km/j. Tempoh perjalanan?`,fmt(minutes),[N(fmt(minutes+30),'time'),N(fmt(Math.max(30,minutes-30)),'time'),N(`${tidyNumber(speed/dist)} jam`,'operation')],'Tempoh = jarak ÷ laju.','Tahun 6 · Jarak dan Masa',true,true),id,mode,'story','application',['time','operation']);
      if(mode==='speed_distance'){return mark(Q(`Kereta bergerak ${speed} km/j selama ${fmt(minutes)}. Berapakah jarak?`,`${dist} km`,[N(`${speed+minutes} km`,'operation'),N(`${tidyNumber(dist+speed)} km`,'operation'),N(`${minutes} km`,'unit')],'Jarak = laju × masa dalam jam.','Tahun 6 · Jarak',true,true),id,mode,'story','application',['time','operation']);}
      const hours=pick([1,2,3]),distance=speed*hours;return mark(Q(`Perjalanan ${distance} km mengambil ${hours} jam. Laju purata?`,`${speed} km/j`,[N(`${distance+hours} km/j`,'operation'),N(`${distance} km/j`,'unit'),N(`${speed+10} km/j`,'operation')],'Laju = jarak ÷ masa.','Tahun 6 · Laju',true,true),id,mode,'story','reasoning',['time','operation']);
    }
    if(id==='D6.AREA'){
      const mode=rotate(id,['area_rect','perimeter_rect','volume_cuboid']),l=pick([8,10,12]),w=pick([5,6,7]),h=pick([2,3,4]);
      if(mode==='area_rect'){const ans=l*w;return mark(Q(`Segi empat tepat ${l} cm × ${w} cm. Luas?`,`${ans} cm²`,[N(`${2*(l+w)} cm²`,'area'),N(`${l+w} cm²`,'operation'),N(`${ans+w} cm²`,'area')],'Luas = panjang × lebar.','Tahun 6 · Luas',true,true),id,mode,'story','procedure',['area']);}
      if(mode==='perimeter_rect'){const ans=2*(l+w);return mark(Q(`Segi empat tepat ${l} cm × ${w} cm. Perimeter?`,`${ans} cm`,[N(`${l*w} cm`,'area'),N(`${l+w} cm`,'operation'),N(`${ans+w} cm`,'area')],'Perimeter = 2 × (panjang + lebar).','Tahun 6 · Perimeter',true,true),id,mode,'story','procedure',['area']);}
      const ans=l*w*h;return mark(Q(`Kuboid panjang ${l} cm, lebar ${w} cm dan tinggi ${h} cm. Isipadu?`,`${ans} cm³`,[N(`${2*(l+w+h)} cm³`,'area'),N(`${l*w} cm³`,'area'),N(`${ans+h} cm³`,'area')],'Isipadu kuboid = panjang × lebar × tinggi.','Tahun 6 · Isipadu',true,true),id,mode,'story','application',['area','operation']);
    }
    if(id==='D6.COORD'){
      const mode=rotate(id,['coord_read','coord_move','coord_distance']),x=R(1,4),y=R(1,4);
      if(mode==='coord_read')return mark(Q(`${coordGrid(x,y)}Apakah koordinat titik ●?`,`(${x},${y})`,[N(`(${y},${x})`,'coord'),N(`(${x+1},${y})`,'coord'),N(`(${x},${Math.max(0,y-1)})`,'coord')],'Baca x dahulu, kemudian y.','Tahun 6 · Baca Koordinat',true,true),id,mode,'visual','concept',['coord']);
      if(mode==='coord_move'){const dx=R(1,3),dy=R(1,2);return mark(Q(`Titik P berada pada (${x},${y}). Ia bergerak ${dx} unit ke kanan dan ${dy} unit ke atas. Koordinat baharu?`,`(${x+dx},${y+dy})`,[N(`(${x+dy},${y+dx})`,'coord'),N(`(${x-dx},${y+dy})`,'coord'),N(`(${x+dx},${y-dy})`,'coord')],'Gerak kanan menambah x; gerak atas menambah y.','Tahun 6 · Gerak Koordinat',true,true),id,mode,'story','application',['coord']);}
      const x2=x+R(1,3),ans=x2-x;return mark(Q(`P berada pada (${x},${y}) dan Q pada (${x2},${y}). Berapakah jarak mengufuk P ke Q?`,`${ans} unit`,[N(`${x+x2} unit`,'coord'),N(`${y} unit`,'coord'),N(`${ans+1} unit`,'coord')],'Jika y sama, jarak mengufuk ialah beza nilai x.','Tahun 6 · Jarak Koordinat',true,true),id,mode,'symbolic','reasoning',['coord','operation']);
    }
    if(id==='D6.DATA'){
      const labels=['Merah','Biru','Hijau','Kuning'],vals=uniqueInts(4,10,30),mode=rotate(id,['data_percent','data_average','data_inference']),sum=vals.reduce((a,b)=>a+b,0),i=R(0,3);
      if(mode==='data_percent'){const ans=Math.round(vals[i]/sum*100);return mark(Q(`${barChart(labels,vals)}Anggaran peratus bagi ${labels[i]}?`,`${ans}%`,[N(`${Math.round(vals[(i+1)%4]/sum*100)}%`,'percent'),N(`${vals[i]}%`,'percent'),N(`${sum}%`,'percent')],'Peratus = bahagian ÷ jumlah × 100.','Tahun 6 · Data dan Peratus',true,true),id,mode,'visual','application',['data','percent']);}
      if(mode==='data_average'){const ans=Math.round(sum/4);return mark(Q(`${barChart(labels,vals)}Purata terdekat bagi empat kategori?`,ans,[N(sum,'operation'),N(Math.max(...vals),'data'),N(Math.round(sum/3),'data')],'Purata = jumlah ÷ bilangan kategori.','Tahun 6 · Purata Data',true,true),id,mode,'visual','application',['data','operation']);}
      const mx=Math.max(...vals),mn=Math.min(...vals),diff=mx-mn;return mark(Q(`${barChart(labels,vals)}Berapakah beza kategori tertinggi dan terendah?`,diff,[N(mx,'data'),N(mn,'data'),N(mx+mn,'operation')],'Kenal pasti maksimum dan minimum sebelum menolak.','Tahun 6 · Tafsiran Data',true,true),id,mode,'visual','reasoning',['data','operation']);
    }
    if(id==='D6.PROB'){
      const mode=rotate(id,['prob_compare','prob_fraction','prob_certain']),red=R(1,5),blue=R(1,5),total=red+blue;
      if(mode==='prob_compare'){const ans=red>blue?'merah':blue>red?'biru':'sama kemungkinan';return mark(Q(`Beg mengandungi ${red} guli merah dan ${blue} guli biru. Warna mana lebih besar kemungkinan dipilih?`,ans,[N(ans==='merah'?'biru':'merah','data'),N('mustahil','data'),N('pasti','data')],'Banding bilangan hasil bagi setiap warna.','Tahun 6 · Banding Kebolehjadian',true,true),id,mode,'story','application',['data']);}
      if(mode==='prob_fraction')return mark(Q(`Beg mengandungi ${red} guli merah dan ${blue} guli biru. Pecahan kebarangkalian memilih merah?`,frac(red,total),[N(frac(blue,total),'fraction'),N(`${red}/${blue}`,'fraction'),N(`${total}/${red}`,'fraction')],'Hasil dikehendaki ÷ jumlah hasil.','Tahun 6 · Pecahan Kebolehjadian',true,true),id,mode,'story','reasoning',['data','fraction']);
      return mark(Q(`Sebuah beg hanya mengandungi ${red} guli merah. Apakah kebolehjadian mengambil guli biru?`,'mustahil',[N('pasti','data'),N('sama kemungkinan','data'),N('lebih mungkin','data')],'Tiada guli biru, jadi hasil itu mustahil.','Tahun 6 · Pasti atau Mustahil',true,true),id,mode,'story','concept',['data']);
    }
    return null;
  }

  function repair(id,s,shift){
    const g=Number(String(id).match(/^D(\d)/)?.[1]||0);
    if(g===1)return d1Repair(id,s,shift);
    if(g===2)return d2Repair(id,s,shift);
    if(g===3)return d3Repair(id,s,shift);
    if(g===4){if(id==='D4.RATIO')return ratioRepair(id,4);if(id==='D4.RATE')return rateRepair(id,4);return d4Repair(id,s,shift);}
    if(g===5)return d5Repair(id,s,shift);
    if(g===6)return d6Repair(id,s,shift);
    return null;
  }

  function wrap(key){
    const prior=previous[key];if(typeof prior!=='function')return;
    banks[key]=function(id,s,shift){const fixed=repair(id,s,shift);return fixed||prior(id,s,shift)};
  }
  Object.keys(previous).forEach(wrap);

  // Added skills were appended to GRAPH after the original recovery/stretch maps.
  // Mutate the existing map objects so REC/STR constants keep seeing these links.
  const activeGraph=(typeof GRAPH!=='undefined'?GRAPH:window.GRAPH);
  if(activeGraph){
    const rec=activeGraph.recovery_map||{},str=activeGraph.stretch_map||{};
    Object.assign(rec,{
      'D3.PERCENT':['D2.3.3'],'D3.POSITION':['D2.7.3'],'D4.PERCENT':['D3.PERCENT'],'D4.COORD':['D3.POSITION'],
      'D4.RATIO':['D4.FRAC'],'D4.RATE':['D4.RATIO'],'D5.ADD':['D4.ADD'],'D5.SUB':['D4.SUB'],'D5.OPS':['D5.ADD','D5.SUB','D5.MUL','D5.DIV'],
      'D5.RATIO':['D4.RATIO'],'D5.RATE':['D4.RATE'],'D6.PROB':['D5.DATA']
    });
    Object.assign(str,{
      'D2.3.3':'D3.PERCENT','D2.7.3':'D3.POSITION','D3.PERCENT':'D4.PERCENT','D3.POSITION':'D4.COORD',
      'D4.RATIO':'D5.RATIO','D4.RATE':'D5.RATE','D4.ADD':'D5.ADD','D4.SUB':'D5.SUB','D5.ADD':'D6.OPS','D5.SUB':'D6.OPS',
      'D5.RATIO':'D6.RATIO','D5.DATA':'D6.DATA'
    });
  }

  // ---------- Persistent competency evidence ----------
  const REQUIREMENTS={
    // Each inner array is an OR group. Separate inner arrays are all mandatory.
    'D1.N20':[['number_compare'],['number_order','number_missing']],
    'D1.ADD20':[['add_within20']], 'D1.SUB20':[['sub_within20']],
    'D2.1.5':[['estimate_quantity'],['estimate_reasonable']],
    'D2.2.1':[['add_two'],['add_three']], 'D2.2.2':[['sub_one'],['sub_two']],
    'D2.2.3':[['mul_fact','mul_groups'],['mul10']], 'D2.2.4':[['div_exact'],['div_remainder'],['div10']],
    'D2.2.5':[['problem_add','problem_sub'],['problem_mul','problem_div']],
    'D2.4.1':[['money_value']], 'D2.4.2':[['money_add']], 'D2.4.3':[['money_sub']], 'D2.4.4':[['money_mul']], 'D2.4.5':[['money_div']], 'D2.4.6':[['money_saving']], 'D2.4.7':[['money_problem']],
    'D2.5.1':[['read_clock']], 'D2.5.2':[['hour_minute'],['day_hour','week_day']], 'D2.5.3':[['elapsed_time']],
    'D2.6.1':[['read_ruler']], 'D2.6.2':[['read_scale']], 'D2.6.3':[['read_jug']], 'D2.6.4':[['measure_problem']],
    'D2.8.1':[['tally_data']], 'D2.8.2':[['bar_read'],['bar_compare']], 'D2.8.3':[['data_difference','data_sum'],['data_two_step']],
    'D4.FRAC':[['fraction_add'],['fraction_equivalent','fraction_missing']], 'D4.PERIM':[['perimeter_calc','perimeter_missing','perimeter_story']],
    'D5.OPS':[['combined_mul_first','combined_brackets'],['combined_missing']], 'D5.FRAC':[['fraction_add','fraction_story']],
    'D5.DEC':[['decimal_fraction'],['decimal_add','decimal_sub']], 'D5.MONEY':[['money_discount','money_discount_value']], 'D5.DATA':[['data_average','data_missing_average']],
    'D6.NUMBERS':[['large_sequence'],['large_compare','large_round']], 'D6.OPS':[['combined_mul_first','combined_div_first','combined_brackets'],['combined_missing']],
    'D6.FRAC':[['mixed_to_improper','improper_to_mixed'],['fraction_operation']], 'D6.RATIO':[['ratio_simplify'],['ratio_equivalent','ratio_missing']],
    'D6.MONEY':[['budget_multistep']],
    // Three overlapping OR groups encode "at least two of the three" speed relationships.
    'D6.TIME':[['speed_time','speed_distance'],['speed_time','speed_rate'],['speed_distance','speed_rate']],
    'D6.AREA':[['area_rect'],['perimeter_rect'],['volume_cuboid']]
  };
  function modeFromQuestion(q){return q?.competencyId||String(q?.contextId||'').replace(/^comp:/,'')||String(q?.archetypeId||'').replace(/^integrity_/,'')}
  function competencyBucket(id){
    if(typeof scoreState!=='function')return null;const s=scoreState(id);s.competencies=s.competencies||{};return s.competencies;
  }
  function recordCompetency(id,ok,usedHint,q){
    const mode=modeFromQuestion(q);if(!mode||!REQUIREMENTS[id])return;
    const b=competencyBucket(id);if(!b)return;const x=b[mode]||(b[mode]={attempts:0,clean:0,correct:0});x.attempts++;if(ok)x.correct++;if(ok&&!usedHint)x.clean++;
  }
  function requirementStatus(id,bucket){
    const groups=REQUIREMENTS[id];if(!groups)return{ok:true,missing:[]};const missing=[];
    groups.forEach(group=>{if(!group.some(mode=>Number(bucket?.[mode]?.clean||0)>0))missing.push(group)});
    return{ok:missing.length===0,missing};
  }
  function skillIntegrityReady(id){
    if(!REQUIREMENTS[id])return true;
    const bucket=typeof scoreState==='function'?scoreState(id)?.competencies:null;
    return requirementStatus(id,bucket).ok;
  }
  function chapterIntegrityReady(ch){
    if(typeof coreChapterSkills!=='function')return true;
    return coreChapterSkills(ch).every(m=>skillIntegrityReady(m.id));
  }
  window.PAContentIntegrity={version:'3.18.1',requirements:REQUIREMENTS,requirementStatus,modeFromQuestion,skillIntegrityReady,chapterIntegrityReady};

  if(typeof window.recordFrontierResponse==='function'){
    const oldRecord=window.recordFrontierResponse;
    window.recordFrontierResponse=function(id,ok,sec,usedHint,q){recordCompetency(id,ok,usedHint,q);return oldRecord.apply(this,arguments)};
  }
  // Progression must use the same competency proof as Auto Coach and Parent Mode.
  // Replacing updateFrontier (rather than checking after it runs) prevents an irreversible early unlock.
  if(typeof window.updateFrontier==='function'){
    window.updateFrontier=function(){
      while(db.coreFrontier<totalChapters()){
        const ch=db.coreFrontier;
        const scoreReady=chapterScore(ch)>=CFG.unlock_mastery;
        const evidenceReady=chapterEvidence(ch)>=Math.max(CFG.min_evidence_unlock,coreChapterSkills(ch).length*2-1);
        if(scoreReady&&evidenceReady&&chapterIntegrityReady(ch)){
          db.coreFrontier++;
          log(`Coach buka Topik ${gradeLabel(coreGrade())}.${db.coreFrontier}: topik sebelumnya cukup stabil dan competency wajib telah dibuktikan.`);
        }else break;
      }
    };
  }
  if(typeof window.canStretch==='function'){
    const oldCanStretch=window.canStretch;
    window.canStretch=function(coreId){return skillIntegrityReady(coreId)&&oldCanStretch.apply(this,arguments)};
  }

  if(typeof window.masteryEvidenceDecision==='function'){
    const oldDecision=window.masteryEvidenceDecision;
    window.masteryEvidenceDecision=function(skillId,history=[]){
      const base=oldDecision(skillId,history),bucket=typeof scoreState==='function'?scoreState(skillId)?.competencies:null,status=requirementStatus(skillId,bucket);
      if(!status.ok){
        base.secure=false;base.provisional=false;base.status=base.clean?'developing':'unproven';
        const labels=status.missing.map(group=>group.join(' / '));base.reasons=[...(base.reasons||[]),`Belum cukup bukti competency: ${labels.join('; ')}`];
      }
      base.contentIntegrity=status;return base;
    };
  }

  // Parent Mode must not call a skill “Kuasa Mantap” while required competency proof is missing.
  if(typeof window.powerLevel==='function'){
    const oldPower=window.powerLevel;
    window.powerLevel=function(s){
      const level=oldPower(s);if(level<3)return level;
      const graph=(typeof GRAPH!=='undefined'?GRAPH:window.GRAPH);
      const id=graph?.skills?.find(m=>typeof scoreState==='function'&&scoreState(m.id)===s)?.id;
      if(!id||!REQUIREMENTS[id])return level;
      return requirementStatus(id,s.competencies||{}).ok?3:2;
    };
  }

  // Lightweight grade-aware lesson specifications for repaired upper-primary skills.
  if(typeof window.lessonSpecFor==='function'){
    const oldLesson=window.lessonSpecFor;
    const specs={
      'D4.FRAC':{title:'Pecahan setara dan tambah mudah',goal:'Bezakan kesetaraan dengan operasi tambah pecahan.',faham:'Penyebut memberitahu saiz bahagian; jika penyebut sama, bahagian yang digabungkan mempunyai saiz sama.',visual:'fractionParts',build:'Tunjukkan dua pecahan pada model yang sama sebelum mengira.',bridge:'MODEL → PENYEBUT SAMA → TAMBAH PENGANGKA',good:'Semak penyebut sebelum menambah',bad:'Menambah pengangka dan penyebut serentak',transfer:'Gunakan idea sama dalam masalah reben, makanan atau ukuran.'},
      'D5.OPS':{title:'Operasi bergabung',goal:'Gunakan tertib operasi dengan konsisten.',faham:'Operasi tidak selalu diselesaikan dari kiri ke kanan.',visual:'barModel',build:'Tandakan operasi yang mesti dibuat dahulu.',bridge:'KURUNGAN → DARAB/BAHAGI → TAMBAH/TOLAK',good:'Tandakan tertib sebelum mengira',bad:'Kira terus dari kiri',transfer:'Semak jawapan melalui anggaran dan operasi songsang.'},
      'D5.MONEY':{title:'Diskaun dan bajet',goal:'Hubungkan peratus dengan nilai wang sebenar.',faham:'Diskaun ialah sebahagian daripada harga asal, bukan harga akhir.',visual:'moneyFlow',build:'Cari nilai diskaun dahulu, kemudian tolak.',bridge:'HARGA ASAL → NILAI DISKAUN → HARGA AKHIR',good:'Bezakan nilai diskaun dan harga selepas diskaun',bad:'Terus tolak nombor peratus daripada RM',transfer:'Gunakan pada bajet, jualan dan perbandingan harga.'},
      'D6.OPS':{title:'Operasi gabungan',goal:'Selesaikan operasi gabungan menggunakan tertib yang betul.',faham:'Darab dan bahagi didahulukan sebelum tambah dan tolak kecuali ada kurungan.',visual:'barModel',build:'Pisahkan ungkapan kepada langkah kecil.',bridge:'KENAL TERTIB → KIRA LANGKAH 1 → SEMAK',good:'Tulis langkah mengikut tertib',bad:'Kira semua dari kiri',transfer:'Gunakan operasi songsang untuk mencari nilai hilang.'},
      'D6.FRAC':{title:'Pecahan campuran dan operasi',goal:'Bezakan penukaran nombor bercampur dengan operasi pecahan.',faham:'Nombor bercampur mempunyai bahagian bulat dan bahagian pecahan.',visual:'fractionBar',build:'Tukar bentuk apabila perlu, kemudian lakukan operasi.',bridge:'TUKAR BENTUK → OPERASI → RINGKASKAN',good:'Kekalkan nilai pecahan semasa menukar bentuk',bad:'Campur nombor bulat terus ke pengangka tanpa darab penyebut',transfer:'Gunakan pada ukuran dan masalah berbilang langkah.'},
      'D6.TIME':{title:'Laju, jarak dan masa',goal:'Pilih hubungan yang betul antara laju, jarak dan masa.',faham:'Dua nilai menentukan nilai ketiga.',visual:'timeLine',build:'Tulis unit dahulu dan pastikan masa dalam jam apabila menggunakan km/j.',bridge:'JARAK = LAJU × MASA',good:'Samakan unit sebelum mengira',bad:'Campur jarak dan laju kerana kedua-duanya nombor',transfer:'Cari laju, jarak atau masa daripada dua maklumat yang diberi.'},
      'D6.AREA':{title:'Luas, perimeter dan isipadu',goal:'Pilih ukuran yang sepadan dengan situasi.',faham:'Perimeter mengelilingi, luas menutup permukaan, isipadu memenuhi ruang 3D.',visual:'area',build:'Kenal pasti unit: cm, cm² atau cm³.',bridge:'KELILING → cm | PERMUKAAN → cm² | RUANG → cm³',good:'Tentukan jenis ukuran sebelum pilih formula',bad:'Guna formula luas untuk kuboid',transfer:'Gunakan pada pagar, lantai dan kotak.'}
    };
    window.lessonSpecFor=function(skillId,key){return specs[skillId]||oldLesson(skillId,key)};
  }

  // Keep the visible build label honest even when an older index.html is still cached for one navigation.
  const versionEl=document.querySelector('.loginVersion');
  if(versionEl)versionEl.textContent='Pahlawan Angka · v3.18.1';
  document.documentElement.dataset.contentIntegrity='3.18.1';
  console.info('[Pahlawan Angka] Content Integrity Guard v3.18.1 active');
})();
