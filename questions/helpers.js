// Shared question-generation helpers.
// Clock times carry a day-part only when the question supplies that context.
// Durations keep their own units and must never pass through this formatter.
function formatClockTime(minutes,notation='12',period='bm'){
 const total=((Math.trunc(minutes)%1440)+1440)%1440,h=Math.floor(total/60),m=String(total%60).padStart(2,'0');
 if(notation==='24')return `jam ${String(h).padStart(2,'0')}${m}`;
 const clock=`${h%12||12}:${m}`;
 if(period==='none')return clock;
 if(period==='ampm')return `${clock} ${h<12?'a.m.':'p.m.'}`;
 const dayPart=h===0?'tengah malam':h<12?'pagi':h===12?'tengah hari':h<19?'petang':'malam';
 return `${clock} ${dayPart}`;
}

function tidyNumber(value,maxDp=2){
 if(typeof value!=="number"||!Number.isFinite(value))return value;
 return Number(value.toFixed(maxDp));
}
// Display cleanup must not perform curriculum rounding. Explicit strings retain
// their decimal places; only long floating-point tails are normalized.
function cleanNumericNoise(value){return Number.isFinite(value)?Number(value.toPrecision(15)):value}
function tidyDisplay(value){
 if(typeof value==="number")return cleanNumericNoise(value);
 if(typeof value!=="string")return value;
 return value.replace(/-?\d+\.\d{10,}/g,m=>String(cleanNumericNoise(Number(m))));
}
function questionLearningTitle(meta,q){
 const title=String(q?.kind||'');
 return /^(?:Tahun|Darjah) [1-6] · /.test(title)?title.replace(/^(?:Tahun|Darjah) [1-6] · /,''):(meta?.title||'Kemahiran');
}
function decimalFmt(value,dp=1){return Number(value).toFixed(dp)}
function moneyFmtUpper(value){
 const n=tidyNumber(Number(value));
 return `RM${Number.isInteger(n)?n:n.toFixed(2)}`;
}
function fallbackChoice(answer,d){
 if(typeof answer==="number")return tidyNumber(answer+d*10);
 const s=String(answer);
 let m=s.match(/^RM(-?\d+(?:\.\d+)?)$/);if(m)return moneyFmtUpper(Number(m[1])+d*10);
 m=s.match(/^(\d+)%$/);if(m)return `${(Number(m[1])+d*10)%110}%`;
 m=s.match(/^(\d+)\/(\d+)$/);if(m)return `${Number(m[1])+d}/${m[2]}`;
 m=s.match(/^(\d{1,2}):(\d{2})(?: (pagi|tengah hari|petang|malam|tengah malam|a\.m\.|p\.m\.))?$/);
 if(m){let h=Number(m[1])%12;const suffix=m[3];if(suffix&&/^(?:tengah hari|petang|malam|p\.m\.)$/.test(suffix))h+=12;return formatClockTime(h*60+Number(m[2])+d*5,'12',suffix?(suffix.includes('.')?'ampm':'bm'):'none');}
 m=s.match(/^jam (\d{2})(\d{2})$/);if(m)return formatClockTime(Number(m[1])*60+Number(m[2])+d*5,'24');
 m=s.match(/^\((\d+),(\d+)\)$/);if(m)return `(${Number(m[1])+d},${m[2]})`;
 m=s.match(/^(\d+):(\d+)$/);if(m)return `${Number(m[1])+d}:${m[2]}`;
 if(/^-?\d+\.\d+$/.test(s)){const dp=s.split('.')[1].length;return decimalFmt(Number(s)+d/Math.pow(10,dp),dp)}
 m=s.match(/^(-?\d+(?:\.\d+)?)(\s*[^\d].*)$/);if(m){
  const n=Number(m[1]),step=Math.abs(n)>=100?100:Math.abs(n)>=10?10:1;
  return `${tidyNumber(n+d*step)}${m[2]}`;
 }
 const generic=['Tidak pasti','Tiada jawapan','Maklumat tidak cukup'];
 return generic[(d-1)%generic.length];
}
function choiceKey(value){return String(tidyDisplay(value)).replace(/\s+/g,' ').trim().toLocaleLowerCase('ms')}
function semanticChoiceKey(value){
 const raw=choiceKey(value), compact=raw.replace(/\s+/g,'');
 // A mixed number must not lose its space: "1 1/11" is not "11/11".
 const mixedNumber=String(raw).trim().match(/^(\d+)\s+(\d+)\/(\d+)$/);if(mixedNumber)return `mixed:${+mixedNumber[1]} ${+mixedNumber[2]}/${+mixedNumber[3]}`;
 if(/^-?\d+(?:\.\d+)?$/.test(compact))return `number:${cleanNumericNoise(Number(compact))}`;
 let m=compact.match(/^rm(-?\d+(?:\.\d+)?)$/);if(m)return `money:${tidyNumber(Number(m[1]))}`;
 m=compact.match(/^(-?\d+(?:\.\d+)?)sen$/);if(m)return `money:${tidyNumber(Number(m[1])/100)}`;
 m=compact.match(/^(-?\d+(?:\.\d+)?)rm$/);if(m)return `money:${tidyNumber(Number(m[1]))}`;
 m=compact.match(/^(-?\d+(?:\.\d+)?)%$/);if(m)return `percent:${cleanNumericNoise(Number(m[1]))}`;
 m=compact.match(/^(-?\d+)\/(-?\d+)$/);if(m){const n=Number(m[1]),d=Number(m[2]);if(d){const g=gcd(Math.abs(n),Math.abs(d));return Math.abs(d/g)===1?`number:${n/d}`:`fraction:${n/g}/${d/g}`}}
 // Expanded notation is an addition statement: 20 + 5 and 5 + 20 are the same answer.
 if(/^-?\d+(?:\.\d+)?(?:\+-?\d+(?:\.\d+)?)+$/.test(compact))return `sum:${cleanNumericNoise(compact.split('+').reduce((a,x)=>a+Number(x),0))}`;
 if(/^-?\d+(?:\.\d+)?(?:[×*]-?\d+(?:\.\d+)?)+$/.test(compact))return `product:${cleanNumericNoise(compact.split(/[×*]/).reduce((a,x)=>a*Number(x),1))}`;
 return `text:${raw}`;
}
function Q(prompt,answer,wrong,hint,kind="Adaptive",diagnostic=false,formatShift=false){
 answer=tidyDisplay(answer);
 wrong=(wrong||[]).map(x=>x==null?x:{...x,v:tidyDisplay(x.v),label:tidyDisplay(x.label)});
 let seen=new Set([semanticChoiceKey(answer)]),w=[];
 for(let x of wrong){if(x!=null){const key=semanticChoiceKey(x.label??x.v);if(!seen.has(key)){seen.add(key);w.push(x)}}}
 let d=1,guard=0;while(w.length<3&&guard++<20){let v=fallbackChoice(answer,d++),key=semanticChoiceKey(v);if(!seen.has(key)){w.push(N(v,"generated"));seen.add(key)}}
 // Extra candidates are spares for when earlier ones collide; the first three unique ones are kept.
 if(w.length<3)throw new Error(`Pilihan unik tidak dapat dijana untuk jawapan: ${answer}`);
 return{prompt,answer,wrong:w.slice(0,3),hint,kind,diagnostic,formatShift}
}
function attachFractionShade(q,numerator,denominator,answerMode='fraction'){
 q.shadeSpec={kind:'fraction',numerator,denominator,answerMode};
 q.representation='fraction_area';
 q.archetypeId=q.archetypeId||'fraction_shade_choice';
 return q;
}
function attachFractionVisualChoice(q,choices,answerMode='letter'){
 q.visualChoiceSpec={kind:'fraction',choices:(choices||[]).map((choice,index)=>({...choice,letter:String.fromCharCode(65+index)})),answerMode};
 q.representation='fraction_area_choice';
 q.responseType='visual_choice';
 q.interactionAuthored=true;
 q.archetypeId=q.archetypeId||'fraction_visual_choice';
 return q;
}
function N(v,tag){return{v,tag,label:v}}
function R(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function pick(arr){return arr[R(0,arr.length-1)]}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function reverseN(n){return +String(n).split("").reverse().join("")}
function uniqueDigitNumber(len){ let digits=[]; digits.push(R(1,9)); while(digits.length<len){let d=R(0,9);if(!digits.includes(d))digits.push(d)} return +digits.join("") }

function explain(t){let m={compare:"Banding nilai nombor dengan teliti.",operation:"Semak operasi yang sepatutnya.",place:"Gunakan nilai tempat satu demi satu.",digit_value:"Bezakan digit dengan nilai digitnya.",units_only:"Kira semua nilai tempat, bukan digit sa sahaja.",same_end:"Banding seluruh nombor, bukan digit hujung sahaja.",pattern:"Cari beza atau aturan yang tetap.",round:"Lihat digit penentu sebelum membundar.",fraction:"Semak pengangka dan penyebut.",decimal:"Selarikan tempat perpuluhan.",money:"Semak unit RM dan sen.",time:"Semak jam, minit atau tempoh.",unit:"Pilih unit yang paling sesuai.",shape:"Padankan ciri bentuk atau ruang.",data:"Baca data dengan teliti.",fact:"Gunakan fakta darab yang berkaitan.",division:"Guna hubungan darab-bahagi.",estimate:"Pilih anggaran yang hampir dengan nilai sebenar.",percent:"100% bermaksud keseluruhan.",ratio:"Banding ikut nisbah yang diberi.",area:"Luas biasanya panjang × lebar.",coord:"Semak kedudukan pada paksi."};return m[t]||"Mari cuba cara lain yang lebih mudah untuk menguatkan kemahiran ini."}

function addDistractors(a,b,ans){
 let same=[ans-20,ans-10,ans+10,ans+20,ans+100].filter(x=>x>=0&&x!==ans);
 let unit=(a%10)+(b%10),partial=a+(b%10);
 return [N(same[R(0,same.length-1)],"same_end"),N(unit,"units_only"),N(partial===ans?ans+1:partial,"place")]
}
function addQ(a,b,ans,kind,shift,focus={}){const q=Q(`${a} + ${b} = ?`,ans,addDistractors(a,b,ans),"Pisahkan ikut nilai tempat, kemudian gabungkan.",kind,true,shift);return focus.skillId?attachFoundationQuestionTags(q,addSubFocusMeta(focus.skillId,'addition',[a,b],ans,focus)):q}
function subQ(a,b,ans,kind,shift,focus={}){const q=Q(`${a} − ${b} = ?`,ans,[N(ans+10,"same_end"),N(Math.abs((a%10)-(b%10)),"units_only"),N(a+b,"operation")],"Tolak ikut nilai tempat.",kind,true,shift);return focus.skillId?attachFoundationQuestionTags(q,addSubFocusMeta(focus.skillId,'subtraction',[a,b],ans,focus)):q}

function addSubFocusMeta(skillId,operation,operands,result,options={}){
 const values=operands.filter(Number.isFinite).map(Math.trunc),digits=n=>String(Math.abs(n)).length;
 const columns=Math.max(1,...values.map(digits)),regroupingColumns=[],factDependencies=[];
 let current=values[0]||0;
 for(let step=1;step<values.length;step++){
  const next=values[step],max=Math.max(digits(current),digits(next));let carry=0;
  const currentDigits=Array.from({length:max},(_,col)=>Math.floor(Math.abs(current)/Math.pow(10,col))%10);
  for(let col=0;col<max;col++){
   const right=Math.floor(Math.abs(next)/Math.pow(10,col))%10,left=currentDigits[col];
   if(operation==='addition'){
    const raw=left+right+carry;if(raw>=10)regroupingColumns.push(col);carry=raw>=10?1:0;
    factDependencies.push(`add:${Math.min(left,right)}+${Math.max(left,right)}`);
   }else{
    if(left<right){
     let lender=col+1;while(lender<max&&currentDigits[lender]===0)lender++;
     if(lender<max){currentDigits[lender]--;for(let k=col+1;k<lender;k++)currentDigits[k]=9;currentDigits[col]+=10;for(let k=col;k<lender;k++)regroupingColumns.push(k)}
    }
    factDependencies.push(`sub:${currentDigits[col]}-${right}`);
   }
  }
  current=operation==='addition'?current+next:current-next;
 }
 const uniqueColumns=[...new Set(regroupingColumns)].sort((a,b)=>a-b),labels=['ones','tens','hundreds','thousands','ten_thousands','hundred_thousands'];
 const maxDigits=Math.max(...values.map(digits));
 const simple=maxDigits===1;
 const foundations=operation==='addition'?(simple?['add.facts']:['add.facts','add.place_value']):(simple?['sub.facts']:['sub.facts','sub.place_value']);
 if(uniqueColumns.length)foundations.push(operation==='addition'?'add.regroup':'sub.regroup');
 const equationOperands=operation==='addition'?{addends:values,sum:result,unit:options.unit||'integer'}:{minuend:values[0],subtrahend:values[1],subsequentSubtrahends:values.slice(2),difference:result,unit:options.unit||'integer'};
 return {originSkillId:skillId,contextDomain:options.contextDomain||'number',diagnosticFamily:operation,
  arithmeticProfile:{operationFamilies:[operation],operands:equationOperands,operandDimensions:{operandDigits:values.map(digits),maxOperandDigits:maxDigits,placeValueColumns:labels.slice(0,columns),numberMagnitudeBand:maxDigits===1?'ones':maxDigits===2?'tens':maxDigits===3?'hundreds':'thousands_or_more',usesRegrouping:uniqueColumns.length>0,regroupingColumns:uniqueColumns.map(i=>labels[i]||`column_${i}`),zeroCrossingBorrow:operation==='subtraction'&&uniqueColumns.some(i=>values[0]&&Math.floor(Math.abs(values[0])/Math.pow(10,i))%10===0),decimalPlaces:0,stepCount:Math.max(1,values.length-1),factDependencies:[...new Set(factDependencies)]}},
  probes:{foundationIds:[...new Set(foundations)],conceptIds:[],diagnosticPurpose:options.diagnosticPurpose||'normal'},
  evidence:{questionFamilyKey:operation==='addition'?'integer_addition_calculation':'integer_subtraction_calculation',representation:'symbolic',demand:'procedure',difficultyBand:Math.min(4,maxDigits)}};
}

function moneyFmt(cents){
 cents=Math.round(cents);
 if(cents<100)return `${cents} sen`;
 const rm=Math.floor(cents/100),sen=cents%100;
 return sen?`RM${rm}.${String(sen).padStart(2,"0")}`:`RM${rm}`;
}
function moneyChoice(cents,tag="money"){return N(moneyFmt(cents),tag)}
function moneyDenominations(){return [10000,5000,2000,1000,500,100,50,20,10,5]}
function moneyPieces(cents){
 let remain=cents,pieces=[];
 for(const d of moneyDenominations()){
   while(remain>=d && pieces.length<8){pieces.push(d);remain-=d}
 }
 if(remain>0){ // keep visual exact even for unusual generated values
   pieces.push(remain);remain=0;
 }
 return pieces;
}
function moneyPieceSvg(cents){
 const asset={5:'5sen',10:'10sen',20:'20sen',50:'50sen',100:'rm1',500:'rm5',1000:'rm10',2000:'rm20',5000:'rm50'}[cents];
 if(asset){
  const coin=cents<100, label=moneyFmt(cents), w=coin?58:92, h=coin?58:48;
  return `<img class="paMoneyPiece" src="assets/questions/money/money_${asset}.webp" alt="${label}" title="${label}" width="${w}" height="${h}" draggable="false" decoding="async" style="display:inline-block;flex:0 0 auto;width:${w}px;height:${h}px;object-fit:contain;vertical-align:middle;filter:drop-shadow(0 2px 2px #0002)" />`;
 }
 return moneyPieceFallback(cents);
}
function moneyPieceFallback(cents){
 const isCoin=cents<100;
 const label=moneyFmt(cents);
 if(isCoin){
   const fill=cents===50?'#d7b56d':cents===20?'#d8d8d8':cents===10?'#dfc58e':'#d6c2a2';
   return `<span style="width:58px;height:58px;border-radius:50%;display:inline-grid;place-items:center;background:${fill};border:3px solid #7d6a45;color:#182238;font-weight:950;font-size:11px;box-shadow:inset 0 0 0 3px #ffffff55">${label}</span>`;
 }
 const palette={100:'#b689d6',50:'#69b69a',20:'#dc8b89',10:'#d17c77',5:'#85a8d9',1:'#7bb08b'};
 const rm=Math.floor(cents/100),fill=palette[rm]||'#8db7d9';
 return `<span style="width:92px;height:48px;border-radius:8px;display:inline-grid;place-items:center;background:${fill};border:3px solid #53647d;color:white;font-weight:950;font-size:15px;box-shadow:inset 0 0 0 2px #ffffff33">${label}</span>`;
}
function moneyVisual(cents){
 const ps=moneyPieces(cents);
 return `<div class="moneyVisual" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;margin:4px auto 12px;max-width:340px">${ps.map(moneyPieceSvg).join('')}</div>`;
}
function moneyGroupCard(label,cents){
 const ps=moneyPieces(cents);
 return `<div class="moneyGroupCard" style="position:relative;display:flex;flex-direction:column;justify-content:center;flex:1 1 240px;max-width:380px;min-width:0;padding:22px 12px 12px;border:2px solid #c9d4ea;border-radius:16px;background:#fff;box-shadow:0 2px 0 #dfe6f3"><span style="position:absolute;top:-13px;left:50%;transform:translateX(-50%);padding:3px 14px;border-radius:999px;background:#162a47;color:#fff;font-size:13px;font-weight:850;letter-spacing:.04em;white-space:nowrap">${label}</span><div class="moneyVisual" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center">${moneyStacks(ps)}</div></div>`;
}
/* Notes and coins in two rows; pieces of the same value form one pile. On a wide screen the
   wrappers vanish (display:contents) and the pieces sit side by side; on a phone css/game.css
   overlaps each pile so its edges still show (the child counts them) and the top piece shows
   its colour and value in full, so the group takes little space. */
function moneyStacks(ps){
 const piles=list=>{const out=[];list.forEach(c=>{const last=out[out.length-1];if(last&&last[0]===c)last.push(c);else out.push([c])});return out};
 const row=(kind,list)=>list.length?`<span class="moneyStack ${kind}">${piles(list).map(p=>`<span class="moneyPile">${p.map(moneyPieceSvg).join('')}</span>`).join('')}</span>`:'';
 return row('notes',ps.filter(c=>c>=100))+row('coins',ps.filter(c=>c<100));
}
function moneyCompare(a,b,labels=['Kumpulan A','Kumpulan B']){
 return `<div class="moneyCompare" style="display:flex;flex-wrap:wrap;gap:22px 16px;justify-content:center;align-items:stretch;margin:16px auto 16px;max-width:780px">${moneyGroupCard(labels[0],a)}${moneyGroupCard(labels[1],b)}</div>`;
}
function priceTag(label,cents){return `<div style="display:inline-flex;flex-direction:column;align-items:center;gap:3px;padding:8px 12px;border-radius:12px;background:#fff3ca;border:2px solid #d7b657;color:#273149;font-size:12px;font-weight:850"><span>${label}</span><b style="font-size:17px">${moneyFmt(cents)}</b></div>`}
function moneyWrongSet(ans,values=[]){
 const out=[]; const seen=new Set([ans]);
 /* v3.86.41: no 0 sen, and only amounts payable with Malaysian coins (multiples of 5 sen) */
 for(const v of values){if(v>0&&v<=10000&&v%5===0&&!seen.has(v)){seen.add(v);out.push(moneyChoice(v,"money"))}}
 let step=ans<100?10:50;
 for(let k=1;out.length<3&&k<10;k++){
   for(const v of [ans+step*k,ans-step*k]){if(v>0&&v<=10000&&v%5===0&&!seen.has(v)){seen.add(v);out.push(moneyChoice(v,"money"));if(out.length===3)break}}
 }
 return out.slice(0,3);
}
function chooseMoneyValue(mode="mixed",max=10000){
 const coin=[5,10,20,50,60,70,80,90];
 const ringgit=[100,200,300,400,500,1000,1500,2000,2500,3000,4000,5000];
 const mixed=[150,250,270,320,450,575,625,750,825,950,1050,1275,1520,1875,2350,2725,3150,4050];
 let pool=mode==="coin"?coin:mode==="ringgit"?ringgit:mixed;
 pool=pool.filter(x=>x<=max);return pick(pool.length?pool:[Math.min(max,100)]);
}
/* Focus Diagnosis v2: optional question-instance evidence, not scores/routing. */
function attachFoundationQuestionTags(q,meta){
 if(!q)return q;
 const operands=meta.arithmeticProfile?.operands||{};
 // Equation identity deliberately excludes wording/representation: showing
 // the same calculation in a story is not a second independent equation.
 const operationFamilies=meta.arithmeticProfile?.operationFamilies||[];
 const expression=Array.isArray(operands.addends)?[...operands.addends].sort((a,b)=>a-b):
   Array.isArray(operands.valuesMinorUnits)?[...operands.valuesMinorUnits].sort((a,b)=>a-b):
   operands.minuend!==undefined?[operands.minuend,operands.subtrahend,...(operands.subsequentSubtrahends||[])]:
   [operands.totalMinorUnits??operands.dividend,operands.divisor,operands.quotientMinorUnits??operands.quotient,operands.remainder??0];
 const identity=JSON.stringify([operationFamilies,operands.unit||'unknown',expression]);
 let hash=2166136261;for(const char of identity){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619)}
 q.focusDiagnosticV1={schema:'pa.focus.question-tag.v1',tagOrigin:'authored',...meta,
   evidence:{...meta.evidence,tagRevision:meta.evidence?.tagRevision||(['addition','subtraction'].includes(meta.diagnosticFamily)?'add-sub-features-v1':'d2-pilot-v2'),
     variantFingerprint:meta.evidence?.variantFingerprint||'eq-'+(hash>>>0).toString(36)}};
 return q;
}
/* Focus Diagnosis v2: tag from an authored per-archetype spec
   [contextDomain, 'op,op', foundationIds, conceptIds, diagnosticFamily?]. Operand values are not
   structured here, and the fingerprint hashes numbers only, never names or wording. */
