// Darjah 2 Topic 8 — Data. Phase 3.4 Cikgu Wajar repair.
window.PAQuestionBanks = window.PAQuestionBanks || {};
window.PAQuestionBanks.d2t8 = function(id,s,shift){
 const cats=shuffle(['Epal','Oren','Mangga','Pisang']);
 if(id==="D2.8.1"){
   const vals=uniqueValues(3,2,9),labels=cats.slice(0,3),mode=Math.random()<.55?'read':'arrange';
   if(mode==='read'){const idx=R(0,2),ans=vals[idx];return Q(`${tallyTable(labels,vals)}Berdasarkan jadual gundalan, berapakah bilangan <b>${labels[idx]}</b>?`,ans,[N(Math.max(1,ans-1),'data'),N(ans+1,'data'),N(vals[(idx+1)%3],'data')],"Setiap satu tanda gundalan mewakili satu item.","D2 Core · Kumpul & Susun Data",true,true)}
   const raw=[];labels.forEach((l,i)=>{for(let k=0;k<vals[i];k++)raw.push(l)});const target=labels[R(0,2)],ans=vals[labels.indexOf(target)];return Q(`Data dikumpul: <div style="max-width:330px;margin:6px auto;line-height:1.7"><b>${shuffle(raw).join(', ')}</b></div>Jika disusun ke dalam jadual gundalan, berapakah gundalan untuk <b>${target}</b>?`,ans,[N(Math.max(1,ans-1),'data'),N(ans+1,'data'),N(vals[(labels.indexOf(target)+1)%3],'data')],"Kumpulkan nama yang sama dan kira satu demi satu.","D2 Application · Susun Data",true,true);
 }
 if(id==="D2.8.2"){
   const vals=uniqueValues(4,2,10),mode=pick(['most','least','read']),idx=R(0,3);
   if(mode==='read'){const ans=vals[idx];return Q(`${barChart(cats,vals)}Berapakah nilai bagi <b>${cats[idx]}</b>?`,ans,[N(Math.max(0,ans-2),'data'),N(ans+2,'data'),N(vals[(idx+1)%4],'data')],"Cari nama kategori di bawah palang, kemudian baca tinggi palang pada skala.","D2 Core · Carta Palang",true,true)}
   const target=mode==='most'?Math.max(...vals):Math.min(...vals),i=vals.indexOf(target),ans=cats[i];return Q(`${barChart(cats,vals)}Buah manakah ${mode==='most'?'paling banyak':'paling sedikit'}?`,ans,cats.filter(x=>x!==ans).map(x=>N(x,'data')),"Banding ketinggian palang menggunakan skala di sebelah kiri.","D2 Core · Carta Palang",true,true);
 }
 if(id==="D2.8.3"){
   const vals=uniqueValues(4,2,10),mode=pick(['difference','sum','twoStep']);
   if(mode==='difference'){const i=R(0,3),j=(i+R(1,3))%4,ans=Math.abs(vals[i]-vals[j]);return Q(`${barChart(cats,vals)}Berapakah beza bilangan <b>${cats[i]}</b> dan <b>${cats[j]}</b>?`,ans,[N(vals[i]+vals[j],'data'),N(Math.max(vals[i],vals[j]),'data'),N(ans+1,'data')],"Baca kedua-dua nilai daripada carta, kemudian nilai besar tolak nilai kecil.","D2 Application · Masalah Data",true,true)}
   if(mode==='sum'){const i=R(0,3),j=(i+R(1,3))%4,ans=vals[i]+vals[j];return Q(`${barChart(cats,vals)}Berapakah jumlah <b>${cats[i]}</b> dan <b>${cats[j]}</b>?`,ans,[N(Math.abs(vals[i]-vals[j]),'data'),N(Math.max(vals[i],vals[j]),'data'),N(ans+1,'data')],"Baca dua nilai daripada carta dan tambah.","D2 Application · Masalah Data",true,true)}
   const max=Math.max(...vals),min=Math.min(...vals),ans=max-min;return Q(`${barChart(cats,vals)}Cari nilai paling banyak dan paling sedikit. Berapakah beza kedua-duanya?`,ans,[N(max,'data'),N(min,'data'),N(ans+2,'data')],"Langkah 1: cari palang tertinggi dan terendah. Langkah 2: tolak nilai kecil daripada nilai besar.","D2 Application · Masalah Data 2 Langkah",true,true);
 }
 return null;
};
