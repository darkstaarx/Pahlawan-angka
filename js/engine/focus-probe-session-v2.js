/* Pahlawan Angka — bounded, test-only Focus v2 D2 probe session. */
(function(root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PAFocusProbeSessionV2 = api;
})(typeof window !== 'undefined' ? window : undefined, function() {
  'use strict';
  const VERSION = '0.2.0-test-only';
  const OUTCOMES = new Set(['independent', 'corrected', 'assisted', 'unresolved']);
  const SUPPORTED = new Set(['div.facts', 'div.regroup']);
  const text = x => String(x == null ? '' : x).trim();
  const num = x => Number.isInteger(x) ? x : Number(x);
  const digits = x => String(Math.abs(x)).length;
  function makeQuestion(origin, grade, spec, serial) {
    const money = !!spec.money, skill = money ? 'D2.4.5' : 'D2.2.4';
    const eq = spec.equationIdentity || `${spec.dividend}/${spec.divisor}`;
    const fingerprint = `d2-probe|${spec.family}|${eq}|${money ? 'money' : 'plain'}|${spec.regroup ? 'regroup' : 'basic'}`;
    const id = `focus-v2-${fingerprint.replace(/[^a-z0-9|]+/gi, '-').replace(/\|/g, '-')}-${serial}`;
    let prompt, answer, wrong, representation = 'symbolic', demand = 'procedure';
    let operands = { dividend: spec.dividend, divisor: spec.divisor, quotient: spec.quotient, unit: money ? 'RM' : 'integer' };
    if (spec.family === 'grouping') {
      representation = 'manipulative'; demand = 'concept';
      const objects = Number(spec.dividend), groups = Number(spec.divisor), each = Number(spec.quotient);
      prompt = `${objects} objek diagihkan sama rata ke dalam ${groups} kotak. Pilih susunan yang betul.`;
      answer = `${each} objek dalam setiap kotak`;
      const groupingWrong = [groups, objects, each + 1, Math.max(1, each - 1), objects + groups]
        .map(x => `${x} objek dalam setiap kotak`).filter((v, i, a) => v !== answer && a.indexOf(v) === i).slice(0, 3);
      wrong = groupingWrong.map(v => ({ v, tag: 'authored_distractor' }));
      operands = { objects, groups, each, unit: 'objects' };
    } else {
      const total = Number(spec.dividend);
      prompt = money ? `RM${total.toFixed(2)} diagihkan sama rata kepada ${spec.divisor} orang. Berapakah setiap orang menerima?` : (spec.regroup ? `${total} objek diagihkan sama rata kepada ${spec.divisor} kumpulan. Berapakah setiap kumpulan?` : `${total} ÷ ${spec.divisor} = ?`);
      answer = money ? `RM${spec.quotient.toFixed(2)}` : String(spec.quotient);
      const candidates = [spec.quotient + 1, spec.divisor, spec.quotient - 1, spec.dividend], seen = new Set([answer]);
      wrong = candidates.map(x => money ? `RM${Number(x).toFixed(2)}` : String(x)).filter(x => !seen.has(x) && seen.add(x)).slice(0, 3).map(v => ({ v, tag: 'authored_distractor' }));
      representation = money ? 'contextual' : (spec.regroup ? 'contextual' : 'symbolic'); demand = spec.transfer ? 'transfer' : (money ? 'application' : 'procedure');
    }
    const profile = { operationFamilies: ['division'], operands, operandDimensions: { dividendDigits: digits(spec.dividend || 18), divisorDigits: digits(spec.divisor || 3), quotientDigits: digits(spec.quotient || 6), canHaveRemainder: false, usesRegrouping: !!spec.regroup, decimalPlaces: 0 }, steps: spec.regroup ? ['partition_tens', 'regroup_ones', 'divide'] : ['divide'] };
    const tag = { schema: 'pa.focus.question-tag.v1', tagOrigin: 'authored', originSkillId: skill, contextDomain: money ? 'money' : 'operations', diagnosticFamily: spec.family, arithmeticProfile: profile,
      probes: { foundationIds: spec.family === 'grouping' ? ['div.equal_sharing'] : (spec.regroup ? ['div.regroup'] : ['div.facts']), conceptIds: money ? ['money.ringgit_sen', 'money.equal_sharing_application'] : [], diagnosticPurpose: spec.purpose || 'contrast_plain' },
      evidence: { questionFamilyKey: spec.family === 'grouping' ? 'equal_group_model' : (spec.regroup ? 'division_regroup' : (money ? 'money_equal_sharing' : 'division_basic_fact')), variantFingerprint: fingerprint, representation, demand, misconceptionTargets: [], difficultyBand: spec.regroup ? 3 : 2, tagRevision: 'focus-v2-probe' } };
    const q = { id, token: id, questionKey: id, skill, schoolGrade: grade, prompt, answer, wrong, equationIdentity: eq, equationFingerprint: fingerprint, focusDiagnosticV1: tag, arithmeticProfile: profile, assessmentAlignment: { grade, originSkillId: origin, probeGrade: 2 }, probePhase: spec.phase || 'contrast' };
    if(spec.family==='grouping')q.groupModel={objects:spec.dividend,groups:spec.divisor,each:spec.quotient};
    if (money) q.money = { currency: 'MYR', minorUnit: 'sen', totalMinor: spec.dividend * 100, normalizedRM: `${spec.dividend.toFixed(2)} / ${spec.divisor} = ${spec.quotient.toFixed(2)}` };
    return Object.freeze(q);
  }
  function createSession(options = {}, engine) {
    if (!engine || typeof engine.evaluate !== 'function') throw new TypeError('Pure FocusDiagnosisV2 evaluator required');
    const origin = text(options.originSkillId); if (!origin) throw new TypeError('originSkillId required');
    const grade = num(options.schoolGrade); if (!Number.isInteger(grade) || grade < 1 || grade > 6) throw new TypeError('schoolGrade must be 1..6');
    const requested = Number.isInteger(options.maxAttempts) ? options.maxAttempts : 16, maxAttempts = Math.min(16, Math.max(11, requested));
    const base = [['division_fact', 24, 4, false], ['money', 24, 4, true], ['division_fact', 36, 6, false], ['money', 36, 6, true], ['grouping', 18, 3, false], ['regroup_div', 64, 4, false], ['regroup_div', 68, 4, false]];
    const questions = base.map((x, i) => makeQuestion(origin, grade, { family: x[0], dividend: x[1], divisor: x[2], quotient: x[1] / x[2], money: x[3], regroup: x[0] === 'regroup_div', phase: 'contrast' }, i));
    const issued = new Map(), observations = [], seen = new Set();
    let cursor = 0, pending = null, phase = 'contrast', candidate = null, recovery = [], transferIssued = 0, transferStreak = 0, attempts = 0, stopped = false;
    const recoverySpecs = { 'div.facts': [[12, 3], [20, 4], [30, 5], [56, 7]], 'div.regroup': [[72, 3], [76, 4], [52, 4], [56, 4]] };
    const transferSpecs = { 'div.facts': [[48, 6, true], [32, 4, false], [60, 5, true], [42, 6, false]], 'div.regroup': [[92, 4, false], [96, 4, true], [84, 3, false], [72, 4, true]] };
    function obs(q, outcome) { const tag = q.focusDiagnosticV1; return { family: tag.diagnosticFamily, probe: q.equationFingerprint, result: outcome, purpose: phase === 'transfer' ? 'transfer_verify' : tag.probes.diagnosticPurpose, originSkillId: origin }; }
    function report() {
      const result = engine.evaluate({ originSkillId: origin, observations: observations.slice() }), verification = transferStreak >= 2 ? 'transfer_observed' : 'not_yet_verified';
      return Object.freeze({ ...result, version: VERSION, sessionPhase: phase, candidate, schoolGrade: grade, attempts, stopped, verification, transferObserved: verification === 'transfer_observed', recovery: { candidate, independentPrerequisites: recovery.filter(x => x.result === 'independent').length, transferIndependentStreak: transferStreak, supported: !candidate || SUPPORTED.has(candidate) } });
    }
    function next() {
      if (pending) return null;
      if (stopped) return null;
      if (attempts >= maxAttempts) { stopped = true; phase = 'stopped'; return null; }
      let q;
      if (phase === 'contrast') q = questions[cursor++];
      else if (phase === 'recovery') { const pair = recoverySpecs[candidate]; if (!pair) { phase = 'blocked'; stopped = true; return null; } const [d, div] = pair[recovery.length % pair.length]; q = makeQuestion(origin, grade, { family: candidate === 'div.regroup' ? 'regroup_div' : 'grouping', dividend: d, divisor: div, quotient: d / div, regroup: candidate === 'div.regroup', phase: 'recovery', purpose: 'prerequisite_probe' }, 100 + recovery.length); }
      else if (phase === 'transfer') { const slots = transferSpecs[candidate] || []; if (!slots[transferIssued]) { stopped = true; phase = 'stopped'; return null; } const [d, div, money] = slots[transferIssued++]; q = makeQuestion(origin, grade, { family: 'transfer_verify', dividend: d, divisor: div, quotient: d / div, money, regroup: candidate === 'div.regroup', transfer: true, phase: 'transfer', purpose: 'transfer_verify' }, 200 + transferIssued); }
      if (!q) { stopped = true; phase = 'stopped'; return null; } pending = q; issued.set(q.id, q); return q;
    }
    function record(q, response = {}) {
      if (stopped || !pending || q !== pending) return { accepted: false, reason: 'not-current-question' };
      const outcome = text(response.outcome); if (!OUTCOMES.has(outcome)) return { accepted: false, reason: 'invalid-outcome' };
      const probeKey = q.focusDiagnosticV1.diagnosticFamily + '|' + q.equationFingerprint; if (seen.has(probeKey)) { pending = null; return { accepted: false, reason: 'duplicate-equation' }; }
      seen.add(probeKey); pending = null; attempts++; observations.push(obs(q, outcome));
      if (phase === 'contrast' && cursor >= questions.length) { const r = engine.evaluate({ originSkillId: origin, observations: observations.slice() }); candidate = r.rootCause || null; if (candidate && SUPPORTED.has(candidate)) phase = 'recovery'; else { phase = candidate ? 'blocked' : 'stopped'; stopped = true; } }
      else if (phase === 'recovery') { recovery.push({ result: outcome, q }); if (recovery.filter(x => x.result === 'independent').length >= 2) phase = 'transfer'; else if (recovery.length >= 4) { phase = 'blocked'; stopped = true; } }
      else if (phase === 'transfer') { transferStreak = outcome === 'independent' ? transferStreak + 1 : 0; if (transferStreak >= 2 || transferIssued >= 4) { phase = 'stopped'; stopped = true; } }
      return { accepted: true, outcome, report: report() };
    }
    return Object.freeze({ version: VERSION, originSkillId: origin, schoolGrade: grade, next, record, evaluate: report, state: () => Object.freeze({ phase, candidate, attempts, stopped, pending: !!pending, issued: issued.size }) });
  }
  return Object.freeze({ version: VERSION, createSession });
});
