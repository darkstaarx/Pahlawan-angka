const fs=require('fs'),path=require('path'),root=path.join(__dirname,'..');
const app=fs.readFileSync(path.join(root,'js/app.js'),'utf8');
const audio=fs.readFileSync(path.join(root,'js/audio.js'),'utf8');
const css=fs.readFileSync(path.join(root,'css/battle-scene-v3.8.28.css'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const assets=[
 'forest-temple/arena-v1.webp','operations-forge/arena-v1.webp','cave-temple/arena-depth-v2.webp',
 'money-market/arena-v1.webp','time-tower/arena-v1.webp','measurement-court/arena-v1.webp',
 'nusantara-temple/arena-v1.webp','data-observatory/arena-v1.webp'
];
const checks={
 eightThemes:['number','operation','fraction','money','time','measure','shape','data'].every(x=>new RegExp(`${x}:'assets/battlefields/`).test(app)),
 terrainApplied:/setBattleTerrain\(m\)/.test(app)&&/--battle-terrain/.test(app)&&/--battle-terrain/.test(css),
 semanticRouting:/pecahan\|perpuluhan\|peratus\|nisbah\|kadaran/.test(app)&&/ruang\|bentuk\|koordinat\|kedudukan/.test(app),
 quietAmbient:/activeMode==='ambient'\?\.16/.test(audio)&&/activeMode==='boss'\?\.1/.test(audio),
 allAssetsExist:assets.every(x=>fs.existsSync(path.join(root,'assets/battlefields',x))),
 allAssetsCached:assets.every(x=>sw.includes(x)),
 compressed:assets.every(x=>fs.statSync(path.join(root,'assets/battlefields',x)).size<700000),
 cacheVersion:/pahlawan-angka-v3\.15\.1/.test(sw)
};
const failed=Object.entries(checks).filter(([,ok])=>!ok).map(([name])=>name);
console.log(JSON.stringify({passed:Object.keys(checks).length-failed.length,total:Object.keys(checks).length,checks},null,2));
if(failed.length){console.error('FAILED:',failed.join(', '));process.exit(1)}
