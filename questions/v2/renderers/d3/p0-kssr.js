// questions/v2/renderers/d3/p0-kssr.js
// Phase 3A-1 clean-room static renderer for Darjah 3 P0 shadow bank.
// Pure function: no DOM/Node globals.
(function(){
'use strict';
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function svg(w,h,b){return '<svg viewBox="0 0 '+w+' '+h+'" width="100%" style="max-width:'+w+'px;height:auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">'+b+'</svg>';}
var stroke='#2b2540',fill='#f4f0fa',accent='#7254a8',light='#ffffff';
function bar(v){
  var p=v.parts||[], total=p.reduce(function(a,x){return a+Math.abs(Number(x)||0);},0)||1,x=8,b='';
  for(var i=0;i<p.length;i++){var w=Math.max(28,220*Math.abs(Number(p[i])||0)/total);b+='<rect x="'+x+'" y="28" width="'+w+'" height="42" rx="5" fill="'+(p[i]<0?'#f8e9e9':fill)+'" stroke="'+stroke+'" stroke-width="2"/><text x="'+(x+w/2)+'" y="54" text-anchor="middle" font-size="12" font-family="sans-serif">'+esc((v.labels||[])[i]||String(p[i]))+'</text>';x+=w;}
  return svg(Math.max(250,x+8),92,b);
}
function grouping(v){
  var g=Math.max(1,Math.min(8,Number(v.groups)||1)),each=v.each,b='';
  for(var i=0;i<g;i++){var x=12+(i%4)*64,y=12+Math.floor(i/4)*54;b+='<rect x="'+x+'" y="'+y+'" width="52" height="40" rx="7" fill="'+fill+'" stroke="'+stroke+'" stroke-width="2"/><text x="'+(x+26)+'" y="'+(y+25)+'" text-anchor="middle" font-size="11" font-family="sans-serif">'+esc(each)+'</text>';}
  return svg(276, g>4?120:66,b);
}
function fractionArea(v){
  var d=Math.max(1,Number(v.denominator)||1),n=Math.max(0,Number(v.numerator)||0),count=Math.max(1,Math.min(4,Number(v.count)||1)),b='',W=86,H=52;
  for(var c=0;c<count;c++){var x0=8+c*(W+8);for(var i=0;i<d;i++){var w=W/d;b+='<rect x="'+(x0+i*w)+'" y="12" width="'+w+'" height="'+H+'" fill="'+(i<n?accent:light)+'" stroke="'+stroke+'" stroke-width="1.2"/>';}}
  return svg(16+count*(W+8),78,b);
}
function hundred(v){
  var shaded=Math.max(0,Math.min(100,Number(v.shaded)||0)),b='',s=11;
  for(var i=0;i<100;i++){var x=8+(i%10)*s,y=8+Math.floor(i/10)*s;b+='<rect x="'+x+'" y="'+y+'" width="'+s+'" height="'+s+'" fill="'+(i<shaded?accent:light)+'" stroke="'+stroke+'" stroke-width=".55"/>';}
  return svg(126,126,b);
}
function numberLine(v){
  var vals=(v.values||[]).map(Number),min=Math.min.apply(null,vals),max=Math.max.apply(null,vals);if(!isFinite(min)||min===max){min=0;max=1;}var b='<line x1="18" y1="45" x2="242" y2="45" stroke="'+stroke+'" stroke-width="2"/>';
  for(var i=0;i<vals.length;i++){var x=18+(vals[i]-min)/(max-min)*224;b+='<line x1="'+x+'" y1="36" x2="'+x+'" y2="54" stroke="'+accent+'" stroke-width="2"/><text x="'+x+'" y="70" text-anchor="middle" font-size="11" font-family="sans-serif">'+esc((v.marks||[])[i]||vals[i])+'</text>';}
  return svg(260,82,b);
}
function clock(v){
  var h=Number(v.hour)||0,m=Number(v.minute)||0,cx=70,cy=70,r=52,ma=(m*6-90)*Math.PI/180,ha=((h%12)*30+m*.5-90)*Math.PI/180,b='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+light+'" stroke="'+stroke+'" stroke-width="3"/>';
  for(var i=1;i<=12;i++){var a=(i*30-90)*Math.PI/180;b+='<text x="'+(cx+Math.cos(a)*42)+'" y="'+(cy+Math.sin(a)*42+4)+'" text-anchor="middle" font-size="9" font-family="sans-serif">'+i+'</text>';}
  b+='<line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+Math.cos(ha)*28)+'" y2="'+(cy+Math.sin(ha)*28)+'" stroke="'+stroke+'" stroke-width="4" stroke-linecap="round"/><line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+Math.cos(ma)*40)+'" y2="'+(cy+Math.sin(ma)*40)+'" stroke="'+accent+'" stroke-width="3" stroke-linecap="round"/>';
  return svg(140,140,b);
}
function timeline(v){
  var start=Number(v.start)||0,end=Number(v.end)||1,marks=[start].concat(v.markers||[]).concat([end]),b='<line x1="18" y1="40" x2="252" y2="40" stroke="'+stroke+'" stroke-width="3"/>';
  marks.forEach(function(q){var x=18+(Number(q)-start)/Math.max(1,end-start)*234;b+='<circle cx="'+x+'" cy="40" r="4" fill="'+accent+'"/>';});
  return svg(270,66,b);
}
function table(v){
  var hs=v.headers||[],rows=v.rows||[],html='<table class="qsv2-d3p0-table" style="border-collapse:collapse;margin:4px auto 10px;font:600 12px/1.3 sans-serif">';
  html+='<tr>'+hs.map(function(h){return'<th style="border:1px solid #888;padding:5px 8px">'+esc(h)+'</th>';}).join('')+'</tr>';
  rows.forEach(function(r){html+='<tr>'+r.map(function(x){return'<td style="border:1px solid #aaa;padding:5px 8px;text-align:center">'+esc(x)+'</td>';}).join('')+'</tr>';});return html+'</table>';
}
function unitGauge(v){
  var val=Number(v.value)||0,max=Math.max(1,Number(v.max)||val||1),pct=Math.max(0,Math.min(1,val/max)),label=esc(v.label||''),b='<rect x="18" y="28" width="220" height="28" rx="8" fill="'+light+'" stroke="'+stroke+'" stroke-width="2"/><rect x="18" y="28" width="'+(220*pct)+'" height="28" rx="8" fill="'+fill+'"/><text x="128" y="47" text-anchor="middle" font-size="12" font-family="sans-serif">'+esc(val)+' '+label+'</text>';
  return svg(256,78,b);
}
function placeValue(v){
  var text=v.value||((v.base||'')+' × '+(v.factor||'')),b='<rect x="18" y="18" width="224" height="54" rx="8" fill="'+fill+'" stroke="'+stroke+'" stroke-width="2"/><text x="130" y="50" text-anchor="middle" font-size="18" font-family="monospace">'+esc(text)+'</text>';return svg(260,90,b);
}
function classification(v){return '<div style="max-width:300px;margin:4px auto 10px;padding:8px;border:1px solid #aaa;border-radius:8px;font:600 12px/1.5 sans-serif;text-align:center">'+(v.items||[]).map(esc).join(' · ')+'</div>';}
function barChart(v){
  var vals=v.values||[],labs=v.labels||[],mx=Math.max.apply(null,vals.concat([1])),b='';
  for(var i=0;i<vals.length;i++){var h=80*vals[i]/mx,x=26+i*58;b+='<rect x="'+x+'" y="'+(102-h)+'" width="34" height="'+h+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="2"/><text x="'+(x+17)+'" y="118" text-anchor="middle" font-size="11" font-family="sans-serif">'+esc(labs[i])+'</text>';}
  return svg(220,130,b);
}
function pictograph(v){
  var labs=v.labels||[],vals=v.values||[],html='<div style="display:grid;grid-template-columns:auto 1fr;gap:4px 8px;max-width:280px;margin:4px auto 10px;font:600 12px sans-serif">';
  for(var i=0;i<labs.length;i++){html+='<span>'+esc(labs[i])+'</span><span>'+new Array((Number(vals[i])||0)+1).join('● ')+'</span>';}return html+'</div>';
}
function pie(v){
  var vals=v.values||[],labs=v.labels||[],sum=vals.reduce(function(a,b){return a+Number(b||0);},0)||1,ang=-Math.PI/2,b='',cx=70,cy=70,r=52;
  for(var i=0;i<vals.length;i++){var next=ang+2*Math.PI*Number(vals[i]||0)/sum,x1=cx+r*Math.cos(ang),y1=cy+r*Math.sin(ang),x2=cx+r*Math.cos(next),y2=cy+r*Math.sin(next),large=(next-ang)>Math.PI?1:0;b+='<path d="M '+cx+' '+cy+' L '+x1+' '+y1+' A '+r+' '+r+' 0 '+large+' 1 '+x2+' '+y2+' Z" fill="'+(i%2?fill:light)+'" stroke="'+stroke+'" stroke-width="1.5"/>';var mid=(ang+next)/2;b+='<text x="'+(cx+Math.cos(mid)*33)+'" y="'+(cy+Math.sin(mid)*33+4)+'" text-anchor="middle" font-size="10" font-family="sans-serif">'+esc(labs[i])+'</text>';ang=next;}
  return svg(140,140,b);
}
function renderOne(v){
  if(!v)return '';
  if(v.kind==='bar_model')return bar(v);
  if(v.kind==='grouping')return grouping(v);
  if(v.kind==='fraction_area')return fractionArea(v);
  if(v.kind==='hundred_grid')return hundred(v);
  if(v.kind==='number_line')return numberLine(v);
  if(v.kind==='clock')return clock(v);
  if(v.kind==='timeline')return timeline(v);
  if(v.kind==='table')return table(v);
  if(v.kind==='classification')return classification(v);
  if(v.kind==='pie_chart')return pie(v);
  if(v.kind==='bar_chart')return barChart(v);
  if(v.kind==='pictograph')return pictograph(v);
  if(v.kind==='multi_chart')return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'+renderOne(v.pictograph)+renderOne(v.bar)+'</div>';
  if(v.kind==='place_value_shift'||v.kind==='place_value_decimal'||v.kind==='place_value_decimal_pair')return placeValue(v);
  if(v.kind==='ruler'||v.kind==='scale'||v.kind==='container'||v.kind==='time_units')return unitGauge(v);
  return '<div class="qsv2-d3p0-visual" data-kind="'+esc(v.kind)+'"></div>';
}
registerRenderer('d3p0',function(question){return renderOne(question&&question.visual);});
})();