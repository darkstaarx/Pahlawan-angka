/* D4 measurement operations, KSSR Semakan 2017 SP5.2.1–5.3.2. */
(function(root){
 'use strict';
 const configs=[{domain:'mass',major:'kg',minor:'g',name:'jisim',material:'beras',container:'beg',add:'ditambah',take:'digunakan'},
  {domain:'liquid',major:'L',minor:'mL',name:'isi padu',material:'air',container:'botol',add:'dituang masuk',take:'digunakan'}];
 function mixed(n,c){const major=Math.floor(n/1000),minor=n%1000;return major?(major+' '+c.major+(minor?' '+minor+' '+c.minor:'')):minor+' '+c.minor;}
 function question(){
  const c=pick(configs),mode=pick(['add_sub','subtract_two','multiply','divide','multiply_divide','missing']),style=pick(['minor','mixed']);
  const fmt=n=>style==='minor'?n+' '+c.minor:mixed(n,c);
  let a,b,d,factor,divisor,answer,prompt,standard,operands;
  if(mode==='add_sub'||mode==='subtract_two'){
   b=R(3,30)*50;d=R(3,20)*50;a=b+d+R(5,80)*50;
   answer=mode==='add_sub'?a+b-d:a-b-d;operands=[a,b,d];standard=c.domain==='mass'?'5.2.1':'5.3.1';
   prompt=mixed(a,c)+(mode==='add_sub'?' + ':' − ')+mixed(b,c)+' − '+mixed(d,c)+' = ?';
  }else if(mode==='multiply'){
   a=R(3,70)*50;factor=R(2,12);answer=a*factor;operands=[a,factor];standard=c.domain==='mass'?'5.2.2':'5.3.2';
   prompt=`Setiap ${c.container} mengandungi ${mixed(a,c)} ${c.material}. Berapakah ${c.name} ${c.material} dalam ${factor} ${c.container} yang sama?`;
  }else if(mode==='divide'){
   divisor=R(2,12);b=R(3,70)*50;a=b*divisor;answer=b;operands=[a,divisor];standard=c.domain==='mass'?'5.2.2':'5.3.2';
   prompt=`Sebanyak ${mixed(a,c)} ${c.material} dibahagi sama rata ke dalam ${divisor} ${c.container}. Berapakah ${c.name} ${c.material} dalam setiap ${c.container}?`;
  }else if(mode==='multiply_divide'){
   divisor=R(2,9);factor=R(2,12);a=R(2,20)*divisor*50;answer=a*factor/divisor;operands=[a,factor,divisor];standard=c.domain==='mass'?'5.2.2':'5.3.2';
   prompt=mixed(a,c)+' × '+factor+' ÷ '+divisor+' = ?';
  }else{
   b=R(5,90)*50;d=R(3,30)*50;a=b+d;answer=b;operands=[a,d];standard=c.domain==='mass'?'5.2.1':'5.3.1';
   prompt=`Selepas ${mixed(d,c)} ${c.material} ${c.add}, jumlahnya menjadi ${mixed(a,c)}. Berapakah ${c.name} ${c.material} sebelum itu?`;
  }
  if(style==='minor')prompt+=' Jawab dalam '+c.minor+'.';else prompt+=' Jawab menggunakan '+c.major+' dan '+c.minor+' jika perlu.';
  const values=[answer+100,answer+1000,Math.max(0,answer-100),answer+50],seen=new Set([answer]),wrong=[];
  for(const v of values)if(!seen.has(v)&&wrong.length<3){seen.add(v);wrong.push(N(fmt(v),'unit'));}
  const q=Q(prompt,fmt(answer),wrong,'Samakan unit dahulu: 1 '+c.major+' = 1000 '+c.minor+'. Kemudian ikut operasi atau tindakan dalam soalan.','Tahun 4 · Operasi '+(c.domain==='mass'?'Jisim':'Isi Padu Cecair'),true,true);
  return Object.assign(q,{source:'d4-completion-v1',familyKey:'D4.MEASURE',competencyId:standard,curriculumStandard:standard,archetypeId:'measure_'+c.domain+'_'+mode,representation:['multiply','divide','missing'].includes(mode)?'story':'symbolic',demand:'application',contextId:c.domain+'-operations',misconceptionTargets:['unit','operation'],difficultyBand:3,
   qaEvidence:{domain:c.domain,mode,operands,answerBase:answer,major:c.major,minor:c.minor,outputStyle:style}});
 }
 root.PAD4MeasureCompletion={version:'1.0.0',question};
})(typeof window!=='undefined'?window:globalThis);
