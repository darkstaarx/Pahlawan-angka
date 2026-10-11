// Run with: node audit/worksheet-graphics-v1.js
// A small DOM fixture and recording canvas keep this audit dependency-free.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..'),draws=[];
class Node{
 constructor(tag='',attrs={},text=''){this.tagName=tag.toUpperCase();this.attrs={...attrs};this.nodes=[];this.parent=null;this.value=text;this.classList={contains:c=>(this.attrs.class||'').split(' ').includes(c)}}
 get children(){return this.nodes.filter(n=>n.tagName)}get firstChild(){return this.nodes[0]}
 get textContent(){return this.value+this.nodes.map(n=>n.textContent).join('')}set textContent(v){this.value=String(v);this.nodes=[]}
 appendChild(n){n.parent=this;this.nodes.push(n);return n}insertBefore(n,b){n.parent=this;const i=this.nodes.indexOf(b);this.nodes.splice(i<0?this.nodes.length:i,0,n)}
 getAttribute(k){return this.attrs[k]??null}setAttribute(k,v){this.attrs[k]=String(v)}removeAttribute(k){delete this.attrs[k]}
 contains(n){return this.nodes.some(x=>x===n||x.contains(n))}
 remove(){if(this.parent)this.parent.nodes=this.parent.nodes.filter(n=>n!==this)}replaceWith(n){const p=this.parent,i=p.nodes.indexOf(this);p.nodes[i]=n;n.parent=p}
 cloneNode(){const n=new Node(this.tagName,this.attrs,this.value);this.nodes.forEach(c=>n.appendChild(c.cloneNode()));return n}
 matches(selector){if(selector.startsWith('.'))return this.classList.contains(selector.slice(1));if(selector.startsWith('[')){const m=selector.match(/^\[([^=]+)="([^"]+)"\]$/);return m&&this.attrs[m[1]]===m[2]}return this.tagName.toLowerCase()===selector}
 querySelectorAll(selectors){const names=selectors.split(','),found=[];const visit=n=>{for(const c of n.nodes){if(names.some(s=>c.matches(s.trim())))found.push(c);visit(c)}};visit(this);return found}querySelector(s){return this.querySelectorAll(s)[0]||null}
 set innerHTML(html){this.nodes=[];const stack=[this],tokens=String(html).match(/<[^>]+>|[^<]+/g)||[];for(const token of tokens){if(token.startsWith('</')){stack.pop();continue}if(token.startsWith('<')){const tag=(token.match(/^<([\w:-]+)/)||[])[1];if(!tag)continue;const attrs={};for(const m of token.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g))attrs[m[1]]=m[2];const n=new Node(tag,attrs);stack.at(-1).appendChild(n);if(!/\/>$/.test(token)&&!['img','br','input','hr'].includes(tag))stack.push(n)}else stack.at(-1).appendChild(new Node('',{},token.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')))}}
}
function serialize(n){if(!n.tagName)return n.textContent;const tag=n.tagName.toLowerCase();return '<'+tag+Object.entries(n.attrs).map(([k,v])=>' '+k+'="'+v+'"').join('')+'>'+n.value+n.nodes.map(serialize).join('')+'</'+tag+'>'}
const context={font:'23px Arial',textAlign:'left',measureText(t){return{width:String(t).length*(parseInt(this.font.match(/\d+/)?.[0])||23)*.55}},drawImage(image,...args){draws.push({src:image._src||'canvas',args})},fillText(text,...args){draws.push({text,args})}};
for(const name of ['fillRect','beginPath','roundRect','fill','stroke','save','restore','translate','scale','moveTo','lineTo','bezierCurveTo','closePath','ellipse','arc'])context[name]=()=>{};
const body={appendChild(){}};
const document={body,readyState:'loading',addEventListener(){},createElement(tag){if(tag==='canvas')return{width:0,height:0,getContext:()=>context};return new Node(tag)},createElementNS(ns,tag){return new Node(tag)},createTextNode:t=>new Node('',{},t),getElementById:()=>null};
class Image{set src(v){this._src=v;this.width=this.naturalWidth=96;this.height=this.naturalHeight=96;queueMicrotask(()=>v.includes('missing')?this.onerror():this.onload())}}
const sandbox={window:{},document,Image,XMLSerializer:class{serializeToString(n){return serialize(n)}},console,Math,TextEncoder,Blob,setTimeout(){}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(root,'js/worksheet-graphics-v1.js'),'utf8'),sandbox);
const graphics=sandbox.window.PAWorksheetGraphics;
let checks=0;const check=(ok,message)=>{assert(ok,message);checks++};
(async()=>{
 const clock='<svg viewBox="0 0 100 100"><text x="5" y="8">12</text><line x1="50" y1="50" x2="20" y2="30"/></svg>';
 const model=graphics.fromQuestion({prompt:clock+'Apakah waktu yang ditunjukkan?',answer:'10:00'});
 check(model.prompt==='Apakah waktu yang ditunjukkan?','SVG labels must not enter the prompt');check(model.graphics.length===1,'clock lost');check(decodeURIComponent(model.graphics[0].src).includes('x2="20"'),'clock hand changed');check(!model.graphics[0].src.includes('10%3A00'),'answer leaked into clock');
 const coins='<div class="moneyVisual"><img src="assets/questions/money/money_20sen.png" width="58" height="58" alt="20 sen"><img src="assets/questions/money/money_50sen.png" width="58" height="58" alt="50 sen"></div>';
 const money=graphics.fromQuestion({prompt:coins+coins+'Berapakah jumlah wang ini?'});check(money.graphics.length===2,'money groups collapsed');check(money.graphics[0].pieces.length===2,'coin count changed');
 const picto='<div class="kssrDiagram kd-pictograph"><div class="kd-picto-row"><b>Rambutan</b><span>●●●●</span></div><div class="kd-picto-row"><b>Pisang</b><span>●●</span></div><div class="kd-picto-row"><b>Jambu</b><span>●●●</span></div><small>● = 2</small></div>';
 const fruits=graphics.fromQuestion({prompt:picto+'Buah manakah paling banyak?'});check(fruits.prompt==='Buah manakah paling banyak?','dot text leaked into stem');check(fruits.graphics[0].key===2,'pictograph key changed');check(fruits.graphics[0].rows.map(r=>r.count).join(',')==='4,2,3','pictograph counts changed');
 const image=await graphics.render(fruits);check(image.height===294,'pictograph row/legend layout changed');check(draws.filter(d=>d.src==='assets/questions/counting/rambutan.png').length===4,'fruit icons do not match original count');
 const table=graphics.fromQuestion({prompt:'<table><tr><th>Item</th><th>Gundalan</th></tr><tr><td>Pensel</td><td>|||| ||</td></tr></table>Berapakah bilangan pensel?'});check(table.graphics[0].rows[1][1]==='|||| ||','tally evidence lost');check((await graphics.render(table)).height===120,'table height incorrect');
 check(graphics.fromQuestion({prompt:'<canvas></canvas>Berapakah nilainya?'})===null,'interactive canvas must not silently print blank');
 const choices=graphics.fromQuestion({prompt:'Rajah manakah menunjukkan 1/2?',visualChoiceSpec:{kind:'fraction',choices:[{letter:'A',numerator:1,denominator:2},{letter:'B',numerator:1,denominator:4}]}});check(choices.graphics[0].choices[1].denominator===4,'fraction visual choice lost');
 await assert.rejects(graphics.loadImage('missing.png'),/Grafik soalan gagal dimuat/);checks++;
 const source=fs.readFileSync(path.join(root,'js/parent-learning-tools-v3.26.0.js'),'utf8');
 check(source.includes('assets/branding/pahlawan-angka-full-logo-v1.png'),'old logo still used');check(!source.includes('pahlawan-angka-crest-192.png'),'legacy crest remains');
 vm.runInContext(source.replace('const originalRender=','window.__print={studentPages,answerPages,studentLayout,printableQuestion};const originalRender='),sandbox);
 const print=sandbox.window.__print;const item=print.printableQuestion({prompt:coins+'Berapakah jumlah wang ini?',answer:'70 sen',hint:'Tambah nilai syiling.'});check(item.graphic.graphics.length===1,'question filter dropped real money');
 check(print.printableQuestion({prompt:'<div aria-label="bahagian tidak sama besar" style="display:grid"><i></i><i></i></div>Rajah manakah yang betul?',answer:'A'})===null,'unsupported CSS evidence must not print without a diagram');
 const first=print.printableQuestion({prompt:clock+'Apakah waktu yang ditunjukkan?',answer:'10:00'}),second=print.printableQuestion({prompt:clock.replace('x2="20"','x2="30"')+'Apakah waktu yang ditunjukkan?',answer:'11:00'});check(first.printKey!==second.printKey,'same stem with different diagram must remain distinct');
 const pages=await print.studentPages(Array.from({length:10},()=>({...item})),'Ujian','Darjah 1');check(pages.length>=2,'dynamic pagination did not create additional pages');
 const cardCalls=draws.filter(d=>d.text&&d.text==='Jawapan / ruang kerja');check(cardCalls.every(d=>d.args[1]<1610),'answer space crosses page footer');
 const long={prompt:'Soalan ukuran panjang.',answer:'enam ratus lapan puluh empat',hint:'Gunakan nilai tempat.',choices:[{value:'Pilihan yang memerlukan dua baris perkataan panjang supaya tidak bertindih dengan pilihan jawapan bersebelahan.'},{value:'Pilihan lain'}]};
 check(print.studentLayout(context,long).height>=190,'long choices are not measured');
 console.log(JSON.stringify({status:'pass',checks,studentPages:pages.length,coverage:['logo','clock','coins','pictograph','tallies','fraction choices','asset failure','graphic deduplication','A4 pagination']},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
