/* Pahlawan Angka — Diagnostic Brain v1 (Phase 1 of docs/PA-DIAGNOSTIC-BRAIN.md).
   1) facets(q): deterministic facet tags for a question (explicit q.facets win;
      otherwise derived from skill metadata, archetype, context and the equation).
   2) record(...): keeps a compact per-answer log in db.diagLog (first attempt,
      wrong value, seconds, hint) — on the child's own profile only.
   3) analyze(log): evidence-gated findings for lenses 4.1 (picture vs numbers),
      4.2 (fact fluency), 4.3 (error bugs), 4.4 (lazim vs word), 4.5 (rapid
      guessing), 4.6 (blocked vs mixed), 4.7 (retention), 4.8 (short vs long wording) plus
      operation-within-context (e.g. money subtraction). Each finding carries
      parent copy (BM), evidence and the action PA will take.
   Pure functions are exported for Node tests; browser wiring is at the end. */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.PADiagnostic=api;
})(typeof window!=='undefined'?window:undefined,function(){
  'use strict';
  const VERSION='1.2.0';
  const LOG_MAX=500, WINDOW_DAYS=30, RUN_GAP=15*6e4;
  const OP_WORD={add:'tambah',sub:'tolak',mul:'darab',div:'bahagi'};
  const CTX_WORD={money:'wang',time:'masa',measure:'ukuran',fraction:'pecahan',decimal:'perpuluhan',plain:'nombor'};
  const DOMAIN_CTX={Wang:'money',Masa:'time',Ukuran:'measure',Pecahan:'fraction',Perpuluhan:'decimal'};

  // ---------- facets ----------
  const strip=html=>String(html??'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
  const num=s=>Number(String(s).replace(/,/g,''));
  const numIn=s=>{const m=/-?\d+(?:\.\d+)?/.exec(String(s??'').replace(/,/g,''));return m?Number(m[0]):NaN};
  const SYM={'+':'add','−':'sub','-':'sub','×':'mul','x':'mul','X':'mul','*':'mul','÷':'div',':':'div'};
  function equation(text){
    const m=/(\d[\d,]*)\s*([+\-−×xX*÷:])\s*(\d[\d,]*)\s*(?:=|$|\?)/.exec(text);
    if(!m)return null;
    const op=SYM[m[2]],a=num(m[1]),b=num(m[3]);
    if(!op||!Number.isFinite(a)||!Number.isFinite(b))return null;
    return{op,a,b};
  }
  function opFromWords(s){
    const t=String(s||'').toLowerCase();
    if(/(^|[^a-z])(sub|tolak|baki|beza|minus)([^a-z]|$)|_sub|sub_/.test(t))return 'sub';
    if(/(^|[^a-z])(add|tambah|jumlah|campur)([^a-z]|$)|_add|add_/.test(t))return 'add';
    if(/(^|[^a-z])(mul|multiply|multiplication|darab|kali)([^a-z]|$)|_mul|mul_/.test(t))return 'mul';
    if(/(^|[^a-z])(div|division|bahagi)([^a-z]|$)|_div|div_/.test(t))return 'div';
    return null;
  }
  function facets(q,meta){
    const given=q&&typeof q.facets==='object'&&q.facets?q.facets:{};
    const text=strip(q?.prompt??q?.question??q?.q);
    const words=text?text.split(' ').length:0;
    const eq=given.operands?{op:given.op,a:given.operands[0],b:given.operands[1]}:equation(text);
    const m=meta||{};
    const op=given.op||eq?.op||opFromWords(q?.archetypeId)||opFromWords(q?.familyKey)||opFromWords(m.title)||'none';
    const context=given.context||DOMAIN_CTX[m.domain]||'plain';
    let format=given.format||'';
    if(!format){
      if(q?.contextId==='written-arithmetic'||/bentuk lazim/i.test(String(q?.kind||'')))format='lazim';
      else if(/<(svg|img|canvas)\b/i.test(String(q?.prompt||''))||q?.representation==='visual')format='visual';
      else if(q?.representation==='story'||(!eq&&words>=10))format='word';
      else format='symbolic';
    }
    let tables=null;
    if(eq&&eq.op==='mul'&&eq.a>=1&&eq.b>=1&&eq.a<=12&&eq.b<=12)tables=[...new Set([eq.a,eq.b].filter(n=>n>=2&&n<=12))];
    else if(eq&&eq.op==='div'&&eq.b>=2&&eq.b<=12&&eq.a%eq.b===0&&eq.a/eq.b<=12)tables=[eq.b];
    if(given.table)tables=[given.table];
    const ops=eq&&eq.op===op?[eq.a,eq.b]:null;
    // Basic facts (Darjah 1–2): addends to 10 / minuend to 20.
    let factFamily=null,fact=null;
    if(ops&&op==='add'&&ops[0]<=10&&ops[1]<=10){factFamily='add20';fact=`${ops[0]}+${ops[1]}`}
    else if(ops&&op==='sub'&&ops[0]<=20&&ops[1]<=10&&ops[0]-ops[1]>=0&&ops[0]-ops[1]<=10){factFamily='sub20';fact=`${ops[0]}-${ops[1]}`}
    // Multi-digit add/sub: does it need carrying (mengumpul semula) / borrowing (meminjam)?
    let regroup=null;
    if(ops&&!factFamily&&Math.max(ops[0],ops[1])>=10){if(op==='add')regroup=needsCarry(ops[0],ops[1]);else if(op==='sub'&&ops[0]>=ops[1])regroup=needsBorrow(ops[0],ops[1])}
    const answer=q?.answer==null?null:strip(q.answer).slice(0,24);
    // 4.1 CPA: concrete (blocks/rack), pictorial (picture) or abstract (numbers/words only).
    // Mini games say it explicitly; a table of data is neither, so it stays unknown.
    let rep=['concrete','pictorial','abstract'].includes(given.rep)?given.rep:null;
    if(!rep&&!/^minigame_/.test(String(q?.archetypeId||''))&&q?.representation!=='table'){
      if(q?.representation==='manipulative')rep='concrete';
      else if(q?.representation==='visual'||/<(svg|img|canvas)\b/i.test(String(q?.prompt||'')))rep='pictorial';
      else rep='abstract';
    }
    // 4.8 language load: only a generator that wrote the short and the long wording knows it (1 short … 3 long).
    const reading=[1,2,3].includes(given.reading)?given.reading:null;
    return{skill:q?.skill||given.skill||null,op,context,format,tables:tables&&tables.length?tables:null,
      operands:ops,words,factFamily,fact,regroup,answer,rep,reading,aloud:q?.readAloud===true,
      // 4.6: a page that knows its run may say so; otherwise applyResponse() reads it from the answers before.
      interleaved:typeof given.interleaved==='boolean'?given.interleaved:null};
  }

  // ---------- recording ----------
  function compact(f,{ok,sec,hint,value,at}){
    const r={t:at,s:f.skill,o:f.op,c:f.context,f:f.format,k:ok?1:0,sec:Math.round((Number(sec)||0)*10)/10,w:f.words};
    if(f.tables)r.tb=f.tables;
    if(f.operands)r.a=f.operands;
    if(hint)r.h=1;
    if(f.factFamily){r.fx=f.factFamily;r.fk=f.fact}
    if(f.regroup!==null&&f.regroup!==undefined)r.rg=f.regroup?1:0;
    if(f.rep)r.rp=f.rep[0];   // c | p | a
    if(f.reading)r.rd=f.reading;
    if(f.aloud)r.ra=1;        // the child had the question read aloud before answering
    if(f.interleaved!==null)r.il=f.interleaved?1:0;   // 0 same operation as the two answers before (blocked), 1 mixed
    if(!ok&&value!==undefined&&value!==null&&value!==''){r.v=String(value).slice(0,24);if(f.answer)r.x=f.answer}
    return r;
  }
  function pushRecord(log,entry,token){
    const list=Array.isArray(log)?log:[];
    list.push(token?{...entry,id:String(token).slice(0,40)}:entry);
    while(list.length>LOG_MAX)list.shift();
    return list;
  }
  /* First attempt creates the record; a later resolution of the same item only
     adds the retry outcome, so accuracy always means "first try". */
  function applyResponse(log,{q,meta,ok,sec,usedHint,mode,value,at}){
    const token=q?.token?String(q.token).slice(0,40):null;
    const first=/first-attempt/.test(String(mode||''));
    const list=Array.isArray(log)?log:[];
    if(!first&&token){
      for(let i=list.length-1;i>=Math.max(0,list.length-6);i--){
        if(list[i].id===token){list[i].r=ok?1:0;if(usedHint)list[i].h=1;
          // Read aloud only after the first try: "wrong read alone, then heard it" (lens 4.8).
          if(q?.readAloud===true&&!list[i].ra)list[i].ra=2;
          return list;}
      }
    }
    const f=facets(q,meta),t=at||Date.now();
    // 4.6 blocked or mixed: the operations of the two answers just before (same sitting, 15 minutes).
    if(f.interleaved===null&&OP_WORD[f.op]){
      const prev=[];
      for(let i=list.length-1;i>=0&&prev.length<2;i--){const x=list[i];if(!x||t-x.t>RUN_GAP)break;if(OP_WORD[x.o])prev.push(x.o)}
      if(prev.length===2)f.interleaved=prev.some(o=>o!==f.op);
    }
    return pushRecord(list,compact(f,{ok:first?false:!!ok,sec,hint:!!usedHint,value,at:t}),token);
  }

  // ---------- analysis helpers ----------
  const pct=(a,b)=>b?Math.round(a/b*100):0;
  const median=xs=>{if(!xs.length)return 0;const s=[...xs].sort((a,b)=>a-b),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2};
  const independent=r=>r.k===1&&!r.h;
  // Same reading-load floor as js/effort-guard-v3.32.0.js limit().
  const floor=r=>Math.min(3.2,Math.max(1.8,1.35+(Number(r.w)||0)*5.5*.018));
  const isRapid=r=>r.sec>0&&r.sec<floor(r);
  const joinBM=xs=>xs.length<=1?String(xs[0]??''):xs.slice(0,-1).join(', ')+' dan '+xs[xs.length-1];
  /* Current state = latest evidence per category (like Kemahiran Fokus uses the
     latest 20 encounters), so a child who has improved leaves the list. */
  const latest=(rs,n)=>rs.length<=n?rs:[...rs].sort((a,b)=>a.t-b.t).slice(-n);
  /* KSSR skills the evidence came from, most mistakes first, so a finding can
     open the Kemahiran Fokus card for the skill where the problem showed. */
  const skillsOf=rs=>{const n=new Map();for(const r of rs){if(!r.s)continue;const x=n.get(r.s)||{s:r.s,bad:0,all:0};x.all++;if(!independent(r))x.bad++;n.set(r.s,x)}
    return[...n.values()].sort((a,b)=>b.bad-a.bad||b.all-a.all||a.s.localeCompare(b.s)).slice(0,3).map(x=>x.s)};

  /* KSSR title for a parent sentence, when the app's META is loaded. */
  const skillTitle=id=>{try{return(typeof META!=='undefined'&&META&&META[id]&&META[id].title)||''}catch(_){return ''}};

  // ---------- bug detectors (lens 4.3) ----------
  function digits(n){return String(Math.abs(Math.trunc(n))).split('').map(Number).reverse()}
  function fromDigits(d){return Number(d.slice().reverse().join(''))||0}
  function smallerFromLarger(a,b){const A=digits(a),B=digits(b),out=[];for(let i=0;i<A.length;i++){const x=A[i],y=B[i]||0;out.push(Math.abs(x-y))}return fromDigits(out)}
  function addNoCarry(a,b){const A=digits(a),B=digits(b),n=Math.max(A.length,B.length),out=[];for(let i=0;i<n;i++)out.push(((A[i]||0)+(B[i]||0))%10);return fromDigits(out)}
  function needsBorrow(a,b){const A=digits(a),B=digits(b);return A.some((x,i)=>x<(B[i]||0))}
  function needsCarry(a,b){const A=digits(a),B=digits(b),n=Math.max(A.length,B.length);for(let i=0;i<n;i++)if((A[i]||0)+(B[i]||0)>9)return true;return false}
  // Column subtraction with one step of the borrowing procedure missing.
  function borrowNoDecrement(a,b){const A=digits(a),B=digits(b),out=[];for(let i=0;i<A.length;i++){const x=A[i],y=B[i]||0;out.push(x<y?x+10-y:x-y)}return fromDigits(out)}
  function borrowFromZero(a,b){const A=digits(a),B=digits(b),out=[];
    for(let i=0;i<A.length;i++){let x=A[i];const y=B[i]||0;
      if(x<y){x+=10;let j=i+1;if(A[j]===0)A[j]=9;else if(j<A.length)A[j]-=1;}   // bug: 0 becomes 9 but the next column is never decremented
      out.push(x-y)}
    return fromDigits(out)}
  const hasBorrowAcrossZero=(a,b)=>{const A=digits(a),B=digits(b);return A.some((x,i)=>x<(B[i]||0)&&A[i+1]===0)};
  const BUGS={
    smaller_from_larger:{op:'sub',test:(a,b,v)=>a>=10&&needsBorrow(a,b)&&v===smallerFromLarger(a,b)&&v!==a-b,
      copy:'Corak: anak tolak digit kecil daripada digit besar dalam setiap lajur, tanpa meminjam',
      example:(a,b)=>`${a} − ${b} jadi ${smallerFromLarger(a,b)}`,
      action:'Latihan tolak yang perlu meminjam, dengan Cikgu tunjuk langkah pinjam satu demi satu'},
    add_no_carry:{op:'add',test:(a,b,v)=>needsCarry(a,b)&&v===addNoCarry(a,b)&&v!==a+b,
      copy:'Corak: anak terlupa mengumpul semula (bawa 1) bila jumlah lajur lebih 9',
      example:(a,b)=>`${a} + ${b} jadi ${addNoCarry(a,b)}`,
      action:'Latihan tambah yang perlu mengumpul semula, dengan nilai tempat ditunjukkan'},
    borrow_no_decrement:{op:'sub',test:(a,b,v)=>a>=10&&needsBorrow(a,b)&&v===borrowNoDecrement(a,b)&&v!==a-b,
      copy:'Corak: anak meminjam 10 tetapi lupa mengurangkan 1 pada lajur sebelah',
      example:(a,b)=>`${a} − ${b} jadi ${borrowNoDecrement(a,b)}`,
      action:'Latihan meminjam dengan blok nilai tempat, menekankan lajur yang "memberi" berkurang satu'},
    borrow_from_zero:{op:'sub',test:(a,b,v)=>a>=100&&hasBorrowAcrossZero(a,b)&&v===borrowFromZero(a,b)&&v!==a-b,
      copy:'Corak: anak keliru bila perlu meminjam melalui sifar (contoh 304 − 127)',
      example:(a,b)=>`${a} − ${b} jadi ${borrowFromZero(a,b)}`,
      action:'Latihan tolak yang ada sifar di tengah, dengan Cikgu tunjuk pinjam berantai'},
    mul_no_placeholder:{op:'mul',test:(a,b,v)=>a>=10&&b>=10&&v!==a*b&&(v===a*(b%10)+a*Math.floor(b/10)||v===b*(a%10)+b*Math.floor(a/10)),
      copy:'Corak: dalam darab bentuk lazim, anak lupa letak sifar (nilai tempat) pada baris kedua',
      example:(a,b)=>`${a} × ${b}`,
      action:'Latihan darab dua digit dengan baris kedua dimulakan sifar sebagai penanda nilai tempat'},
    times_neighbour:{op:'mul',test:(a,b,v)=>a<=12&&b<=12&&v!==a*b&&(v===a*(b+1)||v===a*(b-1)||v===(a+1)*b||v===(a-1)*b),
      copy:'Corak: jawapan sifir tersasar satu langkah (contoh jawab 7×7 untuk 7×8) — tanda anak mengira dari fakta berdekatan',
      example:(a,b)=>`${a} × ${b}`,
      action:'Latihan ingat sifir pantas untuk fakta yang tersasar'},
    wrong_operation:{op:'any',test:(a,b,v,op)=>(op==='sub'&&v===a+b)||(op==='add'&&a!==b&&v===Math.abs(a-b))||(op==='mul'&&v===a+b),
      copy:'Corak: anak memilih operasi yang salah (contoh menambah bila soalan minta tolak)',
      example:(a,b,op)=>`${a} ${op==='add'?'+':op==='mul'?'×':'−'} ${b}`,
      action:'Soalan "operasi mana?" sebelum mengira, dan baca semula kata kunci soalan'}
  };
  // Bugs read from the correct answer alone (no operands needed, e.g. word problems).
  const ANSWER_BUGS={
    money_unit:{test:(v,x,r)=>r.c==='money'&&x>0&&v>0&&(Math.abs(v-x*100)<1e-6||Math.abs(v*100-x)<1e-6),
      copy:'Corak: anak keliru antara sen dan ringgit (jawapan 100 kali terlalu besar atau kecil)',
      example:(r)=>`jawapan ${r.v} untuk ${r.x}`,
      action:'Latihan menukar sen kepada RM (RM1 = 100 sen) sebelum mengira'},
    place_value_shift:{test:(v,x,r)=>['add','sub','mul','div'].includes(r.o)&&x>=1&&v>=1&&(Math.abs(v-x*10)<1e-6||Math.abs(v*10-x)<1e-6),
      copy:'Corak: jawapan tersasar satu nilai tempat (10 kali terlalu besar atau kecil)',
      example:(r)=>`jawapan ${r.v} untuk ${r.x}`,
      action:'Latihan menyusun nombor ikut lajur sa, puluh dan ratus sebelum mengira'}
  };
  function detectBug(r){
    if(r.v===undefined)return null;
    if(r.a){
      const [a,b]=r.a,v=num(r.v);
      if(Number.isFinite(v))for(const [id,bug] of Object.entries(BUGS)){if((bug.op===r.o||bug.op==='any')&&bug.test(a,b,v,r.o))return id}
    }
    if(r.x!==undefined){
      const v=numIn(r.v),x=numIn(r.x);
      if(Number.isFinite(v)&&Number.isFinite(x))for(const [id,bug] of Object.entries(ANSWER_BUGS)){if(bug.test(v,x,r))return id}
    }
    return null;
  }

  // ---------- analysis ----------
  function analyze(log,opts={}){
    const now=opts.now||Date.now(),name=String(opts.name||'Anak').trim()||'Anak';
    const recs=(Array.isArray(log)?log:[]).filter(r=>r&&r.t&&now-r.t<=WINDOW_DAYS*864e5&&r.t<=now+6e4);
    const findings=[];
    if(recs.length<5)return{findings,strengths:[],total:recs.length,enough:false,name};
    const scored=recs.filter(r=>!(r.k===0&&isRapid(r))); // rapid guesses are not ability evidence

    // 4.5 rapid guessing
    const wrong=latest(recs,40).filter(r=>r.k===0),rapidWrong=wrong.filter(isRapid);
    if(rapidWrong.length>=5&&rapidWrong.length/wrong.length>=.4){
      findings.push({id:'rapid_guess',lens:'4.5',severity:3,confidence:rapidWrong.length>=10?'tinggi':'sederhana',
        text:`Banyak soalan dijawab terlalu cepat — ${rapidWrong.length} daripada ${wrong.length} jawapan salah diberi dalam beberapa saat sahaja. Kemungkinan ${name} meneka.`,
        action:'Pahlawan Angka akan minta anak bertenang dan membaca semula; jika meneka berterusan, Wira jatuh ke Portal Restu dan ibu bapa membukanya dengan PIN.',
        tip:'Duduk bersama anak untuk 3 soalan pertama dan minta dia sebut jawapan dengan kuat sebelum menekan.',
        evidence:{rapidWrong:rapidWrong.length,wrong:wrong.length}});
    }

    // 4.2 fact fluency per table
    const byTable=new Map();
    for(const r of scored)for(const t of(r.tb||[])){if(!byTable.has(t))byTable.set(t,[]);byTable.get(t).push(r)}
    const weakT=[],slowT=[],fluentT=[];
    /* 4 × 7 belongs to sifir 4 and sifir 7. Explain away: confirm the weakest table first,
       then judge the others without the questions that share a confirmed weak table. */
    const tStat=(t,skip)=>{const all=(byTable.get(t)||[]).filter(r=>!(r.tb||[]).some(x=>x!==t&&skip.has(x)));
      if(all.length<(skip.size?6:8))return null;const rs=latest(all,20),ok=rs.filter(independent);
      return{t,acc:pct(ok.length,rs.length),n:rs.length,ok:ok.length,med:median(ok.map(r=>r.sec))}};
    // Small samples lie: weak only when we are ~95% sure true accuracy is below 80% (Wilson upper bound).
    const wilsonHi=(k,n,z=1.645)=>{const p=k/n,d=1+z*z/n;return(p+z*z/(2*n)+z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n)))/d};
    const weakSet=new Set();
    for(;;){
      const cand=[...byTable.keys()].filter(t=>!weakSet.has(t)).map(t=>tStat(t,weakSet)).filter(x=>x&&x.acc<70&&wilsonHi(x.ok,x.n)<.8).sort((a,b)=>a.acc-b.acc);
      if(!cand.length)break;weakSet.add(cand[0].t);weakT.push(cand[0]);
    }
    weakT.sort((a,b)=>a.t-b.t);
    for(const t of [...byTable.keys()].sort((a,b)=>a-b)){
      if(weakSet.has(t))continue;const x=tStat(t,weakSet);if(!x)continue;
      if(x.acc>=80&&x.med>3)slowT.push(x);
      else if(x.acc>=90&&x.med<=3)fluentT.push(t);
    }
    if(weakT.length||slowT.length){
      const parts=[];
      if(weakT.length)parts.push(`sifir ${joinBM(weakT.map(x=>x.t))} belum dikuasai (${weakT.map(x=>`${x.ok}/${x.n}`).join(', ')} betul)`);
      if(slowT.length)parts.push(`sifir ${joinBM(slowT.map(x=>x.t))} betul tetapi lambat (purata ${Math.round(median(slowT.map(x=>x.med)))} saat) — anak masih mengira, belum ingat`);
      const lead=fluentT.length>=3?`Hebat dalam sifir ${joinBM(fluentT.slice(0,4))}; cuma `:'';
      const target=[...weakT,...slowT].map(x=>x.t);
      findings.push({id:'fact_fluency',lens:'4.2',severity:weakT.length?3:2,confidence:'tinggi',
        text:`${lead}${parts.join('; ')}.`.replace(/^./,c=>c.toUpperCase()),
        action:`Pahlawan Angka akan beri lebih banyak latihan sifir ${joinBM(target)} dalam mini game, bercampur dengan sifir yang sudah dikuasai.`,
        tip:`Uji sifir ${target[0]} secara lisan 2 minit sehari — dalam kereta atau sebelum tidur.`,
        target:{tables:target},skills:skillsOf(scored.filter(r=>(r.tb||[]).some(t=>target.includes(t)))),evidence:{weak:weakT,slow:slowT,fluent:fluentT}});
    }else if(fluentT.length>=3){
      findings.push({id:'fact_strength',lens:'4.2',severity:0,confidence:'tinggi',strength:true,
        text:`Hebat dalam sifir ${joinBM(fluentT)} — tepat dan pantas.`,action:'',evidence:{fluent:fluentT}});
    }

    // operation inside a context (money, time, ...)
    for(const ctx of['money','time','measure']){
      const all=scored.filter(r=>r.c===ctx);if(all.length<8)continue;const rs=latest(all,20);
      const okN=rs.filter(independent).length,acc=pct(okN,rs.length);if(acc>=70)continue;
      const wrongs=rs.filter(r=>!independent(r)),byOp={};
      for(const r of rs){if(!OP_WORD[r.o])continue;(byOp[r.o]=byOp[r.o]||{n:0,bad:0}).n++;if(!independent(r))byOp[r.o].bad++}
      const top=Object.entries(byOp).filter(([,x])=>x.n>=4).sort((a,b)=>b[1].bad-a[1].bad)[0];
      const focus=top&&wrongs.length&&top[1].bad/wrongs.length>=.6&&pct(top[1].n-top[1].bad,top[1].n)<=50?top[0]:null;
      findings.push({id:`context_${ctx}`,lens:'context',severity:3,confidence:rs.length>=15?'tinggi':'sederhana',
        text:`${CTX_WORD[ctx][0].toUpperCase()+CTX_WORD[ctx].slice(1)}: ${acc}% betul (${okN}/${rs.length})${focus?`, dan hampir semua kesilapan melibatkan operasi ${OP_WORD[focus]}`:''}.`,
        action:focus?`Pahlawan Angka akan fokus latihan operasi ${OP_WORD[focus]} dalam soalan ${CTX_WORD[ctx]}.`:`Pahlawan Angka akan beri lebih banyak latihan ${CTX_WORD[ctx]} bermula dari tahap yang lebih mudah.`,
        tip:ctx==='money'?`Main jual-beli di rumah dengan duit sebenar${focus?` dan minta anak kira ${OP_WORD[focus]==='tolak'?'baki':'jumlah'}`:''}.`:'Kaitkan dengan aktiviti harian anak.',
        target:{context:ctx,op:focus},skills:skillsOf(rs),evidence:{accuracy:acc,n:rs.length,byOp}});
    }

    // 4.4 bentuk lazim vs ayat (same arithmetic skills)
    {
      const arith=scored.filter(r=>OP_WORD[r.o]);
      const laz=latest(arith.filter(r=>r.f==='lazim'||r.f==='symbolic'),15),word=latest(arith.filter(r=>r.f==='word'),15);
      if(laz.length>=6&&word.length>=6){
        const la=pct(laz.filter(independent).length,laz.length),wa=pct(word.filter(independent).length,word.length);
        if(la>=80&&wa<=55)findings.push({id:'format_word',lens:'4.4',severity:2,confidence:'sederhana',
          text:`Soalan bentuk lazim hampir semua betul (${la}%), tetapi ${name} keliru bila soalan dalam ayat (${wa}%).`,
          action:'Worksheet akan fokus soalan berayat (bukan bentuk lazim); ibu bapa diminta semak cara kerja anak.',
          tip:'Minta anak lukis gambar atau bar ringkas untuk setiap soalan cerita sebelum mengira.',
          target:{format:'word'},skills:skillsOf(word),evidence:{lazim:la,word:wa}});
      }
    }

    // 4.3 systematic bugs
    {
      const hits={},opportunity={
        smaller_from_larger:r=>r.o==='sub'&&r.rg===1,borrow_no_decrement:r=>r.o==='sub'&&r.rg===1,borrow_from_zero:r=>r.o==='sub'&&r.rg===1,
        add_no_carry:r=>r.o==='add'&&r.rg===1,times_neighbour:r=>r.o==='mul'&&!!r.tb,mul_no_placeholder:r=>r.o==='mul'&&!r.tb,
        wrong_operation:r=>!!OP_WORD[r.o],money_unit:r=>r.c==='money',place_value_shift:r=>!!OP_WORD[r.o]};
      // Guesses are not evidence of a bug: only considered (non-rapid) wrong answers count.
      for(const r of scored.filter(r=>r.k===0)){const b=detectBug(r);if(!b)continue;(hits[b]=hits[b]||[]).push(r)}
      for(const [id,rs] of Object.entries(hits)){
        const distinct=new Set(rs.map(r=>r.a?r.a.join(','):`${r.x}|${r.v}`)).size;
        if(rs.length<3||distinct<2)continue;
        // Recovered: the latest 6 chances to make this mistake were mostly right.
        const chances=latest(scored.filter(opportunity[id]||(()=>false)),6);
        // Only "improved" when those chances came after the pattern was seen.
        if(chances.length>=6&&chances.filter(independent).length>=5&&chances[0].t>rs[Math.min(2,rs.length-1)].t){
          const bug=BUGS[id]||ANSWER_BUGS[id];
          findings.push({id:`improved_${id}`,lens:'4.3',severity:0,confidence:'sederhana',strength:true,
            text:`Semakin baik: ${bug.copy.replace(/^Corak: /,'').replace(/^anak /,'')} kini jarang berlaku — ${chances.filter(independent).length}/6 soalan terakhir betul.`,action:''});
          continue;
        }
        const ex=rs[rs.length-1],bug=BUGS[id]||ANSWER_BUGS[id];
        const example=BUGS[id]?bug.example(ex.a[0],ex.a[1],ex.o):bug.example(ex);
        findings.push({id:`bug_${id}`,lens:'4.3',severity:3,confidence:rs.length>=5?'tinggi':'sederhana',
          text:`${bug.copy} (${rs.length} kali, contoh ${example}).`,
          action:`Pahlawan Angka akan beri ${bug.action.charAt(0).toLowerCase()+bug.action.slice(1)}.`,
          tip:'Minta anak terangkan langkahnya dengan kuat untuk satu soalan — biasanya corak salah akan kelihatan.',
          target:{bug:id,op:ex.o},skills:skillsOf(rs),evidence:{count:rs.length,distinct}});
      }
    }

    // basic facts to 20 (Darjah 1–2)
    {
      const FAM={add20:'tambah asas hingga 20',sub20:'tolak asas hingga 20'};
      const parts=[],targets=[],hard=[];let weakAny=false;const fluent=[];
      for(const fam of Object.keys(FAM)){
        const all=scored.filter(r=>r.fx===fam);if(all.length<8)continue;const rs=latest(all,20);
        const ok=rs.filter(independent),acc=pct(ok.length,rs.length),med=median(ok.map(r=>r.sec));
        const missed={};for(const r of rs.filter(r=>!independent(r)))missed[r.fk]=(missed[r.fk]||0)+1;
        const topRaw=Object.entries(missed).filter(([,n])=>n>=2).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([f])=>f);hard.push(...topRaw);
        const top=topRaw.map(f=>f.replace('-',' − ').replace('+',' + '));
        if(acc<70){weakAny=true;targets.push(fam);parts.push(`${FAM[fam]} belum kukuh (${ok.length}/${rs.length} betul${top.length?`, paling kerap salah: ${top.join(', ')}`:''})`)}
        else if(acc>=80&&med>3){targets.push(fam);parts.push(`${FAM[fam]} betul tetapi lambat (purata ${Math.round(med)} saat) — anak masih mengira jari`)}
        else if(acc>=90&&med<=3)fluent.push(FAM[fam]);
      }
      if(parts.length)findings.push({id:'basic_facts',lens:'4.2',severity:weakAny?3:2,confidence:'tinggi',
        text:`${parts.join('; ')}.`.replace(/^./,c=>c.toUpperCase()),
        action:`Pahlawan Angka akan beri latihan ingat pantas ${joinBM(targets.map(f=>FAM[f]))}, sedikit setiap hari.`,
        tip:'Main "cepat sebut" 2 minit: ibu bapa sebut soalan seperti 8 + 7, anak jawab tanpa jari.',
        target:{factFamilies:targets,facts:hard},skills:skillsOf(scored.filter(r=>targets.includes(r.fx))),evidence:{parts}});
      else if(fluent.length)findings.push({id:'basic_strength',lens:'4.2',severity:0,confidence:'tinggi',strength:true,
        text:`Hebat dalam ${joinBM(fluent)} — tepat dan pantas.`,action:'',evidence:{facts:fluent}});
    }

    // regrouping (meminjam / mengumpul semula) — skipped when a bug already explains it
    for(const [op,word,gerund,bugs] of [['sub','tolak','meminjam',['bug_smaller_from_larger','bug_borrow_no_decrement','bug_borrow_from_zero']],['add','tambah','mengumpul semula',['bug_add_no_carry']]]){
      if(findings.some(f=>bugs.includes(f.id)))continue;
      const rs=scored.filter(r=>r.o===op&&(r.rg===0||r.rg===1)),reg=latest(rs.filter(r=>r.rg===1),10),non=latest(rs.filter(r=>r.rg===0),10);
      if(reg.length<5||non.length<5)continue;
      const ra=pct(reg.filter(independent).length,reg.length),na=pct(non.filter(independent).length,non.length);
      if(na>=80&&ra<=55)findings.push({id:`regroup_${op}`,lens:'4.3',severity:2,confidence:reg.length>=10?'tinggi':'sederhana',
        text:`${word[0].toUpperCase()+word.slice(1)} betul bila tidak perlu ${gerund} (${na}%), tetapi banyak salah bila perlu ${gerund} (${ra}%).`,
        action:`Pahlawan Angka akan beri latihan ${word} yang perlu ${gerund}, dengan blok nilai tempat ditunjukkan.`,
        tip:`Guna 10 batang aiskrim diikat sebagai "puluh" untuk tunjuk cara ${gerund}.`,
        target:{op,regroup:true},skills:skillsOf(reg),evidence:{regroup:ra,plain:na}});
    }

    // 4.1 CPA: the same skill is right with a picture (or blocks) and wrong with numbers only.
    // Steps aside for a skill whose sifir / basic-fact finding already explains it (counting the picture).
    {
      const explained=new Set(findings.filter(f=>f.id==='fact_fluency'||f.id==='basic_facts').flatMap(f=>f.skills||[]));
      const bySkill=new Map();
      // Same skill and same operation, so "with picture" and "numbers only" ask the same thing.
      for(const r of scored){if(!r.s||!r.rp||explained.has(r.s))continue;const k=r.s+'|'+(r.o||'none');(bySkill.get(k)||bySkill.set(k,[]).get(k)).push(r)}
      const gaps=[];
      for(const [k,rs] of bySkill){const [skill,op]=k.split('|');
        const pic=latest(rs.filter(r=>r.rp==='p'||r.rp==='c'),10),abs=latest(rs.filter(r=>r.rp==='a'),10);
        if(pic.length<6||abs.length<6)continue;
        const pOk=pic.filter(independent).length,aOk=abs.filter(independent).length,pa=pct(pOk,pic.length),aa=pct(aOk,abs.length);
        if(pa-aa>=25)gaps.push({skill,op,pa,aa,pic:`${pOk}/${pic.length}`,abs:`${aOk}/${abs.length}`,gap:pa-aa});
      }
      gaps.sort((a,b)=>b.gap-a.gap);
      if(gaps.length){
        const g=gaps[0],title=skillTitle(g.skill);
        findings.push({id:'rep_cpa',lens:'4.1',severity:2,confidence:gaps.length>1||Number(g.abs.split('/')[1])>=10?'tinggi':'sederhana',
          text:`${title?title+': ':''}${name} mudah jawab bila ada gambar (${g.pic} betul), tetapi tanpa gambar hanya ${g.abs}.`,
          action:'Pahlawan Angka akan kurangkan gambar sedikit demi sedikit — gambar, kemudian gambar dengan nombor, kemudian nombor sahaja — dan semak soalan tanpa gambar setiap pusingan ketiga.',
          tip:'Selepas anak jawab dengan gambar atau benda sebenar, tulis ayat matematiknya bersama (contoh 3 × 4 = 12) supaya anak nampak kaitannya.',
          target:{rep:'fade',skill:g.skill,op:g.op},skills:[...new Set(gaps.map(x=>x.skill))].slice(0,3),evidence:{gaps}});
      }
    }

    // 4.8 language load: the same family (operation + context) is right in a short wording and wrong in a long one.
    // Only a generator that wrote both wordings tags rd (1 short, 3 long). A long question heard read aloud
    // first (ra 1) is not "read alone"; it and a miss put right after hearing it (ra 2) support the finding.
    {
      const weakTables=new Set(findings.filter(f=>f.id==='fact_fluency').flatMap(f=>f.target?.tables||[]));
      const weakFacts=new Set(findings.filter(f=>f.id==='basic_facts').flatMap(f=>f.target?.factFamilies||[]));
      const bugs=new Set(findings.filter(f=>f.id.startsWith('bug_')).map(f=>f.id.slice(4)));
      const explains=r=>(r.tb||[]).some(t=>weakTables.has(t))||weakFacts.has(r.fx)||bugs.has(detectBug(r));
      const byFam=new Map();
      for(const r of scored){if(!OP_WORD[r.o]||(r.rd!==1&&r.rd!==3))continue;const k=r.o+'|'+(r.c||'plain');(byFam.get(k)||byFam.set(k,[]).get(k)).push(r)}
      const gaps=[];
      for(const [k,rs] of byFam){const [op,context]=k.split('|');
        const short=latest(rs.filter(r=>r.rd===1),10),long=latest(rs.filter(r=>r.rd===3&&r.ra!==1),10);
        if(short.length<6||long.length<6)continue;
        const sOk=short.filter(independent).length,lOk=long.filter(independent).length,sa=pct(sOk,short.length),la=pct(lOk,long.length);
        if(sa<80||la>50)continue;
        // A weak sifir, basic fact or a known bug already explains most long misses: not a reading problem.
        const misses=long.filter(r=>!independent(r));
        if(misses.filter(explains).length*2>=misses.length)continue;
        const heard=latest(rs.filter(r=>r.rd===3&&r.ra===1),10),hOk=heard.filter(independent).length,rescued=long.filter(r=>r.ra===2&&r.r===1).length;
        gaps.push({op,context,short:`${sOk}/${short.length}`,long:`${lOk}/${long.length}`,gap:sa-la,heard:heard.length?`${hOk}/${heard.length}`:null,rescued,recs:long});
      }
      gaps.sort((a,b)=>b.gap-a.gap);
      if(gaps.length){
        const g=gaps[0],fam=`${OP_WORD[g.op]}${g.context==='money'?' wang':''}`,hOk=g.heard?Number(g.heard.split('/')[0]):0;
        const support=[hOk>=2?` Bila soalan dibacakan, ${name} betul ${g.heard}.`:'',g.rescued>=2?` ${g.rescued} kali ${name} betul selepas mendengar soalan.`:''].join('');
        findings.push({id:'reading_load',lens:'4.8',severity:2,confidence:support||gaps.length>1?'tinggi':'sederhana',
          text:`Matematik ${name} ok — yang menyukarkan ialah ayat panjang. Soalan ${fam} dengan ayat pendek betul ${g.short}, tetapi dengan ayat panjang hanya ${g.long}.${support}`,
          action:'Pahlawan Angka akan beri soalan berayat pendek dahulu, kemudian ayat yang lebih panjang sedikit demi sedikit. Butang speaker boleh membacakan soalan.',
          tip:'Bila membaca soalan panjang bersama anak, minta dia tunjuk nombor dan perkataan penting (jumlah, beza, kali ganda, sama rata) sebelum mengira.',
          target:{reading:true,op:g.op,context:g.context},skills:skillsOf(g.recs),evidence:{gaps:gaps.map(({recs,...x})=>x)}});
        // Short word problems are right, so the bar-model structure is not the gap (lens 4.4 steps aside).
        const i=findings.findIndex(f=>f.id==='format_word');if(i>=0)findings.splice(i,1);
      }
    }

    // 4.6 strategy choice: word problems are right when the same operation comes in a row (blocked) and
    // wrong when tambah, tolak, darab and bahagi are mixed. In a word problem the sign is not shown, so the
    // child must choose it; symbolic items are left out.
    {
      const weakTables=new Set(findings.filter(f=>f.id==='fact_fluency').flatMap(f=>f.target?.tables||[]));
      const weakFacts=new Set(findings.filter(f=>f.id==='basic_facts').flatMap(f=>f.target?.factFamilies||[]));
      const bugs=new Set(findings.filter(f=>f.id.startsWith('bug_')).map(f=>f.id.slice(4)));
      const reading=findings.some(f=>f.id==='reading_load');
      const words=scored.filter(r=>r.f==='word'&&OP_WORD[r.o]&&(r.il===0||r.il===1));
      const blocked=latest(words.filter(r=>r.il===0),12),mixed=latest(words.filter(r=>r.il===1),12);
      if(blocked.length>=6&&mixed.length>=6){
        const bOk=blocked.filter(independent).length,mOk=mixed.filter(independent).length,ba=pct(bOk,blocked.length),ma=pct(mOk,mixed.length);
        // A weak sifir, basic fact, long wording (4.8) or another bug already explains most mixed misses.
        const misses=mixed.filter(r=>!independent(r)),wrongOp=misses.filter(r=>detectBug(r)==='wrong_operation').length;
        const explains=r=>{const b=detectBug(r);return(r.tb||[]).some(t=>weakTables.has(t))||weakFacts.has(r.fx)||(reading&&r.rd===3&&r.ra!==1)||(!!b&&b!=='wrong_operation'&&bugs.has(b))};
        if(ba>=80&&ma<=55&&misses.filter(explains).length*2<misses.length){
          findings.push({id:'strategy_choice',lens:'4.6',severity:2,confidence:wrongOp>=2||mixed.length>=10?'tinggi':'sederhana',
            // One plain sentence for parents; the blocked score and the wrong-operation count stay in evidence.
            text:`${name} keliru memilih operasi bila soalan bercampur (${mOk}/${mixed.length} betul).`,
            action:'Pahlawan Angka akan beri set soalan cerita bercampur. Anak pilih ayat matematik dahulu, kemudian baru mengira.',
            tip:'Sebelum anak mengira, tanya: "Soalan ini minta kita gabung, ambil, kumpul sama banyak, atau agih sama rata?"',
            target:{choose:true},skills:skillsOf(mixed),evidence:{blocked:`${bOk}/${blocked.length}`,mixed:`${mOk}/${mixed.length}`,wrongOp}});
          // The finer cause wins: right in a blocked run, so neither the story (4.4) nor a habit of one operation (4.3) is the gap.
          for(const id of ['format_word','bug_wrong_operation']){const i=findings.findIndex(f=>f.id===id);if(i>=0)findings.splice(i,1)}
        }
      }
    }

    // 4.7 retention: mastered earlier, slipping in the last 3 days
    {
      const cut=now-3*864e5,slips=[],slipped=[];
      const groups=new Map();
      for(const r of scored){for(const t of(r.tb||[]))(groups.get(`sifir ${t}`)||groups.set(`sifir ${t}`,[]).get(`sifir ${t}`)).push(r);
        if(r.fx){const k=r.fx==='add20'?'tambah asas':'tolak asas';(groups.get(k)||groups.set(k,[]).get(k)).push(r)}}
      for(const [label,rs] of groups){
        const old=rs.filter(r=>r.t<cut),fresh=rs.filter(r=>r.t>=cut);
        if(old.length<5||fresh.length<4)continue;
        const oa=pct(old.filter(independent).length,old.length),fa=pct(fresh.filter(independent).length,fresh.length);
        if(oa>=90&&fa<=60){slips.push({label,oa,fa,old:`${old.filter(independent).length}/${old.length}`,fresh:`${fresh.filter(independent).length}/${fresh.length}`});slipped.push(...fresh)}
      }
      if(slips.length)findings.push({id:'retention',lens:'4.7',severity:2,confidence:'sederhana',
        text:`${joinBM(slips.map(x=>x.label))} sudah mantap sebelum ini (${slips.map(x=>x.old).join(', ')}), tetapi dalam 3 hari terakhir mula lupa (${slips.map(x=>x.fresh).join(', ')}).`.replace(/^./,c=>c.toUpperCase()),
        action:`Pahlawan Angka akan ulang kaji ${joinBM(slips.map(x=>x.label))} secara berjadual (selepas 1, 3 dan 7 hari) supaya ingatan kekal.`,
        tip:'Ulang kaji sekejap lebih berkesan daripada latihan panjang sekali-sekala.',
        target:{review:slips.map(x=>x.label)},skills:skillsOf(slipped),evidence:{slips}});
    }

    const strengths=findings.filter(f=>f.strength);
    const issues=findings.filter(f=>!f.strength).sort((a,b)=>b.severity-a.severity||(b.confidence==='tinggi')-(a.confidence==='tinggi'));
    return{findings:issues.slice(0,4),strengths,total:recs.length,enough:true,name};
  }

  // ---------- parent card ----------
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function cardMarkup(result){
    const r=result||{findings:[],strengths:[],total:0,enough:false,name:'Anak'};
    const head=`<div class="paToolHead"><span class="paToolIcon">✦</span><div><small>RINGKASAN CIKGU DIMENSI</small><h3>Apa yang kami nampak pada ${esc(r.name)}</h3></div></div>`;
    if(!r.enough||(!r.findings.length&&!r.strengths.length))
      return `<section class="paExportCard paDiagCard">${head}<p class="paToolCopy">Bukti awal — ${esc(r.name)} perlu menjawab lebih banyak soalan (${r.total}/20) sebelum Cikgu boleh menerangkan corak dengan yakin.</p></section>`;
    const items=[...r.strengths.slice(0,2),...r.findings];
    const list=items.map((f,i)=>`<li class="${f.strength?'good':''}"><b>${i+1}</b><span>${esc(f.text)}</span></li>`).join('');
    const acts=r.findings.filter(f=>f.action).map((f,i)=>`<li><b>${i+1}</b><span>${esc(f.action)}</span></li>`).join('');
    const tip=r.findings.find(f=>f.tip)?.tip;
    return `<section class="paExportCard paDiagCard">${head}
      <h4 class="paDiagH">Ringkasan</h4><ol class="paDiagList">${list}</ol>
      ${acts?`<h4 class="paDiagH">Apa Pahlawan Angka akan buat</h4><ol class="paDiagList act">${acts}</ol>`:''}
      ${tip?`<p class="paDiagTip"><b>Cara ibu bapa boleh bantu:</b> ${esc(tip)}</p>`:''}
      <p class="paDiagNote">Berdasarkan ${r.total} jawapan dalam ${WINDOW_DAYS} hari terakhir. Dapatan hanya dipaparkan bila buktinya cukup.</p>
    </section>`;
  }

  // ---------- browser wiring ----------
  // db / sess / META are top-level `let`/`const` in classic scripts, so they
  // are reachable by name but are not properties of window.
  const liveDb=()=>{try{return typeof db!=='undefined'?db:null}catch(_){return null}};
  const liveSess=()=>{try{return typeof sess!=='undefined'?sess:null}catch(_){return null}};
  const liveMeta=id=>{try{return typeof META!=='undefined'?META[id]||null:null}catch(_){return null}};
  function record(skillId,ok,tag,sec,usedHint,q,mode,value){
    try{
      const d=liveDb();if(!d||d.demoMode)return false;
      const s=liveSess();if(s?.devBattlefield||s?.demoMode)return false;
      d.diagLog=applyResponse(d.diagLog,{q:{...(q||{}),skill:q?.skill||skillId},meta:liveMeta(skillId),ok,sec,usedHint,mode,value,at:Date.now()});
      return true;
    }catch(_){return false}
  }
  function current(){const d=liveDb();return analyze(d?.diagLog,{name:d?.name})}

  return{VERSION,facets,applyResponse,analyze,detectBug,cardMarkup,record,current,_floor:floor};
});
