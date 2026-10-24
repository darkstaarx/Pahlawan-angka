/* Pahlawan Angka — "Jom tengok cara": an interactive worked example for the mini games.
   After a pupil has tried a round several times, Wira walks through the written
   (lazim) method one column at a time. The pupil still does each step: every
   step asks one small question with three tiles (the right one, and the slips a
   child really makes: forgetting the carried 1, taking the smaller digit from the
   bigger, one off). Borrowing is its own tap ("Pinjam"). A wrong tile shakes and
   the right one glows, so nobody gets stuck. Pure step builder (Node-testable)
   plus a small DOM renderer the game page calls. */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.PAWorked=api;
})(typeof window!=='undefined'?window:undefined,function(){
  'use strict';
  const VERSION='1.12.0';
  const PLACE=['sa','puluh','ratus','ribu','puluh ribu','ratus ribu','juta'],PLACE_=PLACE;
  const SIGN={add:'+',sub:'−',mul:'×',div:'÷'};
  /* Decimals (opt.dp): the numbers come scaled to whole numbers (0.45 → 45 with dp 2); the
     columns below sa are persepuluh, perseratus, perseribu, and the board shows the point. */
  const DECP=['persepuluh','perseratus','perseribu'],DECH=['1/10','1/100','1/1000'];
  const names=dp=>[...Array(12).keys()].map(i=>i<dp?DECP[dp-1-i]:PLACE[i-dp]);
  const fmtDp=dp=>x=>dp?(x/10**dp).toFixed(dp):nf(x);
  // Money in sen: RM12.50 (Gerai Wirayung); under RM1 as sen.
  const rm=v=>v<100?`${v} sen`:`RM${(v/100).toFixed(2)}`;
  const MNAMES=['1 sen','10 sen','RM1','RM10','RM100','RM1000'];   // money columns, low to high
  const digits=n=>String(Math.abs(Math.trunc(n))).split('').map(Number).reverse();
  const num=s=>Number(String(s).replace(/[\s, ]/g,''));
  // Thousands grouped with a no-break space from 10 000, as the games print them.
  const nf=n=>Math.abs(n)>=10000?String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'\u00a0'):String(n),nf_=nf;
  // Three different tiles: the right one first in the list given, shuffled by the caller's order rule.
  function tiles(right,wrongs){
    const out=[right];
    for(const w of wrongs)if(Number.isInteger(w)&&w>=0&&!out.includes(w)&&out.length<3)out.push(w);
    for(let d=1;out.length<3;d++){if(!out.includes(right+d))out.push(right+d);else if(right-d>=0&&!out.includes(right-d))out.push(right-d)}
    // A fixed, non-sorted order that still moves the right answer around.
    const k=(right*7+wrongs.length)%3;return[...out.slice(1,1+k),out[0],...out.slice(1+k)];
  }

  /* Read "a op b" from a round: its facets when the page knows them, else its worked text "a + b = c.". */
  function parse(q){
    const fx=q?.fx||{};
    if(['add','sub','mul','div'].includes(fx.op)&&Array.isArray(fx.operands)&&fx.operands.length===2)return{op:fx.op,a:fx.operands[0],b:fx.operands[1]};
    const m=/^\s*([\d][\d  ,]*)\s*([+−×÷])\s*([\d][\d  ,]*)\s*=\s*[\d]/.exec(String(q?.a||''));
    if(!m)return null;
    const op={'+':'add','−':'sub','×':'mul','÷':'div'}[m[2]];
    return{op,a:num(m[1]),b:num(m[3])};
  }

  /* The written method as steps. Each step: {kind:'pick'|'borrow', col, say, ask, choices, right, after}.
     `after` says what the board shows once the step is done. */
  function build(op,a,b,opt={}){
    if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0)return null;
    let plan=null;const dp=opt.money?2:(opt.dp||0),N=opt.money?MNAMES:dp?names(dp):PLACE;
    if(op==='add')plan=add(a,b,N,dp);
    else if(op==='sub'&&a>=b)plan=sub(a,b,N,dp);
    // Decimals: × a whole number of one digit, ÷ one digit (the point stays in its column).
    else if(dp&&op==='mul'&&b>=1&&b<=9&&a>=1)plan=mul(a,b,N,dp);
    else if(dp&&op==='div'&&b>=2&&b<=9&&a>=b&&a%b===0)plan=div(a,b,dp);
    else if(dp)return null;
    else if(op==='mul'&&b>=1&&b<=9&&a>=10)plan=mul(a,b);
    else if(op==='mul'&&a>=1&&a<=9&&b>=10)plan=mul(b,a);
    else if(op==='div'&&b>=2&&b<=12&&a>=b)plan=div(a,b);
    // A story first asks for the number sentence: the right one, the other operation, the reversed order.
    if(plan&&opt.story){
      const S=(x,o,y)=>`${nf(x)} ${SIGN[o]} ${nf(y)}`,other={add:'sub',sub:'add',mul:'add',div:'mul'}[op];
      const right=S(a,op,b),wrong=[S(a,other,b),op==='sub'||op==='div'?S(b,op,a):S(a,op==='add'?'mul':'sub',b)];
      plan.steps.unshift({kind:'pick',col:-1,say:'Ayat matematik mana yang sepadan dengan cerita?',right,choices:[wrong[0],right,wrong[1]],sentence:true,
        after:{sign:SIGN[op],note:`Betul: ${right}. Sekarang kira ikut tempat, mula dari sa.`}});
    }
    if(plan&&dp){
      // 0.45 + 0.3: the places up to sa that no sum reached are written as 0 (the 0 before the point too).
      const written=new Set(plan.steps.filter(s=>s.after&&s.after.write).map(s=>s.after.write.col));
      for(let c=0;c<=dp;c++)if(!written.has(c)&&c>=Math.max(...written,-1))plan.steps.push({kind:'show',col:c,say:c===dp?'Tiada nombor bulat: tulis 0 sebelum titik.':`Tempat ${N[c]}: 0.`,after:{write:{col:c,digit:0},note:'Tulis 0.'}});
      const f=opt.money?rm:fmtDp(dp),fb=op==='mul'||op==='div'?nf:f;plan.dp=dp;plan.money=!!opt.money;plan.cols=Math.max(plan.cols,dp+1);plan.done=`${f(a)} ${SIGN[op]} ${fb(b)} = ${f(plan.answer)}.`;
    }
    return plan;
  }
  // With decimals every column up to sa holds a real digit (0.05 has a 0 in persepuluh and in sa).
  const padTo=(D,n)=>{const out=[...D];while(out.length<n)out.push(0);return out};
  function add(a,b,PLACE=PLACE_,dp=0){
    const A=dp?padTo(digits(a),dp+1):digits(a),B=dp?padTo(digits(b),dp+1):digits(b),n=Math.max(A.length,B.length),steps=[];let c=0;
    for(let i=0;i<n;i++){
      const x=A[i]||0,y=B[i]||0,s=x+y+c,one=A[i]===undefined||B[i]===undefined,ask=one?`${A[i]===undefined?y:x} + 1 = ?`:`${x} + ${y}${c?' + 1':''} = ?`;
      // Only one number has a digit here and nothing is carried: it just comes down.
      if((A[i]===undefined||B[i]===undefined)&&!c){steps.push({kind:'show',col:i,say:`Tempat ${PLACE[i]}: hanya ada ${s}. ${s} turun.`,after:{write:{col:i,digit:s},note:`Tulis ${s}.`}});continue}
      steps.push({kind:'pick',col:i,ask,say:`Tempat ${PLACE[i]}: ${ask}`,right:s,choices:tiles(s,[c?x+y:s+1,s%10===s?s-1:s%10,Math.abs(x-y)]),...(c||one?{}:{fact:{op:'add',a:x,b:y}}),
        after:{write:{col:i,digit:s%10},carry:s>=10?{col:i+1}:null,note:s>=10?`Tulis ${s%10}, kumpul semula 1 ke tempat ${PLACE[i+1]}.`:`Tulis ${s}.`}});
      c=s>=10?1:0;
    }
    if(c)steps.push({kind:'show',col:n,say:`Tempat ${PLACE[n]}: 1 yang dikumpul semula turun.`,after:{write:{col:n,digit:1},note:'Tulis 1.'}});
    return{op:'add',rows:[a,b],answer:a+b,cols:Math.max(n+(c?1:0),digits(a+b).length),steps};
  }
  function sub(a,b,PLACE=PLACE_,dp=0){
    const A=dp?padTo(digits(a),dp+1):digits(a),B=dp?padTo(digits(b),dp+1):digits(b),top=[...A],n=A.length,steps=[];
    for(let i=0;i<n;i++){
      const y=B[i]||0;
      if(top[i]<y){
        // Borrow from the next place that has something; zeros on the way become 9.
        let j=i+1;while(j<n&&top[j]===0)j++;
        const chain=[];for(let k=j;k>i;k--){chain.push({col:k,from:top[k],to:k===j?top[k]-1:9})}
        steps.push({kind:'borrow',col:i,say:`Tempat ${PLACE[i]}: ${top[i]} kurang daripada ${y}. Pinjam 1 dari tempat ${PLACE[j]}${j>i+1?' (melalui 0)':''}.`,
          after:{borrow:chain,gain:{col:i,from:top[i],to:top[i]+10},note:`${top[i]} jadi ${top[i]+10}.`}});
        top[j]-=1;for(let k=j-1;k>i;k--)top[k]=9;top[i]+=10;
      }
      const d=top[i]-y,ask=`${top[i]} − ${y} = ?`;
      if(B[i]===undefined){const lead=i===n-1&&d===0&&n>1&&i>dp;steps.push({kind:'show',col:i,say:lead?`Tempat ${PLACE[i]}: tinggal 0. 0 di depan tidak ditulis.`:`Tempat ${PLACE[i]}: tiada nombor untuk ditolak. ${d} turun.`,after:{write:{col:i,digit:d,lead:i===n-1&&d===0&&n>1&&i>dp},note:d===0&&i===n-1&&n>1&&i>dp?'0 di depan tidak ditulis.':`Tulis ${d}.`}});continue}
      steps.push({kind:'pick',col:i,ask,say:`Tempat ${PLACE[i]}: ${ask}`,right:d,choices:tiles(d,[Math.abs((A[i])-y),d+1,top[i]+y]),fact:{op:'sub',a:top[i],b:y},
        after:{write:{col:i,digit:d,lead:i===n-1&&d===0&&n>1&&i>dp},note:`Tulis ${d}.`}});
    }
    return{op:'sub',rows:[a,b],answer:a-b,cols:n,steps};
  }
  function mul(a,b,PLACE=PLACE_,dp=0){
    const A=dp?padTo(digits(a),dp+1):digits(a),n=A.length,steps=[];let c=0;
    for(let i=0;i<n;i++){
      const p=A[i]*b+c,ask=`${A[i]} × ${b}${c?' + '+c:''} = ?`;
      steps.push({kind:'pick',col:i,ask,say:`Tempat ${PLACE[i]}: ${ask}`,right:p,choices:tiles(p,[c?A[i]*b:p+b,p-b,A[i]+b+c]),...(c?{}:{fact:{op:'mul',a:A[i],b}}),
        after:{write:{col:i,digit:p%10},carry:p>=10?{col:i+1,digit:Math.floor(p/10)}:null,note:p>=10?`Tulis ${p%10}, bawa ${Math.floor(p/10)} ke tempat ${PLACE[i+1]}.`:`Tulis ${p}.`}});
      c=Math.floor(p/10);
    }
    if(c)steps.push({kind:'show',col:n,say:`Tempat ${PLACE[n]}: ${c} yang dibawa turun.`,after:{write:{col:n,digit:c,multi:true},note:`Tulis ${c}.`}});
    return{op:'mul',rows:[a,b],answer:a*b,cols:Math.max(digits(a*b).length,dp?dp+1:0),steps};
  }
  function div(a,b,dp=0){
    // Short division (bahagi bentuk lazim): left to right, the remainder joins the next digit.
    // With decimals the 0 at sa (and after it) is written: 0.84 ÷ 7 = 0.12.
    const D=(dp?padTo(digits(a),dp+1):digits(a)).reverse(),steps=[];let r=0,started=false;const qd=[];
    D.forEach((d,k)=>{
      const cur=r*10+d,q=Math.floor(cur/b),col=D.length-1-k;
      if(!started&&q===0&&k<D.length-1){r=cur;const z=dp&&col<=dp;steps.push({kind:'show',col,say:`${cur} kurang daripada ${b}. ${z?'Tulis 0, kemudian g':'G'}abung dengan digit seterusnya.`,after:{write:{col,digit:z?0:null},note:z?'Tulis 0.':'Tiada di sini.'}});return}
      started=true;qd.push(q);const nr=cur-q*b;
      steps.push({kind:'pick',col,ask:`${cur} ÷ ${b} = ?`,say:`${cur} ÷ ${b} = ? (berapa kumpulan ${b}?)`,right:q,choices:tiles(q,[q+1,q-1,cur%10]),...(cur%b===0?{fact:{op:'div',a:cur,b}}:{}),
        after:{write:{col,digit:q},rem:nr,note:nr?`${q} × ${b} = ${q*b}. Baki ${nr}${k<D.length-1?' dibawa ke digit seterusnya':''}.`:`${q} × ${b} = ${q*b}. Tiada baki.`}});
      r=nr;
    });
    return{op:'div',rows:[a,b],answer:Math.floor(a/b),rem:r,cols:D.length,steps};
  }

  /* Two steps, left to right (a op1 b op2 d): two boards, one after the other.
     A story first asks for the whole number sentence. */
  function buildChain(spec,opt={}){const dp=opt.dp||0,f=fmtDp(dp);
    if(!spec||!Array.isArray(spec.ops)||spec.ops.length!==2)return null;
    const{a,b,d}=spec,[o1,o2]=spec.ops,mid=o1==='add'?a+b:o1==='sub'?a-b:NaN;
    if(!Number.isInteger(mid)||mid<0)return null;
    const p1=build(o1,a,b,{dp}),p2=build(o2,mid,d,{dp});if(!p1||!p2)return null;
    if(opt.story){
      const S=(x,y)=>`${f(a)} ${SIGN[x]} ${f(b)} ${SIGN[y]} ${f(d)}`,flip={add:'sub',sub:'add'};
      const right=S(o1,o2);
      p1.steps.unshift({kind:'pick',col:-1,say:'Ayat matematik mana yang sepadan dengan cerita?',right,choices:order(right,[S(flip[o1],flip[o2]),S(o1,o1)]),sentence:true,
        after:{sign:SIGN[o1],note:`Betul: ${right}. Kira dari kiri: langkah pertama ${f(a)} ${SIGN[o1]} ${f(b)}.`}});
    }
    return{chain:[p1,p2],mid,answer:p2.answer,notes:[`Langkah pertama siap: <b>${f(mid)}</b>. Sekarang ${f(mid)} ${SIGN[o2]} ${f(d)}.`]};
  }
  /* 567 × 37: 567 × 7, then 567 × 3 with a 0 at the end (× 30), then add the two. */
  function buildLong(spec){
    const{a,b}=spec||{};if(!Number.isInteger(a)||!Number.isInteger(b)||a<10||b<11||b>99)return null;
    const u=b%10,t=Math.floor(b/10);if(!u)return null;
    const p1=build('mul',a,u),p2=build('mul',a,t),A=a*u,B=a*t*10,p3=build('add',A,B);if(!p1||!p2||!p3)return null;
    return{chain:[p1,p2,p3],answer:a*b,notes:[
      `${nf(a)} × ${u} = <b>${nf(A)}</b>. Sekarang ${nf(a)} × ${t} (untuk ${t*10}).`,
      `${nf(a)} × ${t} = ${nf(a*t)}. Tambah 0 di hujung: ${nf(a)} × ${t*10} = <b>${nf(B)}</b>. Sekarang tambah.`]};
  }
  /* Run the two boards: the first, a short pause with its result, then the second. */
  function runChain(c,el,onDone,opt={}){
    const total=c.chain.reduce((n,p)=>n+p.steps.length,0);
    const go=(k,off)=>run(c.chain[k],el,k===c.chain.length-1?onDone:()=>{
      setTimeout(()=>{
        el.say.innerHTML=`<span>${c.notes[k]}</span>`;   // notes are built from numbers only
        setTimeout(()=>go(k+1,off+c.chain[k].steps.length),opt.pause??1600);
      },opt.pace??900);
    },{...opt,onShow:(i)=>opt.onShow&&opt.onShow(off+i,total)});
    go(0,0);
  }

  /* Number patterns (pola): a trail of boxes. {t:'seq', list, k} asks for list[k]: two
     neighbours light up, then "bertambah atau berkurang?", "berapa beza?", and a hop from
     the neighbour to the missing box. {t:'apply', s0, st, n} states the rule: n hops from s0. */
  function buildSeq(spec){
    if(!spec)return null;
    if(spec.t==='apply'){
      const{s0,st}=spec,n=spec.n||3;if(!Number.isInteger(s0)||!Number.isInteger(st)||!st)return null;
      const list=[s0];for(let i=1;i<=n;i++)list.push(s0+i*st);if(list.some(x=>x<0))return null;
      const steps=list.slice(1).map((v,i)=>{const from=list[i],ask=`${nf(from)} ${st>0?'+':'−'} ${nf(Math.abs(st))} = ?`;
        return{kind:'pick',col:i+1,say:`Nombor ke-${i+2}: ${ask}`,right:nf(v),choices:order(nf(v),[nf(from-st),nf(v+st),nf(from)]),after:{fill:{i:i+1,v},note:`Tulis ${nf(v)}.`}}});
      return{op:'seq',rows:[],items:list.map((v,i)=>i===0?v:null),steps,done:`Nombor keempat ialah ${nf(list[n])}.`,answer:list[n]};
    }
    const L=spec.list,k=spec.k;if(!Array.isArray(L)||L.length<3||!(k>=0&&k<L.length)||L.some(x=>!Number.isInteger(x)))return null;
    const st=L[1]-L[0];if(!st||L.some((x,i)=>i&&x-L[i-1]!==st))return null;
    // A known pair, as close to the missing box as possible.
    const pairs=[];for(let i=0;i<L.length-1;i++)if(i!==k&&i+1!==k)pairs.push(i);
    const p=pairs.sort((x,y)=>Math.abs(x-k)-Math.abs(y-k))[0],a=L[p],b=L[p+1],up=st>0,big=Math.max(a,b),small=Math.min(a,b),gap=Math.abs(st);
    const back=k===0,from=back?L[1]:L[k-1],v=L[k],ask=`${nf(from)} ${up!==back?'+':'−'} ${nf(gap)} = ?`;
    const steps=[
      {kind:'pick',col:-1,pre:{pair:[p,p+1]},say:`Lihat ${nf(a)} dan ${nf(b)}. Nombor bertambah atau berkurang?`,right:up?'Bertambah':'Berkurang',choices:['Bertambah','Berkurang'],after:{note:up?'Bertambah: setiap nombor lebih besar.':'Berkurang: setiap nombor lebih kecil.'}},
      {kind:'pick',col:-1,say:`Berapa bezanya? ${nf(big)} − ${nf(small)} = ?`,right:nf(gap),choices:order(nf(gap),[nf(gap*10),nf(gap+1),nf(Math.max(1,gap-1))]),after:{note:`Peraturan: ${up?'tambah':'tolak'} ${nf(gap)}.`}},
      {kind:'pick',col:-1,pre:{pair:back?[1]:[k-1],hop:k},say:back?`Nombor pertama: undur dari ${nf(from)}. ${ask}`:`Dari ${nf(from)}: ${ask}`,right:nf(v),choices:order(nf(v),[nf(back?from+st:from-st),nf(v+st),nf(v+(up?1:-1))].filter(x=>!/^-/.test(x))),after:{fill:{i:k,v},note:`Nombor yang hilang ialah ${nf(v)}.`}}];
    return{op:'seq',rows:[],items:L.map((x,i)=>i===k?null:x),steps,done:`Pola ${up?'tambah':'tolak'} ${nf(gap)}: nombor yang hilang ialah ${nf(v)}.`,answer:v};
  }

  /* Facts as hops on a trail (the seq board with a label on each hop):
       {t:'make10',a,b}        8 + 4: 8 + 2 = 10, 4 = 2 + 2, 10 + 2 = 12
       {t:'countUp',from,to}   17 − ___ = 9: count up 9 → 10 → 17
       {t:'skip',step,count,ask}  4, 8, 12 … (from 5 × step when count > 5); ask 'end' (×) or 'count' (÷)
       {t:'back',start,step,count}  take away step, count times
       {t:'tenAnd',n}           1 uncang = 10, then the loose coins */
  function buildHops(spec){
    if(!spec)return null;const T=spec.t,P=(v,say,right,choices,i,hop)=>({kind:'pick',col:-1,say,right:String(right),choices:order(String(right),choices.map(String).filter(x=>x!==String(right)&&!/^-/.test(x))),after:{fill:i===undefined?undefined:{i,v},hop,note:''}});
    if(T==='make10'){const{a,b}=spec,x=10-a,r=b-x;if(!(a>0&&a<10&&b>0&&b<10&&r>0))return null;
      return{op:'seq',rows:[],items:[a,null,null],hops:['',''],steps:[
        P(10,`Buat 10 dulu: ${a} + ? = 10`,x,[x+1,x-1,b],1,{i:1,label:`+${x}`}),
        P(null,`${b} = ${x} + ?`,r,[r+1,b,x],undefined,{i:2,label:`+${r}`}),
        P(a+b,`10 + ${r} = ?`,10+r,[10+r+1,a+b-10,10+r-1],2)],done:`${a} + ${b} = ${a+b}.`,answer:a+b}}
    if(T==='countUp'){const{from,to}=spec,ans=to-from;if(!(from>=0&&ans>0))return null;
      if(from<10&&to>10)return{op:'seq',rows:[],items:[from,10,to],hops:['',''],steps:[
        P(null,`Kira naik dari ${from}: ${from} + ? = 10`,10-from,[11-from,9-from,to-10],undefined,{i:1,label:`+${10-from}`}),
        P(null,`10 + ? = ${to}`,to-10,[to-9,to-11,10-from],undefined,{i:2,label:`+${to-10}`}),
        P(null,`Jadi ${10-from} + ${to-10} = ?`,ans,[ans+1,ans-1,to],undefined)],done:`${to} − ${ans} = ${from}.`,answer:ans};
      return{op:'seq',rows:[],items:[from,to],hops:[''],steps:[P(null,`Kira naik dari ${from}: ${from} + ? = ${to}`,ans,[ans+1,ans-1,to],undefined,{i:1,label:`+${ans}`})],done:`${to} − ${ans} = ${from}.`,answer:ans}}
    if(T==='skip'&&spec.count===1&&spec.ask!=='count'){const d=spec.step;if(!(d>=1&&d<=12))return null;
      return{op:'seq',rows:[],items:[null],steps:[P(d,`1 × ${d}: satu kumpulan ${d}. Berapa semuanya?`,d,[d+1,1,d*10],0)],done:`1 × ${d} = ${d}.`,answer:d}}
    if(T==='skip'){const{step:d,count:k}=spec;if(!(d>=1&&d<=12&&k>=2&&k<=12))return null;
      const s0=k>5?5:1,items=[];for(let i=s0;i<=k;i++)items.push(i*d);const steps=[];
      if(s0===5)steps.push(P(5*d,`Mula dengan yang mudah: 5 × ${d} = ?`,5*d,[5*d+d,5+d,5*d-d],0));
      for(let i=s0+1;i<=k;i++)steps.push(P(i*d,`${nf((i-1)*d)} + ${d} = ?`,i*d,[i*d+1,(i-1)*d+d+d,i*d-1],i-s0,{i:i-s0,label:`+${d}`}));
      const it=items.map((v,i)=>i===0&&s0===1?v:null),cnt=spec.ask==='count';
      if(cnt)steps.push(P(null,`Berapa kali ${d} sampai ${nf(k*d)}?`,k,[k+1,k-1,d],undefined));
      return{op:'seq',rows:[],items:it,hops:items.slice(1).map(()=>''),steps,done:cnt?`${nf(k*d)} ÷ ${d} = ${k}.`:`${k} × ${d} = ${nf(k*d)}.`,answer:cnt?k:k*d}}
    if(T==='back'){const{start:a,step:d,count:k}=spec;if(!(a-d*k>=0&&k>=1&&k<=5))return null;
      const items=[a];for(let i=1;i<=k;i++)items.push(a-i*d);
      return{op:'seq',rows:[],items:items.map((v,i)=>i?null:v),hops:items.slice(1).map(()=>''),steps:items.slice(1).map((v,i)=>P(v,`${nf(items[i])} − ${d} = ?`,v,[v+1,v-1,items[i]+d],i+1,{i:i+1,label:`−${d}`})),done:`${a} − ${d} × ${k} = ${a-d*k}.`,answer:a-d*k}}
    if(T==='tenAnd'){const n=spec.n;if(!(n>10&&n<20))return null;
      return{op:'seq',rows:[],items:[null,null],hops:[''],steps:[P(10,'Satu uncang penuh ada berapa syiling?',10,[5,9,n],0),P(n,`10 + ${n-10} syiling lagi = ?`,n,[n+1,n-1,10],1,{i:1,label:`+${n-10}`})],done:`10 + ${n-10} = ${n}.`,answer:n}}
    return null;
  }
  /* × or ÷ by 10, 100, 1000: the digits move left (or right) by as many places as there are zeros. */
  function buildPow10(spec){
    const{n,p,div}=spec||{};const z=[10,100,1000].indexOf(p)+1;if(!z||!Number.isInteger(n)||n<1)return null;
    const v=div?n:n*p,top=div?n*p:n,Z=k=>`${div?'Buang':'Tambah'} ${k} sifar`;
    return{op:'pv',rows:[top],answerRow:'=',cols:digits(n*p).length,steps:[
      {kind:'pick',col:-1,say:`${div?'÷':'×'} ${nf(p)}: ${nf(p)} ada berapa sifar?`,right:String(z),choices:order(String(z),['1','2','3'].filter(x=>x!==String(z))),after:{note:`${nf(p)} ada ${z} sifar.`}},
      {kind:'pick',col:-1,say:`${Z(z)} ${div?'dari hujung':'di hujung'}: ${nf(top)} ${div?'÷':'×'} ${nf(p)} = ?`,right:nf(v),choices:order(nf(v),[nf(div?v*10:v/10),nf(div?Math.max(1,Math.round(v/10)):v*10)].filter(x=>!/\./.test(x))),after:{answer:v,note:`Setiap digit beralih ${z} tempat ke ${div?'kanan':'kiri'}.`}}],
      done:`${nf(top)} ${div?'÷':'×'} ${nf(p)} = ${nf(v)}.`,answer:v};
  }

  /* ---------- place value (papan nilai tempat) ----------
     For rounds that are about places, not sums: round, compare, place name, digit value.
     The board shows the number(s) digit by digit under sa / puluh / ratus …; a 'tap' step
     asks the pupil to touch a digit on the board itself. spec comes from the game:
       {t:'round', n, place}           place = index of the digit that decides (0 = sa)
       {t:'compare', a, b, ask}        ask = 'big' | 'small' | 'symbol'
       {t:'placeName', n, i} / {t:'digitValue', n, i}   i = index of the digit asked about */
  const PV=[1,10,100,1000,10000,100000,1000000];
  // Three (or two) string tiles in a fixed order that still moves the right one around.
  function order(right,wrongs,max=3){
    const out=[right];for(const w of wrongs)if(w!==undefined&&w!==null&&!out.includes(w)&&out.length<max)out.push(w);
    const k=(String(right).length+out.length)%out.length;return[...out.slice(1,1+k),out[0],...out.slice(1+k)];
  }
  /* Malay number words: the same rules as the games (gudang-harta.html words()). */
  const ONE=['','satu','dua','tiga','empat','lima','enam','tujuh','lapan','sembilan'];
  function w999(n){const h=Math.floor(n/100),t=Math.floor(n%100/10),u=n%10,r=n%100,p=[];if(h)p.push(h===1?'seratus':ONE[h]+' ratus');
   if(r){if(r<10)p.push(ONE[r]);else if(r===10)p.push('sepuluh');else if(r===11)p.push('sebelas');else if(r<20)p.push(ONE[u]+' belas');else p.push(ONE[t]+' puluh'+(u?' '+ONE[u]:''))}return p.join(' ')}
  function words(n){if(!n)return 'sifar';const j=Math.floor(n/1e6),k=Math.floor(n%1e6/1000),r=n%1000,p=[];if(j)p.push(w999(j)+' juta');if(k)p.push(k===1?'seribu':w999(k)+' ribu');if(r)p.push(w999(r));return p.join(' ')}
  // Word chunks of n, biggest first: [{w, cols}] — juta, ribu, ratus, then puluh+sa together.
  function chunks(n){
    const j=Math.floor(n/1e6),k=Math.floor(n%1e6/1000),r=n%1000,h=Math.floor(r/100),t=r%100,out=[];
    if(j)out.push({w:w999(j)+' juta',cols:[6,7,8].filter(c=>c<digits(n).length),kind:'juta',v:j});
    if(k)out.push({w:k===1?'seribu':w999(k)+' ribu',cols:[3,4,5].filter(c=>c<digits(n).length),kind:'ribu',v:k});
    if(h)out.push({w:h===1?'seratus':ONE[h]+' ratus',cols:[2],kind:'ratus',v:h});
    if(t)out.push({w:w999(t),cols:t>=10?[0,1]:[0],kind:'puluh',v:t});
    return out;
  }
  function chunkWrongs(c){
    const nm=(d,p)=>d===1?{puluh:'sepuluh',ratus:'seratus',ribu:'seribu'}[p]:ONE[d]+' '+p;   // seratus, not "satu ratus"
    if(c.kind==='ratus')return[nm(c.v,'puluh'),nm(c.v,'ribu')];
    // Slips a child makes: the digits read the other way round, a place too high.
    if(c.kind==='puluh'){const a=Math.floor(c.v/10),b=c.v%10,sw=b*10+a;return[sw!==c.v&&b?w999(sw):w999(c.v+10<100?c.v+10:c.v-10),a?w999(a*100+b):(b===1?'sepuluh':ONE[b]+' puluh')]}
    if(c.kind==='ribu'){const rev=Number(String(c.v).split('').reverse().join(''));
      const R=x=>x===1?'seribu':w999(x)+' ribu';
      return c.v<10?[nm(c.v,'ratus'),R(c.v*10)]:[rev!==c.v&&rev>0?R(rev):R(c.v+10<1000?c.v+10:c.v-10),c.v*10<1000?R(c.v*10):R(c.v-1)]}
    return[w999(c.v)+' ribu',w999(c.v)+' ratus'];
  }
  const expandStr=n=>digits(n).map((d,i)=>d*PV[i]).reverse().filter(x=>x).map(nf).join(' + ');
  function buildPV(spec,opt={}){
    const plan=buildPV0(spec,opt);
    if(plan&&spec&&spec.dp&&plan.op==='pv'&&!plan.dp){plan.dp=spec.dp;plan.cols=Math.max(plan.cols,spec.dp+1)}
    return plan;
  }
  /* Decimal and percent boards (Lombong Permata). Returns undefined for any other spec. */
  function buildDec(spec,opt={}){
    const t=spec.t,fin=opt.final&&Array.isArray(opt.final.choices)&&opt.final.choices.includes(opt.final.right)?opt.final:null;
    const pick=(say,right,wrongs,after={})=>({kind:'pick',col:-1,say,right:String(right),choices:order(String(right),wrongs.map(String).filter(x=>x!==String(right))),after:{note:'',...after}});
    if(t==='decFrac'){
      // 45/100 → 0.45: the last digit of 45 goes to perseratus, the one before to persepuluh, 0 at sa.
      const{n,dp}=spec;if(!Number.isInteger(n)||n<1||!(dp>=1&&dp<=3)||n>=10**dp)return null;
      const N=names(dp),D=padTo(digits(n),dp+1),steps=[];
      for(let c=0;c<=dp;c++){const d=D[c];
        if(c===0)steps.push({kind:'tap',row:0,col:0,blank:true,say:`${n}/${10**dp}: ${n} ${N[0]}. Digit akhir ${d} di tempat ${N[0]}. Tekan tempat itu.`,after:{fill:{row:0,col:0,digit:d},note:`Tulis ${d}.`}});
        else if(c===dp)steps.push({kind:'show',col:dp,say:'Tiada nombor bulat: tulis 0 sebelum titik.',after:{fill:{row:0,col:dp,digit:0},note:'Tulis 0.'}});
        else if(d)steps.push({kind:'tap',row:0,col:c,blank:true,say:`Digit ${d} di tempat ${N[c]}. Tekan tempat itu.`,after:{fill:{row:0,col:c,digit:d},note:`Tulis ${d}.`}});
        else steps.push({kind:'show',col:c,say:`Tempat ${N[c]}: 0.`,after:{fill:{row:0,col:c,digit:0},note:'Tulis 0.'}});
      }
      return{op:'pv',dp,rows:[n],blank:[0],cols:dp+1,steps,done:`${n}/${10**dp} = ${(n/10**dp).toFixed(dp)}.`,answer:n};
    }
    if(t==='decShift'){
      // 6 ÷ 100: 100 has 2 zeros, the point moves 2 places to the left.
      const{n,p}=spec,z=[10,100,1000].indexOf(p)+1;if(!z||!Number.isInteger(n)||n<1)return null;
      const v=n/p,vs=String(+v.toFixed(z));
      return{op:'pv',dp:z,rows:[n*p],answerRow:'=',cols:Math.max(digits(n*p).length,z+1),steps:[
        pick(`${spec.pct?`${n}% = ${n} ÷ 100. `:''}÷ ${nf(p)}: ${nf(p)} ada berapa sifar?`,z,[1,2,3],{note:`${nf(p)} ada ${z} sifar: titik bergerak ${z} tempat ke kiri.`}),
        pick(`${nf(n)} ÷ ${nf(p)} = ?`,vs,[String(+(v*10).toFixed(z)),String(+(v/10).toFixed(z+1))],{answer:n,note:`Setiap digit beralih ${z} tempat ke kanan.`})],
        done:`${nf(n)} ÷ ${nf(p)} = ${vs}.`,answer:n};
    }
    if(t==='grid'){
      // A hundred grid: a full row is 0.1 (10%), one square is 0.01 (1%).
      const{n,pct}=spec;if(!Number.isInteger(n)||n<1||n>99)return null;const r=Math.floor(n/10),c=n%10,one=spec.dp===1;
      const val=pct?`${n}%`:one?(n/100).toFixed(1):(n/100).toFixed(2);
      const steps=[{...pick('Berapa baris penuh berlorek?',r,[r+1,r-1,c].filter(x=>x>=0),{note:`${r} baris = ${pct?r*10+'%':(r/10).toFixed(1)}.`}),look:'full'}];
      if(!one)steps.push({look:'part',...pick('Berapa petak lagi di baris yang belum penuh?',c,[c+1,Math.max(0,c-1),r].filter(x=>x>=0),{note:`${c} petak = ${pct?c+'%':(c/100).toFixed(2)}.`})});
      steps.push(pick(pct?'Jadi berapa peratus berlorek?':'Jadi nombor perpuluhannya?',val,pct?[`${r+c}%`,`${c*10+r}%`]:one?[`${r}.0`,(r/100).toFixed(2)]:[(c/10+r/100).toFixed(2),`${r}.${c}`]));   // the digits swapped, or the point in the wrong place
      if(spec.unshaded){steps.push({look:'off',...pick(`Belum berlorek: 100% − ${n}% = ?`,`${100-n}%`,[`${n}%`,`${90-n}%`,`${110-n}%`].filter(x=>!/^-/.test(x)))})}
      return{op:'grid',rows:[],n,steps,done:spec.unshaded?`100% − ${n}% = ${100-n}%.`:`${n} petak daripada 100 = ${val}.`,answer:spec.unshaded?100-n:pct?n:+val};
    }
    if(t==='pctOf'){
      // 15% of 200: 10% first (÷ 10), 5% is half of 10%, then put them together.
      const{p,Q}=spec;if(!(p>0&&p<=300&&p%5===0&&Q%10===0&&(p%10===0||(Q/10)%2===0)))return null;const ten=Q/10,k=Math.floor(p/10),half=p%10?ten/2:0,v=p*Q/100;
      const nf=spec.money?rm:nf_;   // money rounds read RM / sen
      // A story that asks for the rest ("BUKAN merah"): (100 − p)% straight away.
      const lead=spec.rest?`Bukan ${spec.rest}% = ${100-spec.rest}%. `:'';
      const items=[`100% = ${nf(Q)}`,null],steps=[pick(`${lead}10% daripada ${nf(Q)} = ${nf(Q)} ÷ 10 = ?`,nf(ten),[Q,ten*10,ten+10].map(nf),{fill:{i:1,v:`10% = ${nf(ten)}`}})];
      if(half){items.push(null);steps.push(pick(`5% ialah separuh daripada 10%: ${nf(ten)} ÷ 2 = ?`,nf(half),[ten,ten*2,half+1].map(nf),{fill:{i:2,v:`5% = ${nf(half)}`}}))}
      if(!k){const st=steps[steps.length-1];st.after.fill={i:2,v:`5% = ${nf(half)}`};return{op:'seq',rows:[],items,steps,done:`5% daripada ${nf(Q)} = ${nf(v)}.`,answer:v}}
      items.push(null);const last=items.length-1;
      steps.push(pick(half?(k?`${p}% = ${k} × 10% + 5% = ${k} × ${nf(ten)} + ${nf(half)} = ?`:`${p}% = 5% = ?`):`${p}% = ${k} × 10% = ${k} × ${nf(ten)} = ?`,nf(v),[v+ten,v-half||v+1,k*ten*10].filter(x=>x>0).map(nf),{fill:{i:last,v:`${p}% = ${nf(v)}`}}));
      return{op:'seq',rows:[],items,steps,done:`${p}% daripada ${nf(Q)} = ${nf(v)}.`,answer:v};
    }
    if(t==='fracToPct'){
      const{a,b}=spec,k=100/b;if(!Number.isInteger(k)||a<1||a>=b)return null;const p=a*k;
      return{op:'seq',rows:[],items:[`${a}/${b}`,null,null],hops:['',''],steps:[
        pick(`Jadikan penyebut 100: ${b} × ? = 100`,k,[k+1,k*10,100-b].filter(x=>x>0),{hop:{i:1,label:`× ${k}`}}),
        pick(`Pengangka juga: ${a} × ${k} = ?`,p,[a+k,p+k,a*10].filter(x=>x>0),{fill:{i:1,v:`${p}/100`}}),
        pick(`${p}/100 = ?`,`${p}%`,[`${a}%`,`${b}%`,`${p/10}%`].filter(x=>x!==`${p}%`),{fill:{i:2,v:`${p}%`}})],done:`${a}/${b} = ${p}/100 = ${p}%.`,answer:p};
    }
    if(t==='pctToFrac'){
      const{p}=spec;if(!(p>0&&p<100))return null;const gcd=(x,y)=>y?gcd(y,x%y):x,g=gcd(p,100),A=p/g,B=100/g,lab=`${A}/${B}`;
      return{op:'seq',rows:[],items:[`${p}%`,`${p}/100`,null],hops:['',''],steps:[
        pick(`Nombor terbesar yang boleh membahagi ${p} dan 100?`,g,[2,5,10,g*2].filter(x=>x!==g&&p%x===0&&100%x===0).concat([g===1?2:1]),{hop:{i:2,label:`÷ ${g}`}}),
        pick(`${p} ÷ ${g} / 100 ÷ ${g} = ?`,lab,[`${p}/100`,`${B}/${A}`,`${A}/${B*2}`].filter(x=>x!==lab),{fill:{i:2,v:lab}})],done:`${p}% = ${p}/100 = ${lab}.`,answer:lab,finalLabel:lab};
    }
    if(t==='outOf100'){
      const{n}=spec;if(!(n>0&&n<100))return null;
      return{op:'seq',rows:[],items:[`${n} daripada 100`,null],steps:[pick('Peratus bermaksud “daripada 100”. Jadi?',`${n}%`,[`${100-n}%`,`${n/10}%`,`${n*10}%`],{fill:{i:1,v:`${n}%`}})],done:`${n} daripada 100 = ${n}%.`,answer:n};
    }
    if(t==='extreme'){
      // The biggest (or smallest) of four: compare from the first place that differs, then the round's own choices.
      const plan=buildPV0({t:'order',list:spec.list,desc:!spec.small,dp:spec.dp},{});if(!plan)return null;
      const first=plan.steps[0];first.say=first.say.replace('Cari nombor paling','Cari yang paling');
      plan.steps=[first,...(fin?[{kind:'pick',col:-1,say:`Jadi yang paling ${spec.small?'sedikit':'banyak'}?`,right:fin.right,choices:fin.choices.slice(0,4),after:{note:''}}]:[])];
      plan.dp=spec.dp;plan.cols=Math.max(plan.cols,spec.dp+1);plan.done=`Yang paling ${spec.small?'sedikit':'banyak'}: ${fmtDp(spec.dp)(spec.small?Math.min(...spec.list):Math.max(...spec.list))}.`;
      plan.answer=fin?fin.right:null;plan.finalLabel=fin?fin.right:undefined;return plan;
    }
    return undefined;
  }
  function buildPV0(spec,opt={}){
    if(!spec||typeof spec!=='object')return null;
    // Decimals (spec.dp): the numbers come scaled; the places below sa have their own names.
    const dp=spec.dp||0,PL=dp?names(dp):PLACE,F=dp?(x=>String(+(x/10**dp).toFixed(dp))):nf;   // 0.6, not 0.60, in the text
    const dec=buildDec(spec,opt);if(dec!==undefined)return dec;   // eslint-disable-line no-use-before-define
    const t=spec.t;
    if(t==='round'){
      const n=spec.n,p=spec.place,P=PV[p+1];if(!Number.isInteger(n)||!(p>=0)||!P||n<=0)return null;
      const lo=Math.floor(n/P)*P,hi=lo+P,d=digits(n)[p]||0,up=d>=5,r=up?hi:lo,cols=Math.max(digits(n).length,digits(r).length,dp+1);
      if(dp){const t=Math.max(0,dp-p-1),Ft=x=>(x/10**dp).toFixed(t),to=t?`${t} tempat perpuluhan`:'nombor bulat';
        return{op:'pv',dp,rows:[n],answerRow:'≈',cols,steps:[
          {kind:'tap',row:0,col:p,say:`Bundar kepada ${to}. Tekan digit selepas tempat itu.`,after:{mark:{row:0,col:p},note:`Digit itu ialah ${d}.`}},
          {kind:'pick',col:-1,say:`Digit ${d}: 5 atau lebih?`,right:up?'Ya, 5 atau lebih':'Tidak, kurang 5',choices:['Ya, 5 atau lebih','Tidak, kurang 5'],after:{note:up?`Bundar naik: tempat ${PL[p+1]} tambah 1.`:`Tempat ${PL[p+1]} kekal.`}},
          {kind:'pick',col:-1,say:`Jadi ${F(n)} ≈ ?`,right:Ft(r),choices:order(Ft(r),[Ft(up?lo:hi),(n/10**dp).toFixed(Math.min(dp,t+1))]),after:{answer:r,answerFrom:p+1,note:'Digit selepas tempat itu dibuang.'}}],
          done:`${F(n)} ≈ ${Ft(r)}.`,answer:r}}
      const steps=[
        {kind:'tap',row:0,col:p,say:`Bundar kepada ${PL[p+1]} terdekat. Tekan digit di tempat ${PL[p]}.`,after:{mark:{row:0,col:p},note:`Digit di tempat ${PL[p]} ialah ${d}.`}},
        {kind:'pick',col:-1,say:`Digit ${d}: 5 atau lebih?`,right:up?'Ya, 5 atau lebih':'Tidak, kurang 5',choices:['Ya, 5 atau lebih','Tidak, kurang 5'],
          after:{note:up?`${d} ialah 5 atau lebih: bundar naik. Tempat ${PL[p+1]} tambah 1.`:`${d} kurang daripada 5: tempat ${PL[p+1]} kekal.`}},
        {kind:'pick',col:-1,say:`Jadi ${F(n)} ≈ ?`,right:F(r),choices:order(F(r),[F(up?lo:hi),F(Math.round(n/PV[p])*PV[p])]),
          after:{answer:r,note:`Digit selepas tempat ${PL[p+1]} jadi 0.`}}];
      return{op:'pv',rows:[n],answerRow:'≈',cols,steps,done:`${F(n)} ≈ ${F(r)}.`,answer:r};
    }
    if(t==='compare'){
      const a=spec.a,b=spec.b;if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0)return null;
      const cols=Math.max(digits(a).length,digits(b).length,dp?dp+1:0),A=dp?padTo(digits(a),cols):digits(a),B=dp?padTo(digits(b),cols):digits(b),steps=[];   // decimals: compare place by place, never by digit count
      let j=cols-1;while(j>=0&&(A[j]||0)===(B[j]||0))j--;
      const same=[];for(let i=cols-1;i>j;i--)same.push(PL[i]);
      if(A.length!==B.length){
        const big=A.length>B.length?0:1;
        steps.push({kind:'tap',row:big,col:cols-1,say:'Nombor mana ada lebih banyak digit? Tekan digit pertamanya.',after:{mark:{row:big,col:cols-1},note:'Lebih banyak digit = lebih besar.'}});
      }else if(j<0){
        steps.push({kind:'show',col:-1,say:'Banding dari kiri: semua digit sama.',after:{note:'Kedua-dua nombor sama.'}});
      }else{
        const sameCols=[];for(let i=cols-1;i>j;i--)sameCols.push(i);
        if(same.length)steps.push({kind:'show',col:-1,pre:{same:sameCols},say:`Banding dari kiri. Tempat ${same.join(', ')}: digit sama.`,after:{note:'Lihat tempat seterusnya.'}});
        const big=(A[j]||0)>(B[j]||0)?0:1,hi=Math.max(A[j]||0,B[j]||0),lo=Math.min(A[j]||0,B[j]||0);
        // The first place that differs gets a red frame: "here they are not the same".
        steps.push({kind:'tap',row:big,col:j,pre:{diff:j},say:`Tempat ${PL[j]} tidak sama: ${A[j]||0} dan ${B[j]||0}. Mana lebih besar? Tekan digit itu.`,after:{mark:{row:big,col:j},note:`${hi} lebih besar daripada ${lo}.`}});
      }
      const bigN=Math.max(a,b),smallN=Math.min(a,b);
      if(spec.ask==='symbol'){const sym=a>b?'>':a<b?'<':'=';
        steps.push({kind:'pick',col:-1,say:`${F(a)} ___ ${F(b)}`,right:sym,choices:['<','>','='],after:{sym,note:'Mulut buaya terbuka ke arah nombor yang lebih besar.'}});
        return{op:'pv',rows:[a,b],labels:['',''],cols,steps,done:`${F(a)} ${sym} ${F(b)}.`,answer:sym};
      }
      const want=spec.ask==='small'?smallN:bigN;
      steps.push({kind:'pick',col:-1,say:`Jadi yang lebih ${spec.ask==='small'?'kecil':'besar'}?`,right:F(want),choices:order(F(want),[F(want===a?b:a)],2),after:{note:''}});
      return{op:'pv',rows:[a,b],labels:['',''],cols,steps,done:`${F(want)} lebih ${spec.ask==='small'?'kecil':'besar'}.`,answer:want};
    }
    if(t==='compose'){
      // 600 + 70 + 2: each part goes to its place on an empty row; a place with no part gets 0.
      const n=spec.n,D=digits(n);if(!Number.isInteger(n)||n<10)return null;
      const steps=[];
      for(let i=D.length-1;i>=0;i--){
        const d=D[i];
        if(d)steps.push({kind:'tap',row:0,col:i,blank:true,say:`${F(d*PV[i])}: digit ${d} di tempat ${PL[i]}. Tekan tempat ${PL[i]}.`,after:{fill:{row:0,col:i,digit:d},note:`Tulis ${d} di tempat ${PL[i]}.`}});
        else steps.push({kind:'show',col:i,say:`Tiada bahagian untuk tempat ${PL[i]}. Tulis 0.`,after:{fill:{row:0,col:i,digit:0},note:'Tempat kosong ditulis 0.'}});
      }
      return{op:'pv',rows:[n],blank:[0],cols:D.length,steps,done:`${expandStr(n)} = ${F(n)}.`,answer:n};
    }
    // The round's own last choice (a pick round): {choices, right}.
    const fin=opt.final&&Array.isArray(opt.final.choices)&&opt.final.choices.includes(opt.final.right)?opt.final:null;
    const finalStep=say=>fin?[{kind:'pick',col:-1,say,right:fin.right,choices:fin.choices.length>4?fin.choices.slice(0,4):fin.choices,after:{note:''}}]:[];
    if(t==='order'){
      const L=spec.list;if(!Array.isArray(L)||L.length<2||L.some(x=>!Number.isInteger(x)||x<0)||new Set(L).size!==L.length)return null;
      const cols=Math.max(...L.map(x=>digits(x).length),dp?dp+1:0),R=L.map((_,i)=>i),steps=[],small=!spec.desc;let rank=1;
      while(R.length>1){
        const D=R.map(r=>digits(L[r]));let j=cols-1;while(j>0&&D.every(d=>(d[j]||0)===(D[0][j]||0)))j--;
        const pickRow=R.reduce((a,b)=>small?(L[b]<L[a]?b:a):(L[b]>L[a]?b:a));
        steps.push({kind:'tap',row:pickRow,col:j,anyCol:true,pre:{diff:j,diffRows:[...R]},say:`Cari nombor paling ${small?'kecil':'besar'}. Banding tempat ${PL[j]}, kemudian tekan nombor itu.`,
          after:{done:{row:pickRow,rank},note:`${F(L[pickRow])} ialah ${rank===1?'pertama':'ke-'+rank}.`}});
        R.splice(R.indexOf(pickRow),1);rank++;
      }
      steps.push({kind:'show',col:-1,say:`Tinggal ${F(L[R[0]])}: ia ${'ke-'+rank}.`,after:{done:{row:R[0],rank},note:'Semua sudah tersusun.'}});
      steps.push(...finalStep(`Jadi susunan ${small?'menaik':'menurun'} ialah?`));
      return{op:'pv',rows:L,cols,steps,done:`${small?'Menaik':'Menurun'}: ${[...L].sort((a,b)=>small?a-b:b-a).map(nf).join(', ')}.`,answer:fin?fin.right:null,finalLabel:fin?fin.right:undefined};
    }
    if(t==='toWords'){
      const n=spec.n;if(!Number.isInteger(n)||n<1)return null;
      const C=chunks(n),steps=[];let said=[];
      for(const c of C){said=said.concat(c.w);
        steps.push({kind:'pick',col:-1,pre:{group:c.cols},say:`${c.cols.length>1?'Digit ':'Digit '}${c.cols.slice().reverse().map(i=>digits(n)[i]).join('')} di sini dibaca?`,right:c.w,choices:order(c.w,chunkWrongs(c)),after:{note:`Setakat ini: ${said.join(' ')}.`}});
      }
      steps.push(...finalStep('Jadi perkataan yang betul ialah?'));
      return{op:'pv',rows:[n],cols:digits(n).length,steps,done:`${F(n)} dibaca “${words(n)}”.`,answer:fin?fin.right:words(n),finalLabel:fin?fin.right:undefined};
    }
    if(t==='fromWords'){
      const n=spec.n,D=digits(n);if(!Number.isInteger(n)||n<10)return null;
      const C=chunks(n),word=i=>(C.find(c=>c.cols.includes(i))||{}).w,steps=[];
      for(let i=D.length-1;i>=0;i--){
        if(D[i])steps.push({kind:'tap',row:0,col:i,blank:true,say:`“${word(i)}”: digit ${D[i]} di tempat ${PL[i]}. Tekan tempat itu.`,after:{fill:{row:0,col:i,digit:D[i]},note:`Tulis ${D[i]}.`}});
        else steps.push({kind:'show',col:i,say:`Tempat ${PL[i]} tidak disebut. Tulis 0.`,after:{fill:{row:0,col:i,digit:0},note:'Tempat yang tiada disebut ialah 0.'}});
      }
      steps.push(...finalStep('Jadi angka yang betul ialah?'));
      return{op:'pv',rows:[n],blank:[0],cols:D.length,steps,done:`“${words(n)}” = ${F(n)}.`,answer:n,finalLabel:fin?fin.right:undefined};
    }
    if(t==='expanded'){
      const n=spec.n,D=digits(n);if(!Number.isInteger(n)||n<10)return null;
      const steps=[];
      for(let i=D.length-1;i>=0;i--){if(!D[i])continue;const v=D[i]*PV[i];
        steps.push({kind:'pick',col:i,say:`Digit ${D[i]} di tempat ${PL[i]}: nilainya?`,right:F(v),choices:order(F(v),[F(D[i]),F(v*10)].filter(x=>x!==F(v))),after:{mark:{row:0,col:i},note:`${D[i]} × ${F(PV[i])} = ${F(v)}.`}})}
      steps.push(...finalStep('Jadi cerakinan yang betul ialah?'));
      return{op:'pv',rows:[n],cols:D.length,steps,done:`${F(n)} = ${expandStr(n)}.`,answer:fin?fin.right:expandStr(n),finalLabel:fin?fin.right:undefined};
    }
    if(t==='missingPart'){
      // 9041 = 9000 + ___ + 1: the places already written go grey; the pupil finds the one left.
      const n=spec.n,i=spec.i,D=digits(n);if(!Number.isInteger(n)||!(i>=0&&i<D.length)||!D[i])return null;
      const known=D.map((d,j)=>d&&j!==i?j:-1).filter(j=>j>=0),v=D[i]*PV[i];
      const steps=[
        {kind:'tap',row:0,col:i,pre:{same:known},say:`Tempat yang sudah ada dalam ayat jadi kelabu. Digit mana belum ada? Tekan digit itu.`,after:{mark:{row:0,col:i},reveal:true,note:`Digit ${D[i]} di tempat ${PL[i]}.`}},
        {kind:'pick',col:i,say:`Nilai = ${D[i]} × ${F(PV[i])} = ?`,right:F(v),choices:order(F(v),[F(D[i]),F(v*10),F(v/10)].filter(x=>x!==F(v)&&!/\./.test(x))),after:{note:`Bahagian yang hilang ialah ${F(v)}.`}}];
      return{op:'pv',rows:[n],cols:D.length,hideHead:true,steps,done:`${F(n)} = ${expandStr(n)}.`,answer:v};
    }
    if(t==='placeName'||t==='digitValue'){
      const n=spec.n,i=spec.i,D=digits(n);if(!Number.isInteger(n)||!(i>=0&&i<D.length))return null;
      const d=D[i],names=PL.slice(0,Math.max(D.length,3)).map((x,j)=>[x,Math.abs(j-i)]).filter(x=>x[1]).sort((x,y)=>x[1]-y[1]).map(x=>x[0]);   // the places next to it first
      const steps=[
        {kind:'tap',row:0,col:i,say:`Tekan digit ${d} pada papan.`,after:{mark:{row:0,col:i},note:'Sekarang kira tempat dari kanan: sa, puluh, ratus…'}},
        {kind:'pick',col:i,say:`Digit ${d} di tempat apa?`,right:PL[i],choices:order(PL[i],names),after:{reveal:true,note:`Digit ${d} di tempat ${PL[i]}.`}}];
      if(t==='placeName')return{op:'pv',rows:[n],cols:D.length,hideHead:true,steps,done:`Digit ${d} di tempat ${PL[i]}.`,answer:PL[i]};
      const v=d*PV[i];
      steps.push({kind:'pick',col:i,say:`Nilai = ${d} × ${F(PV[i])} = ?`,right:F(v),choices:order(F(v),[F(d),F(v*10),F(v/10)].filter(x=>x!==F(v)&&!/\./.test(x))),after:{note:`Nilai digit ${d} ialah ${F(v)}.`}});
      if(fin){const last=steps[steps.length-1];last.right=fin.right;last.choices=fin.choices.slice(0,4)}
      return{op:'pv',rows:[n],cols:D.length,hideHead:true,steps,finalLabel:fin?fin.right:undefined,done:`${d} × ${F(PV[i])} = ${F(v)}.`,answer:v};
    }
    return null;
  }

  /* ---------- renderer ---------- */
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  /* Fractions (Kedai Kek). Text uses the game's notation, [3/4] a fraction and [1 2/3] a mixed
     number; the page draws it with opt.html. The board is a working line, one row at a time:
     each row holds fractions whose numbers are slots the steps fill in. Every plan ends at
     plan.value {N,D} (the exact fraction, D = 1 for a whole number) or at a pick's own label. */
  const gcdF=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a||1};
  const FS=(n,d)=>`[${n}/${d}]`,MS=(w,n,d)=>`[${w} ${n}/${d}]`;
  const factors=n=>[...Array(n).keys()].map(i=>i+1).filter(i=>n%i===0);
  function buildFrac(spec,opt={}){
    if(!spec||!spec.t)return null;
    const fin=opt.final&&Array.isArray(opt.final.choices)&&opt.final.choices.includes(opt.final.right)?opt.final:null;
    const rows=[],steps=[];let sid=0;
    const S=v=>({id:'f'+(sid++),v});                                  // a slot: empty until a step writes v
    const row=(items,hide=true)=>{rows.push({items,hide});return rows.length-1};
    const ok=x=>x!==undefined&&x!==null&&x!==''&&!(typeof x==='number'&&(!Number.isFinite(x)||x<=0||!Number.isInteger(x)));
    const P=(say,right,wrongs,after={},pre)=>({kind:'pick',col:-1,say,right:String(right),choices:order(String(right),wrongs.filter(ok).map(String).filter(x=>x!==String(right))),after:{note:'',...after},...(pre?{pre}:{})});
    const G=(say,after={},pre)=>({kind:'show',col:-1,say,after:{note:'',...after},...(pre?{pre}:{})});
    // A step that is one basic fact (sifir, tambah/tolak asas): the page reports the first pick as a fact try.
    const X=(step,op,a,b)=>({...step,fact:{op,a,b}});
    const set=(...slots)=>Object.fromEntries(slots.map(s=>[s.id,s.v]));
    const FIN=say=>fin?{kind:'pick',col:-1,say,right:String(fin.right),choices:order(String(fin.right),fin.choices.map(String).filter(x=>x!==String(fin.right)),4),after:{note:''}}:null;
    const gcfWrongs=(g,a,b)=>[...factors(g).filter(x=>x>1&&x<g).reverse(),g+1,g*2,a,b];
    // From N/D (on the board) to the simplest form: a whole number, a mixed number or a fraction.
    const tail=(N,D,mixed=true)=>{
      const g=gcdF(N,D);
      if(N%D===0){const w=N/D,s=S(w),r=row([{t:'='},{v:s}]);
        steps.push(X(P(`${FS(N,D)}: ${N} ÷ ${D} = ?`,w,[w+1,w-1,N-D],{showRow:r,set:set(s),note:`Jawapan nombor bulat: ${w}.`}),'div',N,D));return{N:w,D:1,text:String(w)}}
      if(N>D&&mixed){const w=Math.floor(N/D),rm=N%D,k=gcdF(rm,D),sw=S(w),sn=S(rm),r=row([{t:'='},{mx:[sw,sn,D]}]);
        steps.push(P(`${FS(N,D)} lebih daripada 1. ${N} ÷ ${D} = ? (berapa kali ${D} muat dalam ${N}?)`,w,[w+1,w-1,rm],{showRow:r,set:set(sw),note:`${w} kek penuh.`}));
        steps.push(P(`Baki: ${N} − ${w*D} = ?`,rm,[rm+1,rm-1,D-rm],{set:set(sn),note:`Baki ${rm} jadi pengangka. Penyebut kekal ${D}.`}));
        if(k===1)return{N,D,text:MS(w,rm,D)};
        const n2=S(rm/k),d2=S(D/k),r2=row([{t:'='},{mx:[w,n2,d2]}]);
        steps.push(P(`Permudahkan ${FS(rm,D)}: nombor terbesar yang boleh bahagi ${rm} dan ${D}?`,k,gcfWrongs(k,rm,D),{showRow:r2,note:`Bahagi atas dan bawah dengan ${k}.`}));
        steps.push(X(P(`${rm} ÷ ${k} = ?`,rm/k,[rm/k+1,rm-k,rm],{set:set(n2)}),'div',rm,k));
        steps.push(X(P(`${D} ÷ ${k} = ?`,D/k,[D/k+1,D-k,D],{set:set(d2),note:`${MS(w,rm,D)} = ${MS(w,rm/k,D/k)}.`}),'div',D,k));
        return{N,D,text:MS(w,rm/k,D/k)}}
      if(g>1){const n2=S(N/g),d2=S(D/g),r=row([{t:'='},{fr:[n2,d2]}]);
        steps.push(P(`Bentuk termudah: nombor terbesar yang boleh bahagi ${N} dan ${D}?`,g,gcfWrongs(g,N,D),{showRow:r,note:`Bahagi atas dan bawah dengan ${g}.`}));
        steps.push(X(P(`${N} ÷ ${g} = ?`,N/g,[N/g+1,N-g,N],{set:set(n2)}),'div',N,g));
        steps.push(X(P(`${D} ÷ ${g} = ?`,D/g,[D/g+1,D-g,D],{set:set(d2),note:`${FS(N,D)} = ${FS(N/g,D/g)}.`}),'div',D,g));
        return{N,D,text:FS(N/g,D/g)}}
      return{N,D,text:FS(N,D)}};
    const T=spec.t,I=Number.isInteger;let out=null;
    if(T==='read'){
      // Count all the equal parts (penyebut), then the parts asked about (pengangka).
      const{d,sh=0,eat=0,want='sh',label='berkrim'}=spec,n=want==='sh'?sh:want==='un'?d-sh-eat:want==='eat'?eat:d-eat;
      if(!I(d)||d<2||d>12||!I(n)||n<1||n>d)return null;
      row([{model:{n:d,sh,eat}}],false);const sn=S(n),sd=S(d),r=row([{fr:[sn,sd]}]);
      steps.push(P('Kira semua bahagian sama besar.',d,[d+1,d-1,n],{showRow:r,set:set(sd),note:`${d} bahagian semuanya: penyebut ${d}.`},{glow:'all'}));
      steps.push(P(`Kira bahagian ${label}.`,n,[n+1,n-1,d-n],{set:set(sn),note:`${n} daripada ${d} = ${FS(n,d)}.`},{glow:want}));
      out={N:n,D:d,text:FS(n,d),exact:true}}
    else if(T==='parts'){
      // A story: d equal parts; friends eat or get some. Add them; what is left is d − that.
      const{d,terms,left}=spec;if(!I(d)||!Array.isArray(terms)||terms.length<2)return null;
      const sum=terms.reduce((a,b)=>a+b,0),n=left?d-sum:sum;if(n<1||n>d)return null;
      const sn=S(n),sd=S(d),r=row([{fr:[sn,sd]}],false);
      steps.push(P(`Kek dipotong ${d} sama besar. Penyebut = ?`,d,[d+1,sum,d-1],{set:set(sd),note:`Penyebut ${d}.`}));
      steps.push(P(`${left?'Dimakan':'Diterima'}: ${terms.join(' + ')} = ?`,sum,[sum+1,sum-1,d],left?{note:`${sum} bahagian dimakan.`}:{set:set(sn),note:`${sum} daripada ${d} = ${FS(sum,d)}.`}));
      if(left)steps.push(P(`Tinggal: ${d} − ${sum} = ?`,n,[n+1,n-1,sum],{set:set(sn),note:`${n} daripada ${d} = ${FS(n,d)}.`}));
      out={N:n,D:d,text:FS(n,d),exact:true};void r}
    else if(T==='equiv'){
      // n/d = ?/(d×k): find ×k from the known side, then do the same to the other side.
      const{n,d,k,ask='both'}=spec;if(![n,d,k].every(I)||k<2)return null;
      const sk=S('× '+k),sn=S(n*k),sd=S(d*k),N=ask==='d'?n*k:sn,D=ask==='n'||ask==='shade'?d*k:sd;
      row([{fr:[n,d]},{t:'='},{fr:[N,D]}],false);const rt=row([{tag:sk}]);
      if(ask==='shade'){
        steps.push(X(P(`Kek B ada ${d*k} bahagian, kek A ada ${d}. ${d*k} ÷ ${d} = ?`,k,[k+1,k-1,d*k-d],{showRow:rt,set:set(sk),note:`1 bahagian kek A = ${k} bahagian kek B.`}),'div',d*k,d));
        steps.push(X(P(`Krim kek B: ${n} × ${k} = ?`,n*k,[n+k,n*k+1,n],{set:set(sn),note:`Letak krim pada ${n*k} bahagian kek B.`}),'mul',n,k))}
      else if(ask==='n'){
        steps.push(X(P(`Penyebut ${d} jadi ${d*k}. ${d} × ? = ${d*k}`,k,[k+1,k-1,d*k-d],{showRow:rt,set:set(sk),note:`Darab dengan ${k}.`}),'div',d*k,d));
        steps.push(X(P(`Buat sama pada pengangka: ${n} × ${k} = ?`,n*k,[n+k,n*k+1,n],{set:set(sn),note:`${FS(n,d)} = ${FS(n*k,d*k)}.`}),'mul',n,k))}
      else if(ask==='d'){
        steps.push(X(P(`Pengangka ${n} jadi ${n*k}. ${n} × ? = ${n*k}`,k,[k+1,k-1,n*k-n],{showRow:rt,set:set(sk),note:`Darab dengan ${k}.`}),'div',n*k,n));
        steps.push(X(P(`Buat sama pada penyebut: ${d} × ${k} = ?`,d*k,[d+k,d*k+1,d],{set:set(sd),note:`${FS(n,d)} = ${FS(n*k,d*k)}.`}),'mul',d,k))}
      else{
        steps.push(G(`Pecahan setara: darab atas dan bawah dengan nombor yang sama. Cuba × ${k}.`,{showRow:rt,set:set(sk)}));
        steps.push(X(P(`${n} × ${k} = ?`,n*k,[n+k,n*k+1,n],{set:set(sn)}),'mul',n,k));
        steps.push(X(P(`${d} × ${k} = ?`,d*k,[d+k,d*k+1,d],{set:set(sd),note:`${FS(n,d)} = ${FS(n*k,d*k)}.`}),'mul',d,k))}
      out=ask==='n'?{N:n*k,D:1,text:String(n*k)}:ask==='d'?{N:d*k,D:1,text:String(d*k)}:{N:n*k,D:d*k,text:FS(n*k,d*k),exact:true}}
    else if(T==='simp'){
      const{N,D}=spec;if(!I(N)||!I(D)||gcdF(N,D)<2)return null;
      row([{fr:[N,D]}],false);
      if(spec.ask==='gcf'){const g=gcdF(N,D);steps.push(G(`Faktor ${N}: ${factors(N).join(', ')}. Faktor ${D}: ${factors(D).join(', ')}.`,{note:`Sama dalam kedua-dua senarai: ${factors(g).filter(x=>D%x===0).join(', ')}.`}));out={N:g,D:1,text:String(g)}}
      else out=tail(N,D,false)}
    else if(T==='toMixed'){const{N,D}=spec;if(!I(N)||!I(D)||N<=D)return null;row([{fr:[N,D]}],false);out=tail(N,D)}
    else if(T==='readMixed'){
      const{w,n,d}=spec;if(![w,n,d].every(I)||n<1||n>=d)return null;
      for(let i=0;i<w;i++)row([{model:{n:d,sh:d}}],false);row([{model:{n:d,sh:n}}],false);
      const sw=S(w),sn=S(n),r=row([{mx:[sw,sn,d]}]);
      steps.push(P('Berapa kek lapis penuh berkrim?',w,[w+1,w-1,w+2],{showRow:r,set:set(sw),note:`${w} kek penuh: nombor bulat ${w}.`}));
      steps.push(P(`Kek terakhir: berapa bahagian berkrim daripada ${d}?`,n,[n+1,n-1,d-n],{set:set(sn),note:`${w} dan ${FS(n,d)} = ${MS(w,n,d)}.`}));
      out={N:w*d+n,D:d,text:MS(w,n,d)}}
    else if(T==='toImp'){
      const{w,n,d}=spec;if(![w,n,d].every(I))return null;const N=w*d+n,sn=S(N);
      row([{mx:[w,n,d]},{t:'='},{fr:[sn,d]}],false);
      steps.push(X(P(`${w} kek penuh = berapa bahagian? ${w} × ${d} = ?`,w*d,[w+d,N,w*d-1],{note:`${w} kek penuh = ${w*d} bahagian.`}),'mul',w,d));
      steps.push(P(`Tambah pengangka: ${w*d} + ${n} = ?`,N,[N+1,w*d,N-1],{set:set(sn),note:`${MS(w,n,d)} = ${FS(N,d)}. Penyebut kekal ${d}.`}));
      out={N,D:d,text:FS(N,d),exact:true}}
    else if(T==='add'){
      // a/d1 ± b/d2 (± c/d3): make the denominators the same, add or take the numerators, simplify.
      const{terms,ops}=spec;if(!Array.isArray(terms)||terms.length<2||!Array.isArray(ops)||ops.length!==terms.length-1)return null;
      const D=Math.max(...terms.map(t=>t[1]));if(terms.some(([a,d])=>!I(a)||!I(d)||D%d))return null;
      const line=[];terms.forEach(([a,d],i)=>{if(i)line.push({t:ops[i-1]});line.push({fr:[a,d]})});row(line,false);
      const conv=terms.map(([a,d])=>d===D?a:null);
      if(terms.some(([,d])=>d!==D)){
        const slots=terms.map(([a,d])=>d===D?null:S(a*D/d)),l2=[];terms.forEach(([a,d],i)=>{if(i)l2.push({t:ops[i-1]});l2.push({fr:[slots[i]||a,D]})});const r=row([{t:'='},...l2]);
        terms.forEach(([a,d],i)=>{if(d===D)return;const m=D/d;
          steps.push(X(P(`Samakan penyebut kepada ${D}: ${d} × ? = ${D}`,m,[m+1,m-1,D-d],{showRow:r,note:`Darab atas dan bawah dengan ${m}.`}),'div',D,d));
          steps.push(X(P(`${a} × ${m} = ?`,a*m,[a+m,a*m+1,a],{set:set(slots[i]),note:`${FS(a,d)} = ${FS(a*m,D)}.`}),'mul',a,m));conv[i]=a*m})}
      let S0=conv[0];ops.forEach((o,i)=>{S0=o==='+'?S0+conv[i+1]:S0-conv[i+1]});if(S0<1)return null;
      const expr=conv.map((x,i)=>(i?ops[i-1]+' ':'')+x).join(' '),loose=conv.reduce((a,b)=>a+b,0),ss=S(S0),r=row([{t:'='},{fr:[ss,D]}]);
      {const st=P(`Penyebut sama (${D}). Pengangka: ${expr} = ?`,S0,[S0+1,S0-1,loose,S0+D],{showRow:r,set:set(ss),note:`Penyebut kekal ${D}: ${FS(S0,D)}.`});
        steps.push(conv.length===2?X(st,ops[0]==='+'?'add':'sub',conv[0],conv[1]):st)}
      out=tail(S0,D)}
    else if(T==='cmp'){
      const{a,b,d,big=true,names}=spec;if(![a,b,d].every(I)||a===b)return null;const want=big?Math.max(a,b):Math.min(a,b),sy=S(a>b?'>':'<');
      row([{fr:[a,d]},{v:sy},{fr:[b,d]}],false);
      steps.push(P(`${names?`${names[0]} = ${FS(a,d)}, ${names[1]} = ${FS(b,d)}. `:''}Penyebut sama (${d}). Banding pengangka: ${a} dan ${b}. Yang lebih ${big?'besar':'kecil'}?`,want,[want===a?b:a],{set:set(sy),note:`${FS(a,d)} ${a>b?'>':'<'} ${FS(b,d)}.`}));
      out={N:want,D:d,text:FS(want,d),exact:true}}
    else if(T==='order'){
      const{L,d}=spec;if(!Array.isArray(L)||L.length<3||!I(d))return null;const asc=[...L].sort((x,y)=>x-y),sl=asc.map(x=>S(x));
      row(L.map(x=>({fr:[x,d]})),false);const r=row(sl.map(s=>({fr:[s,d]})));
      asc.forEach((x,i)=>{const rest=asc.slice(i+1);if(!rest.length)return;
        steps.push(P(i?'Antara yang tinggal, pengangka paling kecil?':`Penyebut sama (${d}). Pengangka paling kecil?`,x,rest,{...(i?{}:{showRow:r}),set:i===asc.length-2?set(sl[i],sl[i+1]):set(sl[i])}))});
      out={text:asc.map(x=>FS(x,d)).join(', ')}}
    else if(T==='tenthCmp'){
      const{a,b}=spec;if(!I(a)||!I(b)||a===b)return null;const sv=S('0.'+a);
      row([{fr:[a,10]},{t:'='},{v:sv}],false);
      steps.push(P(`Tukar ${FS(a,10)} kepada perpuluhan.`,'0.'+a,['0.0'+a,a+'.0','0.'+(a>1?a-1:a+1)],{set:set(sv),note:`${FS(a,10)} = 0.${a}.`}));
      steps.push(P(`Banding 0.${a} dan 0.${b}. Yang lebih besar?`,'0.'+Math.max(a,b),['0.'+Math.min(a,b)],{note:'Banding digit persepuluh.'}));
      out={text:a>b?FS(a,10):'0.'+b}}
    else if(T==='tenth'){
      // n out of 10 parts: n persepuluh = 0.n = n/10; or the part left out of 10.
      const{n,from='model',out:o='dec'}=spec;if(!I(n)||n<1||n>9)return null;const v=from==='rest'?10-n:n,sv=S(o==='dec'?'0.'+v:v);
      if(from==='model'){row([{model:{n:10,sh:n}}],false);steps.push(P('Kira bahagian berkrim daripada 10.',n,[n+1,n-1,10-n],{note:`${n} persepuluh.`},{glow:'sh'}))}
      if(from==='rest'){row([{model:{n:10,eat:n}}],false);steps.push(P(`Satu kek = 10 persepuluh. Dimakan ${n}. 10 − ${n} = ?`,v,[v+1,v-1,n],{note:`${v} persepuluh tinggal.`},{glow:'left'}))}
      const r=row(o==='dec'?[{v:sv}]:[{fr:[sv,10]}],from==='dec');
      if(from==='dec'){row([{t:`0.${n}`}],false);steps.push(P(`0.${n}: digit selepas titik = ?`,n,[n+1,n-1,10-n],{set:set(sv),note:`0.${n} = ${n} persepuluh = ${FS(n,10)}.`}))}
      else steps.push(o==='dec'?P(`${v} persepuluh dalam perpuluhan = ?`,'0.'+v,['0.0'+v,v+'.0','0.'+(10-v)],{showRow:r,set:set(sv),note:`${v} persepuluh = 0.${v}.`}):G(`${v} daripada 10 = ${FS(v,10)}.`,{showRow:r,set:set(sv)}));
      out={N:v,D:10,text:o==='dec'?'0.'+v:FS(v,10),exact:o!=='dec'}}
    else if(T==='qty'){
      // n/d of N: find 1/d first (N ÷ d), then n of them; "belum dijual" takes that from N.
      const{n,d,N,rest}=spec;if(![n,d,N].every(I)||N%d)return null;const g=N/d,sg=S(g),sp=S(n*g);
      row([{fr:[n,d]},{t:'daripada'},{v:N}],false);const r1=row([{fr:[1,d]},{t:'='},{v:sg}]),r2=row([{fr:[n,d]},{t:'='},{v:sp}]);
      steps.push(X(P(`Cari ${FS(1,d)} dulu: ${N} ÷ ${d} = ?`,g,[g+1,N-d,g-1],{showRow:r1,set:set(sg),note:`${FS(1,d)} daripada ${N} = ${g}.`}),'div',N,d));
      steps.push(X(P(`${FS(n,d)}: ${g} × ${n} = ?`,n*g,[n*g+g,n+g,g],{showRow:r2,set:set(sp),note:`${FS(n,d)} daripada ${N} = ${n*g}.`}),'mul',g,n));
      if(rest){const left=N-n*g,sl=S(left),r3=row([{t:`${N} −`},{v:n*g},{t:'='},{v:sl}]);
        steps.push(P(`Belum dijual: ${N} − ${n*g} = ?`,left,[left+1,left-1,n*g],{showRow:r3,set:set(sl),note:`${left} belum dijual.`}));out={N:left,D:1,text:String(left)}}
      else out={N:n*g,D:1,text:String(n*g)}}
    else if(T==='mulW'||T==='mulF'){
      // n/d × k: the numerator times k, the denominator stays. a/b × c/d: top × top, bottom × bottom.
      let{n,d,w=0}=spec;if(!I(n)||!I(d))return null;
      const k=spec.k,c=spec.c,e=spec.e,line=[w?{mx:[w,n,d]}:{fr:[n,d]},{t:'×'},T==='mulW'?{v:k}:{fr:[c,e]}];row(line,false);
      if(w){const A=w*d+n,sa=S(A),r=row([{t:'='},{fr:[sa,d]},{t:'×'},T==='mulW'?{v:k}:{fr:[c,e]}]);
        steps.push(P(`Tukar dulu: ${w} × ${d} + ${n} = ?`,A,[A+1,w*d,w+d+n],{showRow:r,set:set(sa),note:`${MS(w,n,d)} = ${FS(A,d)}.`}));n=A}
      if(T==='mulW'){if(!I(k)||k<2)return null;const P0=n*k,sp=S(P0),r=row([{t:'='},{fr:[sp,d]}]);
        steps.push(X(P(`Darab pengangka: ${n} × ${k} = ?`,P0,[n+k,P0+n,P0-1],{showRow:r,set:set(sp),note:`Penyebut kekal ${d}.`}),'mul',n,k));out=tail(P0,d)}
      else{if(!I(c)||!I(e))return null;const tn=n*c,td=d*e,s1=S(tn),s2=S(td),r=row([{t:'='},{fr:[s1,s2]}]);
        steps.push(X(P(`Atas × atas: ${n} × ${c} = ?`,tn,[n+c,tn+1,tn-1],{showRow:r,set:set(s1)}),'mul',n,c));
        steps.push(X(P(`Bawah × bawah: ${d} × ${e} = ?`,td,[d+e,td+1,td-1],{set:set(s2),note:`${FS(tn,td)}.`}),'mul',d,e));out=tail(tn,td)}}
    else if(T==='div'){
      // ÷ a fraction = × its reciprocal (salingan); a whole number k is k/1, so ÷ k = × 1/k.
      let{n,d,w=0,W,c,e,k}=spec;if(W!==undefined){n=W;d=1}
      if(!I(n)||!I(d))return null;const byWhole=I(k);if(byWhole){c=k;e=1}if(!I(c)||!I(e)||c<1)return null;
      const L=W!==undefined?{v:W}:w?{mx:[w,n,d]}:{fr:[n,d]},R=byWhole?{v:k}:{fr:[c,e]};row([L,{t:'÷'},R],false);
      if(w){const A=w*d+n,sa=S(A),r=row([{t:'='},{fr:[sa,d]},{t:'÷'},R]);
        steps.push(P(`Tukar dulu: ${w} × ${d} + ${n} = ?`,A,[A+1,w*d,w+d+n],{showRow:r,set:set(sa),note:`${MS(w,n,d)} = ${FS(A,d)}.`}));n=A}
      const inv=FS(e,c),sr=S(byWhole?1:e),sd=S(c),Lr=W!==undefined?{v:W}:{fr:[n,d]},r=row([{t:'='},Lr,{t:'×'},{fr:[sr,sd]}]);
      steps.push(P(byWhole?`Bahagi dengan ${k} = darab dengan ${FS(1,k)}. Salingan ${k} = ?`:`Bahagi dengan pecahan = darab dengan salingannya. Salingan ${FS(c,e)} = ?`,inv,[FS(c,e),byWhole?String(k):FS(e,c+1),FS(c,e+1)],{showRow:r,set:set(sr,sd),note:`÷ jadi ×, ${byWhole?k:FS(c,e)} jadi ${inv}.`}));
      const tn=n*e,td=d*c,s1=S(tn),s2=d===1?td:S(td),r2=row([{t:'='},{fr:[s1,s2]}]);
      steps.push(X(P(d===1?`${n} × ${e} = ?`:`Atas × atas: ${n} × ${e} = ?`,tn,[n+e,tn+1,tn-1],{showRow:r2,set:set(s1),...(d===1?{note:`${FS(tn,td)}.`}:{})}),'mul',n,e));
      if(d!==1)steps.push(X(P(`Bawah × bawah: ${d} × ${c} = ?`,td,[d+c,td+1,td-1],{set:set(s2),note:`${FS(tn,td)}.`}),'mul',d,c));
      out=td===1?{N:tn,D:1,text:String(tn)}:tail(tn,td)}
    if(!out||!steps.length)return null;
    const f=FIN(spec.ask==='gcf'?'Jadi faktor sepunya terbesar?':'Jadi jawapannya?');if(f)steps.push(f);
    return{op:'frac',rows,steps,value:out.N!==undefined?{N:out.N,D:out.D,exact:!!out.exact}:null,answerText:out.text,finalLabel:fin?String(fin.right):undefined,
      done:fin?`Jawapannya ${fin.right}.`:`Jawapannya ${out.text}.`};
  }
  /* Data (Pos Peninjau): read the chart, then work it out, one line at a time. spec.lines =
     [{say, right, wrongs, line, hl?, fact?, show?}]: each step's line is written on the work card
     after the pupil picks the right tile; hl (rows to light on the page's own chart) rides along.
     spec.value is the round's number; a pick round ends at its own label (opt.final). */
  function buildList(spec,opt={}){
    if(!spec||!Array.isArray(spec.lines)||!spec.lines.length)return null;
    const fin=opt.final&&Array.isArray(opt.final.choices)&&opt.final.choices.includes(opt.final.right)?opt.final:null;
    const ok=x=>x!==undefined&&x!==null&&x!==''&&!(typeof x==='number'&&(!Number.isFinite(x)||x<0));
    const rows=[],steps=[];
    for(const L of spec.lines){
      if(!L||!ok(L.right)||!L.say)return null;
      const r=rows.push({items:[{t:L.line||''}],hide:true})-1,right=String(L.right);
      const st=L.show?{kind:'show',col:-1,say:L.say,after:{showRow:r,note:L.note||''}}
        :{kind:'pick',col:-1,say:L.say,right,choices:order(right,(L.wrongs||[]).filter(ok).map(String).filter(x=>x!==right)),after:{showRow:r,note:L.note||''}};
      if(st.kind==='pick'&&st.choices.length<2)return null;
      if(L.hl)st.hl=L.hl;if(L.fact)st.fact=L.fact;steps.push(st);
    }
    if(fin)steps.push({kind:'pick',col:-1,say:spec.finSay||'Jadi jawapannya?',right:String(fin.right),choices:order(String(fin.right),fin.choices.map(String).filter(x=>x!==String(fin.right)),4),after:{note:''}});
    else if(spec.value===undefined)return null;
    return{op:'frac',list:true,rows,steps,value:spec.value,finalLabel:fin?String(fin.right):undefined,answerText:spec.text,done:spec.done||(fin?`Jawapannya ${fin.right}.`:`Jawapannya ${spec.text??spec.value}.`)};
  }
  function boardHTML(plan,opt={}){
    if(plan.op==='frac'){
      const cell=x=>x&&typeof x==='object'&&'id' in x?`<span class="wk-c wk-fs wk-empty" data-s="${x.id}"></span>`:`<span class="wk-c wk-fs">${esc(x)}</span>`;
      const model=m=>`<span class="wk-model" style="--p:${m.n}">${[...Array(m.n).keys()].map(i=>{const k=i<(m.eat||0)?'eat':i<(m.eat||0)+(m.sh||0)?'sh':'un';return`<i data-k="${k}" class="${k==='sh'?'on':k==='eat'?'eat':''}"></i>`}).join('')}</span>`;
      const item=it=>it.fr?`<span class="wk-fr">${cell(it.fr[0])}<i></i>${cell(it.fr[1])}</span>`
        :it.mx?`<span class="wk-mx">${cell(it.mx[0])}<span class="wk-fr">${cell(it.mx[1])}<i></i>${cell(it.mx[2])}</span></span>`
        :it.model?model(it.model):it.tag?`<span class="wk-tag">${cell(it.tag)}</span>`:it.v!==undefined?cell(it.v):`<span class="wk-ft">${esc(it.t)}</span>`;
      return `<div class="wk-board wk-frac${plan.list?' wk-list':''}">${plan.rows.map((r,i)=>`<div class="wk-frow${r.hide?' wk-hide':''}" data-r="${i}">${r.items.map(item).join('')}</div>`).join('')}</div>`;
    }
    const n=plan.cols,[a,b]=plan.rows,A=digits(a),B=digits(b),cell=(cls,txt,col,extra='')=>`<span class="wk-c ${cls}" data-col="${col}"${extra}>${txt}</span>`;
    const cols=[...Array(n).keys()].reverse();
    const dp=plan.dp||0,H=i=>plan.money?MNAMES[i]:i<dp?DECH[dp-1-i]:PLACE[i-dp];
    const head=cols.map(i=>cell('wk-h',H(i)==='puluh ribu'?'p.ribu':H(i)==='ratus ribu'?'r.ribu':H(i),i)).join('');
    if(plan.op==='grid'){
      let g='';for(let i=0;i<100;i++)g+=`<i class="wk-g${i<plan.n?' on':''}" data-r="${Math.floor(i/10)}" data-g="${i}"></i>`;
      return `<div class="wk-board wk-gridb"><div class="wk-hg">${g}</div></div>`;
    }
    if(plan.op==='seq'){
      return `<div class="wk-board wk-seq"><div class="wk-trail">${plan.items.map((v,i)=>`<span class="wk-step">${i?`<i class="wk-hop" data-h="${i}" aria-hidden="true">${plan.hops?'':'›'}</i>`:''}<span class="wk-c wk-box${v===null?' wk-q':''}" data-i="${i}">${v===null?'?':nf(v)}</span></span>`).join('')}</div></div>`;
    }
    if(plan.op==='pv'){
      const pdp=plan.dp||0,NM=pdp?names(pdp):PLACE,HD=i=>i<pdp?DECH[pdp-1-i]:NM[i],ptc=i=>pdp&&i===pdp?' wk-pt':'';
      const head2=cols.map(i=>cell('wk-h'+(opt.hideHead?' wk-hide':''),opt.hideHead?'?':(HD(i)==='puluh ribu'?'p.ribu':HD(i)==='ratus ribu'?'r.ribu':HD(i)),i,` data-name="${esc(HD(i))}"`)).join('');
      const rowPV=(v,r)=>{const D=pdp?padTo(digits(v),pdp+1):digits(v),blank=(plan.blank||[]).includes(r);return`<div class="wk-row wk-pvrow${blank?' wk-blank':''}" data-row="${r}"><span class="wk-op"></span>${cols.map(i=>cell('wk-d wk-tap'+ptc(i)+(blank?' wk-empty':''),blank||D[i]===undefined?'':D[i],i,` data-row="${r}"`)).join('')}</div>`};
      const sym=plan.rows.length===2&&plan.steps.some(s=>s.after&&s.after.sym)?'<div class="wk-sym" aria-live="polite"></div>':'';
      return `<div class="wk-board wk-pv" style="--n:${n}"><div class="wk-row wk-head"><span class="wk-op"></span>${head2}</div>
        ${plan.rows.length>2?plan.rows.map((v,r)=>rowPV(v,r)).join(''):rowPV(plan.rows[0],0)+sym+(plan.rows[1]!==undefined?rowPV(plan.rows[1],1):'')}
        ${plan.answerRow?`<div class="wk-line"></div><div class="wk-row wk-ans"><span class="wk-op">${esc(plan.answerRow)}</span>${cols.map(i=>cell('wk-a'+ptc(i),'',i)).join('')}</div>`:''}</div>`;
    }
    if(plan.op==='div'){
      const dpv=plan.dp||0,D=(dpv?padTo(digits(a),dpv+1):digits(a)).reverse(),pc=c=>dpv&&c===dpv?' wk-pt':'';
      return `<div class="wk-board wk-div" style="--n:${D.length}"><div class="wk-row wk-head"><span class="wk-op"></span>${D.map((_,k)=>cell('wk-h','',D.length-1-k)).join('')}</div>
        <div class="wk-row wk-ans"><span class="wk-op"></span>${D.map((_,k)=>cell('wk-a'+pc(D.length-1-k),'',D.length-1-k)).join('')}</div>
        <div class="wk-row wk-top wk-bracket"><span class="wk-op wk-dv">${b}</span>${D.map((d,k)=>cell('wk-d'+pc(D.length-1-k),d,D.length-1-k)).join('')}</div>
        <div class="wk-rem" aria-live="polite"></div></div>`;
    }
    const pt=i=>dp&&i===dp?' wk-pt':'';   // the decimal point sits after the sa column
    const row=(D,sign,pad=true)=>`<div class="wk-row"><span class="wk-op">${sign||''}</span>${cols.map(i=>cell('wk-d'+(pad?pt(i):''),D[i]===undefined?(pad&&dp&&i<=dp?0:''):D[i],i)).join('')}</div>`;
    const sign=opt.hideSign?'<i class="wk-sign">?</i>':SIGN[plan.op];
    const second=plan.op==='mul'?row([b],sign,false):row(B,sign);   // the multiplier is a whole number: no point, no zeros
    return `<div class="wk-board${plan.money?' wk-money':''}" style="--n:${n}"><div class="wk-row wk-head"><span class="wk-op"></span>${head}</div>
      <div class="wk-row wk-carry"><span class="wk-op"></span>${cols.map(i=>cell('wk-k','',i)).join('')}</div>
      ${row(A)}${second}<div class="wk-line"></div>
      <div class="wk-row wk-ans"><span class="wk-op">=</span>${cols.map(i=>cell('wk-a'+pt(i),'',i)).join('')}</div></div>`;
  }
  /* Run the walkthrough. el = {board, tiles, say, next}; onDone(plan) after the last step. */
  function run(plan,el,onDone,opt={}){
    const q=s=>el.board.querySelector(s);let k=0,busy=false;
    // opt.html draws the page's own notation (Kedai Kek: [3/4] as a stacked fraction); else plain text.
    const H=t=>opt.html?opt.html(String(t)):esc(t),say=t=>{if(opt.html)el.say.innerHTML='<span>'+H(t)+'</span>';else el.say.textContent=t};
    const story=plan.steps[0]?.sentence===true;
    el.board.innerHTML=boardHTML(plan,{hideSign:story,hideHead:plan.hideHead});
    // A story asks for the number sentence first, with no board in the way; the board comes in after.
    const boardEl=el.board.querySelector('.wk-board');if(story&&boardEl)boardEl.classList.add('wk-wait');
    const focus=col=>el.board.querySelectorAll('.wk-c').forEach(c=>c.classList.toggle('wk-on',Number(c.dataset.col)===col));
    const apply=a=>{
      if(!a)return;
      const topCell=col=>[...el.board.querySelectorAll('.wk-row:not(.wk-head):not(.wk-carry):not(.wk-ans)')][0].querySelector(`[data-col="${col}"]`);
      const swap=(col,from,to)=>{const c=topCell(col);if(c){c.innerHTML=`<s class="wk-old">${from}</s>${to}`;c.classList.add('wk-pop','wk-changed')}};
      if(a.borrow)for(const x of a.borrow)swap(x.col,x.from,x.to);
      if(a.gain)swap(a.gain.col,a.gain.from,a.gain.to);
      if(a.sign){const g=el.board.querySelector('.wk-sign');if(g){g.textContent=a.sign;g.classList.add('wk-pop')}
        const bd=el.board.querySelector('.wk-board');if(bd){bd.classList.remove('wk-wait');bd.classList.add('wk-in')}}
      if(a.write&&a.write.digit!==null&&a.write.digit!==undefined&&!a.write.lead){const c=q(`.wk-ans [data-col="${a.write.col}"]`);if(c){c.textContent=a.write.digit;c.classList.add('wk-drop')}}
      if(a.carry){const c=q(`.wk-carry [data-col="${a.carry.col}"]`);if(c){c.textContent=a.carry.digit||1;c.classList.add('wk-fly')}}
      if(a.rem!==undefined){const r=q('.wk-rem');if(r)r.textContent=a.rem?`baki ${a.rem}`:''}
      if(a.mark){const c=q(`.wk-pvrow[data-row="${a.mark.row}"] [data-col="${a.mark.col}"]`);if(c)c.classList.add('wk-mark','wk-pop')}
      if(a.reveal)el.board.querySelectorAll('.wk-head .wk-hide').forEach(c=>{c.textContent=c.dataset.name==='puluh ribu'?'p.ribu':c.dataset.name==='ratus ribu'?'r.ribu':c.dataset.name;c.classList.remove('wk-hide');c.classList.add('wk-pop')});
      if(a.answer!==undefined){const D=padTo(digits(a.answer),(plan.dp||0)+1);el.board.querySelectorAll('.wk-ans .wk-a').forEach(c=>{const col=Number(c.dataset.col),v=D[col];if(v!==undefined&&!(a.answerFrom>col)){c.textContent=v;c.classList.add('wk-drop')}})}
      if(a.sym){const g=q('.wk-sym');if(g){g.textContent=a.sym;g.classList.add('wk-pop')}}
      if(a.done){const r=q(`.wk-pvrow[data-row="${a.done.row}"]`);if(r){r.classList.add('wk-rowdone');const b=r.querySelector('.wk-op');if(b){b.textContent=a.done.rank;b.classList.add('wk-rank','wk-pop')}}}
      if(a.hop){const h=q(`.wk-hop[data-h="${a.hop.i}"]`);if(h){h.textContent=a.hop.label;h.classList.add('wk-hopl','wk-pop')}}
      if(a.set)for(const[id,v]of Object.entries(a.set)){const c=q(`[data-s="${id}"]`);if(c){c.textContent=v;c.classList.remove('wk-empty');c.classList.add('wk-drop')}}
      if(a.showRow!==undefined){const r=q(`.wk-frow[data-r="${a.showRow}"]`);if(r){r.classList.remove('wk-hide');r.classList.add('wk-pop')}}
      if(a.fill&&a.fill.i!==undefined){const c=q(`.wk-box[data-i="${a.fill.i}"]`);if(c){c.textContent=nf(a.fill.v);c.classList.remove('wk-q');c.classList.add('wk-drop')}}
      else if(a.fill){const c=q(`.wk-pvrow[data-row="${a.fill.row}"] [data-col="${a.fill.col}"]`);if(c){c.textContent=a.fill.digit;c.classList.remove('wk-empty');c.classList.add('wk-drop')}}
    };
    /* Owner (2026-10-24): the pupil must see where to look. Each step: Wira's line pops and its "?" pulses,
       the slot the answer goes into pulses (berry, with "?"), and the numbers the step works on glow (gold). */
    // The page's own question (data table, work card) sits beside Wira's panel, inside the same box.
    const lookRoot=(()=>{let a=el.board;while(a&&a.contains&&!a.contains(el.say))a=a.parentElement;a=a||el.board;return a.classList.contains('wk-wrap')&&a.parentElement&&a.parentElement!==document.body?a.parentElement:a})();
    const clearCue=()=>{el.board.querySelectorAll('.wk-ghost').forEach(g=>g.remove());el.board.querySelectorAll('.wk-next,.wk-src').forEach(c=>c.classList.remove('wk-next','wk-src'));
      lookRoot.querySelectorAll('span.wk-lookt').forEach(x=>{const p=x.parentNode;p.replaceChild(document.createTextNode(x.textContent),x);p.normalize()});
      lookRoot.querySelectorAll('.wk-look').forEach(x=>x.classList.remove('wk-look'));if(el.tiles)el.tiles.classList.remove('wk-pickhere')};
    /* "Look here": a number the step works on glows where the pupil can see it: a board cell first, then a table
       cell or card on the page, then the number inside a work line ("3 kg = 3 000 g"). Never Wira's line or the tiles. */
    const skip=n=>{for(let x=n;x&&x!==lookRoot.parentNode;x=x.parentElement){if(x===el.say||x===el.tiles||x===el.inline||x.tagName==='BUTTON'||(x.classList&&(x.classList.contains('wk-ghost')||x.classList.contains('wk-hide')||x.classList.contains('wk-next'))))return true}
      const e=n.nodeType===1?n:n.parentElement;return !e||!e.getClientRects().length};
    const numPat=t=>{const v=String(t).replace(/[\s\u00a0,]/g,'');if(!/^\d+(\.\d+)?$|^\d{1,2}:\d{2}$/.test(v))return null;
      const [i,d]=v.split('.'),body=i.replace(/\B(?=(\d{3})+(?!\d))/g,'§').replace(/§/g,'[\\s\\u00a0,]?')+(d?'\\.'+d:'');
      return new RegExp('(?<![\\d.,:])'+body+'(?![\\d]|[.,:]\\d|[\\s\\u00a0]\\d{3}(?!\\d))')};
    const lookNum=(t,used)=>{const re=numPat(t);if(!re)return false;const want=String(t).replace(/[\s\u00a0,]/g,'');
      // a page element whose whole text is the number (a table cell, a tag)
      for(const e of lookRoot.querySelectorAll('*')){if(e.children.length||used.has(e)||skip(e))continue;const tx=e.textContent.replace(/[\s\u00a0,]/g,'');if(tx===want){used.add(e);e.classList.add(e.matches('.wk-c,.wk-box')?'wk-src':'wk-look');return true}}
      // the number inside a line of text
      const w=document.createTreeWalker(lookRoot,NodeFilter.SHOW_TEXT);while(w.nextNode()){const n=w.currentNode;if(used.has(n.parentElement)||skip(n))continue;const m=re.exec(n.nodeValue);if(!m)continue;
        const r=n.splitText(m.index);r.splitText(m[0].length);const sp=document.createElement('span');sp.className='wk-lookt';sp.textContent=r.nodeValue;r.parentNode.replaceChild(sp,r);used.add(sp);return true}
      return false};
    // The numbers Wira's line names (not inside a [fraction], not after "="): the first, and any with two or more digits.
    const sayNums=t=>{const x=String(t||'').replace(/\[[^\]]*\]/g,' ').replace(/=\s*\?[\s\S]*$/,''),out=[];const re=/\d{1,2}:\d{2}|\d{1,3}(?:[ \u00a0]\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?/g;let m;
      while((m=re.exec(x))){const v=m[0].replace(/[\s\u00a0]/g,'');if(!out.length||v.replace(/\D/g,'').length>=2)out.push(v)}return out.slice(0,3)};
    const markQ=node=>{const w=document.createTreeWalker(node,NodeFilter.SHOW_TEXT),list=[];while(w.nextNode())if(w.currentNode.nodeValue.includes('?'))list.push(w.currentNode);
      // Only a "?" that stands for a number (after =, an operation sign or a space, not the end of a word) becomes the pulsing blank.
      for(const t of list){const v=t.nodeValue,f=document.createDocumentFragment();let last=0;
        for(let i=0;i<v.length;i++)if(v[i]==='?'&&(i===0||/[\s=×÷+−\-]/.test(v[i-1]))){if(i>last)f.appendChild(document.createTextNode(v.slice(last,i)));const q=document.createElement('span');q.className='wk-qm';q.textContent='?';f.appendChild(q);last=i+1}
        if(last===0)continue;if(last<v.length)f.appendChild(document.createTextNode(v.slice(last)));t.parentNode.replaceChild(f,t)}};
    const cue=s=>{
      clearCue();
      try{markQ(el.say)}catch(_){}
      el.say.classList.remove('wk-saynew');void el.say.offsetWidth;el.say.classList.add('wk-saynew');
      if(s.kind==='tap')return;
      const A=s.after||{},tg=[];
      if(A.set)for(const id of Object.keys(A.set)){const c=q(`[data-s="${id}"]`);if(c)tg.push(c)}
      if(A.showRow!==undefined){const r=q(`.wk-frow[data-r="${A.showRow}"]`);
        if(r&&r.classList.contains('wk-hide')){
          // A work-card line (lists) holds its answer as text: keep it hidden, show a pulsing "?" line where it will appear.
          // A fraction row is shown early, empty, only when the answer goes into one of its slots and no visible number gives it away.
          const right=String(s.right??'').replace(/\s+/g,''),shown=[...r.querySelectorAll('.wk-c')].filter(c=>!c.classList.contains('wk-empty')).map(c=>c.textContent.replace(/\s+/g,''));
          if(!plan.list&&tg.some(c=>r.contains(c))&&!(right&&shown.includes(right))){r.classList.remove('wk-hide');r.classList.add('wk-pop')}
          else if(s.kind==='pick'){const g=document.createElement('div');g.className='wk-frow wk-ghost';g.innerHTML='<span class="wk-c wk-next"></span>';r.parentNode.insertBefore(g,r)}}}
      if(A.write&&A.write.digit!==null&&A.write.digit!==undefined&&!A.write.lead){const c=q(`.wk-ans [data-col="${A.write.col}"]`);if(c)tg.push(c)}
      if(A.fill&&A.fill.i!==undefined){const c=q(`.wk-box[data-i="${A.fill.i}"]`);if(c)tg.push(c)}
      else if(A.fill){const c=q(`.wk-pvrow[data-row="${A.fill.row}"] [data-col="${A.fill.col}"]`);if(c)tg.push(c)}
      tg.forEach(c=>c.classList.add('wk-next'));
      // The numbers of a fact step (a × b): the first matching number on the board glows. Column boards
      // already light their column, so only boards without columns (fractions, lists, trails) get this.
      if(s.fact&&!(s.col>=0)){
        const norm=t=>String(t).replace(/\s+/g,''),used=new Set(tg);
        // a number just worked out (it dropped in) comes before the same number printed in the question
        const cells=[...el.board.querySelectorAll('.wk-c,.wk-box')].filter(c=>c.textContent.trim()!==''&&!c.closest('.wk-hide')).sort((x,y)=>y.classList.contains('wk-drop')-x.classList.contains('wk-drop'));
        const find=alts=>{for(const a of alts){const c=cells.find(x=>!used.has(x)&&norm(x.textContent)===a);if(c){used.add(c);c.classList.add('wk-src');return}}};
        const sym=SIGN[s.fact.op]||'';find([String(s.fact.a)]);find([sym+s.fact.b,String(s.fact.b)]);
      }
      if(!(s.col>=0)){
        const used=new Set([...el.board.querySelectorAll('.wk-src,.wk-next')]);
        const want=s.fact?[s.fact.a,s.fact.b]:sayNums(s.say);
        const done=new Set([...el.board.querySelectorAll('.wk-src')].map(c=>c.textContent.replace(/[^\d.:]/g,'')));
        for(const t of want){const v=String(t).replace(/[\s\u00a0,]/g,'');if(done.has(v)){done.delete(v);continue}try{lookNum(v,used)}catch(_){}}
      }
      // The hundred grid: the rows or squares the question asks about.
      if(plan.op==='grid'&&s.look){const r=Math.floor(plan.n/10);el.board.querySelectorAll('.wk-g').forEach(g=>{const row=Number(g.dataset.r),on=g.classList.contains('on');
        if((s.look==='full'&&on&&row<r)||(s.look==='part'&&on&&row===r)||(s.look==='off'&&!on))g.classList.add('wk-src')})}
      // No slot on the board for this answer: the choices below pulse, so the pupil knows where to answer.
      if(!el.board.querySelector('.wk-next')&&el.tiles)el.tiles.classList.add('wk-pickhere');
    };
    const tapCells=on=>el.board.querySelectorAll('.wk-tap').forEach(c=>{c.classList.toggle('wk-can',on&&(c.textContent!==''||c.classList.contains('wk-empty')));c.onclick=on?()=>tap(c):null});
    const show=()=>{
      busy=false;
      if(k>=plan.steps.length){focus(-1);tapCells(false);clearCue();el.say.innerHTML=plan.done?(opt.html?`<span><b>Siap!</b> ${H(plan.done)}</span>`:`<b>Siap!</b> ${H(plan.done)}`):`<b>Siap!</b> ${esc(nf(plan.rows[0]))} ${SIGN[plan.op]} ${esc(nf(plan.rows[1]))} = ${esc(nf(plan.answer))}${plan.rem?` baki ${plan.rem}`:''}.`;el.tiles.innerHTML='';if(el.inline)el.inline.innerHTML='';onDone&&onDone(plan);return}
      const s=plan.steps[k];shownAt=Date.now();focus(s.kind==='tap'?-1:s.col);say(s.say);cue(s);opt.onShow&&opt.onShow(k,plan.steps.length);
      if(s.pre&&s.pre.pair){el.board.querySelectorAll('.wk-box').forEach(c=>{const i=Number(c.dataset.i);c.classList.toggle('wk-pair',s.pre.pair.includes(i));c.classList.toggle('wk-target',i===s.pre.hop)})}
      el.board.querySelectorAll('.wk-diff,.wk-grp').forEach(c=>c.classList.remove('wk-diff','wk-grp'));
      el.board.querySelectorAll('.wk-model i').forEach(c=>{const g=s.pre&&s.pre.glow,k=c.dataset.k;c.classList.toggle('wk-glow',!!g&&(g==='all'||g===k||(g==='left'&&k!=='eat')))});
      if(s.pre&&s.pre.group)s.pre.group.forEach(col=>el.board.querySelectorAll(`.wk-pvrow [data-col="${col}"]`).forEach(c=>c.classList.add('wk-grp')));
      if(s.pre&&s.pre.diffRows){s.pre.diffRows.forEach(r=>{const c=q(`.wk-pvrow[data-row="${r}"] [data-col="${s.pre.diff}"]`);if(c)c.classList.add('wk-diff')})}
      else if(s.pre){const cells=col=>el.board.querySelectorAll(`.wk-pvrow [data-col="${col}"]`);
        if(s.pre.same)s.pre.same.forEach(c=>cells(c).forEach(x=>x.classList.add('wk-same')));
        if(s.pre.diff!==undefined)cells(s.pre.diff).forEach(x=>x.classList.add('wk-diff'))}
      // A tap step: the pupil touches the digit on the board; no tiles.
      tapCells(s.kind==='tap');
      // Where a place differs, only that place glows; the other digits stay quiet.
      if(s.kind==='tap'&&s.pre?.diff!==undefined)el.board.querySelectorAll('.wk-can').forEach(c=>{if(Number(c.dataset.col)!==s.pre.diff||(s.pre.diffRows&&!s.pre.diffRows.includes(Number(c.dataset.row))))c.classList.remove('wk-can')});
      if(s.kind==='tap'){el.tiles.innerHTML='';if(el.inline)el.inline.innerHTML='';el.board.querySelector('.wk-board')?.classList.add('wk-tapnow');return}
      el.board.querySelector('.wk-board')?.classList.remove('wk-tapnow');
      // The story's sentence choices sit right under Wira's question (el.inline) when the page gives a place for them.
      const T=s.sentence&&el.inline?el.inline:el.tiles;if(T!==el.tiles)el.tiles.innerHTML='';if(el.inline&&T!==el.inline)el.inline.innerHTML='';
      T.classList.toggle('wk-one',!!s.sentence||s.kind!=='pick');T.classList.toggle('wk-two',s.kind==='pick'&&s.choices.length===2&&!s.sentence);
      T.classList.toggle('wk-wide',s.kind==='pick'&&s.choices.some(v=>String(v).length>6));
      if(s.kind==='pick')T.innerHTML=s.choices.map(v=>`<button type="button" class="tl wk-t${s.sentence?' wk-s':''}" data-v="${esc(v)}">${H(v)}</button>`).join('');
      else T.innerHTML=`<button type="button" class="tl wk-t wk-go" data-v="go">${s.kind==='borrow'?'Pinjam 1':'Teruskan'}</button>`;
      T.querySelectorAll('.wk-t').forEach((btn,i)=>{btn.onclick=()=>pick(btn);btn.style.setProperty('--i',i);btn.classList.add('wk-enter')});
      try{T.scrollIntoView({block:'nearest',behavior:'smooth'})}catch(_){}
    };
    let misses=0,shownAt=0;const tried=new Set();
    // A basic-fact step: its first pick is a fact try for the brain (lens 4.2, basic facts), even when guided.
    const fact=(s,ok,v)=>{const f=s.fact;if(!f||tried.has(k)||(f.op==='mul'&&Math.min(f.a,f.b)<2)||(f.op==='div'&&f.b<2))return;   // × 1 and ÷ 1 say nothing about a table
      tried.add(k);opt.onFact&&opt.onFact({...s.fact,ok,value:v,answer:s.right,ms:Date.now()-shownAt})};
    const tap=c=>{
      if(busy)return;const s=plan.steps[k];if(!s||s.kind!=='tap')return;
      if(Number(c.dataset.row)!==s.row||(!s.anyCol&&Number(c.dataset.col)!==s.col)){
        misses++;c.classList.remove('wk-no');void c.offsetWidth;c.classList.add('wk-no');
        q(`.wk-pvrow[data-row="${s.row}"] [data-col="${s.col}"]`)?.classList.add('wk-hint');opt.onMiss&&opt.onMiss(s);return;
      }
      busy=true;tapCells(false);el.board.querySelector('.wk-board')?.classList.remove('wk-tapnow');el.board.querySelectorAll('.wk-hint').forEach(x=>x.classList.remove('wk-hint'));
      clearCue();apply(s.after);if(s.after?.note)say(s.after.note);opt.onStep&&opt.onStep(s);
      k++;setTimeout(show,opt.pace??900);
    };
    const pick=btn=>{
      if(busy)return;const s=plan.steps[k];
      if(s.kind==='pick')fact(s,String(btn.dataset.v)===String(s.right),btn.dataset.v);
      if(s.kind==='pick'&&String(btn.dataset.v)!==String(s.right)){
        misses++;btn.classList.remove('wk-no');void btn.offsetWidth;btn.classList.add('wk-no');btn.disabled=true;
        [...btn.parentNode.querySelectorAll('.wk-t')].find(b=>b.dataset.v===String(s.right))?.classList.add('wk-hint');opt.onMiss&&opt.onMiss(s);return;
      }
      busy=true;btn.classList.add('wk-yes');btn.parentNode.querySelectorAll('.wk-t').forEach(b=>b.disabled=true);
      clearCue();apply(s.after);if(s.after?.note)say(s.after.note);opt.onStep&&opt.onStep(s);
      k++;setTimeout(show,opt.pace??900);
    };
    show();
    if(typeof window!=='undefined')window.__wkStep=()=>plan.steps[k]||null;   // tests only
    if(typeof window!=='undefined')window.__wkRight=()=>{const s=plan.steps[k];return s&&s.kind==='pick'?String(s.right):s&&s.kind==='tap'?`tap:${s.row}:${s.col}`:'go'};   // tests only
    return{get step(){return k},get misses(){return misses},plan};
  }
  /* A guided fact try → the parent app (js/minigame-telemetry-v1.js), as its own item with
     facets {op, operands, guided}: lens 4.2 reads it as sifir / basic-fact evidence. */
  let factN=0;
  function reportFact(game,f,round){
    try{const p=new URLSearchParams(location.search),nonce=p.get('pa_nonce');if(!nonce||window.parent===window||!f||!SIGN[f.op])return;
      window.parent.postMessage({type:'PA_MINIGAME_ATTEMPT',version:1,nonce,game,skillId:p.get('skill')||p.get('pa_origin_skill')||null,key:`${nonce}:${round}:f${++factN}`,
        prompt:`${f.a} ${SIGN[f.op]} ${f.b}`,answer:String(f.answer),ok:!!f.ok,first:true,hints:0,ms:Math.max(0,f.ms|0),
        facets:{op:f.op,operands:[f.a,f.b],guided:true},...(f.ok?{}:{value:String(f.value).slice(0,24)})},location.origin)}catch(_){}
  }
  return Object.freeze({VERSION,PLACE,parse,build,buildPV,buildFrac,buildList,reportFact,buildSeq,buildHops,buildPow10,buildChain,buildLong,runChain,boardHTML,run,_digits:digits,_nf:nf});
});
