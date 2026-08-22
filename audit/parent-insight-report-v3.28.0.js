const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'js/parent-learning-tools-v3.26.0.js'),'utf8');
const failures=[];
const check=(name,value)=>{if(!value)failures.push(name)};

check('two-page-only',/footer\(ctx,1,'Pahlawan Angka \| Ringkasan penjaga'\).*footer\(ctx,2,'Pahlawan Angka \| Bukti pembelajaran'\)/s.test(source));
check('no-all-skills-pagination',!/const chunks=\[\];for\(let i=0;i<snap\.skills\.length;i\+=9\)/.test(source));
check('aha-headline',/bukan lemah dalam semua Matematik/.test(source));
check('cause-language',/PUNCA PALING MUNGKIN/.test(source)&&/reportDiagnosis/.test(source));
check('evidence-comparison',/jurang \$\{gap\} mata peratus/.test(source));
check('confidence-label',/CORAK JELAS/.test(source)&&/PETUNJUK BERGUNA/.test(source)&&/BUKTI AWAL/.test(source));
check('seven-day-action',/PELAN 7 HARI/.test(source)&&/REPORT_ACTIONS/.test(source));
check('parent-script',/AYAT YANG BOLEH DIGUNAKAN/.test(source));
check('uncertainty-visible',/APA YANG LAPORAN INI BELUM BOLEH SIMPULKAN/.test(source));
check('limited-skill-detail',/slice\(0,3\)/.test(source));
check('clinical-caveat',/bukan diagnosis klinikal/.test(source));

// Exercise the diagnosis with deterministic learner evidence, not only source-text checks.
const diagnosisSource=source.slice(source.indexOf('const REPORT_ACTIONS='),source.indexOf('function reportSkillRow'))+'\nthis.reportDiagnosis=reportDiagnosis;';
const sandbox={
 topMisEntry:s=>Object.entries(s.mis||{}).sort((a,b)=>b[1]-a[1])[0]||null,
 PARENT_MISCONCEPTION_COPY:{place:'nilai tempat belum dibezakan dengan konsisten'}
};
vm.createContext(sandbox);
vm.runInContext(diagnosisSource,sandbox);
const lead={m:{title:'Tambah hingga 1 000'},s:{correct:2,hints:4,mis:{place:3}},attempts:10,accuracy:20};
const steady={m:{title:'Nombor hingga 1 000'},s:{correct:8,hints:0,mis:{}},attempts:10,accuracy:80};
const diagnosis=sandbox.reportDiagnosis({name:'Umar',priority:[lead],developing:[],strong:[steady],tested:[lead,steady],accuracy:50});
check('diagnosis-identifies-lead',diagnosis.lead===lead&&/Tambah hingga 1 000/.test(diagnosis.headline));
check('diagnosis-computes-gap',/80% pada kemahiran lain/.test(diagnosis.evidence)&&/jurang 60 mata peratus/.test(diagnosis.evidence));
check('diagnosis-uses-repeated-pattern',diagnosis.confidence==='CORAK JELAS'&&/nilai tempat/.test(diagnosis.cause));
check('diagnosis-gives-specific-action',/ratus, puluh dan sa/.test(diagnosis.action));
const early=sandbox.reportDiagnosis({name:'Umar',priority:[],developing:[],strong:[],tested:[],accuracy:0});
check('diagnosis-respects-insufficient-evidence',early.confidence==='BUKTI AWAL'&&early.lead===null&&/Belum cukup/.test(early.cause));

const report={status:failures.length?'fail':'pass',failures};
console.log(JSON.stringify(report,null,2));
process.exitCode=failures.length?1:0;
