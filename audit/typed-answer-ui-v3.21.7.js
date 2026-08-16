const fs=require('fs'),assert=require('assert');
const js=fs.readFileSync('js/typed-answer-ui-v3.21.7.js','utf8');
const css=fs.readFileSync('css/typed-answer-ui-v3.21.7.css','utf8');
const pwa=fs.readFileSync('js/pwa.js','utf8'),sw=fs.readFileSync('sw.js','utf8');

assert(/Jawapan kamu/.test(js),'student label missing');
assert(!/BOSS PROOF/.test(js),'BOSS PROOF leaked into new presentation layer');
assert(!/Tiada pilihan jawapan/.test(js),'old helper copy leaked into new presentation layer');
assert(/querySelector\('\.paTypedNote'\)\?\.remove/.test(js),'old helper note removal missing');
assert(/input\.placeholder='Jawapan'/.test(js),'compact placeholder missing');
assert(/MutationObserver/.test(js),'typed render observer missing');
assert(/paTypedKeyboardOpen/.test(js)&&/visualViewport/.test(js),'keyboard-aware compact state missing');
assert(/grid-template-columns:minmax\(0,1fr\) 108px/.test(css),'balanced input/button row missing');
assert(/font-size:27px/.test(css),'large numeric input missing');
assert(/animation:none!important/.test(css),'empty-input nudge removal missing');
assert(/TYPED_UI_VERSION='3\.21\.7'/.test(pwa),'loader typed UI version missing');
assert(/FINISHER_HOTSPOT_VERSION='3\.21\.6'/.test(pwa),'finisher baseline not preserved');
assert(/typed-answer-ui-v3\.21\.7/.test(sw),'SW typed UI assets missing');

console.log('PASS v3.21.7: clean pupil-facing typed answer UI, no BOSS PROOF/helper copy, keyboard-aware compact layout');
