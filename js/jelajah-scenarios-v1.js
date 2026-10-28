/* Six reproducible demonstration contexts. All questions come from the live bank.
 * Only illustrative answer intentions are preset; routing/validation/reporting
 * use the production engine. Nothing here is a diagnostic or a question bank. */
((root)=>{'use strict';
 const rows=[
  ['D1.PV100','Nilai tempat puluh dan sa','Gudang Harta Wira','gudang-harta'],
  ['D2.2.1','Tambah dengan kumpul semula','Gudang Harta Wira','gudang-harta'],
  ['D3.FRAC','Pecahan','Kedai Kek','kedai-kek'],
  ['D4.MEASURE','Penukaran unit panjang','Bengkel Ajaib','bengkel-ajaib'],
  ['D5.DEC','Perpuluhan','Lombong Permata','lombong-permata'],
  ['D6.RATIO','Nisbah','Dapur Ramuan','dapur-ramuan']
 ];
 const scenarios=Object.fromEntries(rows.map(([skill,topic,title,page],i)=>[i+1,{
  grade:i+1,skill,topic,seed:(i+1)*2026,
  miniGame:{title,page:'preview/jelajah-game-'+page+'.html'},
  misconception:'Contoh kesilapan simulasi; pengesahan dibuat oleh mekanik asal.',
  script:[false,false,false,true,false,true],
  scriptSteps:Array.from({length:6},()=>({duration:3200}))
 }]));
 const api={scenarios,get:grade=>scenarios[Number(grade)]||scenarios[1]};root.PAJelajahScenarios=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
