const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('step four keeps the selected avatar and exposes the final save action',()=>{
 const elements={onboardingBody:{innerHTML:''},onboardingStepLabel:{textContent:''},onboardingProgressFill:{style:{}},guardianOnboarding:{scrollTo(){}},obPin:{value:'1234'},obPin2:{value:'1234'},obCustomTime:{value:''},obHardLock:{checked:true}};
 const c={window:{PAAvatar:{normalize:id=>id},PACommercial:{requireFeature:()=>true}},document:{getElementById:id=>elements[id]},screen(){}};
 vm.createContext(c);vm.runInContext(fs.readFileSync('js/guardian-onboarding-v3.25.1.js','utf8'),c);
 c.window.PAOnboarding.beginProfile({name:'Anak',grade:2,avatar_id:'avatar-07'});
 c.window.PAOnboarding.next();c.window.PAOnboarding.next();c.window.PAOnboarding.next();
 const html=elements.onboardingBody.innerHTML;
 assert.match(elements.onboardingStepLabel.textContent,/4 daripada 4/);
 assert.match(html,/avatar-07.png/);assert.doesNotMatch(html,/PAOnboarding.chooseAvatar/);
 assert.match(html,/class="onboardingAction"/);assert.match(html,/PAOnboarding.finish()/);
 assert.match(html,/Simpan & serahkan kepada anak/);
});
