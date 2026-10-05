/* KSSR Tahun 1: SP 3.1.1, TP2 (melorek), SP 3.2.1. */
(function(){
 'use strict';
 const values=[[1,2],[1,4],[2,4],[3,4]],styles=['epal','coklat','kertas','reben','kek','kad'],layouts=['h','v','grid'];
 const words={'1/2':'satu perdua','1/4':'satu perempat','2/4':'dua perempat','3/4':'tiga perempat'};
 const bank=[],F=(n,d)=>`${n}/${d}`;
 function image(n,d,style,layout){return window.PAFractionVisuals.markup(n,d,style,layout);}
 function choices(n,d){return ['1/2','1/4','3/4','1/1'].filter(x=>{const [a,b]=x.split('/').map(Number);return a/b!==n/d;}).slice(0,3);}
 function nameChoices(n,d){const seen=new Set([n/d]);return [...Object.entries(words),['1/1','satu keseluruhan']].filter(([f])=>{const [a,b]=f.split('/').map(Number),v=a/b;if(seen.has(v))return false;seen.add(v);return true;}).map(([,w])=>w).slice(0,3);}
 function add(group,mode,prompt,answer,wrong,model,interaction){
   if(group==='harian'&&prompt.replace(/<[^>]*>/g,'').length>120)prompt=prompt.replace('class="fraction-art"','class="fraction-art fraction-art-compact"');
   const index=bank.filter(x=>x.group===group).length+1;
   bank.push({id:`D1-F-${group}-${String(index).padStart(2,'0')}`,group,standardRef:group==='harian'?'3.2.1':'3.1.1',performanceRef:group==='lorek'?'TP2':null,mode,prompt,answer,choices:wrong,model,interaction:interaction||null,grade:1,fallbackGrade:null});
 }
 // 50 recognition questions; distinct tasks and orientations, not one repeating cake.
 for(let i=0;i<50;i++){
   const [n,d]=values[i%4],style=styles[Math.floor(i/4)%6],layout=layouts[Math.floor(i/24)],f=F(n,d),m={n,d,style,layout};
   const v=image(n,d,style,layout),mode=Math.floor(i/12)%4;
   if(i>=44&&i<48){
     const isHalf=i%2===0,den=isHalf?2:4,num=1;m.n=num;m.d=den;m.layout=i>=46?'grid':layout;
     add('kenal',isHalf?'half_synonyms':'quarter_synonyms',`${image(num,den,style,m.layout)}Yang manakah <b>BUKAN</b> nama bagi bahagian ${style} yang ditanda?`,isHalf?'Suku':'Separuh',isHalf?['Separuh','Setengah','Satu perdua']:['Suku','Satu perempat','1/4'],m);
   }else if(mode===0)add('kenal','model_symbol',`${v}Apakah pecahan bahagian yang ditanda?`,f,choices(n,d),m);
   else if(mode===1)add('kenal','model_name',`${v}Apakah nama pecahan bahagian yang ditanda?`,words[f],nameChoices(n,d),m);
   else if(mode===2){m.answerNumerator=d-n;add('kenal','unmarked_symbol',`${v}Apakah pecahan bahagian ${style} yang <b>tidak ditanda</b>?`,F(d-n,d),choices(d-n,d),m);}
   else add('kenal','selected_fraction',`${v}Pecahan manakah menunjukkan bahagian ${style} yang dipilih?`,f,choices(n,d),m);
 }
 // 50 independent representations, allowing every valid choice of n parts.
 for(let i=0;i<50;i++){
   const [n,d]=values[i%4],style=styles[1+Math.floor(i/4)%5],layout=layouts[Math.floor(i/20)],f=F(n,d),m={n,d,style,layout};
   const instructions=[`Lorekkan <b>${f}</b> daripada ${style} ini.`,`Warnakan <b>${words[f]}</b> daripada ${style} ini.`,`Pilih ${n} daripada ${d} bahagian ${style} ini untuk dilorek.`];
   add('lorek',['shade_symbol','shade_words','shade_parts'][Math.floor(i/20)],instructions[Math.floor(i/20)],f,choices(n,d),m,'shade');
 }
 // 50 daily problems: ten different relationships, five items each.
 const people=['Aina','Amir','Mei','Ravi','Siti'];
 for(let i=0;i<50;i++){
   let [n,d]=values[i%4];const kind=Math.floor(i/5),name=people[i%5],other=['Sarah','Raju','Lina','Adam','Hana'][i%5];
   const style=kind===4?'kek':kind===5?'coklat':styles[(i+kind)%6],layout=layouts[i%3];
   if(kind>=4&&kind<=8)d=4;
   const m={n,d,style,layout};
   const object={epal:'Sebiji epal',coklat:'Sekeping coklat',kertas:'Sekeping kertas',reben:'Sehelai reben',kek:'Sebiji kek',kad:'Sekeping kad'}[style];
   const intro=`${object} dibahagi kepada ${d} bahagian sama besar.`;
   let prompt,mode,answerN=n,asName=false;
   if(kind===0){mode='take_one_action';prompt=`${intro} ${name} mengambil ${n} bahagian. Apakah pecahan yang diambil?`;}
   else if(kind===1){mode='give_remaining';answerN=d-n;prompt=`${intro} ${name} memberi ${n} bahagian kepada ${other}. Apakah pecahan yang masih ada pada ${name}?`;}
   else if(kind===2){mode='save_name';asName=true;prompt=`${intro} ${name} menyimpan ${n} bahagian. Apakah nama pecahan yang disimpan?`;}
   else if(kind===3){mode='picture_unused';answerN=d-n;prompt=`${image(n,d,style,layout)}Bahagian bertanda telah digunakan oleh ${name}. Apakah pecahan ${style} yang belum digunakan?`;}
   else if(kind===4){mode='two_people_eat';const a=1,b=i%2?2:1;answerN=4-a-b;m.steps=[a,b];prompt=`${image(0,4,style,layout)}${intro} ${name} makan ${a} bahagian dan ${other} makan ${b} bahagian. Apakah pecahan kek yang tinggal?`;}
   else if(kind===5){mode='eat_then_give';const a=1,b=i%2?1:2;answerN=4-a-b;m.steps=[a,b];prompt=`${image(0,4,style,layout)}${intro} ${name} makan ${a} bahagian dan memberi ${b} bahagian kepada ${other}. Apakah pecahan coklat yang masih ada pada ${name}?`;}
   else if(kind===6){mode='two_people_receive';const a=1,b=i%2?1:2;answerN=a+b;m.steps=[a,b];prompt=`${image(0,4,style,layout)}${intro} ${name} mendapat ${a} bahagian. ${other} mendapat ${b} bahagian. Apakah pecahan yang mereka terima semuanya?`;}
   else if(kind===7){mode='put_back';const taken=i%2?3:2,returned=1;answerN=taken-returned;m.steps=[taken,returned];prompt=`${image(0,4,style,layout)}${intro} ${name} mengambil ${taken} bahagian. Dia meletakkan ${returned} bahagian semula. Apakah pecahan yang masih dipegangnya?`;}
   else if(kind===8){mode='separate_saved_given';const saved=i%2?1:2,given=1;answerN=4-saved-given;m.steps=[saved,given];prompt=`${image(0,4,style,layout)}${intro} ${name} menyimpan ${saved} bahagian dalam kotak dan memberi ${given} bahagian kepada ${other}. Apakah pecahan yang belum disimpan atau diberi?`;}
   else {mode='picture_used_name';asName=true;prompt=`${image(n,d,style,layout)}${name} menggunakan bahagian ${style} yang bertanda. Apakah nama pecahan yang digunakan?`;}
   m.answerNumerator=answerN;
   add('harian',mode,prompt,asName?words[F(answerN,d)]:F(answerN,d),asName?nameChoices(answerN,d):choices(answerN,d),m);
 }
 function materialise(item){
   const hint=item.mode==='half_synonyms'?'Separuh, setengah dan satu perdua ialah nama bagi bahagian yang sama. Suku ialah satu perempat.':item.mode==='quarter_synonyms'?'Suku dan satu perempat ialah nama bagi bahagian yang sama. Separuh ialah satu perdua.':['picture_unused','unmarked_symbol'].includes(item.mode)?'Lihat bahagian yang tidak ditanda. Kira bahagian itu.':item.model.steps?'Ikut setiap tindakan dalam cerita. Kira bahagian yang diminta, kemudian bandingkan dengan semua bahagian asal.':'Kira semua bahagian sama besar. Kemudian kira bahagian yang dipilih.';
   const q=Q(item.prompt,item.answer,item.choices.map(x=>N(x,'fraction')),hint,'Tahun 1 · Pecahan',true,true);
   return Object.assign(q,{templateId:item.id,source:'d1-fractions-audit-v1',standardRef:item.standardRef,performanceRef:item.performanceRef,competencyId:'D1.FRAC',subcompetencyId:item.group,archetypeId:item.mode,representation:item.interaction?'interactive':item.prompt.includes('<img')?'visual':'verbal',demand:item.group==='harian'?'application':'concept',contextId:item.model.style,difficultyBand:1,misconceptionTargets:['fraction_equal_parts','fraction_part_whole'],fractionTask:item.interaction?{type:item.interaction,...item.model}:null});
 }
 const previous=window.PAQuestionBanks.d1;
 function shuffled(items){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
 const decks=new WeakMap(),fallbackSession={};
 window.PAQuestionBanks.d1=function(id,s,shift){
   if(id!=='D1.FRAC')return previous(id,s,shift);
   const hist=typeof sess!=='undefined'?(sess.questionHistory||[]).filter(x=>x.skillId===id):[],recent=new Set(hist.slice(-18).map(x=>x.templateId)),last=hist.at(-1)?.archetypeId;
   const owner=typeof sess!=='undefined'&&sess&&typeof sess==='object'?sess:fallbackSession;
   let deck=decks.get(owner);if(!deck?.length){deck=shuffled(bank);decks.set(owner,deck);}
   const suitable=deck.findIndex(x=>!recent.has(x.id)&&x.mode!==last);
   const [item]=deck.splice(suitable<0?0:suitable,1);return materialise(item);
 };
 window.PAD1FractionBank={items:bank,materialise,image,shuffled};
})();
