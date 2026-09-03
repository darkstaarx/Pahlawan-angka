function guardianSnapshot(id){const s=scoreState(id);return{mastery:+s.mastery||0,confidence:+s.confidence||0,evidence:+s.evidence||0,correct:+s.correct||0,wrong:+s.wrong||0,hints:+s.hints||0,mis:{...(s.mis||{})}}}
function openGuardianFocus(id){
 if(!META[id]||META[id].grade!==coreGrade())return;
 const s=scoreState(id),attempts=skillAttempts(s),accuracy=attempts?Math.round(s.correct/attempts*100):0;
 const box=document.getElementById('guardianFocusOverlay');box.dataset.skill=id;
 document.getElementById('guardianFocusTitle').textContent=META[id].title;
 document.getElementById('guardianFocusEvidence').textContent=attempts?`${s.correct}/${attempts} betul · ${accuracy}% · ${s.hints||0} petunjuk`:'Belum cukup bukti. Latihan ini akan membina bacaan pertama.';
 document.querySelectorAll('[data-focus-count]').forEach(b=>b.classList.toggle('active',b.dataset.focusCount==='5'));
 box.dataset.count='5';box.classList.remove('hidden');
}
function closeGuardianFocus(){document.getElementById('guardianFocusOverlay')?.classList.add('hidden')}
function chooseGuardianCount(n){const box=document.getElementById('guardianFocusOverlay');box.dataset.count=String(n);document.querySelectorAll('[data-focus-count]').forEach(b=>b.classList.toggle('active',+b.dataset.focusCount===+n))}
function startGuardianFocus(){
 const box=document.getElementById('guardianFocusOverlay'),id=box?.dataset.skill,count=Number(box?.dataset.count||5);
 if(!META[id]||META[id].grade!==coreGrade())return;
 if(typeof enforceRestuLock==='function'&&enforceRestuLock())return;
 db.focus=id;db.guardianFocusHistory=db.guardianFocusHistory||[];
 const before=guardianSnapshot(id);closeGuardianFocus();
 sess={hp:20,ehp:12,streak:0,q:null,start:0,hint:false,hintLevel:0,enemy:1,recent:[],mode:'focus',recoveryFor:null,stretchFor:null,missionChapter:null,missionAnswered:0,missionCorrect:0,missionHints:0,missionSkills:{},missionFinished:false,devBankTest:false,devSkill:null,coachAdaptive:false,guardianFocus:true,focusSkill:id,focusTarget:[5,10,15].includes(count)?count:5,focusBefore:before,focusAttempts:[],questionFingerprints:[],bossActive:false,bossDefeated:false,bossQuestionsAnswered:0,bossStretchAsked:false,bossStretchCurrent:false};
 resetBattlePresentation();
 log(`Latihan Fokus Penjaga dimulakan untuk ${id} (${sess.focusTarget} soalan).`);save();applyHeroToBattle();updateMissionHud();nextQ();battle();screen('game');
}
function guardianRecordAnswer(ok,id,usedHint){if(!sess.guardianFocus||id!==sess.focusSkill)return;sess.focusAttempts.push({ok:!!ok,hint:!!usedHint,at:Date.now()})}
function guardianPlain(v){return String(v??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()}
function guardianCorrectFeedback(q,retried){
 if(q.archetypeId==='choose_strategy')return `<b>Betul kerana </b>kamu memilih strategi yang sepadan dengan maklumat dan perkara yang dicari.`;
 if(q.archetypeId==='error_analysis')return `<b>Betul kerana </b>kamu berjaya mengenal pasti bahagian cara kerja yang perlu diperiksa.`;
 const p=guardianPlain(q.prompt),a=guardianPlain(q.answer);let why='jawapan itu sepadan dengan hubungan matematik dalam soalan.';
 const sum=p.match(/(\d+)\s*\+\s*(\d+)/),sub=p.match(/(\d+)\s*[−-]\s*(\d+)/),mul=p.match(/(\d+)\s*[×x]\s*(\d+)/),div=p.match(/(\d+)\s*÷\s*(\d+)/);
 if(sum)why=`${sum[1]} ditambah ${sum[2]} menghasilkan ${a}.`;
 else if(sub)why=`apabila ${sub[2]} dikeluarkan daripada ${sub[1]}, bakinya ${a}.`;
 else if(mul)why=`${mul[1]} kumpulan, setiap satu ada ${mul[2]}, berjumlah ${a}.`;
 else if(div)why=`${div[1]} dibahagi sama rata kepada kumpulan ${div[2]}, jadi setiap kumpulan mendapat ${a}.`;
 return `<b>${retried?'Bagus, kamu berjaya membetulkannya.':'Betul kerana'} </b>${why}`;
}
function guardianHint(q,level){
 if(q.archetypeId==='choose_strategy')return level<=1?'Tanya: apakah yang diketahui dan apakah yang perlu dicari?':'Pilih model atau operasi yang menghubungkan maklumat diberi dengan jawapan.';
 if(q.archetypeId==='error_analysis')return level<=1?'Bandingkan jawapan murid dengan unit dan operasi dalam soalan.':'Cari langkah pertama yang tidak lagi mengikuti hubungan matematik yang betul.';
 if(level<=1)return guardianPlain(q.hint)||'Cari apa yang diketahui dan apa yang perlu dicari.';
 const p=guardianPlain(q.prompt),sum=p.match(/(\d+)\s*\+\s*(\d+)/),div=p.match(/(\d+)\s*÷\s*(\d+)/);
 if(sum){const a=+sum[1],b=+sum[2],small=Math.min(a,b);return `Mulakan dengan nombor lebih besar, ${Math.max(a,b)}. Kira maju ${small} langkah. Cuba contoh kecil dahulu: 2 + 1 = 3.`}
 if(div)return `Bayangkan ${div[1]} objek dibahagi sama rata kepada ${div[2]} kumpulan. Cuba contoh kecil dahulu: 6 ÷ 2 bermaksud dua kumpulan sama banyak.`;
 return `Pecahkan soalan: tandakan nombor penting, pilih operasi, kemudian selesaikan satu langkah pada satu masa. Cuba dengan nombor lebih kecil dahulu.`;
}
function finishGuardianFocus(){
 if(!sess.guardianFocus||sess.missionFinished)return;sess.missionFinished=true;
 const id=sess.focusSkill,b=sess.focusBefore,a=guardianSnapshot(id),n=sess.focusAttempts.length,correct=sess.focusAttempts.filter(x=>x.ok).length,hints=sess.focusAttempts.filter(x=>x.hint).length,accuracy=Math.round(correct/Math.max(1,n)*100),gain=Math.round(a.mastery-b.mastery);
 const status=accuracy>=80&&hints<=Math.ceil(n*.3)?'Semakin stabil':accuracy>=60?'Sedang dikuatkan':'Masih perlukan bantuan';
 const report={at:Date.now(),skill:id,count:n,correct,hints,accuracy,masteryBefore:Math.round(b.mastery),masteryAfter:Math.round(a.mastery),status};
 db.guardianFocusHistory.unshift(report);db.guardianFocusHistory=db.guardianFocusHistory.slice(0,20);log(`Latihan Fokus Penjaga selesai untuk ${id}: ${correct}/${n} betul.`);save();
 document.getElementById('resultTitle').textContent=status;
 document.getElementById('resultStars').textContent=accuracy>=80?'★★★':accuracy>=60?'★★☆':'★☆☆';
 document.getElementById('resultScore').textContent=`${correct}/${n} betul · ${hints} petunjuk digunakan`;
 document.getElementById('resultRewards').innerHTML=`<span>Penguasaan ${Math.round(b.mastery)}% → ${Math.round(a.mastery)}%</span><span>${gain>=0?'+':''}${gain}% perubahan</span>`;
 document.getElementById('resultCoach').textContent=accuracy>=80?`Bukti untuk ${META[id].title} semakin kukuh. Kembali ke misi biasa untuk semakan dalam bentuk lain.`:`Cikgu Dimensi akan kembali kepada contoh lebih mudah dan asas berkaitan jika kesalahan yang sama berulang.`;
 screen('result');
}
function repeatGuardianFocus(){if(sess?.focusSkill){openGuardianFocus(sess.focusSkill);screen('parent')}}
function resultPrimary(){if(sess?.guardianFocus){renderParent();screen('parent')}else goHub()}
function resultReplay(){if(sess?.guardianFocus)repeatGuardianFocus();else replayMission()}