// No top-level const here: app.js loads helpers.js a second time, and a redeclared const aborts that run.
function attachSpecFocusTag(q,skillId,spec,revision){
 if(!q||!spec||q.focusDiagnosticV1)return q;
 const FOCUS_SPEC_REPRESENTATION={symbolic:'symbolic',story:'contextual',verbal:'contextual',table:'visual',visual:'visual',diagram:'visual',manipulative:'manipulative'};
 const [domain,steps,foundationIds,conceptIds,family]=spec,ops=steps?steps.split(','):[],arch=String(q.archetypeId||'');
 const nums=(String(q.prompt||'').replace(/<[^>]*>/g,' ').match(/\d+(?:[.,:\/]\d+)*/g)||[]).join('|')+'#'+String(q.answer??'');
 let h=2166136261;for(const ch of arch+'|'+nums){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}
 q.focusDiagnosticV1={schema:'pa.focus.question-tag.v1',tagOrigin:'authored',originSkillId:skillId,contextDomain:domain,
  ...(family?{diagnosticFamily:family}:{}),
  arithmeticProfile:{operationFamilies:[...new Set(ops)],operands:{unit:'unknown'},operandDimensions:{stepCount:ops.length||'unknown'},steps:ops},
  probes:{foundationIds:[...foundationIds],conceptIds:[...conceptIds],diagnosticPurpose:'normal'},
  evidence:{questionFamilyKey:arch,variantFingerprint:'q-'+(h>>>0).toString(36),representation:FOCUS_SPEC_REPRESENTATION[q.representation]||'other',
   demand:q.demand||'unknown',misconceptionTargets:Array.isArray(q.misconceptionTargets)?[...q.misconceptionTargets]:[],
   difficultyBand:q.difficultyBand||'unknown',tagRevision:revision},
  standardRef:q.standardRef||null,unknownFieldReasons:['operands_not_structured']};
 return q;
}
// Exact add/sub tag from known operands, for generators that hold a and b.
function attachAddSubFocusTag(q,skillId,operation,operands,result,revision){
 if(!q||typeof addSubFocusMeta!=='function')return q;
 const meta=addSubFocusMeta(skillId,operation,operands,result);
 return attachFoundationQuestionTags(q,{...meta,evidence:{...meta.evidence,questionFamilyKey:q.archetypeId||meta.evidence.questionFamilyKey,tagRevision:revision}});
}
function moneyQ(id,shift,s){
 const difficulty=(s&&s.mastery>=75)?"STRETCH":(s&&s.mastery>=50)?"APPLICATION":(s&&s.mastery>=25)?"CORE":"FOUNDATION";
 if(id==="D2.4.1"){
   const mode=pick(["recognise","total","total","compare"]);
   const tagMoneyBasics=(q,values,questionMode)=>attachFoundationQuestionTags(q,{
     originSkillId:id,contextDomain:'money',diagnosticFamily:questionMode==='recognise'?'money_unit':'money',
     arithmeticProfile:{operationFamilies:[],operands:{valuesMinorUnits:values,unit:'sen'},
       operandDimensions:{valueCount:values.length,largestValueMinorUnits:Math.max(...values),unit:'sen'}},
     probes:{foundationIds:['money.denominations','money.ringgit_sen'],conceptIds:['money.ringgit_sen'],diagnosticPurpose:'normal'},
     evidence:{questionFamilyKey:`d2-money-basic-${questionMode}`,representation:questionMode==='recognise'?'visual':'symbolic',demand:'concept',difficultyBand:1}
   });
   if(mode==="recognise"){
     const d=pick([5,10,20,50,100,500,1000,2000,5000]);
     const den=[5,10,20,50,100,500,1000,2000,5000,10000],i=den.indexOf(d);/* wang sebenar sahaja: tiada RM49/RM51 */
     const wrong=moneyWrongSet(d,[den[i+1]??den[i-2],den[i-1]??den[i+2],d<100?d*100:d/100]);
     return tagMoneyBasics(Q(`${moneyVisual(d)}Berapakah nilai wang yang ditunjukkan?`,moneyFmt(d),wrong,"Lihat nilai yang tertulis pada syiling atau wang kertas.",`D2 ${difficulty} · Wang`,true,shift),[d],'recognise');
   }
   if(mode==="compare"){
     const a=chooseMoneyValue("mixed",5000),b=chooseMoneyValue("mixed",5000);
     if(a===b)return moneyQ(id,shift,s);
     const ans=Math.max(a,b);
     return tagMoneyBasics(Q(`${moneyCompare(a,b)}Berapakah nilai kumpulan yang lebih besar?`,moneyFmt(ans),[moneyChoice(Math.min(a,b)),moneyChoice(Math.abs(a-b)),moneyChoice(Math.min(10000,a+b))],"Kira nilai setiap kumpulan dahulu, kemudian bandingkan.",`D2 ${difficulty} · Wang`,true,shift),[a,b],'compare');
   }
   const total=chooseMoneyValue(pick(["coin","mixed","ringgit"]),10000);
   const wrong=moneyWrongSet(total,[Math.max(0,total-50),Math.min(10000,total+50),total<100?total*10:Math.round(total/10)]);
   return tagMoneyBasics(Q(`${moneyVisual(total)}Berapakah jumlah wang semuanya?`,moneyFmt(total),wrong,"Tambah nilai semua syiling dan wang kertas yang ditunjukkan.",`D2 ${difficulty} · Wang`,true,shift),[total],'total');
 }
 if(id==="D2.4.2"){
   const three=Math.random()<0.42;
   let vals=[];
   if(three){
     vals=[chooseMoneyValue(pick(["coin","mixed","ringgit"]),3000),chooseMoneyValue(pick(["coin","mixed","ringgit"]),3000),chooseMoneyValue(pick(["coin","mixed"]),3000)];
   }else{
     vals=[chooseMoneyValue(pick(["coin","mixed","ringgit"]),5000),chooseMoneyValue(pick(["coin","mixed","ringgit"]),5000)];
   }
   let ans=vals.reduce((a,b)=>a+b,0);if(ans>10000)return moneyQ(id,shift,s);
   const stem=vals.map(moneyFmt).join(' + ');
   const wrong=moneyWrongSet(ans,[ans-100,ans+100,Math.abs(vals[0]-vals[1]),ans-(vals[vals.length-1]||0)]);
   const q=Q(`${stem} = ?`,moneyFmt(ans),wrong,"Tambah sen dengan sen dan ringgit dengan ringgit. Jika 100 sen, tukarkan kepada RM1.",`D2 ${difficulty} · Tambah Wang`,true,shift);
   const wholeDigits=Math.max(...vals.map(v=>String(Math.floor(v/100)).length));
   return attachFoundationQuestionTags(q,{originSkillId:id,contextDomain:'money',diagnosticFamily:'addition',arithmeticProfile:{
     operationFamilies:['addition'],operands:{addends:vals,unit:'sen',displayUnit:'MYR'},
     operandDimensions:{maxOperandDigits:wholeDigits,usesRegrouping:false,decimalPlaces:2,stepCount:1,unit:'MYR',factDependencies:[]}
    },probes:{foundationIds:['add.place_value','money.ringgit_sen'],conceptIds:['money.ringgit_sen'],diagnosticPurpose:'normal'},
    evidence:{questionFamilyKey:'d2-money-addition',representation:'symbolic',demand:'procedure',difficultyBand:difficulty==='STRETCH'?4:difficulty==='APPLICATION'?3:difficulty==='CORE'?2:1}});
 }
 if(id==="D2.4.3"){
   const three=Math.random()<0.4;
   let start=chooseMoneyValue("mixed",10000),b=chooseMoneyValue(pick(["coin","mixed","ringgit"]),Math.max(50,start-50)),c=three?chooseMoneyValue(pick(["coin","mixed"]),Math.max(50,start-b-5)):0;
   if(start-b-c<0)return moneyQ(id,shift,s);
   const ans=start-b-c,stem=three?`${moneyFmt(start)} − ${moneyFmt(b)} − ${moneyFmt(c)} = ?`:`${moneyFmt(start)} − ${moneyFmt(b)} = ?`;
   const wrong=moneyWrongSet(ans,[start+b+c,start-b+c,b+c,ans+100]);
   return Q(stem,moneyFmt(ans),wrong,"Tolak satu nilai pada satu masa. Semak sen dahulu, kemudian ringgit.",`D2 ${difficulty} · Tolak Wang`,true,shift);
 }
 if(id==="D2.4.4"){
   const k=pick([2,3,4,5,10]);
   let unit=chooseMoneyValue(pick(["coin","mixed","ringgit"]),Math.floor(10000/k));
   const ans=unit*k;if(ans>10000)return moneyQ(id,shift,s);
   const contextual=Math.random()<0.55;
   const prompt=contextual?`${priceTag('1 barang',unit)}<div style="margin-top:8px">Harga satu barang ialah <b>${moneyFmt(unit)}</b>. Berapakah harga ${k} barang yang sama?</div>`:`${moneyFmt(unit)} × ${k} = ?`;
   const wrong=moneyWrongSet(ans,[unit+k*100,unit+k,ans-unit,ans+unit]);
   return Q(prompt,moneyFmt(ans),wrong,"Harga semua barang = harga satu barang × bilangan barang.",`D2 ${difficulty} · Darab Wang`,true,shift);
 }
 if(id==="D2.4.5"){
   const k=pick([2,4,5,10]);
   let each=chooseMoneyValue(pick(["coin","mixed","ringgit"]),Math.floor(10000/k));
   const total=each*k;
   const contextual=Math.random()<0.6;
   const prompt=contextual?`Wang sebanyak <b>${moneyFmt(total)}</b> dibahagi sama rata kepada <b>${k}</b> orang. Berapakah setiap orang dapat?`:`${moneyFmt(total)} ÷ ${k} = ?`;
   const wrong=moneyWrongSet(each,[total-k*100,total/k+100,total-k,each+50]);
   return attachFoundationQuestionTags(
      Q(prompt,moneyFmt(each),wrong,"Bahagi jumlah wang kepada kumpulan yang sama banyak.",`D2 ${difficulty} · Bahagi Wang`,true,shift),
      {originSkillId:id,contextDomain:'money',arithmeticProfile:{
        operationFamilies:['division'],
        operands:{totalMinorUnits:total,divisor:k,quotientMinorUnits:each,unit:'sen'},
        operandDimensions:{dividendDigits:String(total).length,divisorDigits:String(k).length,quotientDigits:String(each).length,unit:'sen',canHaveRemainder:false,usesRegrouping:'unknown'},
        steps:['division']
       },
       probes:{foundationIds:['div.equal_sharing','div.facts'],conceptIds:['money.ringgit_sen','money.equal_sharing_application'],diagnosticPurpose:'screen'},
       evidence:{questionFamilyKey:'d2-money-equal-share',representation:contextual?'contextual':'symbolic',demand:contextual?'application':'procedure',
        difficultyBand:difficulty==='STRETCH'?4:difficulty==='APPLICATION'?3:difficulty==='CORE'?2:1},
       note:'Money minor-unit digits are NOT equivalent to plain integer division difficulty; contrast before diagnosis.'}
    );
 }
 if(id==="D2.4.6"){
   const income=chooseMoneyValue("mixed",7000),spend=chooseMoneyValue(pick(["coin","mixed","ringgit"]),Math.max(50,income-5));
   if(spend>=income)return moneyQ(id,shift,s);
   const ans=income-spend;
   const prompt=pick([
     `Aina mempunyai <b>${moneyFmt(income)}</b>. Dia berbelanja <b>${moneyFmt(spend)}</b>. Berapakah wang yang dapat disimpan?`,
     `Hakim menerima <b>${moneyFmt(income)}</b>. Selepas membeli barang bernilai <b>${moneyFmt(spend)}</b>, berapakah baki yang boleh disimpan?`
   ]);
   const wrong=moneyWrongSet(ans,[income+spend,spend,income,ans+100]);
   return Q(prompt,moneyFmt(ans),wrong,"Wang yang disimpan = wang yang ada − wang yang dibelanjakan.",`D2 ${difficulty} · Simpanan`,true,shift);
 }
 // D2.4.7 varied daily money problems
 const mode=pick(["balance","multi","enough","total","savings"]);
 if(mode==="balance"){
   const price=chooseMoneyValue("mixed",7000),pay=pick([5000,10000]);if(pay<=price)return moneyQ(id,shift,s);const ans=pay-price;
   return Q(`${priceTag('Harga barang',price)}<div style="margin-top:8px">Farah membayar <b>${moneyFmt(pay)}</b>. Berapakah baki wangnya?</div>`,moneyFmt(ans),moneyWrongSet(ans,[price,pay+price,ans+100]),"Baki = wang dibayar − harga barang.",`D2 ${difficulty} · Masalah Wang`,true,true);
 }
 if(mode==="multi"){
   const p1=chooseMoneyValue("mixed",4000),p2=chooseMoneyValue("mixed",4000),ans=p1+p2;if(ans>10000)return moneyQ(id,shift,s);
   return Q(`<div style="display:flex;gap:10px;justify-content:center">${priceTag('Buku',p1)}${priceTag('Pensel',p2)}</div><div style="margin-top:8px">Berapakah jumlah harga kedua-dua barang?</div>`,moneyFmt(ans),moneyWrongSet(ans,[Math.abs(p1-p2),p1,p2,ans+100]),"Tambah harga kedua-dua barang.",`D2 ${difficulty} · Masalah Wang`,true,true);
 }
 if(mode==="enough"){
   const price=chooseMoneyValue("mixed",8000),have=Math.random()<.5?Math.min(10000,price+pick([50,100,200,500])):Math.max(5,price-pick([50,100,200,500]));
   const ans=have>=price?"Cukup":"Tidak cukup";
   return Q(`Harga sebuah permainan ialah <b>${moneyFmt(price)}</b>. Amir mempunyai <b>${moneyFmt(have)}</b>. Adakah wang Amir cukup untuk membelinya?`,ans,[N(ans==="Cukup"?"Tidak cukup":"Cukup","money"),N("Perlu RM100 lagi","money"),N("Tidak dapat ditentukan","money")],"Bandingkan wang Amir dengan harga barang.",`D2 ${difficulty} · Masalah Wang`,true,true);
 }
 if(mode==="savings"){
   const have=chooseMoneyValue("mixed",8000),spent=chooseMoneyValue("mixed",Math.max(50,have-5));if(spent>=have)return moneyQ(id,shift,s);const ans=have-spent;
   return Q(`Siti mempunyai <b>${moneyFmt(have)}</b>. Dia menggunakan <b>${moneyFmt(spent)}</b>. Berapakah wang yang tinggal?`,moneyFmt(ans),moneyWrongSet(ans,[have+spent,spent,have]),"Cari baki selepas berbelanja.",`D2 ${difficulty} · Masalah Wang`,true,true);
 }
 const p1=chooseMoneyValue("mixed",4000),p2=chooseMoneyValue("mixed",4000),ans=p1+p2;if(ans>10000)return moneyQ(id,shift,s);
 return Q(`Ibu membeli makanan berharga <b>${moneyFmt(p1)}</b> dan minuman berharga <b>${moneyFmt(p2)}</b>. Berapakah jumlah yang dibayar?`,moneyFmt(ans),moneyWrongSet(ans,[Math.abs(p1-p2),p1,p2]),"Tambah kedua-dua harga.",`D2 ${difficulty} · Masalah Wang`,true,true);
}

