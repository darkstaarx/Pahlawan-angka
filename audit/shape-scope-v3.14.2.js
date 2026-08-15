const fs=require('fs'),assert=require('assert');
const content=fs.readFileSync('questions/kssr-content-v3.11.js','utf8');
const helpers=fs.readFileSync('questions/helpers.js','utf8');
const year1=content.match(/if\(id==='D1\.SHAPE'\)([\s\S]*?)if\(id==='D1\.DATA'/)?.[1]||'';
const year2=content.match(/function year2Shape\(id\)([\s\S]*?)function year2Chapter3Task/)?.[1]||'';
const legacy=helpers.match(/function shape2DQ\(shift\)([^\n]*)/)?.[1]||'';
for(const [name,source] of [['Tahun 1',year1],['Tahun 2',year2],['helper 2D',legacy]]){
 assert(source,`${name}: generator bentuk tidak ditemui`);
 assert(!/segi lima|segi enam|enam muka|permukaan melengkung/i.test(source),`${name}: kandungan bentuk di luar skop atau istilah 3D ditemui`);
}
for(const shape of ['segi tiga','segi empat sama','segi empat tepat','bulatan'])assert(year2.includes(shape),`Tahun 2: bentuk asas ${shape} tiada`);
assert(year2.includes('4 sisi sama panjang')&&year2.includes('2 sisi panjang, 2 sisi pendek'),'Tahun 2: segi empat sama dan tepat mesti dibezakan dengan ciri panjang sisi');
console.log('PASS shape scope: D1/D2 use scoped 2D shapes with unambiguous properties');
