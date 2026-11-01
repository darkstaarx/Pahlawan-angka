/* Compact Focus mini-game shell and worked fraction "explode" regression. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const files=['kedai-kek.html','lombong-permata.html','gudang-harta.html','bengkel-ajaib.html',
 'dapur-ramuan.html','menara-jam.html','pos-peninjau.html','tapak-bina.html','gerai-wirayung.html'];
const css=fs.readFileSync('css/minigame-compact-play-v1.css','utf8');
const worked=fs.readFileSync('js/minigame-worked-v1.js','utf8');
const bridge=fs.readFileSync('js/focus-mini-games-live-bridge.js','utf8');

test('all nine real mini-games load shared compact CSS after question focus, no duplicate',()=>{
 for(const path of files){
  const src=fs.readFileSync(path,'utf8');
  const compact='css/minigame-compact-play-v1.css?v=1.0.0';
  assert.equal(src.split(compact).length-1,1,path);
  assert.ok(src.indexOf(compact)>src.indexOf('css/minigame-question-focus-v1.css'),path);
  assert.match(src,/js\/minigame-worked-v1.js\?v=1.17.1/,path);
  assert.match(src,/<meta[^>]+name="viewport"/,path);
 }
});

test('embedded bridge preserves a reachable exit and screen-reader live status',()=>{
 assert.match(bridge,/id="paFocusMiniGameExit"/);
 assert.match(bridge,/paFocusMiniGameNav button\{min-height:30px/);
 assert.match(bridge,/paFocusMiniGameNav>b\{display:none!important/);
 assert.match(bridge,/paFocusMiniGameStatus\{position:absolute!important/);
 assert.match(bridge,/aria-live="polite"/);
 assert.match(bridge,/window\.PAMiniGameExit\?window\.PAMiniGameExit\.guard/);
 assert.match(bridge,/frame\.src=page/);
});

test('compact layout does not hide the question or game exit/actions',()=>{
 assert.match(css,/>\.scene\{/);
 assert.match(css,/clamp\(110px,20dvh,158px\)/);
 assert.match(css,/\.wk-on>\.scene/);
 assert.match(css,/clamp\(72px,11dvh,103px\)/);
 assert.match(css,/\.title small\{display:none!important/);
 assert.doesNotMatch(css,/#question\{display:none|#check\{display:none|\.actions\{display:none/);
});

test('worked model has exactly n visually separable fraction cells; no answer is auto-filled',()=>{
 assert.match(worked,/class="wk-model" role="img"/);
 assert.match(worked,/style="--slice:\$\{i\};--dx:\$\{/);
 assert.match(worked,/wk-exploded/);
 assert.match(worked,/model\.classList\.add\('wk-exploded'\)/);
 assert.match(worked,/model\.closest\('\.wk-hide'\)/);
 assert.match(css,/@keyframes paCakeSeparate/);
 assert.match(css,/animation-delay:calc\(var\(--slice\) \* 44ms\)/);
 assert.match(css,/\.wk-model i\.on/);
 assert.match(css,/background:linear-gradient\(#ffbbce,#ed668e\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(worked,/const model=m=>/);
 assert.doesNotMatch(css,/pointer-events:none!important/);
});

test('visual animation leaves the fraction answer/telemetry and scoring handlers unchanged',()=>{
 const cake=fs.readFileSync('kedai-kek.html','utf8');
 assert.match(cake,/PAWorked\.buildFrac|P\.buildFrac\(q\.wk/);
 assert.match(cake,/P\.run\(plan,/);
 assert.match(cake,/check\(\)/);
 assert.match(cake,/paAttempt\(false\)/);
 assert.match(cake,/paAttempt\(true\)/);
 assert.match(cake,/shadeSet\.size===q\.need\.k/);
});