function shape3DQ(shift){let x=[["kubus","6 muka sama besar"],["kuboid","6 muka segi empat"],["silinder","2 muka bulat"],["sfera","tiada muka rata"]][R(0,3)],all=["kubus","kuboid","silinder","sfera"];return Q(`Bentuk 3D: <b>${x[1]}</b>`,x[0],all.filter(y=>y!==x[0]).map(y=>N(y,"shape")).slice(0,3),"Padankan ciri bentuk.","D2 Core · Ruang",false,shift)}
function shape2DQ(shift){let shapes=[["segi tiga",3,"3 sisi lurus"],["segi empat sama",4,"4 sisi sama panjang"],["segi empat tepat",4,"4 sisi; sisi bertentangan sama panjang"],["bulatan",0,"tiada sisi lurus"]],x=shapes[R(0,3)];return Q(`Bentuk 2D yang mempunyai <b>${x[2]}</b> ialah?`,x[0],shapes.filter(y=>y[0]!==x[0]).map(y=>N(y[0],"shape")),"Gunakan semua ciri yang diberi.","D2 Core · Ruang",false,shift)}

function numWords(n){
 const o=["sifar","satu","dua","tiga","empat","lima","enam","tujuh","lapan","sembilan"],t=["sepuluh","sebelas","dua belas","tiga belas","empat belas","lima belas","enam belas","tujuh belas","lapan belas","sembilan belas"];
 function w99(x){if(x<10)return o[x];if(x<20)return t[x-10];let a=Math.floor(x/10),b=x%10;return o[a]+" puluh"+(b?" "+o[b]:"")}
 function w999(x){let h=Math.floor(x/100),r=x%100;return (h?(h===1?"seratus":o[h]+" ratus")+(r?" ":""):"")+ (r||!h?w99(r):"")}
 if(n<1000)return w999(n);
 if(n<1000000){let th=Math.floor(n/1000),r=n%1000;return (th===1?"seribu":w999(th)+" ribu")+(r?" "+w999(r):"")}
 let mil=Math.floor(n/1000000),r=n%1000000;return (mil===1?"sejuta":w999(mil)+" juta")+(r?" "+numWords(r):"")
}

