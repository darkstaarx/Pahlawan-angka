#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const engine = require('../js/engine/focus-diagnosis-v2.js');
const probe = require('../js/engine/focus-probe-session-v2.js');
let checks = 0; const check = (v, m) => { assert(v, m); checks++; };
function initialOutcome(q, kind) {
  const f = q.focusDiagnosticV1.diagnosticFamily;
  if (kind === 'facts') return f === 'division_fact' ? 'unresolved' : 'independent';
  return f === 'regroup_div' ? 'unresolved' : 'independent';
}
function journey(kind, transferOutcome = () => 'independent') {
  const s = probe.createSession({ originSkillId: 'D2.2.4', schoolGrade: 2 }, engine); let q, phase = 'initial', transfer = 0, all = [];
  while ((q = s.next())) {
    all.push(q); check(s.next() === null, 'one pending question only');
    let outcome = phase === 'initial' ? initialOutcome(q, kind) : (phase === 'recovery' ? 'independent' : transferOutcome(q, transfer++));
    const r = s.record(q, { outcome }); check(r.accepted, 'current question accepted');
    phase = r.report.sessionPhase === 'recovery' ? 'recovery' : (r.report.sessionPhase === 'transfer' ? 'transfer' : phase);
    if (r.report.transferObserved) break;
  }
  return { s, all };
}
const first = journey('facts');
check(first.s.evaluate().candidate === 'div.facts', 'facts candidate'); check(first.s.evaluate().verification === 'transfer_observed', 'facts transfer observed');
const transferFacts = first.all.filter(q => q.probePhase === 'transfer'); check(transferFacts.length === 2, 'two fresh facts transfers');
const regroup = journey('regroup');
check(regroup.s.evaluate().candidate === 'div.regroup', 'regroup candidate'); check(regroup.s.evaluate().verification === 'transfer_observed', 'regroup transfer observed');
check(regroup.all.filter(q => q.probePhase === 'recovery').every(q => q.arithmeticProfile.operandDimensions.usesRegrouping === true), 'regroup prerequisites are actual regroup');
check(regroup.all.filter(q => q.probePhase === 'transfer').every(q => q.arithmeticProfile.operandDimensions.usesRegrouping === true), 'regroup transfers are actual regroup');
const money = first.all.find(q => q.money); check(money.skill === 'D2.4.5' && money.focusDiagnosticV1.originSkillId === 'D2.4.5', 'money skill tag'); check(money.money.minorUnit === 'sen' && money.money.totalMinor === 2400 && /24\.00/.test(money.money.normalizedRM), 'money numeric metadata');
const plain = first.all.find(q => !q.money && q.equationIdentity === '24/4'); check(JSON.stringify(plain.arithmeticProfile.operands).replace('integer', 'RM') === JSON.stringify(money.arithmeticProfile.operands), 'paired arithmetic load'); check(plain.equationFingerprint !== money.equationFingerprint, 'paired context fingerprints distinct');
for (const q of first.all) { check(q.focusDiagnosticV1.contextDomain === (q.money ? 'money' : 'operations'), 'contract context'); check(['symbolic', 'contextual', 'manipulative'].includes(q.focusDiagnosticV1.evidence.representation), 'contract representation'); check([1, 2, 3, 4].includes(q.focusDiagnosticV1.evidence.difficultyBand), 'numeric difficulty'); if (q.wrong) { const values = q.wrong.map(x => x.v); check(new Set(values).size === values.length && !values.includes(q.answer), 'unique wrong choices'); } }
const grouping = first.all.find(q => q.focusDiagnosticV1.diagnosticFamily === 'grouping'); check(grouping.focusDiagnosticV1.evidence.representation === 'manipulative' && grouping.answer === '6 objek dalam setiap kotak', 'validated equal-group model');
const prereq = first.all.filter(q => q.probePhase === 'recovery' && q.focusDiagnosticV1.diagnosticFamily === 'grouping'); check(prereq.length === 2 && prereq[0].answer === '4 objek dalam setiap kotak' && prereq[1].answer === '5 objek dalam setiap kotak', 'recovery grouping equations rendered'); check(prereq[0].equationFingerprint !== prereq[1].equationFingerprint && prereq[0].prompt !== prereq[1].prompt, 'recovery grouping tasks vary');
const pending = probe.createSession({ originSkillId: 'D2.2.4', schoolGrade: 2 }, engine), pq = pending.next(); check(pending.record({ ...pq }, { outcome: 'independent' }).accepted === false, 'stale clone rejected'); check(pending.record(pq, { outcome: 'independent' }).accepted, 'current object accepted');
const hint = probe.createSession({ originSkillId: 'D2.2.4', schoolGrade: 2 }, engine); let hq, hi = 0; while ((hq = hint.next())) { const f = hq.focusDiagnosticV1.diagnosticFamily; hint.record(hq, { outcome: f === 'division_fact' ? 'unresolved' : (hi++ > 6 ? 'assisted' : 'independent') }); if (hi > 20) break; } check(hint.evaluate().verification !== 'transfer_observed', 'assisted does not verify'); check(hint.evaluate().attempts <= 16, 'finite attempts');
const d6 = probe.createSession({ originSkillId: 'D6.OPS', schoolGrade: 6 }, engine), dq = d6.next(); check(dq.schoolGrade === 6 && dq.assessmentAlignment.grade === 6, 'D6 grade preserved');
const duplicate = probe.createSession({ originSkillId: 'D2.2.4', schoolGrade: 2 }, engine), one = duplicate.next(); check(duplicate.record(one, { outcome: 'unresolved' }).accepted, 'first record'); check(!duplicate.record(one, { outcome: 'unresolved' }).accepted, 'duplicate rejected');
for(const kind of ['facts','regroup'])for(const outcome of ['assisted','unresolved','corrected']){
 const s=probe.createSession({originSkillId:'D2.2.4',schoolGrade:2},engine);let q,n=0;
 while((q=s.next())){check(++n<=16,'non-independent recovery must terminate');if(q.arithmeticProfile.operandDimensions.usesRegrouping){const o=q.arithmeticProfile.operands;check(Math.floor(o.dividend/10)%o.divisor>0&&o.dividend%o.divisor===0,'authored regroup requires tens remainder and exact quotient');}const r=s.record(q,{outcome:q.probePhase==='contrast'?initialOutcome(q,kind):outcome});check(r.accepted,'fresh recovery equation accepted');}
 check(s.state().stopped&&s.state().phase==='blocked','failed recovery terminates blocked');check(!s.evaluate().transferObserved,'failed recovery cannot verify');
}
const retries=journey('regroup',(_,i)=>i===0?'unresolved':'independent');check(retries.s.evaluate().transferObserved,'recovery with transfer retry');for(const q of retries.all.filter(x=>x.arithmeticProfile.operandDimensions.usesRegrouping)){const o=q.arithmeticProfile.operands;check(Math.floor(o.dividend/10)%o.divisor>0&&o.dividend%o.divisor===0,'regroup transfer retry arithmetic validated');}
console.log(JSON.stringify({ status: 'focus_v2_probe_session_pass', checks }));
