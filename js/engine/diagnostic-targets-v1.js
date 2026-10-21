/* Pahlawan Angka — Targeted practice (Phase 3, docs/PA-DIAGNOSTIC-BRAIN.md).
   Turns Diagnostic Brain findings into (1) a plan PA follows (Kemahiran Fokus
   card + mini game / Gembok targets + worksheet), (2) generated practice items
   that hit exactly the detected problem, and (3) a worksheet layout.
   No new question bank is needed: items are generated from parameters, and
   wrong choices come from the same bug models the brain detects, so practice
   keeps producing diagnostic evidence. Pure module; Node-testable. */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.PATargets=api;
})(typeof window!=='undefined'?window:undefined,function(){
  'use strict';
  const VERSION='1.0.0';

  // ---------- deterministic random (seeded so a worksheet can be reprinted) ----------
  function rng(seed){let t=(Number(seed)>>>0)||0x9e3779b9;return()=>{t+=0x6D2B79F5;let x=Math.imul(t^t>>>15,1|t);x^=x+Math.imul(x^x>>>7,61|x);return((x^x>>>14)>>>0)/4294967296}}
  const int=(r,a,b)=>a+Math.floor(r()*(b-a+1));
  const pick=(r,xs)=>xs[Math.floor(r()*xs.length)];
  const shuffle=(r,xs)=>{const a=[...xs];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

  // ---------- bug models reused as distractors ----------
  const digits=n=>String(Math.abs(Math.trunc(n))).split('').map(Number).reverse();
  const fromDigits=d=>Number(d.slice().reverse().join(''))||0;
  const sfl=(a,b)=>{const A=digits(a),B=digits(b);return fromDigits(A.map((x,i)=>Math.abs(x-(B[i]||0))))};
  const bnd=(a,b)=>{const A=digits(a),B=digits(b);return fromDigits(A.map((x,i)=>{const y=B[i]||0;return x<y?x+10-y:x-y}))};
  const noCarry=(a,b)=>{const A=digits(a),B=digits(b),n=Math.max(A.length,B.length),o=[];for(let i=0;i<n;i++)o.push(((A[i]||0)+(B[i]||0))%10);return fromDigits(o)};
  const needsBorrow=(a,b)=>{const A=digits(a),B=digits(b);return A.some((x,i)=>x<(B[i]||0))};
  const needsCarry=(a,b)=>{const A=digits(a),B=digits(b),n=Math.max(A.length,B.length);for(let i=0;i<n;i++)if((A[i]||0)+(B[i]||0)>9)return true;return false};
  const rm=c=>`RM${(c/100).toFixed(2)}`;

  function choices(r,answer,wrongs){
    const seen=new Set([String(answer)]),out=[];
    for(const w of wrongs){const k=String(w.v);if(w.v===undefined||w.v===null||seen.has(k)||(typeof w.v==='number'&&w.v<0))continue;seen.add(k);out.push(w);if(out.length===3)break}
    let d=1;while(out.length<3){const v=typeof answer==='number'?answer+(d%2?d:-d):`${answer}${d}`;d++;if(!seen.has(String(v))&&!(typeof v==='number'&&v<0)){seen.add(String(v));out.push({v,tag:'generated'})}}
    return shuffle(r,[{v:answer,tag:'correct'},...out]);
  }
  let seq=0;
  function item(r,{prompt,answer,wrongs,facets,skill,kind,hint,calc}){
    return{token:`pat-${Date.now().toString(36)}-${(++seq).toString(36)}`,prompt,answer,choices:choices(r,answer,wrongs||[]),
      facets,skill:skill||null,kind:kind||'Latihan sasaran',hint:hint||'',targeted:true,...(calc?{calc}:{})};
  }

  // ---------- generators, one per target kind ----------
  const GEN={
    /* Times tables: target tables get ~70% of items, known tables keep the mix honest. */
    tables(r,t,n,ctx){
      const targets=(t.tables||[]).filter(x=>x>=2&&x<=12);if(!targets.length)return[];
      const known=(ctx.fluentTables||[2,5,10]).filter(x=>!targets.includes(x));
      return Array.from({length:n},(_,i)=>{
        const table=i%10<7||!known.length?targets[i%targets.length]:pick(r,known),k=int(r,2,9),[a,b]=r()<.5?[table,k]:[k,table];
        return item(r,{prompt:`${a} × ${b} = ?`,answer:a*b,skill:'D3.MUL',kind:`Sifir ${table}`,
          wrongs:[{v:a*(b+1),tag:'times_neighbour'},{v:a*(b-1),tag:'times_neighbour'},{v:a+b,tag:'operation'},{v:(a+1)*b,tag:'times_neighbour'}],
          facets:{op:'mul',operands:[a,b],table,format:'symbolic'}});
      });
    },
    /* Basic facts to 20, the most-missed facts repeated first. */
    facts(r,t,n){
      const fams=t.factFamilies||[],hard=(t.facts||[]).filter(f=>/^\d+[+-]\d+$/.test(f));if(!fams.length)return[];
      return Array.from({length:n},(_,i)=>{
        let a,b,op;
        if(hard.length&&i%3===0){const f=hard[(i/3)%hard.length];op=f.includes('+')?'add':'sub';[a,b]=f.split(/[+-]/).map(Number)}
        else{op=fams[i%fams.length]==='add20'?'add':'sub';if(op==='add'){a=int(r,3,9);b=int(r,3,9)}else{b=int(r,3,9);a=b+int(r,2,9)}}
        const ans=op==='add'?a+b:a-b;
        return item(r,{prompt:`${a} ${op==='add'?'+':'−'} ${b} = ?`,answer:ans,skill:op==='add'?'D1.ADD20':'D1.SUB20',kind:op==='add'?'Tambah asas':'Tolak asas',
          wrongs:[{v:ans+1,tag:'counting'},{v:ans-1,tag:'counting'},{v:op==='add'?Math.abs(a-b):a+b,tag:'operation'}],
          facets:{op,operands:[a,b],format:'symbolic'}});
      });
    },
    /* Every item needs borrowing / carrying; size follows the grade. */
    regroup(r,t,n,ctx){
      const op=t.op==='add'?'add':'sub',big=(ctx.grade||2)>=3?1000:100;
      return Array.from({length:n},()=>{
        let a,b,guard=0;
        do{a=int(r,big/10+1,big-1);b=int(r,big/10,a-1);guard++}while(guard<50&&(op==='sub'?!needsBorrow(a,b):!needsCarry(a,b)));
        const ans=op==='add'?a+b:a-b;
        return item(r,{prompt:`${a} ${op==='add'?'+':'−'} ${b} = ?`,answer:ans,skill:op==='add'?'D2.2.1':'D2.2.2',kind:op==='add'?'Tambah, mengumpul semula':'Tolak, meminjam',
          wrongs:op==='sub'?[{v:sfl(a,b),tag:'smaller_from_larger'},{v:bnd(a,b),tag:'borrow_no_decrement'},{v:a+b,tag:'operation'}]:[{v:noCarry(a,b),tag:'add_no_carry'},{v:Math.abs(a-b),tag:'operation'},{v:ans+10,tag:'place'}],
          facets:{op,operands:[a,b],format:'lazim'},hint:op==='sub'?'Pinjam 10 dari lajur sebelah, dan kurangkan lajur itu satu.':'Jumlah lajur lebih 9? Kumpul semula 1 ke lajur sebelah.'});
      });
    },
    /* Money word problems for the weak operation (cents to avoid float noise). */
    money(r,t,n){
      const want=t.op||'sub',cycle=['sub','add','mul','sub','div'];
      const T={
        sub:[(a,b)=>`Adik ada ${rm(a)}. Dia membeli air berharga ${rm(b)}. Berapakah baki wang adik?`,(a,b)=>`Harga beg ${rm(a)}. Ibu membayar ${rm(b)} dahulu. Berapakah lagi yang perlu dibayar?`,(a,b)=>`Kakak menyimpan ${rm(a)}. Dia menggunakan ${rm(b)} untuk membeli buku. Berapakah wang yang tinggal?`],
        add:[(a,b)=>`Ali membeli roti ${rm(a)} dan susu ${rm(b)}. Berapakah jumlah harganya?`,(a,b)=>`Abang ada ${rm(a)}. Ayah memberi ${rm(b)} lagi. Berapakah wang abang sekarang?`],
        mul:[(a,b)=>`Sebatang pensel berharga ${rm(a)}. Berapakah harga ${b} batang pensel?`],
        div:[(a,b)=>`${rm(a)} dikongsi sama rata oleh ${b} orang. Berapakah yang diterima setiap orang?`]
      };
      const HINT={sub:'Baca soalan: "baki" dan "tinggal" bermaksud tolak.',add:'"Jumlah" dan "lagi" bermaksud tambah.',mul:'Harga satu, beli banyak: darab.',div:'"Sama rata" bermaksud bahagi.'};
      return Array.from({length:n},(_,i)=>{
        const op=want==='mixed'?cycle[i%cycle.length]:want;
        let a,b,ans;
        if(op==='mul'){a=int(r,2,20)*10;b=int(r,2,6);ans=a*b}
        else if(op==='div'){b=int(r,2,5);ans=int(r,2,20)*10;a=ans*b}
        else{a=int(r,20,500)*10;b=int(r,5,a/10-1)*10;ans=op==='add'?a+b:a-b}
        const prompt=pick(r,T[op]||T.sub)(a,op==='mul'||op==='div'?b:b);
        return item(r,{prompt,answer:rm(ans),skill:'D3.MONEY',kind:`Wang, ${({add:'tambah',sub:'tolak',mul:'darab',div:'bahagi'})[op]}`,
          wrongs:[{v:rm(op==='sub'?a+b:Math.abs(a-b)),tag:'operation'},{v:rm(ans*10),tag:'place_value_shift'},{v:`RM${ans}`,tag:'money_unit'}],
          facets:{op,context:'money',format:'word'},hint:HINT[op]||HINT.sub,calc:{op,a,b,ans,unit:'sen'}});
      });
    },
    /* RM <-> sen conversion (money_unit bug). */
    units(r,t,n){
      return Array.from({length:n},()=>{const c=int(r,5,999)*5,toSen=r()<.5;
        return toSen?item(r,{prompt:`${rm(c)} = berapa sen?`,answer:`${c} sen`,skill:'D2.4.1',kind:'Sen dan ringgit',wrongs:[{v:`${c/100} sen`,tag:'money_unit'},{v:`${c*10} sen`,tag:'place'},{v:`${c/10} sen`,tag:'place'}],facets:{op:'none',context:'money',format:'symbolic'},calc:{op:'toSen',c}})
          :item(r,{prompt:`${c} sen = RM berapa?`,answer:rm(c),skill:'D2.4.1',kind:'Sen dan ringgit',wrongs:[{v:`RM${c}`,tag:'money_unit'},{v:rm(c*10),tag:'place'},{v:rm(c/10),tag:'place'}],facets:{op:'none',context:'money',format:'symbolic'},calc:{op:'toRM',c}})});
    },
    /* Same arithmetic as story problems, short sentences first. */
    word(r,t,n){
      const S=[
        (a,b)=>({p:`Ada ${a} biji guli. ${b} biji hilang. Berapakah guli yang tinggal?`,ans:a-b,op:'sub',schema:'change'}),
        (a,b)=>({p:`Siti ada ${a} pelekat. Amin ada ${b} pelekat lebih daripada Siti. Berapakah pelekat Amin?`,ans:a+b,op:'add',schema:'compare_more'}),
        (a,b)=>({p:`Amin ada ${a} pelekat. Siti ada ${b} pelekat kurang daripada Amin. Berapakah pelekat Siti?`,ans:a-b,op:'sub',schema:'compare_less'}),
        (a,b)=>({p:`Dalam kelas ada ${a} murid lelaki dan ${b} murid perempuan. Berapakah jumlah murid?`,ans:a+b,op:'add',schema:'part_whole'})
      ];
      return Array.from({length:n},(_,i)=>{const a=int(r,20,90),b=int(r,5,a-5),s=S[i%S.length](a,b);
        return item(r,{prompt:s.p,answer:s.ans,skill:'D2.2.5',kind:'Soalan berayat',wrongs:[{v:s.op==='sub'?a+b:a-b,tag:'operation'},{v:s.ans+10,tag:'place'},{v:s.ans-1,tag:'counting'}],
          facets:{op:s.op,format:'word',schema:s.schema},hint:'Lukis bar: mana keseluruhan, mana bahagian?',calc:{op:s.op,a,b,ans:s.ans,schema:s.schema}})});
    },
    /* Wrong-operation bug: mixed set where the child must choose the operation first. */
    mixed(r,t,n){const order=['add','sub','mul'];return Array.from({length:n},(_,i)=>{const op=order[i%3];const g=GEN[op==='mul'?'tables':'regroup'];
      return g(r,op==='mul'?{tables:[int(r,3,9)]}:{op},1,{grade:3})[0]})},
    /* Retention: short review of what is slipping. */
    review(r,t,n,ctx){
      const tables=(t.review||[]).map(s=>/^sifir (\d+)$/.exec(s)).filter(Boolean).map(m=>Number(m[1]));
      const fams=(t.review||[]).filter(s=>/asas/.test(s)).map(s=>s.startsWith('tambah')?'add20':'sub20');
      const a=tables.length?GEN.tables(r,{tables},Math.ceil(n*(fams.length?.6:1)),ctx):[];
      const b=fams.length?GEN.facts(r,{factFamilies:fams},n-a.length,ctx):[];
      return [...a,...b].slice(0,n);
    }
  };

  // ---------- findings -> plan ----------
  const BUG_TARGET={smaller_from_larger:{kind:'regroup',op:'sub'},borrow_no_decrement:{kind:'regroup',op:'sub'},borrow_from_zero:{kind:'regroup',op:'sub'},
    add_no_carry:{kind:'regroup',op:'add'},times_neighbour:{kind:'tables'},wrong_operation:{kind:'mixed'},money_unit:{kind:'units'},
    place_value_shift:{kind:'regroup',op:'add'},mul_no_placeholder:{kind:'tables'}};
  function targetFor(f){
    const t=f.target||{};
    if(f.id==='fact_fluency')return{kind:'tables',tables:t.tables,game:'operations',reason:f.text};
    if(f.id==='basic_facts')return{kind:'facts',factFamilies:t.factFamilies,facts:t.facts,game:'operations'};
    if(f.id.startsWith('context_money'))return{kind:'money',op:t.op||'mixed',game:'money'};
    if(f.id==='format_word')return{kind:'word',worksheet:true};
    if(f.id.startsWith('regroup_'))return{kind:'regroup',op:t.op,game:'operations'};
    if(f.id==='retention')return{kind:'review',review:t.review,game:'operations'};
    if(f.id.startsWith('bug_')){const b=BUG_TARGET[t.bug]||{kind:'mixed'};return{...b,tables:b.kind==='tables'?[]:undefined,game:b.kind==='units'?'money':'operations'}}
    return null;
  }
  const CARD={tables:t=>`Sifir ${(t.tables||[]).join(' & ')||'pilihan'}`,facts:()=>'Fakta asas hingga 20',regroup:t=>t.op==='add'?'Tambah, mengumpul semula':'Tolak, meminjam',
    money:t=>t.op==='mixed'?'Wang: soalan cerita campur':`Wang: operasi ${({add:'tambah',sub:'tolak',mul:'darab',div:'bahagi'})[t.op]||'tolak'}`,word:()=>'Soalan berayat',units:()=>'Sen dan ringgit',mixed:()=>'Pilih operasi yang betul',review:()=>'Ulang kaji berjadual'};
  const merge=(a,b)=>[...new Set([...(a||[]),...(b||[])])];
  /* What PA does next: mini game / Gembok targets and the worksheet sections. */
  function plan(result,ctx={}){
    const findings=(result?.findings||[]).filter(f=>!f.strength);
    const fluent=(result?.strengths||[]).flatMap(s=>s.evidence?.fluent||[]);
    const steps=[];
    for(const f of findings){
      if(f.id==='rapid_guess')continue;                      // handled by Portal Restu, not by practice
      const t=targetFor(f);if(!t)continue;
      if(t.kind==='tables'&&!(t.tables||[]).length&&f.id.startsWith('bug_')){const m=/(\d+) × (\d+)/.exec(f.text);t.tables=m?[Number(m[1])]:[7]}
      // One step per practice kind: a regroup lens and a borrowing bug want the same drill.
      const same=steps.find(s=>s.target.kind===t.kind&&(s.target.op||'')===(t.op||''));
      if(same){same.also=[...(same.also||[]),f.id];same.skills=merge(same.skills,f.skills);continue}
      steps.push({finding:f.id,target:t,card:CARD[t.kind]?.(t)||'Latihan sasaran',why:f.text,
        skills:merge([],f.skills),where:t.worksheet?'worksheet':'minigame'});
    }
    // A sen/RM mix-up explains weak money scores; fix the unit first, not a generic money drill.
    if(steps.some(s=>s.target.kind==='units')){const i=steps.findIndex(s=>s.target.kind==='money'&&s.target.op==='mixed');if(i>=0){const [m]=steps.splice(i,1);const u=steps.find(s=>s.target.kind==='units');u.also=[...(u.also||[]),m.finding];u.skills=merge(u.skills,m.skills)}}
    return{steps,fluentTables:fluent,grade:ctx.grade||2};
  }
  /* KSSR skill for a step's Kemahiran Fokus card. skills = the child's grade
     skills that can be practised ({id,domain,title}). The skill where the
     evidence came from wins; otherwise the grade's skill for this practice. */
  const OP_TITLE={add:/^tambah/i,sub:/^tolak/i,mul:/^darab/i,div:/^bahagi/i};
  function skillFor(step,skills){
    const list=Array.isArray(skills)?skills:[],t=step?.target||{};
    const own=(step?.skills||[]).find(id=>list.some(m=>m.id===id));if(own)return own;
    const all=(domain,re)=>list.filter(m=>m.domain===domain&&re.test(String(m.title||'')));
    const basic=m=>/hingga 20$/.test(m.title);
    const ops=(op,small)=>{const xs=all('Operasi',OP_TITLE[op]||/$^/);return(small?xs.find(basic):xs.find(m=>!basic(m)))||xs[0]};
    const money=op=>(all('Wang',OP_TITLE[op]||/$^/)[0]||all('Wang',/masalah|operasi/i)[0]||all('Wang',/./)[0]);
    let m=null;
    if(t.kind==='tables')m=ops('mul');
    else if(t.kind==='facts')m=ops((t.factFamilies||[])[0]==='sub20'?'sub':'add',true);
    else if(t.kind==='regroup')m=ops(t.op==='add'?'add':'sub');
    else if(t.kind==='money')m=money(t.op);
    else if(t.kind==='units')m=all('Wang',/^nilai wang/i)[0]||money();
    else if(t.kind==='word'||t.kind==='mixed')m=all('Operasi',/masalah|bergabung|gabungan/i)[0];
    else if(t.kind==='review'){const r=t.review||[];m=r.some(x=>/^sifir/.test(x))?ops('mul'):ops(r.some(x=>/^tolak/.test(x))?'sub':'add',true)}
    return m?.id||null;
  }
  function practice(step,n=10,ctx={},seed=Date.now()){
    const r=rng(seed),g=GEN[step?.target?.kind];if(!g)return[];
    return g(r,step.target,n,ctx);
  }
  /* Worksheet: one section per step; word problems get a working box. */
  function worksheet(p,ctx={},seed=1){
    const r=rng(seed);
    const sections=(p?.steps||[]).slice(0,3).map((s,i)=>{const n=s.target.kind==='word'||s.target.kind==='money'?4:8;
      return{title:s.card,why:s.why,items:GEN[s.target.kind](rng(seed+i+1),s.target,n,{...ctx,fluentTables:p.fluentTables}),
        showWorking:['word','money','regroup'].includes(s.target.kind)}});
    const hasWord=sections.some(x=>x.showWorking);
    return{title:`Latihan Pahlawan Angka${ctx.name?` · ${ctx.name}`:''}`,sections,
      parentNote:hasWord?'Ibu bapa: semak kotak "Cara kerja". Minta anak terangkan langkahnya — kesilapan cara lebih penting daripada jawapan akhir.':'Ibu bapa: biarkan anak menjawab sendiri, kemudian semak bersama.'};
  }

  // ---------- answer-key steps (Skema) that teach the exact fix ----------
  const PLACE=['sa','puluh','ratus','ribu','puluh ribu'];
  const cap=t=>t.charAt(0).toUpperCase()+t.slice(1);
  function borrowSteps(a,b){
    const A=digits(a),B=digits(b),out=[];let borrow=0;
    for(let i=0;i<A.length;i++){
      const y=B[i]||0,was=borrow;let x=A[i]-was,txt='';borrow=0;
      if(was&&A[i]===0){txt=`${cap(PLACE[i])}: 0 perlu beri 1, jadi pinjam 10 dari ${PLACE[i+1]} → 10 − 1 = 9`;x=9;borrow=1}
      else if(was)txt=`${cap(PLACE[i])}: ${A[i]} − 1 (sudah dipinjam) = ${x}`;
      if(x<y){txt=(txt?txt+'; ':`${cap(PLACE[i])}: `)+`${x} tidak cukup untuk tolak ${y}, pinjam 10 dari ${PLACE[i+1]} → ${x+10} − ${y} = ${x+10-y}`;borrow=1}
      else if(txt||y)txt=(txt?txt+'; ':`${cap(PLACE[i])}: `)+`${x} − ${y} = ${x-y}`;
      if(txt)out.push(txt);
    }
    return out.slice(0,4).join('. ')+'.';
  }
  function carrySteps(a,b){
    const A=digits(a),B=digits(b),n=Math.max(A.length,B.length),out=[];let carry=0;
    for(let i=0;i<n;i++){const s=(A[i]||0)+(B[i]||0)+carry,was=carry;carry=s>9?1:0;
      out.push(`${cap(PLACE[i])}: ${A[i]||0} + ${B[i]||0}${was?' + 1':''} = ${s}${s>9?`, tulis ${s%10}, kumpul semula 1 ke ${PLACE[i+1]}`:''}`)}
    return out.slice(0,4).join('. ')+'.';
  }
  function explain(it){
    const f=it?.facets||{},c=it?.calc,ops=f.operands||[];
    if(c&&c.op==='toSen')return `RM1 = 100 sen. ${rm(c.c)} = ${c.c} sen (darab 100, bukan tambah sifar sahaja).`;
    if(c&&c.op==='toRM')return `100 sen = RM1. ${c.c} sen ÷ 100 = ${rm(c.c)}. Dua digit terakhir ialah sen.`;
    if(c&&f.context==='money'){
      const t={sub:`Baki: ${rm(c.a)} − ${rm(c.b)}. Tukar ke sen: ${c.a} − ${c.b} = ${c.ans} sen = ${rm(c.ans)}.`,
        add:`Jumlah: ${rm(c.a)} + ${rm(c.b)}. Tukar ke sen: ${c.a} + ${c.b} = ${c.ans} sen = ${rm(c.ans)}.`,
        mul:`Harga satu × bilangan: ${rm(c.a)} × ${c.b} = ${c.a*c.b} sen = ${rm(c.ans)}.`,
        div:`Kongsi sama rata: ${rm(c.a)} ÷ ${c.b} = ${c.a/c.b} sen = ${rm(c.ans)}.`};
      return t[c.op]||t.sub;
    }
    if(c&&c.schema){
      const t={change:`Ada ${c.a}, kemudian ${c.b} hilang: keseluruhan berkurang, jadi tolak. ${c.a} − ${c.b} = ${c.ans}.`,
        compare_more:`"Lebih daripada" bermaksud Amin ada lebih: ${c.a} + ${c.b} = ${c.ans}.`,
        compare_less:`"Kurang daripada" bermaksud Siti ada kurang: ${c.a} − ${c.b} = ${c.ans}.`,
        part_whole:`Jumlah = bahagian + bahagian: ${c.a} + ${c.b} = ${c.ans}.`};
      return `${t[c.schema]||''} Lukis bar: keseluruhan di atas, bahagian di bawah.`.trim();
    }
    const [a,b]=ops;
    if(f.op==='mul'&&ops.length===2){
      const t=f.table||a,k=t===a?b:a;
      return k>2?`Sifir ${t}: ${t} × ${k-1} = ${t*(k-1)}, tambah ${t} lagi → ${t} × ${k} = ${t*k}.`:`${a} × ${b} = ${a*b}.`;
    }
    if(f.op==='sub'&&ops.length===2&&f.format==='lazim')return `${borrowSteps(a,b)} Jawapan: ${a-b}.`;
    if(f.op==='add'&&ops.length===2&&f.format==='lazim')return `${carrySteps(a,b)} Jawapan: ${a+b}.`;
    if(f.op==='add'&&ops.length===2&&a+b>10&&a<10&&b<10){const need=10-Math.max(a,b),big=Math.max(a,b),small=Math.min(a,b);
      return `Cukupkan 10 dulu: ${big} + ${need} = 10, baki ${small-need}. 10 + ${small-need} = ${a+b}.`}
    if(f.op==='sub'&&ops.length===2&&a>10&&b>a-10){const first=a-10;return `Tolak ke 10 dulu: ${a} − ${first} = 10, kemudian 10 − ${b-first} = ${a-b}.`}
    if(ops.length===2)return `${a} ${f.op==='add'?'+':f.op==='sub'?'−':'×'} ${b} = ${it.answer}.`;
    return `Jawapan: ${it.answer}.`;
  }
  /* Printable worksheet items for the parent PDF: about 60% targeted, the rest
     is left for the normal bank so the sheet stays mixed. */
  function worksheetItems(p,count=10,ctx={},seed=Date.now()){
    const steps=(p?.steps||[]).slice(0,3);if(!steps.length)return{items:[],focus:[],titles:[]};
    const total=Math.max(6,Math.round(count*.6)),heavy=s=>['word','money'].includes(s.target.kind);
    const weight=steps.map(s=>heavy(s)?2:3),sum=weight.reduce((x,y)=>x+y,0);
    const quota=weight.map(w=>Math.min(8,Math.max(2,Math.floor(total*w/sum))));
    // One focus never takes more than 8 items: past that it is drill, not practice.
    for(let i=0,guard=0;quota.reduce((x,y)=>x+y,0)<total&&guard<99;i=(i+1)%quota.length,guard++)if(quota[i]<8)quota[i]++;
    const items=[];
    steps.forEach((s,i)=>{
      const g=GEN[s.target.kind];if(!g)return;
      const seen=new Set(),out=[];let tries=0;
      while(out.length<quota[i]&&tries++<6){for(const it of g(rng(seed+i*97+tries),s.target,quota[i]*2,{...ctx,fluentTables:p.fluentTables})){
        if(out.length>=quota[i])break;if(seen.has(it.prompt))continue;seen.add(it.prompt);out.push(it)}}
      for(const it of out)items.push({prompt:it.prompt,answer:String(it.answer),hint:it.hint||'',skill:it.skill,choices:null,targeted:true,
        focus:s.card,showWorking:['word','money','regroup'].includes(s.target.kind),solution:explain(it)});
    });
    return{items,focus:steps.map(s=>({card:s.card,why:s.why})),titles:steps.map(s=>s.card)};
  }

  return{VERSION,plan,practice,skillFor,worksheet,worksheetItems,explain,targetFor,_gen:GEN,_rng:rng};
});
