// Parent reporting and focus controls.
function setFocus(id){db.focus=db.focus===id?null:id;log(db.focus?`Parent Focus: ${id} ${META[id].title}. Coach naikkan frequency, tetapi kekalkan spaced review dan curriculum coverage.`:"Parent kembali Auto Coach.");save();renderParent()}

function topMis(s){let x=Object.entries(s.mis).sort((a,b)=>b[1]-a[1])[0];if(!x)return"";let names={units_only:"hanya digit sa",same_end:"pattern digit hujung",place:"nilai tempat",digit_value:"digit vs nilai digit",operation:"pilihan operasi",fraction:"pengangka/penyebut",decimal:"tempat perpuluhan",time:"jam/minit",unit:"pemilihan unit",shape:"ciri bentuk",data:"bacaan data"};return (names[x[0]]||x[0])+` (${x[1]}×)`}

function renderParent(){
 updateFrontier();
 let core=GRAPH.skills.filter(x=>x.grade===2),attempts=core.reduce((z,m)=>z+scoreState(m.id).correct+scoreState(m.id).wrong,0),correct=core.reduce((z,m)=>z+scoreState(m.id).correct,0);
 let recovering=GRAPH.skills.filter(x=>x.grade===1&&scoreState(x.id).evidence>0),stretching=GRAPH.skills.filter(x=>x.grade===3&&scoreState(x.id).evidence>0);
 let weak=core.filter(m=>scoreState(m.id).evidence>=2&&scoreState(m.id).mastery<50).sort((a,b)=>scoreState(a.id).mastery-scoreState(b.id).mastery).slice(0,4);
 document.getElementById("summaryTab").innerHTML=`<div class="card"><h2>${db.name} · Darjah 2</h2><div class="statgrid"><div class="stat"><b>${db.coreFrontier}/8</b>D2 topik dibuka</div><div class="stat"><b>${attempts?Math.round(correct/attempts*100):0}%</b>D2 ketepatan</div><div class="stat"><b>${db.focus||"AUTO"}</b>Coach mode</div></div></div><div class="card"><h3>Coach view</h3><p class="mut">D1 bukan bermaksud anak “turun darjah”; ia hanya prerequisite recovery. D3 bukan bermaksud seluruh anak sudah Darjah 3; ia hanya stretch pada skill tertentu.</p>${weak.length?`<div class="notice">Perlu perhatian: ${weak.map(m=>m.id+" "+m.title).join(" · ")}</div>`:`<div class="notice">Belum ada kelemahan D2 yang kuat atau evidence masih sedikit.</div>`}</div>`;
 let byCh={};core.forEach(m=>(byCh[m.chapter]??=[]).push(m));
 document.getElementById("coreTab").innerHTML='<div class="card"><h2>D2 Curriculum</h2><p class="mut">Parent boleh Focus subtopik. Focus menaikkan weight tetapi tidak mematikan adaptive review.</p>'+Object.keys(byCh).sort((a,b)=>a-b).map(ch=>`<h3 style="margin-top:15px">Topik ${ch}</h3>`+byCh[ch].map(m=>skillHTML(m,true)).join("")).join("")+'</div>';
 document.getElementById("levelsTab").innerHTML=`<div class="card"><h2>D1 Recovery Evidence</h2>${recovering.length?recovering.map(m=>skillHTML(m,false)).join(""):"<p class='mut'>Belum perlu recovery D1.</p>"}</div><div class="card"><h2>D3 Stretch Evidence</h2>${stretching.length?stretching.map(m=>skillHTML(m,false)).join(""):"<p class='mut'>Belum ada D3 stretch yang disahkan.</p>"}</div>`;
 document.getElementById("engineTab").innerHTML=`<div class="card"><h2>Coach Log</h2>${db.logs.length?db.logs.map(x=>`<p class="mut">${new Date(x.t).toLocaleString("ms-MY")}: ${x.text}</p>`).join(""):"<p class='mut'>Belum ada event penting.</p>"}</div>`;
 tab("summary")
}

function skillHTML(m,allowFocus){
 let s=scoreState(m.id),cls=db.focus===m.id?"focus":"",status=s.evidence===0?"Belum diuji":s.mastery<35?"Foundation gap":s.mastery<50?"Perlu perhatian":s.mastery<70?"Sedang berkembang":s.mastery<85?"Baik":"Kuat";
 return `<div class="skill ${cls}"><div class="row"><div><b>${m.id} ${m.title}</b><div class="mut">${status} · M ${Math.round(s.mastery)}% · C ${Math.round(s.confidence)}% · E${s.evidence}${topMis(s)?` · Signal: ${topMis(s)}`:""}</div></div><div class="grow"></div>${allowFocus?`<button class="btn ${db.focus===m.id?"primary":"ghost"} small" onclick="setFocus('${m.id}')">${db.focus===m.id?"Stop":"Focus"}</button>`:""}</div><div class="meter"><span style="width:${s.mastery}%"></span></div></div>`
}

function tab(n){["summary","core","levels","engine"].forEach(x=>document.getElementById(x+"Tab").classList.toggle("hidden",x!==n))}

function exportCSV(){let rows=[["Skill","Grade","Role","Title","Mastery","Confidence","Evidence","Correct","Wrong","Misconception"],...GRAPH.skills.map(m=>{let s=scoreState(m.id);return[m.id,m.grade,m.role,m.title,Math.round(s.mastery),Math.round(s.confidence),s.evidence,s.correct,s.wrong,topMis(s)]})];let csv=rows.map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n"),blob=new Blob([csv],{type:"text/csv"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="pahlawan-angka-coach-v5.csv";a.click();URL.revokeObjectURL(a.href)}
