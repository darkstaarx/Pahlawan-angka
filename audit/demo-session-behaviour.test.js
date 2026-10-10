const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function makeButton(label){
  const classes=new Set();
  return {label,textContent:label,disabled:false,classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),has:x=>classes.has(x)}};
}

function harness(){
  const controls=[makeButton('A'),makeButton('B'),makeButton('C')];
  const answers={children:controls,querySelector:()=>null,querySelectorAll:()=>controls};
  const feedback={textContent:''};
  let questionDraws=0,celebrations=0;
  const elements={segelAnswers:answers,segelFeedback:feedback,segelHint:{classList:{add(){}}}};
  const source=fs.readFileSync('js/segel-demo-v2.1.0.js','utf8');
  const start=source.indexOf('  function unlockGuestRetryControls(');
  const end=source.indexOf('  async function respondProduction(',start);
  const body=source.slice(start,end);
  const c={
    console, setTimeout, clearTimeout,
    run:null, stage:null,
    entryMode:{guestDemo:true},
    $:id=>elements[id],
    sfx:()=>{}, q_hint:()=> 'Baca semula soalan.',
    setTypedRetryEnabled:clear=>{c.typedCleared=!!clear},
    wait:async()=>{},
    paintSeal:()=>{}, toast:()=>{},
    currentRun:x=>c.run===x,
    drawQuestion:()=>{questionDraws++},
    celebrate:()=>{celebrations++}
  };
  vm.createContext(c);
  vm.runInContext(`let run=null; let stage=null; ${body}`,c);
  c.run={generation:1,locked:false,retryOpen:false,retryWrongValue:null,q:{},asked:0,questionTarget:4,usedHint:false,tally:{own:0,hint:0,miss:0}};
  c.stage={wrong(){},async strike(){},hitSeal(){return {broken:false,tier:{name:'Gangsa'}}},async waitFinalImpact(){},allBroken(){return false}};
  c.__run=c.run;c.__stage=c.stage;
  // The extracted functions close over the VM's lexical `run` and `stage`.
  vm.runInContext('run=globalThis.__run; stage=globalThis.__stage;',c);
  return {c,controls,feedback,draws:()=>questionDraws,celebrations:()=>celebrations};
}

test('guest demo keeps first wrong attempt on the same question, then resolves a correct retry',async()=>{
  const h=harness(),wrong=h.controls[0],correct=h.controls[1];
  const originalQuestion=h.c.run.q;
  await h.c.respond({v:'wrong',tag:'wrong'},wrong);
  assert.equal(h.c.run.asked,0);
  assert.equal(h.c.run.tally.miss,0);
  assert.equal(h.c.run.retryOpen,true);
  assert.equal(h.c.run.q,originalQuestion);
  assert.equal(h.draws(),0);
  assert.equal(correct.disabled,false);
  await h.c.respond({v:'right',tag:'correct'},correct);
  assert.equal(h.c.run.asked,1);
  assert.equal(h.c.run.tally.hint,1,'a retry is counted as assisted in the demo summary');
  assert.equal(h.c.run.retryOpen,false);
  assert.equal(h.draws(),1);
});

test('guest demo resolves a distinct second wrong once and blocks repeated typed value',async()=>{
  const h=harness();
  await h.c.respond({v:'wrong-a',tag:'wrong'},h.controls[0]);
  await h.c.respond({v:'wrong-a',tag:'wrong'},h.controls[0]);
  assert.equal(h.c.run.asked,0);
  assert.equal(h.c.run.tally.miss,0);
  assert.equal(h.c.run.retryOpen,true);
  await h.c.respond({v:'wrong-b',tag:'wrong'},h.controls[1]);
  assert.equal(h.c.run.asked,1);
  assert.equal(h.c.run.tally.miss,1);
  assert.equal(h.c.run.retryOpen,false);
  assert.equal(h.draws(),1);
});

test('non guest demo keeps its original one attempt per question behavior',async()=>{
  const h=harness();h.c.entryMode={chapter:'1'};
  await h.c.respond({v:'wrong',tag:'wrong'},h.controls[0]);
  assert.equal(h.c.run.asked,1);
  assert.equal(h.c.run.tally.miss,1);
  assert.equal(h.draws(),1);
});

test('guest demo ignores a rapid second click while the first response is pending',async()=>{
  const h=harness();
  const first=h.c.respond({v:'wrong-a',tag:'wrong'},h.controls[0]);
  const second=h.c.respond({v:'wrong-b',tag:'wrong'},h.controls[1]);
  await Promise.all([first,second]);
  assert.equal(h.c.run.asked,0);
  assert.equal(h.c.run.retryOpen,true);
  assert.equal(h.draws(),0);
});

test('stale guest response cannot unlock a replacement run',async()=>{
  const h=harness();let release;
  h.c.wait=()=>new Promise(resolve=>{release=resolve});
  const pending=h.c.respond({v:'wrong',tag:'wrong'},h.controls[0]);
  await Promise.resolve();
  const replacement={generation:2,locked:false,retryOpen:false,retryWrongValue:null,q:{},asked:0,questionTarget:4,usedHint:false,tally:{own:0,hint:0,miss:0}};
  h.c.run=replacement;
  release();
  await pending;
  assert.equal(replacement.locked,false);
  assert.equal(h.draws(),0);
  assert.equal(h.controls[1].disabled,true,'old controls remain frozen after stale response');
});

test('fraction retry helper reopens nested controls and clears response state',()=>{
  const h=harness();
  const nested=[makeButton('Semak'),makeButton('Bahagian')];
  nested[0].classList.add('no');
  const panel={querySelectorAll:()=>nested};
  h.c.$=()=>({querySelector:selector=>selector==='.d1-fraction-answer'?panel:null});
  h.c.unlockGuestRetryControls(nested[0]);
  assert.deepEqual(nested.map(x=>x.disabled),[false,false]);
  assert.equal(nested[0].classList.has('no'),false);
});

