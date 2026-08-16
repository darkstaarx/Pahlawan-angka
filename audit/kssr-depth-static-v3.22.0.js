const fs=require('fs'),assert=require('assert');
const js=fs.readFileSync('questions/kssr-assessment-depth-v3.22.0.js','utf8');
const pwa=fs.readFileSync('js/pwa.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');

assert(/const VERSION='3\.22\.0'/.test(js));
assert(/const previous=\{\}/.test(js),'previous repaired banks not captured');
assert(/wrapBank\('d1',d1,'D1\.'\)/.test(js));
assert(/wrapBank\('d6',d6,'D6\.'\)/.test(js));
assert(/preserve-integrity-v3\.18\.1/.test(js),'D2 preserve contract missing');

const d1pv=js.slice(js.indexOf("if(id==='D1.PV100')"),js.indexOf("if(id==='D1.CMP100')"));
assert(!/round|bundar/i.test(d1pv),'D1.PV100 must not include rounding');

const d5frac=js.slice(js.indexOf("if(id==='D5.FRAC')"),js.indexOf("if(id==='D5.DEC')"));
assert(/proper_x_whole|proper_x_proper|mixed_x_whole|mixed_x_proper/.test(d5frac));
assert(/×/.test(d5frac),'D5.FRAC multiplication missing');

const d6frac=js.slice(js.indexOf("if(id==='D6.FRAC')"),js.indexOf("if(id==='D6.DEC')"));
assert(/proper_div_whole|whole_div_proper|proper_div_proper|mixed_div_whole|mixed_div_proper/.test(d6frac));
assert(/÷/.test(d6frac),'D6.FRAC division missing');

const d6dec=js.slice(js.indexOf("if(id==='D6.DEC')"),js.indexOf("if(id==='D6.PERCENT')"));
assert(/decimal_x_decimal/.test(d6dec)&&/decimal_div_decimal/.test(d6dec));

const d6pct=js.slice(js.indexOf("if(id==='D6.PERCENT')"),js.indexOf("if(id==='D6.RATIO')"));
assert(/over100_quantity/.test(d6pct)&&/inverse/.test(d6pct));

const d6ratio=js.slice(js.indexOf("if(id==='D6.RATIO')"),js.indexOf("if(id==='D6.MONEY')"));
assert(/simplify/.test(d6ratio)&&/proportion/.test(d6ratio)&&/ratio_table/.test(d6ratio));

const d6time=js.slice(js.indexOf("if(id==='D6.TIME')"),js.indexOf("if(id==='D6.MEASURE')"));
assert(/UTC/.test(d6time)&&/zone_duration/.test(d6time));
assert(!/km\/j|jarak ÷ laju|speed/i.test(d6time),'old speed-distance-time leaked into D6.TIME');

for(const name of ['fractionStrip','hundredGrid','pictograph','miniTable','coordinateMap','spinner','timeBar'])assert(new RegExp(`const ${name}`).test(js),`${name} visual missing`);

assert(/DEPTH_VERSION='3\.22\.0'/.test(pwa));
assert(/questions\/kssr-assessment-depth-v\$\{DEPTH_VERSION\}/.test(pwa));
assert(/loadDepth/.test(pwa),'dynamic depth load missing');
assert(/kssr-assessment-depth-v3\.22\.0/.test(sw),'SW depth assets missing');
assert(!/world-response-v3\.21\.0/.test(pwa+sw),'World Response returned');

console.log('PASS v3.22.0 static: grade-specific KSSR contracts, upper-grade operation shifts, diagrams and load order');