function gcd(a,b){while(b){[a,b]=[b,a%b]}return a}
function simplify(n,d){let g=gcd(Math.abs(n),Math.abs(d)); return [n/g,d/g]}

function words(n){return numWords(n)}


// Shared illustrated counting objects. Numbers and correct answers still come from the question bank.
function countingObjects(count,kind=null){
 const names={apple:'epal',orange:'oren',rambutan:'rambutan',watermelon_slice:'potongan tembikai',starfruit_slice:'potongan belimbing',pencil:'pensel',eraser:'pemadam',candy:'gula-gula',balloon:'belon'};
 const keys=Object.keys(names),type=Object.prototype.hasOwnProperty.call(names,kind)?kind:keys[Math.floor(Math.random()*keys.length)];
 const n=Math.max(0,Math.floor(Number(count)||0));
 // Up to 10: rows of 5 at 42px. 11–20: rows of 10 split 5 + 5 (like a ten-frame) at 34px, so 20 objects take
 // two short rows and the whole question fits on a phone without scrolling.
 const cols=n<=10?5:10,size=n<=10?42:n<=20?34:24,width=n<=10?250:370;
 const img=`<img src="assets/questions/counting/${type}.webp" width="${size}" height="${size}" alt="" draggable="false" decoding="async" style="display:block;width:100%;max-width:${size}px;height:auto;aspect-ratio:1/1;object-fit:contain">`;
 return `<div class="paCountingSet" role="img" aria-label="Kumpulan ${names[type]} untuk dikira" style="display:grid;grid-template-columns:${cols===10?'repeat(5,minmax(0,1fr)) 10px repeat(5,minmax(0,1fr))':'repeat(5,minmax(0,1fr))'};justify-items:center;align-items:center;gap:4px 2px;width:min(${width}px,98%);max-width:100%;margin:6px auto 10px">${Array.from({length:n},(_,i)=>(cols===10&&i%10===5?'<span aria-hidden="true"></span>':'')+img).join('')}</div>`;
}

