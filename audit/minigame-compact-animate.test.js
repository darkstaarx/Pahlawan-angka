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
  const compact='css/minigame-compact-play-v1.css?v=1.0.1';
  assert.equal(src.split(compact).length-1,1,path);
  assert.ok(src.indexOf(compact)>src.indexOf('css/minigame-question-focus-v1.css'),path);
  assert.match(src,path==='kedai-kek.html'?/js\/minigame-worked-v1.js\?v=1.17.4/:/js\/minigame-worked-v1.js\?v=1.17.2/,path);
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

test('counted cake lifts exactly one relevant slice at a time, with a count badge',()=>{
 const W=require('../js/minigame-worked-v1.js');
 const tenth=W.buildFrac({t:'tenth',n:7,from:'model',out:'dec'});
 assert.ok(tenth);assert.equal(tenth.steps[0].pre.glow,'sh');
 const html=W.boardHTML(tenth);
 assert.equal((html.match(/data-k="sh"/g)||[]).length,7);
 assert.equal((html.match(/data-k="un"/g)||[]).length,3);
 assert.match(html,/role="img"/);
 assert.deepEqual(W.fractionCountTargets(['sh','sh','sh','sh','sh','sh','sh','un','un','un'],'sh'),[0,1,2,3,4,5,6]);
 assert.deepEqual(W.fractionCountTargets(['eat','eat','eat','un','un','un','un','un','un','un'],'left'),[3,4,5,6,7,8,9]);
 assert.deepEqual(W.fractionCountTargets(['eat','eat','eat','un','un'],'eat'),[0,1,2]);
 assert.deepEqual(W.fractionCountTargets(['sh','un','eat'],'all'),[0,1,2]);
 assert.deepEqual(W.fractionCountTargets(['sh','un','eat'],undefined),[]);
 assert.match(worked,/const targets=fractionCountTargets\(pieces\.map\(piece=>piece\.dataset\.k\),s\.pre\?\.glow\)/);
 assert.match(worked,/pieces\.forEach\(piece=>\{\s*piece\.classList\.remove\('wk-lifted','wk-glow'\)/);
 assert.match(worked,/const piece=pieces\[targets\[current\]\]/);
 assert.match(worked,/piece\.dataset\.count=String\(current\+1\)/);
 assert.match(worked,/piece\.classList\.add\('wk-lifted','wk-glow'\)/);
 assert.match(worked,/activate\(\); \/\/ first visible action = exactly ONE raised slice/);
 assert.match(worked,/model\.onclick=next/);
 assert.match(css,/\.wk-model i\.wk-lifted\{/);
 assert.match(css,/\.wk-model i\.wk-lifted::after/);
 assert.match(css,/content:attr\(data-count\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.doesNotMatch(css,/\.wk-model\.wk-exploded i\{/);
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

test('active fraction question-mark target is white, thick red, visibly pulsing',()=>{
 const cake=fs.readFileSync('kedai-kek.html','utf8');
 assert.match(css,/\.wk-card \.wk-frac \.wk-c\.wk-next/);
 assert.match(css,/background:#fffdf8!important/);
 assert.match(css,/border:4px solid #dd3159!important/);
 assert.match(css,/min-width:clamp\(53px,14vw,70px\)/);
 assert.match(css,/content:'\?'!important/);
 assert.match(css,/@keyframes paWkAnswerRing/);
 assert.match(css,/inset:-10px/);
 assert.match(css,/animation:paWkAnswerRing 1\.45s ease-in-out infinite/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(cake,/class="compare-legend"/);
});
