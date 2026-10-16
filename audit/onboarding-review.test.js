const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('step four keeps the selected avatar and exposes the final save action',()=>{
 const elements={onboardingBody:{innerHTML:''},onboardingStepLabel:{textContent:''},onboardingProgressFill:{style:{}},guardianOnboarding:{scrollTo(){}},obPin:{value:'1234'},obPin2:{value:'1234'},obCustomTime:{value:''},obHardLock:{checked:true}};
 const c={db:null,window:{PAAvatar:{normalize:id=>id},PACommercial:{requireFeature:()=>true}},document:{getElementById:id=>elements[id],addEventListener(){}},screen(){}};
 vm.createContext(c);vm.runInContext(fs.readFileSync('js/guardian-onboarding-v3.25.1.js','utf8'),c);
 c.window.PAOnboarding.beginProfile({name:'Anak',grade:2,avatar_id:'avatar-07'});
 c.window.PAOnboarding.next();c.window.PAOnboarding.next();c.window.PAOnboarding.next();
 const html=elements.onboardingBody.innerHTML;
 assert.match(elements.onboardingStepLabel.textContent,/4 daripada 4/);
 assert.match(html,/avatar-07.png/);assert.doesNotMatch(html,/PAOnboarding.chooseAvatar/);
 assert.match(html,/class="onboardingAction"/);assert.match(html,/PAOnboarding.finish()/);
 assert.match(html,/Simpan & serahkan kepada anak/);
});
test('a sibling profile inherits the family PIN and step three explains the introduction check',()=>{
 const elements={onboardingBody:{innerHTML:''},onboardingStepLabel:{textContent:''},onboardingProgressFill:{style:{}},guardianOnboarding:{scrollTo(){}},obPin:{value:''},obPin2:{value:''},obCustomTime:{value:''},obHardLock:{checked:true}};
 const c={db:null,window:{PAAvatar:{normalize:id=>id},PACloud:{guardianPin:()=> '4826'},PACommercial:{requireFeature:()=>true}},document:{getElementById:id=>elements[id],addEventListener(){}},screen(){}};
 vm.createContext(c);vm.runInContext(fs.readFileSync('js/guardian-onboarding-v3.25.1.js','utf8'),c);
 c.window.PAOnboarding.beginProfile({name:'Anak Kedua',grade:3,avatar_id:'avatar-02'});
 assert.match(elements.onboardingBody.innerHTML,/Satu PIN untuk semua anak/);
 assert.doesNotMatch(elements.onboardingBody.innerHTML,/id="obPin"/);
 c.window.PAOnboarding.next();c.window.PAOnboarding.next();
 assert.match(elements.onboardingBody.innerHTML,/Misi Pengenalan cari tahap yang sesuai/);
 assert.match(elements.onboardingBody.innerHTML,/Cikgu Dimensi bermula daripada darjah sekolah/);
 assert.match(elements.onboardingBody.innerHTML,/pilihan di sini tidak menentukan latihan/);
 c.window.PAOnboarding.next();
 assert.match(elements.onboardingBody.innerHTML,/Misi Pengenalan/);
 assert.match(elements.onboardingBody.innerHTML,/onboardingSummaryEdit/);
});
test('the entrance cinematic runs after the last lore slide',()=>{
 const source=fs.readFileSync('js/guardian-onboarding-v3.25.1.js','utf8');
 const finish=source.slice(source.indexOf('async function finish()'),source.indexOf('function waitForChild()'));
 const nextLore=source.slice(source.indexOf('function nextLore()'),source.indexOf('function startIntro()'));
 assert.match(finish,/storyIndex=0;renderLore\(\)/);
 assert.doesNotMatch(finish,/playEntrance/);
 assert.match(nextLore,/playEntrance\(afterEntrance\)/);
 assert.match(nextLore,/afterEntrance=\(\)=>\{busy=false;startIntro\(\)\}/);
 assert.doesNotMatch(source,/Misi Pengenalan menanti!/);
});
