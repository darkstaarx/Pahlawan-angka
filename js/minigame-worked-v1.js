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
  const VERSION='1.6.0';
  const PLACE=['sa','puluh','ratus','ribu','puluh ribu','ratus ribu','juta'],PLACE_=PLACE;
  const SIGN={add:'+',sub:'−',mul:'×',div:'÷'};
  /* Decimals (opt.dp): the numbers come scaled to whole numbers (0.45 → 45 with dp 2); the
     columns below sa are persepuluh, perseratus, perseribu, and the board shows the point. */
  const DECP=['persepuluh','perseratus','perseribu'],DECH=['1/10','1/100','1/1000'];
  const names=dp=>[...Array(12).keys()].map(i=>i<dp?DECP[dp-1-i]:PLACE[i-dp]);
  const fmtDp=dp=>x=>dp?(x/10**dp).toFixed(dp):nf(x);
  const digits=n=>String(Math.abs(Math.trunc(n))).split('').map(Number).reverse();
  const num=s=>Number(String(s).replace(/[\s, ]/g,''));
  // Thousands grouped with a no-break space from 10 000, as the games print them.
  const nf=n=>Math.abs(n)>=10000?String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'\u00a0'):String(n);
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
    let plan=null;const dp=opt.dp||0,N=dp?names(dp):PLACE;
    if(op==='add')plan=add(a,b,N,dp);
    else if(op==='sub'&&a>=b)plan=sub(a,b,N,dp);
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
      const f=fmtDp(dp);plan.dp=dp;plan.cols=Math.max(plan.cols,dp+1);plan.done=`${f(a)} ${SIGN[op]} ${f(b)} = ${f(plan.answer)}.`;
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
      steps.push({kind:'pick',col:i,ask,say:`Tempat ${PLACE[i]}: ${ask}`,right:s,choices:tiles(s,[c?x+y:s+1,s%10===s?s-1:s%10,Math.abs(x-y)]),
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
      steps.push({kind:'pick',col:i,ask,say:`Tempat ${PLACE[i]}: ${ask}`,right:d,choices:tiles(d,[Math.abs((A[i])-y),d+1,top[i]+y]),
        after:{write:{col:i,digit:d,lead:i===n-1&&d===0&&n>1&&i>dp},note:`Tulis ${d}.`}});
    }
    return{op:'sub',rows:[a,b],answer:a-b,cols:n,steps};
  }
  function mul(a,b){
    const A=digits(a),n=A.length,steps=[];let c=0;
    for(let i=0;i<n;i++){
      const p=A[i]*b+c,ask=`${A[i]} × ${b}${c?' + '+c:''} = ?`;
      steps.push({kind:'pick',col:i,ask,say:`Tempat ${PLACE[i]}: ${ask}`,right:p,choices:tiles(p,[c?A[i]*b:p+b,p-b,A[i]+b+c]),
        after:{write:{col:i,digit:p%10},carry:p>=10?{col:i+1,digit:Math.floor(p/10)}:null,note:p>=10?`Tulis ${p%10}, bawa ${Math.floor(p/10)} ke tempat ${PLACE[i+1]}.`:`Tulis ${p}.`}});
      c=Math.floor(p/10);
    }
    if(c)steps.push({kind:'show',col:n,say:`Tempat ${PLACE[n]}: ${c} yang dibawa turun.`,after:{write:{col:n,digit:c,multi:true},note:`Tulis ${c}.`}});
    return{op:'mul',rows:[a,b],answer:a*b,cols:digits(a*b).length,steps};
  }
  function div(a,b){
    // Short division (bahagi bentuk lazim): left to right, the remainder joins the next digit.
    const D=digits(a).reverse(),steps=[];let r=0,started=false;const qd=[];
    D.forEach((d,k)=>{
      const cur=r*10+d,q=Math.floor(cur/b),col=D.length-1-k;
      if(!started&&q===0&&k<D.length-1){r=cur;steps.push({kind:'show',col,say:`${cur} kurang daripada ${b}. Gabung dengan digit seterusnya.`,after:{write:{col,digit:null},note:'Tiada di sini.'}});return}
      started=true;qd.push(q);const nr=cur-q*b;
      steps.push({kind:'pick',col,ask:`${cur} ÷ ${b} = ?`,say:`${cur} ÷ ${b} = ? (berapa kumpulan ${b}?)`,right:q,choices:tiles(q,[q+1,q-1,cur%10]),
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
      const S=(x,y)=>`${nf(a)} ${SIGN[x]} ${nf(b)} ${SIGN[y]} ${nf(d)}`,flip={add:'sub',sub:'add'};
      const right=S(o1,o2);
      p1.steps.unshift({kind:'pick',col:-1,say:'Ayat matematik mana yang sepadan dengan cerita?',right,choices:order(right,[S(flip[o1],flip[o2]),S(o1,o1)]),sentence:true,
        after:{sign:SIGN[o1],note:`Betul: ${right}. Kira dari kiri: langkah pertama ${nf(a)} ${SIGN[o1]} ${nf(b)}.`}});
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
    if(!spec||typeof spec!=='object')return null;
    const t=spec.t;
    if(t==='round'){
      const n=spec.n,p=spec.place,P=PV[p+1];if(!Number.isInteger(n)||!(p>=0)||!P||n<=0)return null;
      const lo=Math.floor(n/P)*P,hi=lo+P,d=digits(n)[p]||0,up=d>=5,r=up?hi:lo,cols=Math.max(digits(n).length,digits(r).length);
      const steps=[
        {kind:'tap',row:0,col:p,say:`Bundar kepada ${PLACE[p+1]} terdekat. Tekan digit di tempat ${PLACE[p]}.`,after:{mark:{row:0,col:p},note:`Digit di tempat ${PLACE[p]} ialah ${d}.`}},
        {kind:'pick',col:-1,say:`Digit ${d}: 5 atau lebih?`,right:up?'Ya, 5 atau lebih':'Tidak, kurang 5',choices:['Ya, 5 atau lebih','Tidak, kurang 5'],
          after:{note:up?`${d} ialah 5 atau lebih: bundar naik. Tempat ${PLACE[p+1]} tambah 1.`:`${d} kurang daripada 5: tempat ${PLACE[p+1]} kekal.`}},
        {kind:'pick',col:-1,say:`Jadi ${nf(n)} ≈ ?`,right:nf(r),choices:order(nf(r),[nf(up?lo:hi),nf(Math.round(n/PV[p])*PV[p])]),
          after:{answer:r,note:`Digit selepas tempat ${PLACE[p+1]} jadi 0.`}}];
      return{op:'pv',rows:[n],answerRow:'≈',cols,steps,done:`${nf(n)} ≈ ${nf(r)}.`,answer:r};
    }
    if(t==='compare'){
      const a=spec.a,b=spec.b;if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0)return null;
      const A=digits(a),B=digits(b),cols=Math.max(A.length,B.length),steps=[];
      let j=cols-1;while(j>=0&&(A[j]||0)===(B[j]||0))j--;
      const same=[];for(let i=cols-1;i>j;i--)same.push(PLACE[i]);
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
        steps.push({kind:'tap',row:big,col:j,pre:{diff:j},say:`Tempat ${PLACE[j]} tidak sama: ${A[j]||0} dan ${B[j]||0}. Mana lebih besar? Tekan digit itu.`,after:{mark:{row:big,col:j},note:`${hi} lebih besar daripada ${lo}.`}});
      }
      const bigN=Math.max(a,b),smallN=Math.min(a,b);
      if(spec.ask==='symbol'){const sym=a>b?'>':a<b?'<':'=';
        steps.push({kind:'pick',col:-1,say:`${nf(a)} ___ ${nf(b)}`,right:sym,choices:['<','>','='],after:{sym,note:'Mulut buaya terbuka ke arah nombor yang lebih besar.'}});
        return{op:'pv',rows:[a,b],labels:['',''],cols,steps,done:`${nf(a)} ${sym} ${nf(b)}.`,answer:sym};
      }
      const want=spec.ask==='small'?smallN:bigN;
      steps.push({kind:'pick',col:-1,say:`Jadi yang lebih ${spec.ask==='small'?'kecil':'besar'}?`,right:nf(want),choices:order(nf(want),[nf(want===a?b:a)],2),after:{note:''}});
      return{op:'pv',rows:[a,b],labels:['',''],cols,steps,done:`${nf(want)} lebih ${spec.ask==='small'?'kecil':'besar'}.`,answer:want};
    }
    if(t==='compose'){
      // 600 + 70 + 2: each part goes to its place on an empty row; a place with no part gets 0.
      const n=spec.n,D=digits(n);if(!Number.isInteger(n)||n<10)return null;
      const steps=[];
      for(let i=D.length-1;i>=0;i--){
        const d=D[i];
        if(d)steps.push({kind:'tap',row:0,col:i,blank:true,say:`${nf(d*PV[i])}: digit ${d} di tempat ${PLACE[i]}. Tekan tempat ${PLACE[i]}.`,after:{fill:{row:0,col:i,digit:d},note:`Tulis ${d} di tempat ${PLACE[i]}.`}});
        else steps.push({kind:'show',col:i,say:`Tiada bahagian untuk tempat ${PLACE[i]}. Tulis 0.`,after:{fill:{row:0,col:i,digit:0},note:'Tempat kosong ditulis 0.'}});
      }
      return{op:'pv',rows:[n],blank:[0],cols:D.length,steps,done:`${expandStr(n)} = ${nf(n)}.`,answer:n};
    }
    // The round's own last choice (a pick round): {choices, right}.
    const fin=opt.final&&Array.isArray(opt.final.choices)&&opt.final.choices.includes(opt.final.right)?opt.final:null;
    const finalStep=say=>fin?[{kind:'pick',col:-1,say,right:fin.right,choices:fin.choices.length>4?fin.choices.slice(0,4):fin.choices,after:{note:''}}]:[];
    if(t==='order'){
      const L=spec.list;if(!Array.isArray(L)||L.length<2||L.some(x=>!Number.isInteger(x)||x<0)||new Set(L).size!==L.length)return null;
      const cols=Math.max(...L.map(x=>digits(x).length)),R=L.map((_,i)=>i),steps=[],small=!spec.desc;let rank=1;
      while(R.length>1){
        const D=R.map(r=>digits(L[r]));let j=cols-1;while(j>0&&D.every(d=>(d[j]||0)===(D[0][j]||0)))j--;
        const pickRow=R.reduce((a,b)=>small?(L[b]<L[a]?b:a):(L[b]>L[a]?b:a));
        steps.push({kind:'tap',row:pickRow,col:j,anyCol:true,pre:{diff:j,diffRows:[...R]},say:`Cari nombor paling ${small?'kecil':'besar'}. Banding tempat ${PLACE[j]}, kemudian tekan nombor itu.`,
          after:{done:{row:pickRow,rank},note:`${nf(L[pickRow])} ialah ${rank===1?'pertama':'ke-'+rank}.`}});
        R.splice(R.indexOf(pickRow),1);rank++;
      }
      steps.push({kind:'show',col:-1,say:`Tinggal ${nf(L[R[0]])}: ia ${'ke-'+rank}.`,after:{done:{row:R[0],rank},note:'Semua sudah tersusun.'}});
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
      return{op:'pv',rows:[n],cols:digits(n).length,steps,done:`${nf(n)} dibaca “${words(n)}”.`,answer:fin?fin.right:words(n),finalLabel:fin?fin.right:undefined};
    }
    if(t==='fromWords'){
      const n=spec.n,D=digits(n);if(!Number.isInteger(n)||n<10)return null;
      const C=chunks(n),word=i=>(C.find(c=>c.cols.includes(i))||{}).w,steps=[];
      for(let i=D.length-1;i>=0;i--){
        if(D[i])steps.push({kind:'tap',row:0,col:i,blank:true,say:`“${word(i)}”: digit ${D[i]} di tempat ${PLACE[i]}. Tekan tempat itu.`,after:{fill:{row:0,col:i,digit:D[i]},note:`Tulis ${D[i]}.`}});
        else steps.push({kind:'show',col:i,say:`Tempat ${PLACE[i]} tidak disebut. Tulis 0.`,after:{fill:{row:0,col:i,digit:0},note:'Tempat yang tiada disebut ialah 0.'}});
      }
      steps.push(...finalStep('Jadi angka yang betul ialah?'));
      return{op:'pv',rows:[n],blank:[0],cols:D.length,steps,done:`“${words(n)}” = ${nf(n)}.`,answer:n,finalLabel:fin?fin.right:undefined};
    }
    if(t==='expanded'){
      const n=spec.n,D=digits(n);if(!Number.isInteger(n)||n<10)return null;
      const steps=[];
      for(let i=D.length-1;i>=0;i--){if(!D[i])continue;const v=D[i]*PV[i];
        steps.push({kind:'pick',col:i,say:`Digit ${D[i]} di tempat ${PLACE[i]}: nilainya?`,right:nf(v),choices:order(nf(v),[nf(D[i]),nf(v*10)].filter(x=>x!==nf(v))),after:{mark:{row:0,col:i},note:`${D[i]} × ${nf(PV[i])} = ${nf(v)}.`}})}
      steps.push(...finalStep('Jadi cerakinan yang betul ialah?'));
      return{op:'pv',rows:[n],cols:D.length,steps,done:`${nf(n)} = ${expandStr(n)}.`,answer:fin?fin.right:expandStr(n),finalLabel:fin?fin.right:undefined};
    }
    if(t==='missingPart'){
      // 9041 = 9000 + ___ + 1: the places already written go grey; the pupil finds the one left.
      const n=spec.n,i=spec.i,D=digits(n);if(!Number.isInteger(n)||!(i>=0&&i<D.length)||!D[i])return null;
      const known=D.map((d,j)=>d&&j!==i?j:-1).filter(j=>j>=0),v=D[i]*PV[i];
      const steps=[
        {kind:'tap',row:0,col:i,pre:{same:known},say:`Tempat yang sudah ada dalam ayat jadi kelabu. Digit mana belum ada? Tekan digit itu.`,after:{mark:{row:0,col:i},reveal:true,note:`Digit ${D[i]} di tempat ${PLACE[i]}.`}},
        {kind:'pick',col:i,say:`Nilai = ${D[i]} × ${nf(PV[i])} = ?`,right:nf(v),choices:order(nf(v),[nf(D[i]),nf(v*10),nf(v/10)].filter(x=>x!==nf(v)&&!/\./.test(x))),after:{note:`Bahagian yang hilang ialah ${nf(v)}.`}}];
      return{op:'pv',rows:[n],cols:D.length,hideHead:true,steps,done:`${nf(n)} = ${expandStr(n)}.`,answer:v};
    }
    if(t==='placeName'||t==='digitValue'){
      const n=spec.n,i=spec.i,D=digits(n);if(!Number.isInteger(n)||!(i>=0&&i<D.length))return null;
      const d=D[i],names=PLACE.slice(0,Math.max(D.length,3)).map((x,j)=>[x,Math.abs(j-i)]).filter(x=>x[1]).sort((x,y)=>x[1]-y[1]).map(x=>x[0]);   // the places next to it first
      const steps=[
        {kind:'tap',row:0,col:i,say:`Tekan digit ${d} pada papan.`,after:{mark:{row:0,col:i},note:'Sekarang kira tempat dari kanan: sa, puluh, ratus…'}},
        {kind:'pick',col:i,say:`Digit ${d} di tempat apa?`,right:PLACE[i],choices:order(PLACE[i],names),after:{reveal:true,note:`Digit ${d} di tempat ${PLACE[i]}.`}}];
      if(t==='placeName')return{op:'pv',rows:[n],cols:D.length,hideHead:true,steps,done:`Digit ${d} di tempat ${PLACE[i]}.`,answer:PLACE[i]};
      const v=d*PV[i];
      steps.push({kind:'pick',col:i,say:`Nilai = ${d} × ${nf(PV[i])} = ?`,right:nf(v),choices:order(nf(v),[nf(d),nf(v*10),nf(v/10)].filter(x=>x!==nf(v)&&!/\./.test(x))),after:{note:`Nilai digit ${d} ialah ${nf(v)}.`}});
      return{op:'pv',rows:[n],cols:D.length,hideHead:true,steps,done:`${d} × ${nf(PV[i])} = ${nf(v)}.`,answer:v};
    }
    return null;
  }

  /* ---------- renderer ---------- */
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function boardHTML(plan,opt={}){
    const n=plan.cols,[a,b]=plan.rows,A=digits(a),B=digits(b),cell=(cls,txt,col,extra='')=>`<span class="wk-c ${cls}" data-col="${col}"${extra}>${txt}</span>`;
    const cols=[...Array(n).keys()].reverse();
    const dp=plan.dp||0,H=i=>i<dp?DECH[dp-1-i]:PLACE[i-dp];
    const head=cols.map(i=>cell('wk-h',H(i)==='puluh ribu'?'p.ribu':H(i)==='ratus ribu'?'r.ribu':H(i),i)).join('');
    if(plan.op==='seq'){
      return `<div class="wk-board wk-seq"><div class="wk-trail">${plan.items.map((v,i)=>`<span class="wk-step">${i?`<i class="wk-hop" data-h="${i}" aria-hidden="true">${plan.hops?'':'›'}</i>`:''}<span class="wk-c wk-box${v===null?' wk-q':''}" data-i="${i}">${v===null?'?':nf(v)}</span></span>`).join('')}</div></div>`;
    }
    if(plan.op==='pv'){
      const head2=cols.map(i=>cell('wk-h'+(opt.hideHead?' wk-hide':''),opt.hideHead?'?':(PLACE[i]==='puluh ribu'?'p.ribu':PLACE[i]==='ratus ribu'?'r.ribu':PLACE[i]==='juta'?'juta':PLACE[i]),i,` data-name="${esc(PLACE[i])}"`)).join('');
      const rowPV=(v,r)=>{const D=digits(v),blank=(plan.blank||[]).includes(r);return`<div class="wk-row wk-pvrow${blank?' wk-blank':''}" data-row="${r}"><span class="wk-op"></span>${cols.map(i=>cell('wk-d wk-tap'+(blank?' wk-empty':''),blank||D[i]===undefined?'':D[i],i,` data-row="${r}"`)).join('')}</div>`};
      const sym=plan.rows.length===2&&plan.steps.some(s=>s.after&&s.after.sym)?'<div class="wk-sym" aria-live="polite"></div>':'';
      return `<div class="wk-board wk-pv" style="--n:${n}"><div class="wk-row wk-head"><span class="wk-op"></span>${head2}</div>
        ${plan.rows.length>2?plan.rows.map((v,r)=>rowPV(v,r)).join(''):rowPV(plan.rows[0],0)+sym+(plan.rows[1]!==undefined?rowPV(plan.rows[1],1):'')}
        ${plan.answerRow?`<div class="wk-line"></div><div class="wk-row wk-ans"><span class="wk-op">${esc(plan.answerRow)}</span>${cols.map(i=>cell('wk-a','',i)).join('')}</div>`:''}</div>`;
    }
    if(plan.op==='div'){
      const D=digits(a).reverse();
      return `<div class="wk-board wk-div" style="--n:${D.length}"><div class="wk-row wk-head"><span class="wk-op"></span>${D.map((_,k)=>cell('wk-h','',D.length-1-k)).join('')}</div>
        <div class="wk-row wk-ans"><span class="wk-op"></span>${D.map((_,k)=>cell('wk-a','',D.length-1-k)).join('')}</div>
        <div class="wk-row wk-top wk-bracket"><span class="wk-op wk-dv">${b}</span>${D.map((d,k)=>cell('wk-d',d,D.length-1-k)).join('')}</div>
        <div class="wk-rem" aria-live="polite"></div></div>`;
    }
    const pt=i=>dp&&i===dp?' wk-pt':'';   // the decimal point sits after the sa column
    const row=(D,sign)=>`<div class="wk-row"><span class="wk-op">${sign||''}</span>${cols.map(i=>cell('wk-d'+pt(i),D[i]===undefined?(dp&&i<=dp?0:''):D[i],i)).join('')}</div>`;
    const sign=opt.hideSign?'<i class="wk-sign">?</i>':SIGN[plan.op];
    const second=plan.op==='mul'?row([b],sign):row(B,sign);
    return `<div class="wk-board" style="--n:${n}"><div class="wk-row wk-head"><span class="wk-op"></span>${head}</div>
      <div class="wk-row wk-carry"><span class="wk-op"></span>${cols.map(i=>cell('wk-k','',i)).join('')}</div>
      ${row(A)}${second}<div class="wk-line"></div>
      <div class="wk-row wk-ans"><span class="wk-op">=</span>${cols.map(i=>cell('wk-a'+pt(i),'',i)).join('')}</div></div>`;
  }
  /* Run the walkthrough. el = {board, tiles, say, next}; onDone(plan) after the last step. */
  function run(plan,el,onDone,opt={}){
    const q=s=>el.board.querySelector(s);let k=0,busy=false;
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
      if(a.answer!==undefined){const D=digits(a.answer);el.board.querySelectorAll('.wk-ans .wk-a').forEach(c=>{const v=D[Number(c.dataset.col)];if(v!==undefined){c.textContent=v;c.classList.add('wk-drop')}})}
      if(a.sym){const g=q('.wk-sym');if(g){g.textContent=a.sym;g.classList.add('wk-pop')}}
      if(a.done){const r=q(`.wk-pvrow[data-row="${a.done.row}"]`);if(r){r.classList.add('wk-rowdone');const b=r.querySelector('.wk-op');if(b){b.textContent=a.done.rank;b.classList.add('wk-rank','wk-pop')}}}
      if(a.hop){const h=q(`.wk-hop[data-h="${a.hop.i}"]`);if(h){h.textContent=a.hop.label;h.classList.add('wk-hopl','wk-pop')}}
      if(a.fill&&a.fill.i!==undefined){const c=q(`.wk-box[data-i="${a.fill.i}"]`);if(c){c.textContent=nf(a.fill.v);c.classList.remove('wk-q');c.classList.add('wk-drop')}}
      else if(a.fill){const c=q(`.wk-pvrow[data-row="${a.fill.row}"] [data-col="${a.fill.col}"]`);if(c){c.textContent=a.fill.digit;c.classList.remove('wk-empty');c.classList.add('wk-drop')}}
    };
    const tapCells=on=>el.board.querySelectorAll('.wk-tap').forEach(c=>{c.classList.toggle('wk-can',on&&(c.textContent!==''||c.classList.contains('wk-empty')));c.onclick=on?()=>tap(c):null});
    const show=()=>{
      busy=false;
      if(k>=plan.steps.length){focus(-1);tapCells(false);el.say.innerHTML=plan.done?`<b>Siap!</b> ${esc(plan.done)}`:`<b>Siap!</b> ${esc(nf(plan.rows[0]))} ${SIGN[plan.op]} ${esc(nf(plan.rows[1]))} = ${esc(nf(plan.answer))}${plan.rem?` baki ${plan.rem}`:''}.`;el.tiles.innerHTML='';if(el.inline)el.inline.innerHTML='';onDone&&onDone(plan);return}
      const s=plan.steps[k];focus(s.kind==='tap'?-1:s.col);el.say.textContent=s.say;opt.onShow&&opt.onShow(k,plan.steps.length);
      if(s.pre&&s.pre.pair){el.board.querySelectorAll('.wk-box').forEach(c=>{const i=Number(c.dataset.i);c.classList.toggle('wk-pair',s.pre.pair.includes(i));c.classList.toggle('wk-target',i===s.pre.hop)})}
      el.board.querySelectorAll('.wk-diff,.wk-grp').forEach(c=>c.classList.remove('wk-diff','wk-grp'));
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
      if(s.kind==='pick')T.innerHTML=s.choices.map(v=>`<button type="button" class="tl wk-t${s.sentence?' wk-s':''}" data-v="${esc(v)}">${esc(v)}</button>`).join('');
      else T.innerHTML=`<button type="button" class="tl wk-t wk-go" data-v="go">${s.kind==='borrow'?'Pinjam 1':'Teruskan'}</button>`;
      T.querySelectorAll('.wk-t').forEach((btn,i)=>{btn.onclick=()=>pick(btn);btn.style.setProperty('--i',i);btn.classList.add('wk-enter')});
      try{T.scrollIntoView({block:'nearest',behavior:'smooth'})}catch(_){}
    };
    let misses=0;
    const tap=c=>{
      if(busy)return;const s=plan.steps[k];if(!s||s.kind!=='tap')return;
      if(Number(c.dataset.row)!==s.row||(!s.anyCol&&Number(c.dataset.col)!==s.col)){
        misses++;c.classList.remove('wk-no');void c.offsetWidth;c.classList.add('wk-no');
        q(`.wk-pvrow[data-row="${s.row}"] [data-col="${s.col}"]`)?.classList.add('wk-hint');opt.onMiss&&opt.onMiss(s);return;
      }
      busy=true;tapCells(false);el.board.querySelector('.wk-board')?.classList.remove('wk-tapnow');el.board.querySelectorAll('.wk-hint').forEach(x=>x.classList.remove('wk-hint'));
      apply(s.after);if(s.after?.note)el.say.textContent=s.after.note;opt.onStep&&opt.onStep(s);
      k++;setTimeout(show,opt.pace??900);
    };
    const pick=btn=>{
      if(busy)return;const s=plan.steps[k];
      if(s.kind==='pick'&&String(btn.dataset.v)!==String(s.right)){
        misses++;btn.classList.remove('wk-no');void btn.offsetWidth;btn.classList.add('wk-no');btn.disabled=true;
        [...btn.parentNode.querySelectorAll('.wk-t')].find(b=>b.dataset.v===String(s.right))?.classList.add('wk-hint');opt.onMiss&&opt.onMiss(s);return;
      }
      busy=true;btn.classList.add('wk-yes');btn.parentNode.querySelectorAll('.wk-t').forEach(b=>b.disabled=true);
      apply(s.after);if(s.after?.note)el.say.textContent=s.after.note;opt.onStep&&opt.onStep(s);
      k++;setTimeout(show,opt.pace??900);
    };
    show();
    if(typeof window!=='undefined')window.__wkRight=()=>{const s=plan.steps[k];return s&&s.kind==='pick'?String(s.right):s&&s.kind==='tap'?`tap:${s.row}:${s.col}`:'go'};   // tests only
    return{get step(){return k},get misses(){return misses},plan};
  }
  return Object.freeze({VERSION,PLACE,parse,build,buildPV,buildSeq,buildHops,buildPow10,buildChain,buildLong,runChain,boardHTML,run,_digits:digits,_nf:nf});
});
