function setFocus(id){
 db.focus=db.focus===id?null:id;
 log(db.focus?`Ibu bapa memilih ${META[id].title} sebagai misi utama.`:"Pelan latihan kembali kepada pilihan Cikgu Wajar.");
 save();renderParent();
}

const PARENT_MISCONCEPTION_COPY={
 units_only:"masih melihat digit sa sahaja apabila membanding atau mengira nombor",
 same_end:"kadangkala memilih jawapan berdasarkan digit hujung sahaja",
 place:"masih keliru menentukan rumah sa, puluh atau ratus",
 digit_value:"masih tertukar antara digit dengan nilai digit",
 operation:"boleh membuat kiraan, tetapi kadangkala tersalah memilih operasi",
 fraction:"masih tertukar antara bahagian yang diambil dengan jumlah bahagian",
 decimal:"masih perlukan latihan membaca nilai tempat selepas titik perpuluhan",
 time:"masih perlukan latihan menghubungkan jam, minit dan tempoh",
 unit:"kadangkala memilih unit ukuran yang tidak sesuai",
 shape:"masih mengenal bentuk melalui rupa, bukan ciri seperti sisi dan bucu",
 data:"masih perlu membaca label dan skala sebelum membandingkan data",
 percent:"masih perlukan latihan menghubungkan peratus dengan satu keseluruhan",
 ratio:"masih keliru membandingkan dua kuantiti dalam urutan yang betul",
 area:"masih tertukar antara ukuran panjang, luas dan isi padu",
 coord:"masih perlu mengingat urutan x dahulu, kemudian y"
};

