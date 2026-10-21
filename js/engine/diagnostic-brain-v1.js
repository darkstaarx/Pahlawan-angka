/* Pahlawan Angka — Diagnostic Brain v1 (Phase 1 of docs/PA-DIAGNOSTIC-BRAIN.md).
   1) facets(q): deterministic facet tags for a question (explicit q.facets win;
      otherwise derived from skill metadata, archetype, context and the equation).
   2) record(...): keeps a compact per-answer log in db.diagLog (first attempt,
      wrong value, seconds, hint) — on the child's own profile only.
   3) analyze(log): evidence-gated findings for lenses 4.2 (fact fluency),
      4.3 (error bugs), 4.4 (lazim vs word), 4.5 (rapid guessing) plus
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
  const VERSION='1.0.0';
  const LOG_MAX=500, WINDOW_DAYS=30;
  const OP_WORD={add:'tambah',sub:'tolak',mul:'darab',div:'bahagi'};
  const CTX_WORD={money:'wang',time:'masa',measure:'ukuran',fraction:'pecahan',decimal:'perpuluhan',plain:'nombor'};
  const DOMAIN_CTX={Wang:'money',Masa:'time',Ukuran:'measure',Pecahan:'fraction',Perpuluhan:'decimal'};

  // ---------- facets ----------
  const strip=html=>String(html??'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
  const num=s=>Number(String(s).replace(/,/g,''));
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
    return{skill:q?.skill||given.skill||null,op,context,format,tables:tables&&tables.length?tables:null,
      operands:eq&&eq.op===op?[eq.a,eq.b]:null,words};
  }

  // ---------- recording ----------
  function compact(f,{ok,sec,hint,value,at}){
    const r={t:at,s:f.skill,o:f.op,c:f.context,f:f.format,k:ok?1:0,sec:Math.round((Number(sec)||0)*10)/10,w:f.words};
    if(f.tables)r.tb=f.tables;
    if(f.operands)r.a=f.operands;
    if(hint)r.h=1;
    if(!ok&&value!==undefined&&value!==null&&value!=='')r.v=String(value).slice(0,24);
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
        if(list[i].id===token){list[i].r=ok?1:0;if(usedHint)list[i].h=1;return list;}
      }
    }
    const f=facets(q,meta);
    return pushRecord(list,compact(f,{ok:first?false:!!ok,sec,hint:!!usedHint,value,at:at||Date.now()}),token);
  }

  // ---------- analysis helpers ----------
  const pct=(a,b)=>b?Math.round(a/b*100):0;
  const median=xs=>{if(!xs.length)return 0;const s=[...xs].sort((a,b)=>a-b),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2};
  const independent=r=>r.k===1&&!r.h;
  // Same reading-load floor as js/effort-guard-v3.32.0.js limit().
  const floor=r=>Math.min(3.2,Math.max(1.8,1.35+(Number(r.w)||0)*5.5*.018));
  const isRapid=r=>r.sec>0&&r.sec<floor(r);
  const joinBM=xs=>xs.length<=1?String(xs[0]??''):xs.slice(0,-1).join(', ')+' dan '+xs[xs.length-1];

  // ---------- bug detectors (lens 4.3) ----------
  function digits(n){return String(Math.abs(Math.trunc(n))).split('').map(Number).reverse()}
  function fromDigits(d){return Number(d.slice().reverse().join(''))||0}
  function smallerFromLarger(a,b){const A=digits(a),B=digits(b),out=[];for(let i=0;i<A.length;i++){const x=A[i],y=B[i]||0;out.push(Math.abs(x-y))}return fromDigits(out)}
  function addNoCarry(a,b){const A=digits(a),B=digits(b),n=Math.max(A.length,B.length),out=[];for(let i=0;i<n;i++)out.push(((A[i]||0)+(B[i]||0))%10);return fromDigits(out)}
  function needsBorrow(a,b){const A=digits(a),B=digits(b);return A.some((x,i)=>x<(B[i]||0))}
  function needsCarry(a,b){const A=digits(a),B=digits(b),n=Math.max(A.length,B.length);for(let i=0;i<n;i++)if((A[i]||0)+(B[i]||0)>9)return true;return false}
  const BUGS={
    smaller_from_larger:{op:'sub',test:(a,b,v)=>a>=10&&needsBorrow(a,b)&&v===smallerFromLarger(a,b)&&v!==a-b,
      copy:'Corak: anak tolak digit kecil daripada digit besar dalam setiap lajur, tanpa meminjam',
      example:(a,b)=>`${a} − ${b} jadi ${smallerFromLarger(a,b)}`,
      action:'Latihan tolak yang perlu meminjam, dengan Cikgu tunjuk langkah pinjam satu demi satu'},
    add_no_carry:{op:'add',test:(a,b,v)=>needsCarry(a,b)&&v===addNoCarry(a,b)&&v!==a+b,
      copy:'Corak: anak terlupa mengumpul semula (bawa 1) bila jumlah lajur lebih 9',
      example:(a,b)=>`${a} + ${b} jadi ${addNoCarry(a,b)}`,
      action:'Latihan tambah yang perlu mengumpul semula, dengan nilai tempat ditunjukkan'},
    times_neighbour:{op:'mul',test:(a,b,v)=>a<=12&&b<=12&&v!==a*b&&(v===a*(b+1)||v===a*(b-1)||v===(a+1)*b||v===(a-1)*b),
      copy:'Corak: jawapan sifir tersasar satu langkah (contoh jawab 7×7 untuk 7×8) — tanda anak mengira dari fakta berdekatan',
      example:(a,b)=>`${a} × ${b}`,
      action:'Latihan ingat sifir pantas untuk fakta yang tersasar'},
    wrong_operation:{op:'any',test:(a,b,v,op)=>(op==='sub'&&v===a+b)||(op==='add'&&a!==b&&v===Math.abs(a-b))||(op==='mul'&&v===a+b),
      copy:'Corak: anak memilih operasi yang salah (contoh menambah bila soalan minta tolak)',
      example:(a,b,op)=>`${a} ${op==='add'?'+':op==='mul'?'×':'−'} ${b}`,
      action:'Soalan "operasi mana?" sebelum mengira, dan baca semula kata kunci soalan'}
  };
  function detectBug(r){
    if(!r.a||r.v===undefined)return null;
    const [a,b]=r.a,v=num(r.v);if(!Number.isFinite(v))return null;
    for(const [id,bug] of Object.entries(BUGS)){if((bug.op===r.o||bug.op==='any')&&bug.test(a,b,v,r.o))return id}
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
    const wrong=recs.filter(r=>r.k===0),rapidWrong=wrong.filter(isRapid);
    if(rapidWrong.length>=5&&rapidWrong.length/wrong.length>=.4){
      findings.push({id:'rapid_guess',lens:'4.5',severity:3,confidence:rapidWrong.length>=10?'tinggi':'sederhana',
        text:`Banyak soalan dijawab terlalu cepat — ${rapidWrong.length} daripada ${wrong.length} jawapan salah diberi dalam beberapa saat sahaja. Kemungkinan ${name} meneka.`,
        action:'Pahlawan Angka akan minta anak bertenang dan membaca semula; jika meneka berterusan, game dikunci sehingga ibu bapa buka dengan PIN.',
        tip:'Duduk bersama anak untuk 3 soalan pertama dan minta dia sebut jawapan dengan kuat sebelum menekan.',
        evidence:{rapidWrong:rapidWrong.length,wrong:wrong.length}});
    }

    // 4.2 fact fluency per table
    const byTable=new Map();
    for(const r of scored)for(const t of(r.tb||[])){if(!byTable.has(t))byTable.set(t,[]);byTable.get(t).push(r)}
    const weakT=[],slowT=[],fluentT=[];
    for(const [t,rs] of [...byTable].sort((a,b)=>a[0]-b[0])){
      if(rs.length<8)continue;
      const ok=rs.filter(independent),acc=pct(ok.length,rs.length),med=median(ok.map(r=>r.sec));
      if(acc<70)weakT.push({t,acc,n:rs.length,ok:ok.length});
      else if(acc>=80&&med>3)slowT.push({t,acc,n:rs.length,med});
      else if(acc>=90&&med<=3)fluentT.push(t);
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
        target:{tables:target},evidence:{weak:weakT,slow:slowT,fluent:fluentT}});
    }else if(fluentT.length>=3){
      findings.push({id:'fact_strength',lens:'4.2',severity:0,confidence:'tinggi',strength:true,
        text:`Hebat dalam sifir ${joinBM(fluentT)} — tepat dan pantas.`,action:'',evidence:{fluent:fluentT}});
    }

    // operation inside a context (money, time, ...)
    for(const ctx of['money','time','measure']){
      const rs=scored.filter(r=>r.c===ctx);if(rs.length<8)continue;
      const okN=rs.filter(independent).length,acc=pct(okN,rs.length);if(acc>=70)continue;
      const wrongs=rs.filter(r=>!independent(r)),byOp={};
      for(const r of rs){if(!OP_WORD[r.o])continue;(byOp[r.o]=byOp[r.o]||{n:0,bad:0}).n++;if(!independent(r))byOp[r.o].bad++}
      const top=Object.entries(byOp).filter(([,x])=>x.n>=4).sort((a,b)=>b[1].bad-a[1].bad)[0];
      const focus=top&&wrongs.length&&top[1].bad/wrongs.length>=.6&&pct(top[1].n-top[1].bad,top[1].n)<=50?top[0]:null;
      findings.push({id:`context_${ctx}`,lens:'context',severity:3,confidence:rs.length>=15?'tinggi':'sederhana',
        text:`${CTX_WORD[ctx][0].toUpperCase()+CTX_WORD[ctx].slice(1)}: ${acc}% betul (${okN}/${rs.length})${focus?`, dan hampir semua kesilapan melibatkan operasi ${OP_WORD[focus]}`:''}.`,
        action:focus?`Pahlawan Angka akan fokus latihan operasi ${OP_WORD[focus]} dalam soalan ${CTX_WORD[ctx]}.`:`Pahlawan Angka akan beri lebih banyak latihan ${CTX_WORD[ctx]} bermula dari tahap yang lebih mudah.`,
        tip:ctx==='money'?`Main jual-beli di rumah dengan duit sebenar${focus?` dan minta anak kira ${OP_WORD[focus]==='tolak'?'baki':'jumlah'}`:''}.`:'Kaitkan dengan aktiviti harian anak.',
        target:{context:ctx,op:focus},evidence:{accuracy:acc,n:rs.length,byOp}});
    }

    // 4.4 bentuk lazim vs ayat (same arithmetic skills)
    {
      const arith=scored.filter(r=>OP_WORD[r.o]);
      const laz=arith.filter(r=>r.f==='lazim'||r.f==='symbolic'),word=arith.filter(r=>r.f==='word');
      if(laz.length>=6&&word.length>=6){
        const la=pct(laz.filter(independent).length,laz.length),wa=pct(word.filter(independent).length,word.length);
        if(la>=80&&wa<=55)findings.push({id:'format_word',lens:'4.4',severity:2,confidence:'sederhana',
          text:`Soalan bentuk lazim hampir semua betul (${la}%), tetapi ${name} keliru bila soalan dalam ayat (${wa}%).`,
          action:'Worksheet akan fokus soalan berayat (bukan bentuk lazim); ibu bapa diminta semak cara kerja anak.',
          tip:'Minta anak lukis gambar atau bar ringkas untuk setiap soalan cerita sebelum mengira.',
          target:{format:'word'},evidence:{lazim:la,word:wa}});
      }
    }

    // 4.3 systematic bugs
    {
      const hits={};
      for(const r of recs.filter(r=>r.k===0)){const b=detectBug(r);if(!b)continue;(hits[b]=hits[b]||[]).push(r)}
      for(const [id,rs] of Object.entries(hits)){
        const distinct=new Set(rs.map(r=>r.a.join(','))).size;
        if(rs.length<3||distinct<2)continue;
        const ex=rs[rs.length-1],bug=BUGS[id];
        findings.push({id:`bug_${id}`,lens:'4.3',severity:3,confidence:rs.length>=5?'tinggi':'sederhana',
          text:`${bug.copy} (${rs.length} kali, contoh ${bug.example(ex.a[0],ex.a[1],ex.o)}).`,
          action:`Pahlawan Angka akan beri ${bug.action.charAt(0).toLowerCase()+bug.action.slice(1)}.`,
          tip:'Minta anak terangkan langkahnya dengan kuat untuk satu soalan — biasanya corak salah akan kelihatan.',
          target:{bug:id,op:ex.o},evidence:{count:rs.length,distinct}});
      }
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
    const items=[...r.strengths.slice(0,1),...r.findings];
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
