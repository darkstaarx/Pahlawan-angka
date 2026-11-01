const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const games=[
 'kedai-kek.html','lombong-permata.html','gudang-harta.html',
 'bengkel-ajaib.html','dapur-ramuan.html','menara-jam.html',
 'pos-peninjau.html','tapak-bina.html','gerai-wirayung.html'
];
const css=fs.readFileSync('css/minigame-question-focus-v1.css','utf8');

test('all nine real Focus mini-games load one shared question-focus stylesheet',()=>{
 for(const game of games){
  const html=fs.readFileSync(game,'utf8');
  const cssTag='<link rel="stylesheet" href="css/minigame-question-focus-v1.css?v=1.0.0">';
  assert.equal(html.split(cssTag).length-1,1,game);
  assert.ok(html.indexOf(cssTag)>html.indexOf('minigame-question-first-v1.css'),game);
  assert.match(html,/<(?:main)[^>]*class="(?:pa-game|game)"/,game);
  assert.match(html,/<div class="banner"[^>]*>/,game);
  assert.match(html,/<(?:b)[^>]*id="(?:question|bTitle)"/,game);
  assert.match(html,/<(?:span)[^>]*id="(?:subtitle|bText)"/,game);
 }
});

test('full-width parchment question stays separated from the progress and tier badge',()=>{
 assert.match(css,/grid-template-columns:minmax\(0,1fr\) auto!important/);
 assert.match(css,/>\.banner>\.tag\{/);
 assert.match(css,/position:static!important/);
 assert.match(css,/grid-column:2/);
 assert.match(css,/>\.banner>\.disc\{/);
 assert.match(css,/grid-column:1\/-1/);
 assert.match(css,/grid-row:2/);
 assert.match(css,/background:linear-gradient\(170deg,#fffdf4/);
 assert.match(css,/color:var\(--pa-q-ink\)/);
 assert.match(css,/font-size:clamp\(19px,5\.4vw,25px\)!important/);
});

test('instructions and fractions remain readable on short or narrow displays',()=>{
 assert.match(css,/#subtitle,#bText,\.sub/);
 assert.match(css,/display:block!important/);
 assert.match(css,/line-height:1\.37!important/);
 assert.match(css,/#question \.fr/);
 assert.match(css,/@media\(max-height:700px\)/);
 assert.match(css,/@media\(max-width:350px\)/);
 assert.doesNotMatch(css,/line-clamp|text-overflow:ellipsis|max-height:.*px;.*overflow:hidden/);
});

test('Gerai Wirayung preserves the task as the main message and Tapak Bina keeps navy branding',()=>{
 const gerai=fs.readFileSync('gerai-wirayung.html','utf8');
 const tapak=fs.readFileSync('tapak-bina.html','utf8');
 assert.match(gerai,/id="bTitle"/);assert.match(gerai,/id="bText"/);
 assert.match(css,/\.pa-game>\.banner #bText\{/);
 assert.match(css,/\.pa-game>\.banner #bTitle\{/);
 assert.match(tapak,/--navy2:#14335c/);
 assert.match(css,/--pa-q-ink:var\(--ink/);
 assert.doesNotMatch(css,/\.scene\s*\{|\.actions\s*\{|\.tiles\s*\{|\.panel\s*\{/);
});

test('question changes are visual-only; the original response handler remains in each game',()=>{
 for(const game of games){
  const html=fs.readFileSync(game,'utf8');
  assert.match(html,/id="question"|id="bTitle"/,game);
  assert.match(html,/id="check"|id="go"/,game);
  assert.ok(html.includes('minigame-panel-fit-v1.js'),game);
 }
});

test('all nine standalone mini-games use mobile-width standards mode',()=>{
 for(const game of games){
  const html=fs.readFileSync(game,'utf8');
  assert.match(html,/^<!doctype html>/i,game);
  assert.match(html,/<html lang="ms">/,game);
  assert.match(html,/<meta name="viewport" content="width=device-width,\s*initial-scale=1,\s*viewport-fit=cover">/,game);
  assert.ok(html.indexOf('<head>')>=0,game);
  assert.ok(html.indexOf('</head>')<html.indexOf('<main'),game);
  assert.ok(html.indexOf('<body>')<html.indexOf('<main'),game);
  assert.match(html,/<\/body>\s*<\/html>\s*$/,game);
 }
});