function parentSafe(value){return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]))}
function skillAttempts(s){return Number(s.correct||0)+Number(s.wrong||0)}
function skillAccuracy(s){const n=skillAttempts(s);return n?Math.round(Number(s.correct||0)/n*100):0}
function topMisEntry(s){return Object.entries(s.mis||{}).sort((a,b)=>b[1]-a[1])[0]||null}
function topMis(s){const x=topMisEntry(s);return x?`${PARENT_MISCONCEPTION_COPY[x[0]]||x[0]} (${x[1]}×)`:""}
function powerLevel(s){
 const attempts=skillAttempts(s),accuracy=skillAccuracy(s),hintRate=attempts?Number(s.hints||0)/attempts:0;
 if(Number(s.evidence||0)<2||attempts<2)return 0;
 if(accuracy>=80&&Number(s.mastery||0)>=70&&hintRate<=.2)return 3;
 if(accuracy>=60||Number(s.mastery||0)>=50)return 2;
 return 1;
}
function powerLabel(level){return level===3?"Kuasa Mantap":level===2?"Sedang Dikuatkan":level===1?"Misi Utama":"Masih Diteroka"}
function powerStars(level){return `<span class="powerStars" aria-label="${level} daripada 3 bintang">${[1,2,3].map(n=>`<i class="${n<=level?'lit':''}">★</i>`).join("")}</span>`}
function skillReason(m,s,level){
 const attempts=skillAttempts(s),accuracy=skillAccuracy(s),mis=topMisEntry(s),hintRate=attempts?Number(s.hints||0)/attempts:0;
 if(level===0)return `Belum cukup cabaran diselesaikan untuk membaca kuasa ${parentSafe(m.title)}.`;
 if(level===3)return `Berjaya ${s.correct} daripada ${attempts} cabaran${Number(s.hints||0)===0?' tanpa Petunjuk':''}.`;
 if(mis)return `Berjaya ${s.correct} daripada ${attempts} cabaran; ${PARENT_MISCONCEPTION_COPY[mis[0]]||'corak kesalahan yang sama masih berulang'}.`;
 if(hintRate>.4)return `Asasnya sudah kelihatan, tetapi Petunjuk atau bantuan Cikgu Wajar masih kerap diperlukan.`;
 if(level===2)return `Berjaya ${s.correct} daripada ${attempts} cabaran. Kuasa ini semakin stabil dengan latihan.`;
 return `Berjaya ${s.correct} daripada ${attempts} cabaran (${accuracy}%). Asas kemahiran ini perlu dibina semula.`;
}
function powerCard(m,s){
 const level=powerLevel(s);
 return `<article class="powerCard level-${level}"><div class="powerSeal"><span>${level||'?'}</span></div><div class="powerCopy"><div class="powerTitle"><b>${parentSafe(m.title)}</b>${powerStars(level)}</div><small>${powerLabel(level)}</small><p>${skillReason(m,s,level)}</p></div></article>`;
}
function nextMissionCopy(m,s){
 if(!m)return {title:"Teruskan pengembaraan",text:"Selesaikan beberapa cabaran lagi supaya Cikgu Wajar dapat memilih misi yang paling berguna.",action:"Kumpul sekurang-kurangnya 5 jawapan untuk membuka ringkasan pertama."};
 const mis=topMisEntry(s),attempts=skillAttempts(s),hintRate=attempts?Number(s.hints||0)/attempts:0;
 let action=mis?`Cikgu Wajar akan gunakan contoh visual untuk membantu apabila ${PARENT_MISCONCEPTION_COPY[mis[0]]||'kesalahan yang sama muncul'}.`:hintRate>.4?"Cikgu Wajar akan pecahkan latihan kepada langkah lebih kecil sebelum meminta jawapan tanpa Petunjuk.":"Cikgu Wajar akan beri latihan pendek pada tahap semasa, kemudian semak semula dengan bentuk soalan berbeza.";
 return {title:m.title,text:`Ini misi paling penting untuk menguatkan kuasa ${db.name} sekarang.`,action};
}
function parentPowerSummary(core,attempts){
 const ranked=core.filter(m=>scoreState(m.id).evidence>=2).sort((a,b)=>powerLevel(scoreState(b.id))-powerLevel(scoreState(a.id))||scoreState(b.id).mastery-scoreState(a.id).mastery);
 const strong=ranked.filter(m=>powerLevel(scoreState(m.id))===3).slice(0,3);
 const priority=ranked.filter(m=>powerLevel(scoreState(m.id))===1).sort((a,b)=>scoreState(a.id).mastery-scoreState(b.id).mastery).slice(0,2);
 const developing=ranked.filter(m=>powerLevel(scoreState(m.id))===2).sort((a,b)=>scoreState(a.id).mastery-scoreState(b.id).mastery);
 const mission=priority[0]||developing[0]||null;
 const display=[...priority,...developing.filter(m=>!priority.includes(m)),...strong].slice(0,5);
 if(attempts<5)return {headline:`Perjalanan ${db.name} baru bermula`,intro:"Cikgu Wajar masih mengumpul petunjuk daripada cara jawapan dibuat. Selepas beberapa cabaran lagi, kuasa yang mantap dan misi utama akan muncul di sini.",strong,priority,display,mission:null};
 if(priority.length)return {headline:`${db.name} sedang menguatkan kuasa Darjah ${coreGrade()}`,intro:`${strong.length?'Beberapa kuasa sudah semakin mantap. ':''}Sekarang ada ${priority.length===1?'satu misi utama':'dua misi utama'} yang perlu diberi perhatian sebelum cabaran menjadi lebih sukar.`,strong,priority,display,mission};
 if(developing.length)return {headline:`Kuasa ${db.name} semakin stabil`,intro:"Tiada jurang besar dikesan setakat ini. Beberapa kemahiran masih sedang dikuatkan melalui latihan pendek dan semakan semula.",strong,priority,display,mission};
 return {headline:`Pengembaraan ${db.name} berjalan baik`,intro:"Kuasa yang telah diuji menunjukkan kemajuan yang baik. Teruskan misi biasa supaya pencapaian ini kekal konsisten.",strong,priority,display,mission};
}

