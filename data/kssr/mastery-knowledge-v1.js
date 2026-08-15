// Pahlawan Angka Mastery Knowledge Base v1.
// The graph remains the curriculum spine. This layer describes what counts as
// convincing mastery evidence and how common errors should be interpreted.
(function(){
 const DOMAIN={
  Nombor:{concepts:['kuantiti','urutan','nilai tempat'],mis:['place','digit_value','same_end'],recovery:['concrete','visual','symbolic']},
  Operasi:{concepts:['makna operasi','fakta asas','strategi pengiraan'],mis:['operation','units_only','fact','division'],recovery:['model','number_line','equation']},
  Pecahan:{concepts:['bahagian sama besar','pengangka dan penyebut','kesetaraan'],mis:['fraction','operation'],recovery:['concrete','bar_model','symbolic']},
  Perpuluhan:{concepts:['nilai tempat perpuluhan','kesetaraan','operasi'],mis:['decimal','place'],recovery:['place_value_chart','money_model','symbolic']},
  Peratus:{concepts:['bahagian daripada 100','kesetaraan','aplikasi'],mis:['percent','fraction','decimal'],recovery:['hundred_grid','bar_model','symbolic']},
  Wang:{concepts:['nilai wang','operasi wang','keputusan kewangan'],mis:['money','operation','decimal'],recovery:['coin_note_model','equation','context']},
  Masa:{concepts:['membaca masa','hubungan unit','tempoh'],mis:['time','unit','operation'],recovery:['clock','timeline','equation']},
  Ukuran:{concepts:['atribut ukuran','unit','penukaran'],mis:['unit','operation','place'],recovery:['benchmark','measurement_tool','equation']},
  Ruang:{concepts:['ciri bentuk','hubungan ruang','pengiraan'],mis:['shape','area'],recovery:['manipulative','diagram','formula']},
  Kedudukan:{concepts:['rujukan','arah','kedudukan'],mis:['coord','shape'],recovery:['physical_grid','diagram','symbolic']},
  Koordinat:{concepts:['paksi','pasangan tertib','arah'],mis:['coord','place'],recovery:['physical_grid','labelled_grid','symbolic']},
  Nisbah:{concepts:['perbandingan multiplicative','urutan','kesetaraan'],mis:['ratio','fraction'],recovery:['objects','bar_model','symbolic']},
  Kadaran:{concepts:['kadar unit','penskalaan','perkaitan'],mis:['ratio','operation'],recovery:['table','bar_model','equation']},
  Data:{concepts:['membaca paparan','skala','tafsiran'],mis:['data','operation'],recovery:['objects','table','chart']},
  Kebolehjadian:{concepts:['kemungkinan','ruang sampel','penaakulan'],mis:['data','fraction'],recovery:['experiment','list','fraction']}
 };
 const LABEL={place:'nilai tempat',digit_value:'digit berbanding nilai digit',same_end:'membanding digit hujung',operation:'pemilihan operasi',units_only:'pengumpulan semula',fact:'fakta darab',division:'hubungan darab dan bahagi',fraction:'makna pecahan',decimal:'nilai tempat perpuluhan',percent:'hubungan dengan 100%',money:'nilai ringgit dan sen',time:'jam, minit dan tempoh',unit:'unit dan faktor penukaran',shape:'ciri bentuk',area:'luas, perimeter atau isipadu',coord:'paksi dan pasangan tertib',ratio:'urutan dan faktor nisbah',data:'label atau skala data',pattern:'aturan pola',round:'digit penentu',estimate:'kewajaran anggaran',generated:'strategi yang tidak sepadan'};
 const SOURCE={
  curriculum:'curriculum-backed',
  misconception:'research-backed',
  threshold:'hypothesis-to-calibrate'
 };
 function demandFor(skill){
  const t=(skill.title||'').toLowerCase();
  if(/masalah|tafsiran|bajet|transaksi|situasi/.test(t))return['procedure','application','transfer'];
  return['concept','procedure','application'];
 }
 function buildProfile(skill){
  const d=DOMAIN[skill.domain]||{concepts:[skill.title],mis:['generated'],recovery:['model','guided','independent']};
  return{
   id:skill.id,grade:skill.grade,chapter:String(skill.chapter),domain:skill.domain,title:skill.title,
   sources:{curriculum:SOURCE.curriculum,misconceptions:SOURCE.misconception,masteryThreshold:SOURCE.threshold},
   prerequisites:[...(skill.prereq||[])],concepts:[...d.concepts],misconceptions:[...d.mis],recoverySequence:[...d.recovery],
   evidence:{requiredClean:3,requiredRepresentations:2,requireUnassisted:true,requireTransfer:true,delayedChecksHours:[24,168,720],demands:demandFor(skill)},
   thresholds:{emerging:40,developing:60,secure:80,retained:85}
  };
 }
 const profiles=Object.fromEntries((window.GRAPH?.skills||GRAPH.skills).map(s=>[s.id,buildProfile(s)]));
 window.PAMasteryKB={version:'1.0.0',profiles,labels:LABEL,domains:DOMAIN,sources:SOURCE};
 window.masteryProfile=function(skillId){return profiles[skillId]||null};
 window.masteryMisconceptionLabel=function(tag){return LABEL[tag]||'bahagian ini'};
 window.masteryEvidenceDecision=function(skillId,history=[]){
  const p=profiles[skillId];if(!p)return{status:'unknown',secure:false,reasons:['Tiada profil kemahiran']};
  const clean=history.filter(x=>x.ok&&!x.hint),formats=new Set(clean.map(x=>x.format).filter(Boolean));
  const transfer=clean.some(x=>x.transfer||String(x.format||'').includes('application')||String(x.format||'').includes('reasoning'));
  // Some legacy banks do not yet emit application/transfer items. Five clean,
  // varied answers may unlock progression provisionally, but remain flagged so
  // future calibrated content can replace that weaker evidence.
  const full=clean.length>=p.evidence.requiredClean&&formats.size>=p.evidence.requiredRepresentations&&transfer;
  const provisional=!transfer&&clean.length>=5&&formats.size>=p.evidence.requiredRepresentations;
  const secure=full||provisional;
  const reasons=[];
  if(clean.length<p.evidence.requiredClean)reasons.push(`Perlu ${p.evidence.requiredClean-clean.length} lagi jawapan betul tanpa bantuan`);
  if(formats.size<p.evidence.requiredRepresentations)reasons.push('Perlu bukti dalam bentuk soalan berbeza');
  if(!transfer)reasons.push('Perlu satu soalan aplikasi atau transfer');
  return{status:full?'secure':provisional?'provisional':clean.length?'developing':'unproven',secure,provisional,reasons,clean:clean.length,formats:formats.size,transfer};
 };
})();
