// Year 2 estimation: tray-based dots stay countable, without exact totals or
// a literal answer in the diagram.
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const src=fs.readFileSync('questions/helpers.js','utf8'),start=src.indexOf('function dotsEstimateVisual(count){'),end=src.indexOf('function decimalTenthsVisual',start);
assert(start>=0&&end>start,'estimate helper exists');
const scope={};vm.runInNewContext(src.slice(start,end)+';globalThis.renderEstimate=dotsEstimateVisual;',scope);
for(let count=22;count<=58;count++){
 const html=scope.renderEstimate(count);
 assert.equal((html.match(/<circle /g)||[]).length,count,'correct dot count at '+count);
 assert.equal((html.match(/<rect /g)||[]).length,Math.ceil(count/10),'visible ten-dot trays at '+count);
 assert(!html.includes('>' + String(Math.round(count/10)*10) + '</text>'),'no answer is displayed');
}
const bank=fs.readFileSync('questions/d2/topic-1.js','utf8');
assert(bank.includes('R(22,58)'),'Year 2 estimate range is manageable');
assert(bank.includes('real%10===5'),'avoid rounding midpoint ambiguity');
console.log('Year 2 estimation tray QA: 37 sizes passed');