function parentLogText(raw){
 let text=String(raw||"");
 const skillMatch=GRAPH.skills.find(m=>text.includes(m.id));
 const skillName=skillMatch?.title||"kemahiran ini";
 if(text.startsWith("HP habis"))return "Tenaga hero habis. Tiada kemajuan dipadam dan sesi pengukuhan diteruskan.";
 if(/Learning Camp dicetuskan/.test(text))return `Cikgu Wajar membuka Kem Latihan untuk membantu ${skillName}.`;
 if(/Learning cycle belum berjaya/.test(text))return `${skillName} masih perlukan satu lagi sesi bantuan sebelum meneruskan misi.`;
 if(/Learning Camp .*prerequisite/.test(text))return `Cikgu Wajar kembali kepada asas yang berkaitan untuk menguatkan ${skillName}.`;
 if(/Cikgu Wajar tukar strategi/.test(text))return `Cara pertama belum cukup membantu ${skillName}, jadi Cikgu Wajar menukar pendekatan pembelajaran.`;
 if(/Restu Parent Lock diaktifkan/.test(text))return `Rehat ulang kaji diaktifkan untuk ${skillName}.`;
 if(/Restu Parent dibuka/.test(text))return `Restu ibu bapa diberi dan pengembaraan boleh diteruskan.`;
 if(/Learning Camp selesai/.test(text))return `Kem Latihan untuk ${skillName} berjaya diselesaikan selepas pendekatan yang sesuai ditemui.`;
 if(/Coach buka Topik/.test(text))return "Wilayah baharu dibuka selepas kemahiran sebelumnya semakin stabil.";
 if(/Recovery selesai/.test(text))return `Latihan asas untuk ${skillName} selesai; Cikgu Wajar akan menyemak kemahiran utama semula.`;
 if(/menunjukkan bukti melebihi/.test(text))return `${skillName} berjaya melepasi cabaran tahap lebih tinggi.`;
 if(/Stretch .*belum stabil/.test(text))return `Cabaran tahap lebih tinggi untuk ${skillName} belum stabil; latihan kekal pada tahap semasa.`;
 if(/lemah; coach turun/.test(text))return `Cikgu Wajar kembali kepada asas berkaitan untuk membantu ${skillName}.`;
 if(/kuat; coach mulakan/.test(text))return `${skillName} semakin mantap, jadi satu cabaran bonus telah dibuka.`;
 return text.replace(/Parent Focus:/gi,"Fokus ibu bapa:").replace(/Coach/gi,"Cikgu Wajar");
}

