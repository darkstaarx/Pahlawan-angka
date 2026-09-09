// Pahlawan Angka — synchronous Year 2 curriculum v2 loader v3.62.12
(function(){
'use strict';
const V='3.62.12';
if(window.PAY2CurriculumV2?.version===V)return;
const files=[
 'data/kssr/year2-competencies-v2.js',
 `questions/kssr-year2-v2-runtime-v${V}.js`,
 `questions/kssr-year2-v2-unit1-v${V}.js`,
 `questions/kssr-year2-v2-unit2-v${V}.js`,
 `questions/kssr-year2-v2-unit34-v${V}.js`,
 `questions/kssr-year2-v2-unit56-v${V}.js`,
 `questions/kssr-year2-v2-unit78-v${V}.js`,
 `questions/kssr-year2-curriculum-v2-v${V}.js`,
 `questions/kssr-year2-adaptive-v${V}.js`,
 `questions/kssr-year2-smoke-v${V}.js`
];
if(document.readyState==='loading'){
 for(const src of files){if(!document.querySelector(`script[src^="${src}"]`))document.write(`<script src="${src}?v=${V}"><\/script>`);}
 return;
}
let i=0;const next=()=>{if(i>=files.length)return;const src=files[i++];if(document.querySelector(`script[src^="${src}"]`)){next();return}const s=document.createElement('script');s.src=`${src}?v=${V}`;s.async=false;s.onload=next;document.head.appendChild(s);};next();
})();