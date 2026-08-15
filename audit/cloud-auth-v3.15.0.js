const fs=require('fs');
const root=require('path').join(__dirname,'..');
const read=file=>fs.readFileSync(require('path').join(root,file),'utf8');
const html=read('index.html'),cloud=read('js/cloud.js'),css=read('css/cloud-auth-v3.15.0.css'),sw=read('sw.js');
const checks={
  pinnedSupabase:/@supabase\/supabase-js@2\.111\.0/.test(html),
  publishableKey:/sb_publishable_/.test(cloud)&&!/service_role|sb_secret_/.test(cloud),
  guardianAuth:/signInWithPassword/.test(cloud)&&/auth\.signUp/.test(cloud),
  cloudSave:/from\('game_saves'\)\.upsert/.test(cloud),
  existingSaveMigration:/if\(db\)\{await attachNewChild\(\)/.test(cloud),
  childProfiles:/from\('child_profiles'\)/.test(cloud),
  activeTimer:/from\('play_sessions'\)/.test(cloud)&&/document\.hidden/.test(cloud),
  hardLock:/hard_lock_enabled/.test(cloud)&&/timeLock/.test(html),
  parentControls:/cloudParentControls/.test(html)&&/saveControls/.test(cloud),
  offlineFallback:/Cloud login gagal dimuat/.test(cloud),
  cacheBumped:/pahlawan-angka-v3\.15\.[0-9]+/.test(sw)&&/cloud\.js/.test(sw)&&/cloud-auth-v3\.15\.0\.css/.test(sw),
  stylesPresent:/\.cloudLoginCard/.test(css)&&/\.playTimer/.test(css)&&/\.cloudControls/.test(css)
};
const failed=Object.entries(checks).filter(([,ok])=>!ok).map(([name])=>name);
console.log(JSON.stringify({passed:Object.keys(checks).length-failed.length,total:Object.keys(checks).length,checks},null,2));
if(failed.length){console.error('FAILED:',failed.join(', '));process.exit(1)}