function renderParent(){
 updateFrontier();
 const g=coreGrade(),prev=Math.max(1,g-1),next=Math.min(6,g+1),core=GRAPH.skills.filter(x=>x.grade===g);
 const attempts=core.reduce((z,m)=>z+skillAttempts(scoreState(m.id)),0),correct=core.reduce((z,m)=>z+Number(scoreState(m.id).correct||0),0),accuracy=attempts?Math.round(correct/attempts*100):0;
 const recovering=GRAPH.skills.filter(x=>x.grade===prev&&scoreState(x.id).evidence>0),stretching=GRAPH.skills.filter(x=>x.grade===next&&scoreState(x.id).evidence>0),summary=parentPowerSummary(core,attempts),missionCopy=nextMissionCopy(summary.mission,summary.mission?scoreState(summary.mission.id):null);
 const tested=core.filter(m=>powerLevel(scoreState(m.id))>0),starTotal=tested.reduce((z,m)=>z+powerLevel(scoreState(m.id)),0);
 const cards=summary.display.length?summary.display.map(m=>powerCard(m,scoreState(m.id))).join(""):`<div class="parentEmpty"><span>✦</span><b>Kuasa masih diteroka</b><p>Jawab beberapa soalan lagi untuk membuka penilaian setiap kemahiran.</p></div>`;
 document.getElementById("summaryTab").innerHTML=`
  <section class="parentJourney card"><div class="parentJourneyCopy"><div class="eyebrow">CATATAN CIKGU WAJAR</div><h2>${parentSafe(summary.headline)}</h2><p>${parentSafe(summary.intro)}</p></div><img src="assets/coach/cikgu-wajar/parent-adviser.webp" alt="Cikgu Wajar menunjukkan perjalanan tiga bintang"></section>
  <div class="parentStats"><div><span>⚔</span><b>${db.coreFrontier}/${totalChapters()}</b><small>Wilayah dibuka</small></div><div><span>🎯</span><b>${accuracy}%</b><small>Ketepatan</small></div><div><span>★</span><b>${starTotal}/${tested.length*3||0}</b><small>Bintang kuasa</small></div></div>
  <section class="card powerSection"><div class="sectionHead parentSectionHead"><div><div class="eyebrow">PETA KUASA</div><h3>Kuasa yang telah diuji</h3></div><span class="parentLegend">★ Misi · ★★ Dikuatkan · ★★★ Mantap</span></div><div class="powerList">${cards}</div></section>
  <section class="nextMission card"><div class="missionRune">✦</div><div class="nextMissionCopy"><div class="eyebrow">MISI SETERUSNYA</div><h3>${parentSafe(missionCopy.title)}</h3><p>${parentSafe(missionCopy.text)}</p><div class="coachAction"><img src="assets/coach/cikgu-wajar/welcome.webp" alt=""><span><b>Langkah Cikgu Wajar</b>${parentSafe(missionCopy.action)}</span></div></div>${summary.mission?`<button class="btn primary small focusLaunch" onclick="openGuardianFocus('${summary.mission.id}')">Latih topik ini</button>`:''}</section>`;
 let byCh={};core.forEach(m=>(byCh[m.chapter]??=[]).push(m));
 document.getElementById("coreTab").innerHTML=`<div class="card"><h2>Kemahiran Darjah ${g}</h2><p class="mut">Pilih satu kemahiran jika mahu lebih banyak latihan pada bahagian itu. Cikgu Wajar masih akan menyelitkan ulang kaji penting supaya asas lain tidak tertinggal.</p>${Object.keys(byCh).sort((a,b)=>a-b).map(ch=>`<h3 style="margin-top:15px">Topik ${ch}</h3>`+byCh[ch].map(m=>skillHTML(m,true)).join("")).join("")}</div>`;
 document.getElementById("levelsTab").innerHTML=`<div class="card"><h2>Pengukuhan Asas · ${gradeLabel(prev)}</h2>${recovering.length?recovering.map(m=>skillHTML(m,false)).join(""):"<p class='mut'>Belum ada latihan asas tambahan diperlukan.</p>"}</div><div class="card"><h2>Cabaran Lanjutan · ${gradeLabel(next)}</h2>${stretching.length?stretching.map(m=>skillHTML(m,false)).join(""):"<p class='mut'>Belum ada cabaran lanjutan yang disahkan.</p>"}</div>`;
 document.getElementById("engineTab").innerHTML=`<div class="card"><h2>Rekod Latihan</h2>${db.logs.length?db.logs.map(x=>`<p class="mut">${new Date(x.t).toLocaleString("ms-MY")}: ${parentSafe(parentLogText(x.text))}</p>`).join(""):"<p class='mut'>Belum ada rekod penting.</p>"}</div>`;
 tab("summary");
}

function skillHTML(m,allowFocus){
 const s=scoreState(m.id),level=powerLevel(s),cls=db.focus===m.id?"focus":"";
 return `<div class="skill ${cls}"><div class="row"><div class="skillParentCopy"><b>${parentSafe(m.title)}</b><div class="mut">${powerLabel(level)} · ${skillAttempts(s)?`${s.correct}/${skillAttempts(s)} betul`:"Belum dicuba"}${Number(s.hints||0)?` · ${s.hints} Petunjuk`:''}</div></div><div class="grow"></div>${powerStars(level)}${allowFocus?`<button class="btn ghost small focusLaunch" onclick="openGuardianFocus('${m.id}')">Latih</button>`:""}</div><div class="meter"><span style="width:${Math.max(3,s.mastery)}%"></span></div></div>`;
}
function tab(n){
 ["summary","core","levels","engine"].forEach(x=>document.getElementById(x+"Tab").classList.toggle("hidden",x!==n));
 document.querySelectorAll('#parent .tabs button[data-parent-tab]').forEach(b=>b.classList.toggle('active',b.dataset.parentTab===n));
}
function exportCSV(){let rows=[["Skill","Grade","Role","Title","Mastery","Confidence","Evidence","Correct","Wrong","Misconception"],...GRAPH.skills.map(m=>{let s=scoreState(m.id);return[m.id,m.grade,m.role,m.title,Math.round(s.mastery),Math.round(s.confidence),s.evidence,s.correct,s.wrong,topMis(s)]})];let csv=rows.map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n"),blob=new Blob([csv],{type:"text/csv"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="pahlawan-angka-kemajuan.csv";a.click();URL.revokeObjectURL(a.href)}
