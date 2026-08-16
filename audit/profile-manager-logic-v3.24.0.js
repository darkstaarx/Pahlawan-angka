const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync('js/profile-manager-v3.24.0.js','utf8');

// Extract and execute only transitionGrade to validate grade-change state behavior without a browser.
const match=src.match(/function transitionGrade\(snapshot,newGrade\)\{([\s\S]*?)\n\}\n\nasync function mirrorProfileIntoSave/);
assert(match,'transitionGrade function not found');
const code=`function transitionGrade(snapshot,newGrade){${match[1]}\n}`;
vm.runInThisContext(code);

let s={schoolGrade:2,coreFrontier:6,completedMissions:{1:true,2:true},chapterStars:{1:3},activeMissionChapter:'3',focus:'D2.1.1'};
transitionGrade(s,3);
assert.equal(s.schoolGrade,3);
assert.equal(s.coreFrontier,1);
assert.deepEqual(s.completedMissions,{});
assert.equal(s.activeMissionChapter,null);
assert.equal(s.focus,null);
assert.equal(s.gradeProgressArchive['2'].coreFrontier,6);
s.coreFrontier=4;s.completedMissions={1:true};
transitionGrade(s,2);
assert.equal(s.schoolGrade,2);
assert.equal(s.coreFrontier,6);
assert.deepEqual(s.completedMissions,{1:true,2:true});
assert.equal(s.activeMissionChapter,'3');

console.log('PASS v3.24.0 logic: grade progress archives and restores without copying another grade frontier');