test('typed retry helper clears the rejected value and re-enables input',()=>{
  const source=fs.readFileSync('js/segel-demo-v2.1.0.js','utf8');
  const start=source.indexOf('  function setTypedRetryEnabled('),end=source.indexOf('  function productionCurrent(',start);
  const input={value:'bad',disabled:true,focus(){this.focused=true}};
  const button={disabled:true};
  const form={querySelector:s=>s.includes('paTypedInput')?input:button};
  const answers={querySelector:s=>s==='.paTypedAnswer'?form:null};
  const c={$:()=>answers};
  vm.createContext(c);vm.runInContext(source.slice(start,end),c);
  c.setTypedRetryEnabled(true);
  assert.equal(input.value,'');assert.equal(input.disabled,false);assert.equal(button.disabled,false);assert.equal(input.focused,true);
});

test('guest demo pins the first terrain and resets it for a new run',()=>{
  const source=fs.readFileSync('js/segel-demo-v2.1.0.js','utf8');
  const start=source.indexOf('  function paintQuestion('),end=source.indexOf('  function toast(',start);
  const arenas=[];
  const elements=new Map();
  const el=id=>elements.get(id)||elements.set(id,{textContent:'',innerHTML:'',firstChild:{innerHTML:''},classList:{toggle(){},remove(){},add(){}},querySelector:()=>null,querySelectorAll:()=>[],closest:()=>null}).get(id);
  const c={
    console,window:{PAFractionAnswers:{render:()=>true}},document:{querySelectorAll:()=>[]},entryMode:{guestDemo:true},run:{firstArenaMeta:null,asked:0,questionTarget:2,coveredTopics:[],usedHint:false},
    META:{one:{domain:'Nombor'},two:{domain:'Wang'}},db:{schoolGrade:1},
    stage:{setArena:url=>arenas.push(url),sealAnchor:null},arenaForMeta:m=>m.domain,paintSeal:()=>{},
    $:el,mix:x=>x,questionLearningTitle:()=>'',PAWrittenArithmetic:{render:q=>q.prompt||''},PAFractionAnswers:{render:()=>false},
    renderTypedAnswer:()=>false,wireLegacyFractionTouch:()=>{},queueMicrotask:()=>{}
  };
  vm.createContext(c);
  vm.runInContext(source.slice(start,end),c);
  c.paintQuestion({prompt:'one',answer:'1',wrong:[],skill:'one'},'one');
  c.paintQuestion({prompt:'two',answer:'2',wrong:[],skill:'two'},'two');
  assert.deepEqual(arenas,['Nombor','Nombor']);
  c.run={firstArenaMeta:null,asked:0,questionTarget:1,coveredTopics:[],usedHint:false};
  c.paintQuestion({prompt:'two',answer:'2',wrong:[],skill:'two'},'two');
  assert.deepEqual(arenas,['Nombor','Nombor','Wang']);
});

test('interaction bridge forwards actual guest values and keeps guest retry state engine-neutral',async()=>{
  const source=fs.readFileSync('js/segel-interaction-bridge-v1.0.2.js','utf8');
  const calls=[];let rendered=false;const listeners={};
  const root={dataset:{},addEventListener:(type,fn,capture)=>{(listeners[type] ||= []).push({fn,capture})}};
  const buttonA=makeButton('wrong-a'),buttonB=makeButton('wrong-b');
  const box={className:'answers',dataset:{},querySelectorAll:selector=>selector==='button.ans'?[makeButton('1'),buttonA,buttonB]:[],querySelector:selector=>selector==='.paInteraction'&&rendered?root:null};
  const qEl={querySelector:()=>null};
  const question={interactionAuthored:true,answer:'1',wrong:[{v:'wrong-a',tag:'wrong'},{v:'wrong-b',tag:'wrong'}],skill:'demo'};
  const run={q:question,sess:{retryState:{before:true}}};
  const engine={answerSpec:()=>({kind:'choice'}),render:(q,container,api)=>{
    rendered=true;
    api.respond({v:'wrong-a',tag:'wrong'},buttonA);
    api.respond({v:'wrong-b',tag:'wrong'},buttonB);
    return true;
  }};
  const c={
    console,setTimeout,clearTimeout,queueMicrotask,MutationObserver:class{observe(){}},
    sess:{real:true},window:{PAGameQuestionInteractions:engine,PASegelDemo:{mode:()=>({guestDemo:true}),state:()=>run,submitInteraction:(choice,button,q)=>{calls.push({value:choice.v,button,q});return true}}},
    document:{readyState:'loading',addEventListener(){},getElementById:id=>id==='segelAnswers'?box:qEl}
  };
  vm.createContext(c);vm.runInContext(source,c);
  c.window.PASegelInteractionBridge.sync();
  await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(calls.map(call=>call.value),['wrong-a','wrong-b']);
  assert.equal(calls[0].q,question);assert.equal(calls[1].q,question);
  // Guest mode must not arm the shared engine's synthetic retry sentinel.
  assert.deepEqual(run.sess.retryState,{before:true});
  run.locked=true;
  let prevented=false,stopped=false;
  listeners.click[0].fn({preventDefault(){prevented=true},stopImmediatePropagation(){stopped=true}});
  assert.equal(prevented,true,'pending response blocks the engine click before it can lock the panel');
  assert.equal(stopped,true);
  assert.deepEqual(run.sess.retryState,{before:true});
  run.locked=false;
  listeners.click[0].fn({});
  assert.equal(run.sess.retryState,null);
  listeners.click[1].fn({});
  assert.deepEqual(run.sess.retryState,{before:true});
});