// Phase 3.4 curriculum visuals / assessment helpers.
// Estimate from a known reference, never from a displayed numeral or a rounding rule.
function d2ReferenceEstimate(mode){
 const modes={
  less:{range:[4,6],answer:5,relation:'kurang',hint:'Set B kelihatan kira-kira separuh daripada Set A.'},
  near:{range:[8,12],answer:10,relation:'hampir',hint:'Set B kelihatan hampir sama banyak dengan Set A.'},
  more:{range:[14,16],answer:15,relation:'lebih',hint:'Set B kelihatan kira-kira satu setengah kali Set A.'},
  double:{range:[18,22],answer:20,relation:'lebih',hint:'Set B kelihatan kira-kira dua kali Set A.'},
  triple:{range:[28,32],answer:30,relation:'lebih',hint:'Set B kelihatan kira-kira tiga kali Set A.'}
 };
 const key=modes[mode]?mode:pick(Object.keys(modes)),spec=modes[key],real=R(...spec.range);
 const wrong=[5,10,15,20,30,40].filter(v=>v!==spec.answer)
  .sort((a,b)=>Math.abs(a-spec.answer)-Math.abs(b-spec.answer)).slice(0,3);
 const q=Q(`${dotsEstimateVisual(real)}Set A mempunyai <b>10 objek</b>. Bandingkan Set B dengan Set A.<br>Anggarkan bilangan objek dalam <b>Set B</b>. Pilih anggaran yang paling munasabah.`,spec.answer,wrong.map(v=>N(v,'estimate')),
  `Gunakan Set A yang mempunyai 10 objek sebagai rujukan. ${spec.hint} Bandingkan keseluruhan set tanpa mengira satu demi satu.`,
  'D2 Core · Menganggar dengan Set Rujukan',true,true);
 q.archetypeId=`estimate_reference_${key}`;q.representation='visual';q.misconceptionTargets=['estimate'];
 q.estimateSpec={reference:10,target:real,relation:spec.relation,mode:key};
 return q;
}
function decimalTenthsVisual(n){return fractionVisual(n,10)}
function tallyTable(labels,vals){
 const tally=n=>{let s='';for(let i=0;i<n;i++)s+=(i>0&&i%5===0?' ':'')+'|';return s};
 return `<table style="border-collapse:collapse;margin:6px auto 12px;background:#fff;font-size:14px"><tr><th style="border:2px solid #9aa8c3;padding:6px 10px">Item</th><th style="border:2px solid #9aa8c3;padding:6px 10px">Gundalan</th></tr>${labels.map((l,i)=>`<tr><td style="border:2px solid #9aa8c3;padding:6px 10px;font-weight:800">${l}</td><td style="border:2px solid #9aa8c3;padding:6px 10px;font-family:monospace;font-weight:900;letter-spacing:2px">${tally(vals[i])}</td></tr>`).join('')}</table>`;
}
function uniqueValues(n,min=2,max=10){const a=[];while(a.length<n){const v=R(min,max);if(!a.includes(v))a.push(v)}return a}
function fractionVisualChoiceSpec(num,den){
 const correct={n:num,d:den,kind:den===4?pick(['bar','circle','square']):pick(['bar','circle']),ok:true};
 const pool=[[1,2],[1,4],[2,4],[3,4]].filter(([n,d])=>n!==num||d!==den);
 const wrong=shuffle(pool).slice(0,2).map(([n,d])=>({n,d,kind:d===4?pick(['bar','circle','square']):pick(['bar','circle']),ok:false}));
 wrong.push({n:num,d:den,kind:'bar',invalid:true,ok:false});
 return shuffle([correct,...wrong]);
}
function fractionWrongChoices(num,den){
 const ans=`${num}/${den}`,cands=[];
 for(const [n,d] of [[den,num],[Math.max(1,num-1),den],[Math.min(den-1,num+1),den],[num,den===10?8:10],[1,den],[den-1,den],[num,Math.max(2,den-1)]]){
   if(n<d && n>0 && d>1){const v=`${n}/${d}`;if(v!==ans&&!cands.includes(v))cands.push(v)}
 }
 let d=2;while(cands.length<3){const n=1,v=`${n}/${d}`;if(v!==ans&&!cands.includes(v))cands.push(v);d++}
 return cands.slice(0,3).map(x=>N(x,'fraction'));
}

