// questions/v2/renderers/d3/full-kssr.js
// Phase 3A-1 FULL visual renderer for D3 T1/T4/T8.
// Pure static renderer; no DOM/Node globals.
(function(){
'use strict';
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function box(content){return '<div class="qsv2-d3full" style="max-width:300px;margin:4px auto 10px;font-family:system-ui,sans-serif">'+content+'</div>';}
function pv(v){
 var h=['Ribu','Ratus','Puluh','Sa'],d=v.digits||[];
 return box('<table style="width:100%;border-collapse:collapse;text-align:center"><tr>'+h.map(function(x){return '<th style="border:1px solid currentColor;padding:4px;font-size:12px">'+x+'</th>';}).join('')+'</tr><tr>'+d.map(function(x){return '<td style="border:1px solid currentColor;padding:8px;font-weight:800">'+esc(x)+'</td>';}).join('')+'</tr></table>');
}
function compare(v){return box('<div style="display:flex;gap:10px;justify-content:center">'+(v.numbers||[]).map(function(n){return '<span style="border:1px solid currentColor;border-radius:8px;padding:8px 12px;font-weight:800">'+esc(n)+'</span>';}).join('')+'</div>');}
function groups(v){
 var body='<div style="font-size:12px;margin-bottom:6px">1 kumpulan rujukan ≈ <b>'+esc(v.reference)+'</b> objek</div><div style="display:flex;gap:6px;flex-wrap:wrap">';
 for(var i=0;i<Number(v.groups||0);i++)body+='<span style="display:inline-grid;grid-template-columns:repeat(5,5px);gap:2px;border:1px solid currentColor;border-radius:6px;padding:5px">'+Array(10).fill('<i style="width:5px;height:5px;border-radius:50%;background:currentColor;display:block"></i>').join('')+'</span>';
 return box(body+'</div>');
}
function numberLine(v){
 var min=Number(v.min),max=Number(v.max),value=Number(v.value),span=max-min||1,x=20+(value-min)/span*240;
 return box('<svg viewBox="0 0 280 70" width="280" height="70" role="img" aria-hidden="true"><line x1="20" y1="32" x2="260" y2="32" stroke="currentColor" stroke-width="2"/><line x1="20" y1="25" x2="20" y2="39" stroke="currentColor"/><line x1="260" y1="25" x2="260" y2="39" stroke="currentColor"/><circle cx="'+x.toFixed(1)+'" cy="32" r="5" fill="currentColor"/><text x="20" y="57" text-anchor="middle" font-size="11" fill="currentColor">'+esc(min)+'</text><text x="260" y="57" text-anchor="middle" font-size="11" fill="currentColor">'+esc(max)+'</text><text x="'+x.toFixed(1)+'" y="18" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor">'+esc(value)+'</text></svg>');
}
function seq(v){
 var a=v.sequence||[],html='<div style="display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap">';
 for(var i=0;i<a.length;i++)html+='<span style="min-width:42px;text-align:center;border:1px solid currentColor;border-radius:7px;padding:6px;font-weight:800">'+(a[i]==null?'?':esc(a[i]))+'</span>';
 return box(html+'</div>');
}
function moneyItems(v){
 var a=v.amounts||[],html='<div style="display:flex;gap:7px;justify-content:center;flex-wrap:wrap">';
 for(var i=0;i<a.length;i++)html+='<span style="border:1px solid currentColor;border-radius:8px;padding:7px 9px;font-weight:800">'+esc(a[i])+'</span>';
 html+='</div>';
 if(v.quantity)html+='<div style="text-align:center;font-size:12px;margin-top:5px">Bilangan barang: <b>'+esc(v.quantity)+'</b></div>';
 if(v.payment)html+='<div style="text-align:center;font-size:12px;margin-top:5px">Bayaran: <b>'+esc(v.payment)+'</b></div>';
 return box(html);
}
function budget(v){
 var html='<div style="border:1px solid currentColor;border-radius:8px;padding:8px"><div>Wang mula: <b>'+esc(v.start)+'</b></div>';
 (v.changes||[]).forEach(function(c){html+='<div style="margin-top:4px">'+esc(c.label)+': <b>'+esc(c.amount)+'</b></div>';});
 return box(html+'</div>');
}
function receipts(v){return box('<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div style="border:1px solid currentColor;border-radius:8px;padding:7px"><b>Resit A</b><br>'+ (v.a||[]).map(esc).join('<br>')+'</div><div style="border:1px solid currentColor;border-radius:8px;padding:7px"><b>Resit B</b><br>'+ (v.b||[]).map(esc).join('<br>')+'</div></div>');}
function share(v){return box('<div style="text-align:center;border:1px solid currentColor;border-radius:8px;padding:8px"><b>'+esc(v.total)+'</b><div style="margin-top:6px">dibahagi kepada '+esc(v.groups)+' kumpulan sama rata</div></div>');}
function currency(v){return box('<div style="border:1px solid currentColor;border-radius:10px;padding:10px;text-align:center"><div style="font-weight:900">'+esc(v.country)+'</div><div>'+esc(v.currency)+'</div><div style="font-size:12px;opacity:.8">'+esc(v.code)+'</div></div>');}
function nw(v){return box('<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px">'+(v.items||[]).map(function(x){return '<div style="border:1px solid currentColor;border-radius:8px;padding:7px;text-align:center">'+esc(x)+'</div>';}).join('')+'</div>');}
function grid(v){
 var objs=v.objects||[],hi=v.highlight||[],W=300,H=285,left=42,top=18,cell=45,body='';
 body+='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-hidden="true">';
 for(var i=0;i<=5;i++){var xx=left+i*cell,yy=top+i*cell;body+='<line x1="'+xx+'" y1="'+top+'" x2="'+xx+'" y2="'+(top+5*cell)+'" stroke="currentColor" stroke-opacity=".35"/>';body+='<line x1="'+left+'" y1="'+yy+'" x2="'+(left+5*cell)+'" y2="'+yy+'" stroke="currentColor" stroke-opacity=".35"/>';}
 for(var x=1;x<=5;x++)body+='<text x="'+(left+(x-.5)*cell)+'" y="'+(top+5*cell+18)+'" text-anchor="middle" font-size="11" fill="currentColor">'+x+'</text>';
 for(var y=1;y<=5;y++)body+='<text x="'+(left-12)+'" y="'+(top+(5-y+.5)*cell+4)+'" text-anchor="middle" font-size="11" fill="currentColor">'+y+'</text>';
 body+='<text x="'+(left+2.5*cell)+'" y="'+(H-8)+'" text-anchor="middle" font-size="11" fill="currentColor">Mengufuk</text>';
 body+='<text x="10" y="'+(top+2.5*cell)+'" transform="rotate(-90 10 '+(top+2.5*cell)+')" text-anchor="middle" font-size="11" fill="currentColor">Mencancang</text>';
 objs.forEach(function(o){
   var cx=left+(Number(o.x)-.5)*cell,cy=top+(5-Number(o.y)+.5)*cell,hot=hi.indexOf(o.name)!==-1;
   body+='<circle cx="'+cx+'" cy="'+cy+'" r="'+(hot?16:14)+'" fill="none" stroke="currentColor" stroke-width="'+(hot?3:1.5)+'"/>';
   body+='<text x="'+cx+'" y="'+(cy+3)+'" text-anchor="middle" font-size="8.5" font-weight="700" fill="currentColor">'+esc(o.name)+'</text>';
 });
 return box(body+'</svg>');
}
registerRenderer('d3full',function(question){
 var v=question&&question.visual;if(!v)return '';
 if(v.kind==='place_value_table')return pv(v);
 if(v.kind==='compare_numbers')return compare(v);
 if(v.kind==='estimate_groups')return groups(v);
 if(v.kind==='number_line')return numberLine(v);
 if(v.kind==='number_sequence')return seq(v);
 if(v.kind==='money_items')return moneyItems(v);
 if(v.kind==='money_budget')return budget(v);
 if(v.kind==='money_receipts')return receipts(v);
 if(v.kind==='money_share')return share(v);
 if(v.kind==='currency_card')return currency(v);
 if(v.kind==='needs_wants')return nw(v);
 if(v.kind==='coordinate_grid')return grid(v);
 throw new Error('d3full renderer: unknown visual kind "'+v.kind+'"');
});
})();