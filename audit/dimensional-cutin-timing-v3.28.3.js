const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..'),failures=[];
const read=file=>fs.readFileSync(path.join(root,file),'utf8'),check=(name,value)=>{if(!value)failures.push(name)};
const portal=read('js/engine/dimensional-portal.js'),phase=read('js/phase-3.6.4.js'),version=read('js/version.js');
check('minimum-readable-duration',/Math\.max\(1800,Number\(duration\)\|\|0\)/.test(portal));
check('summon-copy-retained',/Masa untuk Cikgu Dimensi!/.test(portal));
check('portal-cache-busted',/dimensional-portal\.js\?v=0\.2\.4/.test(phase));
check('release-version',/3\.28\.3/.test(version));
const report={status:failures.length?'fail':'pass',failures};console.log(JSON.stringify(report,null,2));process.exitCode=failures.length?1:0;