// ===== 2.5D visual kit (pemilik 2026-10-26: "upgrade mana yang guna flat jadi 2.5D") =====
// Same visual language as PAD5Scenes (Year 5) and the Year 1 paU6Scene: inline SVG on a soft
// panel, solids drawn as raised slabs (darker side faces under a lighter top face), a white
// highlight edge and Nunito 900 text. Text always carries inline style because
// `.paU6Scene svg text` / `.kssrDiagram text` CSS would otherwise override presentation
// attributes. Values, labels and aria-labels are unchanged from the flat versions, so answers
// and accessibility text are identical.
var PA25={
 ink:'#213b67',text:'#243d5e',soft:'#3d5a80',panel:'#f5f9ff',panelEdge:'#d7e3f1',track:'#e7eef8',trackSide:'#b9c8dc',
 colors:[['#f4bb3a','#c48d1c'],['#4fb4c8','#2f8798'],['#7b6bd6','#5546a8'],['#ef7f65','#c2563f'],['#67c26f','#3f8f47'],['#e46fa8','#b2467c']],
 green:['#62c991','#3e9c69'],empty:['#eef3fb','#c3cfe0'],red:['#ef6f6c','#b8433f'],
 f(n){return Number(n).toFixed(1)},
 txt(x,y,s,size=14,fill='#243d5e',anchor='middle',extra=''){return `<text x="${PA25.f(x)}" y="${PA25.f(y)}"${extra} style="font:900 ${size}px Nunito,system-ui,sans-serif;fill:${fill};text-anchor:${anchor}">${s}</text>`},
 scene(w,h,aria,body,cls='',attrs=''){h=Math.ceil(h);return `<div class="kssrDiagram paU6Scene paD5Scene${cls?' '+cls:''}"${attrs}><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${aria}"><rect x="1" y="1" width="${w-2}" height="${h-2}" rx="15" fill="#f5f9ff" stroke="#d7e3f1"/>${body}</svg></div>`},
 poly(pts,fill,stroke='#36577a',w=2){return `<polygon points="${pts.map(([x,y])=>PA25.f(x)+','+PA25.f(y)).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round"/>`},
 // Extruded polygon: side faces down-right, then the top face.
 slab(pts,top,side,depth=7,stroke='#36577a'){
  const dx=depth*.55,dy=depth;
  const sides=pts.map((p,i)=>{const q=pts[(i+1)%pts.length];return PA25.poly([p,q,[q[0]+dx,q[1]+dy],[p[0]+dx,p[1]+dy]],side,'#4d6c83',1)}).join('');
  return sides+PA25.poly(pts,top,stroke);
 },
 // Raised box (front face + right side + top lip), used for bars, tiles and rulers.
 box(x,y,w,h,top,side,depth=6,stroke='#36577a',rx=0){
  const dx=depth*.55,dy=depth*.55;
  return PA25.poly([[x+w,y],[x+w+dx,y-dy],[x+w+dx,y+h-dy],[x+w,y+h]],side,'#4d6c83',1)
   +PA25.poly([[x,y],[x+dx,y-dy],[x+w+dx,y-dy],[x+w,y]],PA25.lighten(top),'#4d6c83',1)
   +`<rect x="${PA25.f(x)}" y="${PA25.f(y)}" width="${PA25.f(w)}" height="${PA25.f(h)}" rx="${rx}" fill="${top}" stroke="${stroke}" stroke-width="1.6"/>`;
 },
 lighten(hex){const n=parseInt(hex.slice(1),16),c=[n>>16,(n>>8)&255,n&255].map(v=>Math.round(v+(255-v)*.35));return '#'+c.map(v=>v.toString(16).padStart(2,'0')).join('')},
 shine(x1,y1,x2,y2){return `<path d="M${PA25.f(x1)} ${PA25.f(y1)} L${PA25.f(x2)} ${PA25.f(y2)}" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>`},
 // Shaded ball/token with a soft floor shadow.
 ball(cx,cy,r,fill,side){return `<ellipse cx="${PA25.f(cx+r*.15)}" cy="${PA25.f(cy+r*.92)}" rx="${PA25.f(r*.9)}" ry="${PA25.f(r*.3)}" fill="#2f5ea8" opacity=".12"/><circle cx="${PA25.f(cx)}" cy="${PA25.f(cy)}" r="${PA25.f(r)}" fill="${side}" stroke="#36577a" stroke-width="1.4"/><circle cx="${PA25.f(cx-r*.12)}" cy="${PA25.f(cy-r*.14)}" r="${PA25.f(r*.78)}" fill="${fill}"/><circle cx="${PA25.f(cx-r*.38)}" cy="${PA25.f(cy-r*.4)}" r="${PA25.f(r*.22)}" fill="#fff" opacity=".7"/>`},
 shadow(cx,cy,rx,ry){return `<ellipse cx="${PA25.f(cx)}" cy="${PA25.f(cy)}" rx="${PA25.f(rx)}" ry="${PA25.f(ry)}" fill="#2f5ea8" opacity=".08"/>`},
 // Thick disc (pie / fraction circle): sectors on the top ellipse, darker band in front.
 disc(cx,cy,rx,ry,t,parts){
  const pt=a=>[cx+rx*Math.cos(a),cy+ry*Math.sin(a)];
  let acc=0;const tot=parts.reduce((a,p)=>a+p.v,0)||1;
  const segs=parts.map(p=>{const a0=-Math.PI/2+acc/tot*2*Math.PI;acc+=p.v;return {a0,a1:-Math.PI/2+acc/tot*2*Math.PI,c:p.c}});
  const band=segs.map(s=>{const lo=Math.max(s.a0,0),hi=Math.min(s.a1,Math.PI);if(hi<=lo)return '';const [x0,y0]=pt(lo),[x1,y1]=pt(hi);return `<path d="M${PA25.f(x0)} ${PA25.f(y0)} A${rx} ${ry} 0 0 1 ${PA25.f(x1)} ${PA25.f(y1)} L${PA25.f(x1)} ${PA25.f(y1+t)} A${rx} ${ry} 0 0 0 ${PA25.f(x0)} ${PA25.f(y0+t)} Z" fill="${s.c[1]}" stroke="${PA25.ink}" stroke-width="1"/>`}).join('');
  const top=segs.map(s=>{if(s.a1-s.a0>=2*Math.PI-1e-6)return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${s.c[0]}" stroke="${PA25.ink}" stroke-width="1.6"/>`;if(s.a1-s.a0<=1e-6)return '';const [x0,y0]=pt(s.a0),[x1,y1]=pt(s.a1);return `<path d="M${cx} ${cy} L${PA25.f(x0)} ${PA25.f(y0)} A${rx} ${ry} 0 ${s.a1-s.a0>Math.PI?1:0} 1 ${PA25.f(x1)} ${PA25.f(y1)} Z" fill="${s.c[0]}" stroke="${PA25.ink}" stroke-width="1.6" stroke-linejoin="round"/>`}).join('');
  return PA25.shadow(cx,cy+t+6,rx,ry)+band+top;
 }
};

function percentVisual(pct){
 const filled=Math.round(pct/10),x0=26,w=28,y=34,h=30;
 let cells='';for(let i=0;i<10;i++){const on=i<filled;cells+=PA25.box(x0+i*w,y,w,h,on?'#ffd36d':PA25.empty[0],on?'#d9a93a':PA25.empty[1],7)}
 return PA25.scene(340,98,`${pct}% daripada 10 kotak, setiap kotak 10%`,cells+PA25.shine(x0+4,y+4,x0+10*w-4,y+4)+PA25.txt(170,90,'Setiap kotak = 10%',12,PA25.soft));
}
function clockSvg(hour,minute){
 let h=((hour%12)+(minute/60))*30-90,m=minute*6-90,rad=x=>x*Math.PI/180;
 const cx=170,cy=80,r=60,hx=cx+26*Math.cos(rad(h)),hy=cy+26*Math.sin(rad(h)),mx=cx+42*Math.cos(rad(m)),my=cy+42*Math.sin(rad(m));
 let marks='';for(let i=0;i<60;i++){const a=rad(i*6-90),big=i%5===0,r1=r-(big?9:5);marks+=`<line x1="${PA25.f(cx+r1*Math.cos(a))}" y1="${PA25.f(cy+r1*Math.sin(a))}" x2="${PA25.f(cx+(r-2)*Math.cos(a))}" y2="${PA25.f(cy+(r-2)*Math.sin(a))}" stroke="#7b8fb0" stroke-width="${big?2.4:1}"/>`}
 const nums=Array.from({length:12},(_,i)=>{const a=rad((i+1)*30-90),x=cx+(r-19)*Math.cos(a),y=cy+(r-19)*Math.sin(a);return PA25.txt(x,y+5,i+1,13,PA25.text)}).join('');
 const body=PA25.shadow(cx+4,cy+r+8,r*.9,8)
  +`<circle cx="${cx+5}" cy="${cy+6}" r="${r+7}" fill="#2f5ea8"/><circle cx="${cx}" cy="${cy}" r="${r+7}" fill="#4f83d1" stroke="${PA25.ink}" stroke-width="2"/>`
  +`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fbfdff" stroke="${PA25.ink}" stroke-width="2"/><path d="M${cx-r*.7} ${cy-r*.55} A${r*.95} ${r*.95} 0 0 1 ${cx+r*.2} ${cy-r*.93}" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".9"/>`
  +marks+nums
  +`<line x1="${cx+2}" y1="${cy+3}" x2="${PA25.f(hx+2)}" y2="${PA25.f(hy+3)}" stroke="#000" stroke-opacity=".15" stroke-width="7" stroke-linecap="round"/><line x1="${cx}" y1="${cy}" x2="${PA25.f(hx)}" y2="${PA25.f(hy)}" stroke="#26344f" stroke-width="7" stroke-linecap="round"/>`
  +`<line x1="${cx+2}" y1="${cy+3}" x2="${PA25.f(mx+2)}" y2="${PA25.f(my+3)}" stroke="#000" stroke-opacity=".15" stroke-width="5" stroke-linecap="round"/><line x1="${cx}" y1="${cy}" x2="${PA25.f(mx)}" y2="${PA25.f(my)}" stroke="#4388e8" stroke-width="5" stroke-linecap="round"/>`
  +`<circle cx="${cx}" cy="${cy}" r="6" fill="#26344f"/><circle cx="${cx-1.5}" cy="${cy-1.5}" r="2" fill="#fff" opacity=".7"/>`;
 return PA25.scene(340,164,'Muka jam analog',body,'clockVisual');
}
function shapeSvg(type){
 const S={
  triangle:{pts:[[170,22],[226,112],[114,112]],c:PA25.colors[0]},
  square:{pts:[[126,26],[214,26],[214,114],[126,114]],c:PA25.colors[1]},
  rectangle:{pts:[[104,40],[236,40],[236,110],[104,110]],c:PA25.colors[4]},
  pentagon:{pts:[[170,20],[222,57],[202,114],[138,114],[118,57]],c:PA25.colors[2]}
 };
 let body;
 if(type==='circle')body=`<circle cx="175" cy="77" r="46" fill="#c2567c" stroke="#4d6c83"/><circle cx="170" cy="70" r="46" fill="#ffb4ca" stroke="#36577a" stroke-width="2"/>`+PA25.shine(140,52,176,30);
 else{const s=S[type]||S.square;body=PA25.slab(s.pts,s.c[0],s.c[1],9)+PA25.shine(s.pts[0][0]+(type==='triangle'?-6:6),s.pts[0][1]+(type==='triangle'?12:6),s.pts[1][0]-(type==='triangle'?20:8),s.pts[1][1]+(type==='triangle'?-14:6))}
 const names={triangle:'Segi tiga',square:'Segi empat sama',rectangle:'Segi empat tepat',pentagon:'Pentagon',circle:'Bulatan'};
 return PA25.scene(340,140,names[type]||names.square,PA25.shadow(176,128,70,8)+body);
}
function coordGrid(x,y){
 const ox=110,oy=126,s=26,n=4;let g='';
 for(let i=0;i<=n;i++){g+=`<line x1="${ox+i*s}" y1="${oy}" x2="${ox+i*s}" y2="${oy-n*s}" stroke="#c9d6e8" stroke-width="1.2"/><line x1="${ox}" y1="${oy-i*s}" x2="${ox+n*s}" y2="${oy-i*s}" stroke="#c9d6e8" stroke-width="1.2"/>`+PA25.txt(ox+i*s,oy+17,i,12,PA25.soft)+PA25.txt(ox-12,oy-i*s+4,i,12,PA25.soft)}
 const board=PA25.box(ox-4,oy-n*s-4,n*s+8,n*s+8,'#ffffff','#c3cfe0',8,'#9bb0cc');
 const axes=`<line x1="${ox}" y1="${oy}" x2="${ox+n*s+10}" y2="${oy}" stroke="${PA25.ink}" stroke-width="2.4"/><line x1="${ox}" y1="${oy}" x2="${ox}" y2="${oy-n*s-10}" stroke="${PA25.ink}" stroke-width="2.4"/>`;
 return PA25.scene(340,150,`Grid koordinat dengan titik pada ${x}, ${y}`,board+g+axes+PA25.ball(ox+x*s,oy-y*s,8,'#ff8a87','#c2453f'));
}
function shape3DSvg(type){
 const L='stroke="#36577a" stroke-width="2" stroke-linejoin="round"';
 const m={
  cube:`<polygon points="132,58 178,36 214,56 168,78" fill="#cfe2ff" ${L}/><polygon points="132,58 168,78 168,128 132,108" fill="#82aff2" ${L}/><polygon points="168,78 214,56 214,106 168,128" fill="#5f8bd0" ${L}/>`,
  cuboid:`<polygon points="104,62 172,38 232,58 164,82" fill="#c8eed2" ${L}/><polygon points="104,62 164,82 164,122 104,102" fill="#79c898" ${L}/><polygon points="164,82 232,58 232,98 164,122" fill="#4f9f72" ${L}/>`,
  pyramid:`<polygon points="170,22 120,106 172,128" fill="#ffd48b" ${L}/><polygon points="170,22 224,102 172,128" fill="#e09a3d" ${L}/>`,
  cylinder:`<rect x="128" y="44" width="84" height="66" fill="#5fb8c5" stroke="none"/><path d="M128 44 V110 A42 14 0 0 0 212 110 V44" fill="#4aa6b4" ${L}/><path d="M128 44 V110 A42 14 0 0 0 170 124 V58 A42 14 0 0 1 128 44 Z" fill="#71cbd8" stroke="none"/><ellipse cx="170" cy="44" rx="42" ry="14" fill="#baf5fa" ${L}/>`,
  cone:`<path d="M170 20 L128 108 A42 14 0 0 0 212 108 Z" fill="#d76f9e" ${L}/><path d="M170 20 L128 108 A42 14 0 0 0 170 122 Z" fill="#f1a8c8" stroke="none"/><path d="M170 20 L128 108 A42 14 0 0 0 212 108" fill="none" ${L}/>`
 };
 const names={cube:'Kubus',cuboid:'Kuboid',pyramid:'Piramid',cylinder:'Silinder',cone:'Kon'};
 const shine=type==='cube'?PA25.shine(142,58,176,42):type==='cuboid'?PA25.shine(116,62,170,44):type==='cylinder'?`<path d="M140 52 V100" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`:'';
 return PA25.scene(340,146,names[type]||names.cube,PA25.shadow(172,132,62,8)+(m[type]||m.cube)+shine);
}
function shapeNetSvg(type){
 const s=26,cell=(cx,cy,c)=>PA25.box(cx,cy,s,s,c[0],c[1],5);
 const blue=['#9fc5ff','#5f8bd0'],green=['#b6e3c2','#5aa676'],dark=['#8dcc9f','#4f9f72'];
 const cells=type==='cube'
  ?[[157,16,blue],[105,42,blue],[131,42,blue],[157,42,blue],[183,42,blue],[157,68,blue]]
  :[[118,28,green],[144,28,green],[170,28,green],[196,28,green],[144,54,dark],[144,80,dark]];
 return PA25.scene(340,124,type==='cube'?'Bentangan kubus':'Bentangan kuboid',cells.map(([x,y,c])=>cell(x,y,c)).join(''));
}
function base10Visual(n){
 const h=Math.floor(n/100),t=Math.floor((n%100)/10),o=n%10;
 const cube=(x,y,c)=>PA25.box(x,y,9,9,c[0],c[1],4,'#36577a');
 const plate=(x,y)=>{let g=PA25.box(x,y,36,36,'#ffd27d','#d4a43c',5);for(let i=1;i<10;i++)g+=`<line x1="${x+i*3.6}" y1="${y}" x2="${x+i*3.6}" y2="${y+36}" stroke="#c99a35" stroke-width=".6"/><line x1="${x}" y1="${y+i*3.6}" x2="${x+36}" y2="${y+i*3.6}" stroke="#c99a35" stroke-width=".6"/>`;return g};
 const rod=(x,y)=>{let g=PA25.box(x,y,9,40,'#87c8ff','#4f95d4',4);for(let i=1;i<10;i++)g+=`<line x1="${x}" y1="${y+i*4}" x2="${x+9}" y2="${y+i*4}" stroke="#4f95d4" stroke-width=".7"/>`;return g};
 let H='',T='',O='';
 for(let i=0;i<h;i++)H+=plate(18+(i%3)*40,22+Math.floor(i/3)*42);
 for(let i=0;i<t;i++)T+=rod(152+(i%5)*14,24+Math.floor(i/5)*46);
 for(let i=0;i<o;i++)O+=cube(252+(i%3)*14,34+Math.floor(i/3)*14,['#8ee1aa','#4fae74']);
 const empty=(x)=>PA25.txt(x,64,'0',16,'#8090aa');
 const rows=Math.max(1,Math.ceil(h/3));
 const yLab=Math.max(120,22+rows*42+18);
 return PA25.scene(340,yLab+10,`Blok asas sepuluh: ${h} ratus, ${t} puluh, ${o} sa`,(H||empty(76))+(T||empty(184))+(O||empty(272))+PA25.txt(76,yLab,'ratus',13)+PA25.txt(184,yLab,'puluh',13)+PA25.txt(272,yLab,'sa',13));
}
function numberLineSvg(min,max,step,point=null,options={}){
 const vals=[];for(let v=min;v<=max;v+=step)vals.push(v);
 const left=26,right=314,y=60,span=Math.max(1,max-min);
 const X=v=>Number((left+(v-min)/span*(right-left)).toFixed(2));
 const track=PA25.box(left-8,y-5,right-left+16,10,'#dfe8f5','#9fb2cc',6,'#7b8fb0',4);
 const ticks=vals.map(v=>{const x=X(v);return `<line x1="${x}" y1="${y-11}" x2="${x}" y2="${y+11}" stroke="${PA25.ink}" stroke-width="2.2" stroke-linecap="round"/>`+PA25.txt(x,y+30,options.endpointLabelsOnly&&Math.abs(v-min)>1e-8&&Math.abs(v-max)>1e-8?'':tidyDisplay(v),12,PA25.text)}).join('');
 let marker='';
 if(point!=null){const x=X(point);marker=`<path d="M${x} ${y-8} L${x-9} ${y-24} A11 11 0 1 1 ${x+9} ${y-24} Z" fill="#c2453f" transform="translate(2 2)" opacity=".35"/><path d="M${x} ${y-8} L${x-9} ${y-24} A11 11 0 1 1 ${x+9} ${y-24} Z" fill="#ef6f6c" stroke="#9c3e3b" stroke-width="1.5"/><circle cx="${x-3}" cy="${y-33}" r="3" fill="#fff" opacity=".7"/>`+PA25.txt(x,y-46,options.hidePointValue?'?':tidyDisplay(point),13,'#9c3e3b')}
 return PA25.scene(340,104,`Garis nombor dari ${tidyDisplay(min)} hingga ${tidyDisplay(max)}${point!=null?(options.hidePointValue?' dengan satu titik bertanda':' dengan titik pada '+tidyDisplay(point)):''}`,track+ticks+marker);
}
// Same-sized objects and spacing in both sets make the known ten a useful benchmark.
// Contract (audit/d2-estimation-reference.test.js): exactly one <circle> per object and exactly
// two <rect> trays, so the 2.5D shading uses a gradient fill and the panel background is a <path>.
function dotsEstimateVisual(count){
 const total=Math.max(1,Math.min(32,Math.round(Number(count)||1)));
 const panel=(amount,x,label,known)=>{
  const dots=Array.from({length:amount},(_,i)=>{
   const row=Math.floor(i/6),col=i%6;
   const cx=x+19+col*20+(row%2)*4+((i*7)%3-1)*2;
   const cy=49+row*18+((i*5)%3-1)*2;
   return `<circle cx="${cx}" cy="${cy}" r="5.6" fill="url(#paEstDot)" stroke="#2e66ad" stroke-width="1"/>`;
  }).join('');
  const side=PA25.poly([[x+148,4],[x+154,0],[x+154,177],[x+148,181]],'#b9cbe2','#8cadd0',1)+PA25.poly([[x,4],[x+6,0],[x+154,0],[x+148,4]],'#ffffff','#8cadd0',1);
  return `<g data-estimate-set="${label}">${side}<rect x="${x}" y="4" width="148" height="177" rx="12" fill="#edf5ff" stroke="#8cadd0"/>${PA25.txt(x+74,26,'Set '+label,15)}${dots}${PA25.txt(x+74,168,known?'10 objek':'? objek',13)}</g>`;
 };
 return `<div class="kssrDiagram paU6Scene paD5Scene"><svg role="img" aria-label="Set A mengandungi 10 objek. Anggarkan bilangan objek dalam Set B dengan membandingkan kedua-dua set." viewBox="0 0 330 192"><defs><radialGradient id="paEstDot" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#cfe3ff"/><stop offset=".45" stop-color="#5a9be0"/><stop offset="1" stop-color="#2e66ad"/></radialGradient></defs><path d="M16 1 H314 A15 15 0 0 1 329 16 V176 A15 15 0 0 1 314 191 H16 A15 15 0 0 1 1 176 V16 A15 15 0 0 1 16 1 Z" fill="#f5f9ff" stroke="#d7e3f1"/>${panel(10,3,'A',true)}${panel(total,161,'B',false)}</svg></div>`;
}
/* Pembaris gaya buku teks KSSR: nombor pada SETIAP cm (murid membaca hujung objek, bukan
   mengira garis), tanda setengah cm, dan objek bermula tepat pada tanda 0. */
function rulerSvg(cm){
 const max=20,left=24,right=310,y=100,scale=(right-left)/max;
 const body=PA25.box(12,y-38,310,44,'#ffe7a3','#c9a24b',8,'#a88730',6)+PA25.shine(18,y-33,316,y-33);
 let ticks='';
 for(let i=0;i<=max*2;i++){const x=left+i*scale/2,whole=i%2===0,tall=whole?(i%10===0?17:13):8;ticks+=`<line x1="${PA25.f(x)}" y1="${y-38}" x2="${PA25.f(x)}" y2="${y-38+tall}" stroke="#6b5420" stroke-width="${whole?1.6:1}"/>`;if(whole)ticks+=PA25.txt(x,y-8,i/2,i/2>=10?9:10,'#6b5420')}
 const x2=left+cm*scale;
 const obj=PA25.box(left,28,Math.max(4,x2-left),12,'#ef6f6c','#b8433f',6,'#9c3e3b',3);
 const guides=`<line x1="${left}" y1="42" x2="${left}" y2="${y-38}" stroke="#ef6f6c" stroke-width="1.4" stroke-dasharray="3 3"/><line x1="${PA25.f(x2)}" y1="42" x2="${PA25.f(x2)}" y2="${y-38}" stroke="#ef6f6c" stroke-width="1.4" stroke-dasharray="3 3"/>`;
 return PA25.scene(340,128,'Pembaris 0 hingga 20 cm dengan satu objek diukur',PA25.shadow(166,y+12,150,5)+body+ticks+guides+obj+PA25.txt(318,y+18,'cm',11,'#6b5420','end'));
}
/* Penimbang gaya buku teks KSSR (pemilik 2026-10-26: "scale tu betul ke follow KSSR style?"):
   dulang di atas, badan penimbang, dail bulat dengan 0 di atas, nombor setiap 100 g dan
   jarum bergerak ikut arah jam. Dail meliputi 330° supaya 0 dan nilai maksimum tidak
   bertindih. Nombor dilukis DI ATAS jarum (dengan halo putih) supaya nombor yang ditunjuk
   tetap boleh dibaca. Nilai soalan (100–900 g) jatuh tepat pada nombor berlabel. */
function paDialScale(value,dmax,step,unit){
 // Padat (tinggi 160): kad soalan menghadkan visual ~151px, jadi lukisan tinggi akan dikecilkan
 // dan nombor dail jadi terlalu halus. Dail sendiri ialah badan penimbang; dulang di atas.
 const cx=170,cy=94,r=58,SW=330,ang=x=>(-90+(x/dmax)*SW)*Math.PI/180;
 let marks='',nums='';
 const nTicks=Math.round(dmax/(step/2));
 for(let i=0;i<=nTicks;i++){const x=i*step/2,a=ang(x),big=i%2===0,r1=r-(big?9:5);marks+=`<line x1="${PA25.f(cx+r1*Math.cos(a))}" y1="${PA25.f(cy+r1*Math.sin(a))}" x2="${PA25.f(cx+(r-1.5)*Math.cos(a))}" y2="${PA25.f(cy+(r-1.5)*Math.sin(a))}" stroke="${PA25.ink}" stroke-width="${big?2:1.1}"/>`;
  if(big){const tr=r-19,lab=String(+x.toFixed(4)),fs=lab.length>=4?8.5:lab.length===3?9.5:11;nums+=`<text x="${PA25.f(cx+tr*Math.cos(a))}" y="${PA25.f(cy+tr*Math.sin(a)+3.8)}" style="font:900 ${fs}px Nunito,system-ui,sans-serif;fill:#243d5e;text-anchor:middle;paint-order:stroke;stroke:#fbfdff;stroke-width:3px;stroke-linejoin:round">${lab}</text>`}}
 const v=Math.max(0,Math.min(dmax,value)),a=ang(v),nx=cx+(r-3)*Math.cos(a),ny=cy+(r-3)*Math.sin(a);
 const pan=`<path d="M112 14 Q172 30 232 14 L227 20 Q172 37 117 20 Z" fill="#7f98bb" stroke="#4d6c83" stroke-width="1"/><ellipse cx="172" cy="14" rx="60" ry="8" fill="#dbe6f4" stroke="#4d6c83" stroke-width="1.6"/>`+PA25.box(165,22,12,10,'#c7d6ea','#7f98bb',4);
 const body=`<circle cx="${cx+5}" cy="${cy+6}" r="${r+12}" fill="#c48d1c"/><circle cx="${cx}" cy="${cy}" r="${r+12}" fill="#f0b84a" stroke="#8a6410" stroke-width="2"/>`+PA25.box(cx-44,cy+r+6,88,8,'#f0b84a','#c48d1c',6,'#8a6410',3);
 const dial=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fbfdff" stroke="${PA25.ink}" stroke-width="1.5"/>`;
 const needle=`<line x1="${cx+1.2}" y1="${cy+2}" x2="${PA25.f(nx+1.2)}" y2="${PA25.f(ny+2)}" stroke="#000" stroke-opacity=".15" stroke-width="3" stroke-linecap="round"/><line x1="${cx}" y1="${cy}" x2="${PA25.f(nx)}" y2="${PA25.f(ny)}" stroke="#e0443f" stroke-width="2.4" stroke-linecap="round"/>`;
 return PA25.shadow(174,cy+r+18,80,5)+body+pan+dial+marks+PA25.txt(cx,cy-12,unit,12,PA25.soft)+needle+nums+`<circle cx="${cx}" cy="${cy}" r="5" fill="${PA25.ink}"/>`;
}
function scaleSvg(grams){
 return PA25.scene(340,172,'Penimbang berdail 0 hingga 1000 g',paDialScale(grams,1000,100,'g'));
}
/* Silinder penyukat gaya KSSR: nombor pada setiap 100 mL supaya bacaan (100–900 mL) jatuh
   tepat pada nombor, bukan di antara label. */
function cylinderSvg(ml){
 const max=1000,top=16,bottom=136,cx=150,rx=24,ry=6,fillH=(ml/max)*(bottom-top),fy=bottom-fillH;
 let marks='';for(let v=0;v<=1000;v+=50){const y=bottom-(v/max)*(bottom-top),big=v%100===0;marks+=`<line x1="${cx+rx-(big?13:7)}" y1="${PA25.f(y)}" x2="${cx+rx}" y2="${PA25.f(y)}" stroke="${PA25.ink}" stroke-width="${big?1.6:1}"/>`+(big?PA25.txt(cx+rx+7,y+4,v,11,PA25.text,'start'):'')}
 const liquid=fillH>0?`<path d="M${cx-rx} ${PA25.f(fy)} V${bottom} A${rx} ${ry} 0 0 0 ${cx+rx} ${bottom} V${PA25.f(fy)} Z" fill="#59b8ef" opacity=".85"/><ellipse cx="${cx}" cy="${PA25.f(fy)}" rx="${rx}" ry="${ry}" fill="#9ad9ff" stroke="#3f95cc" stroke-width="1"/>`:'';
 const glass=`<path d="M${cx-rx} ${top} V${bottom} A${rx} ${ry} 0 0 0 ${cx+rx} ${bottom} V${top}" fill="#eef6ff" fill-opacity=".55" stroke="#4d6c83" stroke-width="2"/>`;
 const rim=`<ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" fill="#f8fbff" fill-opacity=".6" stroke="#4d6c83" stroke-width="2"/><path d="M${cx-rx+6} ${top+10} V${bottom-6}" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
 const foot=PA25.box(cx-rx-12,bottom+12,2*rx+24,8,'#c7d6ea','#7f98bb',6);
 return PA25.scene(340,164,'Silinder penyukat 0 hingga 1000 mL',PA25.shadow(cx+4,bottom+24,50,6)+foot+glass+liquid+marks+rim+PA25.txt(cx-rx-10,top+6,'mL',12,PA25.text,'end'));
}
function timelineSvg(sh,sm,eh,em,visibility={}){
 const fmt=visibility.formatTime||((h,m)=>`${h}:${String(m).padStart(2,'0')}`);
 const startLabel=visibility.showStart===false?'?':fmt(sh,sm),endLabel=visibility.showEnd===false?'?':fmt(eh,em);
 const y=54;
 return PA25.scene(340,104,`Garis masa dari ${startLabel} hingga ${endLabel}`,
  PA25.box(40,y-6,260,12,'#dfe8f5','#9fb2cc',7,'#7b8fb0',5)
  +PA25.ball(55,y,9,'#8fb9ff','#4f83d1')+PA25.ball(285,y,9,'#9fe0b8','#4fae74')
  +`<path d="M130 ${y-18} Q170 ${y-40} 210 ${y-18}" fill="none" stroke="#f0ae3d" stroke-width="3.5" stroke-linecap="round"/><path d="M204 ${y-26} l10 8 -12 4" fill="#f0ae3d"/>`
  +PA25.txt(30,y+34,startLabel,14,PA25.text,'start')+PA25.txt(310,y+34,endLabel,14,PA25.text,'end'));
}
function barChart(labels,vals){
 const max=Math.max(10,Math.ceil(Math.max(...vals)/2)*2),W=340,left=44,base=150,top=18,plotH=base-top,n=labels.length;
 const bw=Math.min(42,Math.floor(220/n)),gap=Math.max(10,Math.floor((270-n*bw)/Math.max(1,n)));
 let grid='';for(let v=0;v<=max;v+=2){const y=base-(v/max)*plotH;grid+=`<line x1="${left}" y1="${PA25.f(y)}" x2="324" y2="${PA25.f(y)}" stroke="#dde5f1" stroke-width="1"/>`+PA25.txt(36,y+4,v,10,'#55627a','end')}
 let bars='';labels.forEach((l,i)=>{const x=left+gap/2+i*(bw+gap),h=(vals[i]/max)*plotH,y=base-h,c=PA25.colors[i%PA25.colors.length];bars+=(h>0?PA25.box(x,y,bw,h,c[0],c[1],10,PA25.ink):'')+PA25.txt(x+bw/2,base+18,l,11,PA25.text)});
 const floor=PA25.poly([[left,base],[left+5.5,base-5.5],[330,base-5.5],[324,base]],'#c9d6e8','#9fb2cc',1);
 return PA25.scene(W,176,`Carta palang: ${labels.map((l,i)=>l+' '+vals[i]).join(', ')}`,grid+floor+`<line x1="${left}" y1="${top}" x2="${left}" y2="${base}" stroke="${PA25.ink}" stroke-width="2"/><line x1="${left}" y1="${base}" x2="324" y2="${base}" stroke="${PA25.ink}" stroke-width="2"/>`+bars);
}
function fractionVisual(num,den){
 const label=`Satu keseluruhan dibahagi kepada ${den} bahagian sama besar; ${num} bahagian berlorek`;
 /* Gaya rajah dipelbagaikan seperti lembaran sekolah: jalur, bulatan dan
    petak. Semua bentuk masih mengekalkan bilangan bahagian yang sama besar. */
 const forms=den===2?['bar','circle']:den===4?['bar','circle','square']:['bar'];
 const form=forms[Math.floor(Math.random()*forms.length)];
 if(form==='circle'){
  const parts=Array.from({length:den},(_,i)=>({v:1,c:i<num?PA25.green:PA25.empty}));
  return PA25.scene(340,128,label,PA25.disc(170,56,72,40,14,parts));
 }
 if(form==='square'){
  let cells='';[[0,0],[1,0],[0,1],[1,1]].forEach(([c,r],i)=>{cells+=PA25.box(126+c*44,18+r*44,44,44,i<num?PA25.green[0]:PA25.empty[0],i<num?PA25.green[1]:PA25.empty[1],9)});
  return PA25.scene(340,124,label,cells);
 }
 const w=Math.min(46,Math.floor(276/den)),x0=170-den*w/2;
 let cells='';for(let i=0;i<den;i++)cells+=PA25.box(x0+i*w,30,w,40,i<num?PA25.green[0]:PA25.empty[0],i<num?PA25.green[1]:PA25.empty[1],10);
 return PA25.scene(340,96,label,PA25.shadow(176,84,den*w/2+6,6)+cells+PA25.shine(x0+4,35,x0+den*w-4,35));
}
function fractionChoiceBoard(num,den){
 const mini=(kind,n,d,invalid=false)=>{
  const label=invalid?'bahagian tidak sama besar':`${n}/${d}`;
  let body;
  if(kind==='circle')body=PA25.disc(42,24,30,17,7,Array.from({length:d},(_,i)=>({v:1,c:i<n?PA25.green:PA25.empty})));
  else if(invalid)body=PA25.box(10,10,24,30,PA25.green[0],PA25.green[1],6)+PA25.box(34,10,40,30,PA25.empty[0],PA25.empty[1],6);
  else{const w=64/d;body=Array.from({length:d},(_,i)=>PA25.box(10+i*w,10,w,30,i<n?PA25.green[0]:PA25.empty[0],i<n?PA25.green[1]:PA25.empty[1],6)).join('')}
  return `<svg viewBox="0 0 86 54" width="86" height="54" role="img" aria-label="${label}">${body}</svg>`;
 };
 const wrongD=den===2?4:den,wrongN=den===2?1:(num===den-1?num-1:num+1);
 const otherD=den===2?4:2,otherN=Math.min(otherD-1,Math.max(1,num));
 const choices=[mini('bar',num,den),mini('circle',wrongN,wrongD),mini('bar',1,den,true),mini('bar',otherN,otherD)];
 return `<div role="group" aria-label="Pilihan rajah pecahan" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;max-width:260px;margin:0 auto 12px">${choices.map((v,i)=>`<div style="display:flex;align-items:center;justify-content:center;gap:4px;padding:6px;border:1px solid #d7e3f1;border-radius:12px;background:#f5f9ff;box-shadow:0 3px 0 #d7e3f1"><b style="font:900 15px Nunito,system-ui,sans-serif;color:#243d5e">${String.fromCharCode(65+i)}</b>${v}</div>`).join('')}</div>`;
}
function rectangleMeasureSvg(length,width){
 return PA25.scene(340,150,`Segi empat tepat berukuran ${length} sentimeter kali ${width} sentimeter`,
  PA25.shadow(176,128,96,7)+PA25.slab([[86,38],[246,38],[246,112],[86,112]],'#dceaff','#8fb0dc',10)+PA25.shine(92,44,240,44)
  +PA25.txt(166,28,`${length} cm`,15,PA25.text)+PA25.txt(266,80,`${width} cm`,15,PA25.text,'middle',` transform="rotate(90 266 80)"`),'geometryVisual');
}
function comparisonBarsSvg(a,b,unit,labelA='A',labelB='B'){
 const max=Math.max(a,b),wa=40+170*a/max,wb=40+170*b/max;
 return PA25.scene(340,118,`Perbandingan ${a} ${unit} dengan ${b} ${unit}`,
  PA25.txt(28,42,labelA,14,PA25.text)+PA25.box(48,24,wa,26,'#78a9ff','#4a7fd0',9,PA25.ink,4)+PA25.txt(62+wa,43,`${a} ${unit}`,12,PA25.text,'start')
  +PA25.txt(28,94,labelB,14,PA25.text)+PA25.box(48,76,wb,26,'#8bd3a8','#4fae74',9,PA25.ink,4)+PA25.txt(62+wb,95,`${b} ${unit}`,12,PA25.text,'start'),'measureVisual');
}
function fractionSetVisual(selected,total){
 const rows=Math.ceil(total/5),x0=170-Math.min(5,total)*21+21;
 const dots=Array.from({length:total},(_,i)=>PA25.ball(x0+(i%5)*42,30+Math.floor(i/5)*42,14,i<selected?PA25.green[0]:'#f1f5fb',i<selected?PA25.green[1]:'#b9c6d8')).join('');
 return PA25.scene(340,20+rows*42+8,`${selected} daripada ${total} objek dipilih`,dots,'fractionSetVisual');
}
