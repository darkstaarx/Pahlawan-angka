// Darjah 2 Topic 5 — Masa. Phase 3.4 Cikgu Wajar repair.
window.PAQuestionBanks = window.PAQuestionBanks || {};
window.PAQuestionBanks.d2t5 = function(id,s,shift){
 if(id==="D2.5.1"){
   const h=R(1,12),m=pick([0,5,10,15,20,25,30,35,40,45,50,55]),ans=`${h}:${String(m).padStart(2,'0')}`;
   return Q(`${clockSvg(h,m)}Apakah waktu yang ditunjukkan oleh jam?`,ans,[N(`${h}:${String((m+5)%60).padStart(2,'0')}`,'time'),N(`${(h%12)+1}:${String(m).padStart(2,'0')}`,'time'),N(`${h}:${String((m+10)%60).padStart(2,'0')}`,'time')],"Jarum pendek menunjukkan jam. Jarum panjang menunjukkan minit.","D2 Core · Baca Jam",true,true);
 }
 if(id==="D2.5.2"){
   const rel=pick(['hourmin','dayhour','weekday']);
   if(rel==='hourmin'){const h=R(1,4),ans=h*60;return Q(`<b>${h} jam</b> = ? minit`,ans,[N(h*30,'time'),N(h*24,'time'),N(ans+60,'time')],"1 jam = 60 minit.","D2 Core · Perkaitan Masa",true,shift)}
   if(rel==='dayhour'){const d=R(1,4),ans=d*24;return Q(`<b>${d} hari</b> = ? jam`,ans,[N(d*12,'time'),N(d*60,'time'),N(ans+24,'time')],"1 hari = 24 jam.","D2 Core · Perkaitan Masa",true,shift)}
   const w=R(1,4),ans=w*7;return Q(`<b>${w} minggu</b> = ? hari`,ans,[N(w*5,'time'),N(w*10,'time'),N(ans+7,'time')],"1 minggu = 7 hari.","D2 Core · Perkaitan Masa",true,shift);
 }
 if(id==="D2.5.3"){
   const startH=R(7,15),startM=pick([0,15,30,45]),dur=pick([15,30,45,60,90,120]);const total=startH*60+startM+dur,endH=Math.floor(total/60),endM=total%60,ans=`${endH}:${String(endM).padStart(2,'0')}`;
   const mode=Math.random()<.7?'end':'duration';
   if(mode==='end')return Q(`${timelineSvg(startH,startM,endH,endM,{showEnd:false})}Aktiviti bermula pada <b>${startH}:${String(startM).padStart(2,'0')}</b> dan berlangsung <b>${dur} minit</b>. Pukul berapakah aktiviti tamat?`,ans,[N(`${endH}:${String((endM+15)%60).padStart(2,'0')}`,'time'),N(`${startH}:${String(startM).padStart(2,'0')}`,'time'),N(`${Math.max(1,endH-1)}:${String(endM).padStart(2,'0')}`,'time')],"Gerakkan masa ke hadapan mengikut tempoh.","D2 Application · Masalah Masa",true,true);
   return Q(`${timelineSvg(startH,startM,endH,endM)}Berapakah tempoh dari <b>${startH}:${String(startM).padStart(2,'0')}</b> hingga <b>${ans}</b>?`,`${dur} minit`,[N(`${Math.max(15,dur-15)} minit`,'time'),N(`${dur+15} minit`,'time'),N(`${dur+60} minit`,'time')],"Kira beza masa dari mula hingga tamat.","D2 Application · Tempoh",true,true);
 }
 return null;
};
