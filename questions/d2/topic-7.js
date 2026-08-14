// Darjah 2 Topic 7 — Ruang. Phase 3.4 Cikgu Wajar repair.
window.PAQuestionBanks = window.PAQuestionBanks || {};
window.PAQuestionBanks.d2t7 = function(id,s,shift){
 const mastery=Number(s?.mastery||0);
 if(id==="D2.7.1"){
   const shapes=[
    {key:'cube',name:'kubus',clue:'Semua permukaan ratanya berbentuk segi empat sama.'},
    {key:'cuboid',name:'kuboid',clue:'Bentuk seperti kotak panjang.'},
    {key:'pyramid',name:'piramid',clue:'Mempunyai satu puncak dan tapak segi empat sama.'},
    {key:'cylinder',name:'silinder',clue:'Mempunyai dua permukaan bulat.'},
    {key:'cone',name:'kon',clue:'Mempunyai satu puncak dan satu tapak bulat.'}
   ];
   const x=pick(shapes),others=shapes.filter(y=>y.name!==x.name),mode=pick(mastery>50?['visual','clue','net','object']:['visual','clue','object']);
   if(mode==='visual')return Q(`${shape3DSvg(x.key)}Apakah nama bentuk 3D ini?`,x.name,shuffle(others).slice(0,3).map(y=>N(y.name,'shape')),"Perhatikan tapak, permukaan dan puncaknya.","D2 Core · Bentuk 3D",true,true);
   if(mode==='clue')return Q(`${x.clue}<br><b>Apakah bentuk 3D itu?</b>`,x.name,shuffle(others).slice(0,3).map(y=>N(y.name,'shape')),"Padankan ciri dengan bentuk 3D.","D2 Core · Ciri Bentuk 3D",true,shift);
   if(mode==='net'){
     const t=pick(['cube','cuboid']),ans=t==='cube'?'kubus':'kuboid';return Q(`${shapeNetSvg(t)}Bentangan ini boleh dilipat menjadi bentuk apa?`,ans,[N(ans==='kubus'?'kuboid':'kubus','shape'),N('silinder','shape'),N('kon','shape')],"Bayangkan setiap bahagian dilipat pada garisan tepi.","D2 Application · Bentangan",true,true);
   }
   const objects=[['dadu','kubus'],['kotak hadiah sama sisi','kubus'],['kotak kasut','kuboid'],['kotak pensel','kuboid'],['tin minuman','silinder'],['gelas silinder','silinder'],['kon aiskrim','kon'],['kon trafik','kon'],['hiasan piramid','piramid'],['bumbung piramid','piramid']];const [obj,ans]=pick(objects);
   return Q(`Objek <b>${obj}</b> paling hampir dengan bentuk 3D apa?`,ans,shuffle(shapes.filter(y=>y.name!==ans)).slice(0,3).map(y=>N(y.name,'shape')),"Fikir bentuk keseluruhan objek.","D2 Application · Bentuk 3D",false,true);
 }
 if(id==="D2.7.2"){
   const shapes=[{key:'triangle',name:'segi tiga',sides:3,corners:3},{key:'square',name:'segi empat sama',sides:4,corners:4},{key:'rectangle',name:'segi empat tepat',sides:4,corners:4},{key:'circle',name:'bulatan',sides:0,corners:0}];
   const x=pick(shapes),others=shapes.filter(y=>y.name!==x.name),mode=pick(['visual','property','compare']);
   if(mode==='visual'){const stem=pick(['Apakah nama bentuk 2D ini?','Bentuk 2D yang ditunjukkan ialah?','Pilih nama yang betul bagi bentuk ini.','Kenal pasti bentuk 2D ini.']);return Q(`${shapeSvg(x.key)}${stem}`,x.name,shuffle(others).slice(0,3).map(y=>N(y.name,'shape')),"Perhatikan sisi lurus dan bucu.","D2 Core · Bentuk 2D",true,true)}
   if(mode==='property'){
     const cases=[
      [['Bentuk manakah mempunyai 3 sisi lurus dan 3 bucu?','Tiga sisi lurus dan tiga bucu menerangkan bentuk apa?','Pilih bentuk yang mempunyai tepat 3 sisi.'],'segi tiga'],
      [['Bentuk manakah tiada sisi lurus dan tiada bucu?','Bentuk apakah yang bulat tanpa bucu?','Pilih bentuk yang tidak mempunyai sisi lurus.'],'bulatan'],
      [['Bentuk manakah mempunyai 4 sisi sama panjang dan 4 bucu?','Empat sisi sama panjang menerangkan bentuk apa?','Pilih bentuk 4 sisi yang semua sisinya sama panjang.'],'segi empat sama'],
      [['Bentuk manakah mempunyai 4 bucu serta dua pasang sisi yang sama panjang?','Dua sisi panjang dan dua sisi pendek menerangkan bentuk apa?','Pilih bentuk 4 bucu yang tidak semestinya semua sisi sama panjang.'],'segi empat tepat']
     ];const entry=pick(cases),q=pick(entry[0]),ans=entry[1];
     return Q(q,ans,shuffle(shapes.filter(y=>y.name!==ans)).slice(0,3).map(y=>N(y.name,'shape')),"Gunakan semua ciri dalam soalan, bukan bilangan sisi sahaja.","D2 Core · Ciri Bentuk 2D",true,true);
   }
   const pair=pick([['segi tiga','bulatan'],['segi empat sama','segi tiga'],['segi empat tepat','bulatan'],['segi tiga','segi empat tepat'],['bulatan','segi empat sama']]),a=shapes.find(z=>z.name===pair[0]),b=shapes.find(z=>z.name===pair[1]),ans=a.sides>b.sides?a.name:b.name;
   const stem=pick([`Antara <b>${a.name}</b> dan <b>${b.name}</b>, yang manakah mempunyai lebih banyak sisi lurus?`,`Bandingkan <b>${a.name}</b> dengan <b>${b.name}</b>. Bentuk mana ada lebih banyak sisi lurus?`,`Yang manakah mempunyai bilangan sisi lurus lebih banyak: <b>${a.name}</b> atau <b>${b.name}</b>?`]);
   return Q(stem,ans,[N(ans===a.name?b.name:a.name,'shape'),N('Kedua-duanya sama','shape'),N('Tidak boleh ditentukan','shape')],"Banding bilangan sisi lurus kedua-dua bentuk.","D2 Application · Banding Bentuk",true,true);
 }
 if(id==="D2.7.3"){
   const cases=[
    ['Aina mahu menyimpan buku dalam bekas seperti kotak kasut. Bentuk 3D manakah paling sesuai?','kuboid',['kubus','kon','silinder']],
    ['Sebuah tin minuman mempunyai bentuk yang hampir sama dengan bentuk 3D apa?','silinder',['kubus','piramid','kon']],
    ['Ali melukis papan tanda yang mempunyai 3 sisi lurus. Bentuk 2D apakah itu?','segi tiga',['bulatan','segi empat sama','segi empat tepat']],
    ['Siti mahu bentuk yang tiada sisi lurus dan tiada bucu. Apakah bentuk itu?','bulatan',['segi tiga','segi empat sama','segi empat tepat']],
    ['Sebuah objek mempunyai satu puncak dan satu tapak bulat. Bentuk apakah yang paling hampir?','kon',['silinder','kuboid','kubus']],
    ['Kotak kecil mempunyai semua sisi sama panjang. Bentuk 3D apakah yang paling hampir?','kubus',['kuboid','silinder','kon']],
    ['Bekas makanan berbentuk kotak panjang. Bentuk 3D manakah paling hampir?','kuboid',['kubus','kon','piramid']],
    ['Hiasan mempunyai satu puncak dan tapak segi empat sama. Bentuk apakah itu?','piramid',['kon','silinder','kubus']],
    ['Mira mahu melukis roda. Bentuk 2D manakah sesuai?','bulatan',['segi tiga','segi empat sama','segi empat tepat']],
    ['Kad mempunyai 4 sisi sama panjang. Bentuk 2D manakah diterangkan?','segi empat sama',['segi tiga','bulatan','segi empat tepat']]
   ];const c=pick(cases),lead=pick(['', 'Fikirkan situasi ini: ', 'Dalam kehidupan harian, ', 'Cabaran bentuk: ']);return Q(lead+c[0],c[1],c[2].map(x=>N(x,'shape')),"Cari ciri bentuk yang disebut dalam situasi.","D2 Application · Masalah Ruang",true,true);
 }
 return null;
};
