// Main application/session/UI flow.
let db=JSON.parse(localStorage.getItem("pa_coach_v5")||"null");

let sess={hp:20,ehp:12,streak:0,q:null,start:0,hint:false,enemy:1,recent:[],mode:"calibrate",recoveryFor:null,stretchFor:null};

function save(){localStorage.setItem("pa_coach_v5",JSON.stringify(db))}
function initSkill(id){
 if(!db.skills[id]) db.skills[id]={mastery:(META[id].grade===2?18:0),confidence:8,evidence:0,correct:0,wrong:0,hints:0,mis:{},lastSeen:0,stability:0,probePass:0,probeFail:0};
}
function initAll(){GRAPH.skills.forEach(x=>initSkill(x.id))}
function chooseHero(id){selectedHero=id;document.querySelectorAll('.heroPick').forEach(x=>x.classList.remove('active'));let p=document.getElementById('pick-'+id);if(p)p.classList.add('active')}
function applyHeroToBattle(){
 let h=HEROES[(db&&db.hero)||selectedHero||"wira"];
 document.getElementById('heroName').textContent=h.name;
 document.getElementById('heroIdle').src=h.idle;
 document.getElementById('heroAttack').src=h.attack;
 document.getElementById('iceFx').style.display=h.theme==='ice'?'block':'none';
 document.getElementById('bloomFx').src=h.finisher;
 document.getElementById('bloomFx').style.display=h.theme==='bloom'?'block':'none';
}
function setupHeroPicker(){
 let w=document.getElementById('pickImgWira'),b=document.getElementById('pickImgBunga');
 if(w)w.src=HEROES.wira.idle;
 if(b)b.src=HEROES.bunga.idle;
 chooseHero(selectedHero||'wira');
}
function startNew(){db={name:document.getElementById("child").value.trim()||"Anak",schoolGrade:2,hero:selectedHero||"wira",skills:{},coreFrontier:1,focus:null,logs:[],created:Date.now()};initAll();save();startSession()}
function resumeGame(){if(db&&db.hero)selectedHero=db.hero;initAll();startSession()}
function resetAll(){if(confirm("Reset semua progress coach MVP?")){localStorage.removeItem("pa_coach_v5");location.reload()}}
function screen(id){document.querySelectorAll(".screen").forEach(x=>x.classList.remove("on"));document.getElementById(id).classList.add("on")}
function goGame(){db?screen("game"):screen("setup")}
function openParent(){if(!db)return;renderParent();screen("parent")}
function startSession(){sess={hp:20,ehp:12,streak:0,q:null,start:0,hint:false,enemy:1,recent:[],mode:"calibrate",recoveryFor:null,stretchFor:null};applyHeroToBattle();nextQ();battle();screen("game")}














function nextQ(){
 let id=chooseModeAndSkill(),m=META[id],s=scoreState(id),q=generate(id,s);q.skill=id;sess.q=q;sess.start=performance.now();sess.hint=false;
 sess.recent.push(id);if(sess.recent.length>10)sess.recent.shift();
 document.getElementById("skillTitle").textContent=m.grade===2?m.title:(m.grade===3?"Cabaran Bonus · "+m.domain:"Misi Asas · "+m.domain);
 document.getElementById("why").textContent="";
 document.getElementById("coachMode").textContent="Adaptive";
 document.getElementById("gradeLayer").textContent=m.grade===3?"Cabaran Bonus":"Misi";
 document.getElementById("mastery").style.width=Math.max(3,s.mastery)+"%";
 document.getElementById("kind").textContent=m.grade===3?"Cabaran Bonus":(m.grade===1?"Misi Asas":"Misi Matematik");
 document.getElementById("evidence").textContent="";
 document.getElementById("question").innerHTML=q.prompt;document.getElementById("feedback").textContent="";
 let e=document.getElementById("answers");e.innerHTML="";
 shuffle([{v:q.answer,tag:"correct",label:q.answer},...q.wrong]).forEach(o=>{let b=document.createElement("button");b.className="ans";b.textContent=o.label??o.v;b.dataset.v=String(o.v);b.onclick=()=>respond(o,b);e.appendChild(b)})
}




function log(t){db.logs.unshift({t:Date.now(),text:t});db.logs=db.logs.slice(0,120)}
























if(db)document.getElementById("resume").innerHTML=`<button class="btn secondary" onclick="resumeGame()">Sambung ${db.name} · ${HEROES[db.hero||'wira'].name}</button>`;
setupHeroPicker();
