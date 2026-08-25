#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const repo=path.resolve(process.argv[2]||path.join(__dirname,'..'));
let checks=0;function ok(v,m){checks++;assert(v,m)}function eq(a,b,m){checks++;assert.deepStrictEqual(a,b,m)}

function buildCtx(){
  const ctx={console, Math, Date, Set, Array, Object, String, Number, JSON, RegExp};
  ctx.window=ctx; ctx.globalThis=ctx;
  ctx.document = { querySelector: () => null, addEventListener: () => {} };
  vm.createContext(ctx);
  function load(rel){vm.runInContext(fs.readFileSync(path.join(repo,rel),'utf8'),ctx,{filename:rel});}
  load('questions/v2/dist/runtime.js');
  load('questions/v2/engine/d3-rollout.js');
  load('questions/v2/engine/legacy-adapter.js');
  ctx.PAD3Topic7LiveCutover = { authorizeLive: (skillId) => ({ allowed: skillId === 'D3.SHAPE' }) };
  ctx.PA_QSV2_FLAGS = {};
  return ctx;
}

function makeRng(seedBase){let s=seedBase;return ()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff;};}

function runSession(bridge, legacySkillId, mastery, nQuestions, rng) {
  const history = [], fingerprints = [];
  const state = { mastery, evidence: 5, confidence: mastery - 5, correct: 4, wrong: 1 };
  const out = [];
  for (let i = 0; i < nQuestions; i++) {
    const q = bridge.tryGenerate(legacySkillId, state, { history, recentFingerprints: fingerprints, stateRoot: { skills: {} }, rng });
    if (!q) { out.push(null); continue; }
    const fp = (q.prompt || '') + '|' + (q.answer != null ? q.answer : '');
    fingerprints.push(fp);
    const entry = { competencyId: q.competencyId, templateId: q.templateId, archetypeId: q.archetypeId, representation: q.representation, demand: q.demand, difficultyBand: q.difficultyBand, prompt: q.prompt, answer: q.answer, wrong: q.wrong };
    history.push(entry);
    out.push(entry);
  }
  return out;
}

function longestRAStreak(entries) {
  let cur = 0, max = 0;
  for (const e of entries) {
    if (e && (e.demand === 'reasoning' || e.demand === 'application')) { cur++; max = Math.max(max, cur); } else cur = 0;
  }
  return max;
}

// =======================================================================
// 1. New templates are reachable, carry correct metadata, and are
// arithmetically correct at scale.
// =======================================================================
{
  const ctx = buildCtx(); const bridge = ctx.PAQuestionSystemV2Bridge;
  bridge.setPilotMode('live', false);
  const newArchetypes = ['direct_addition_fluency', 'direct_subtraction_fluency', 'missing_addend_fluency', 'direct_two_step_fluency'];
  let checkedNew = 0;
  for (let seed = 1; seed <= 15; seed++) {
    const entries = runSession(bridge, 'D3.ADD10000', [15,45,60,85][seed%4], 300, makeRng(1000+seed*97))
      .concat(runSession(bridge, 'D3.SUB10000', [15,45,60,85][seed%4], 300, makeRng(2000+seed*97)))
      .filter(x => x);
    for (const e of entries) {
      if (!newArchetypes.includes(e.archetypeId)) continue;
      checkedNew++;
      ok(e.demand === 'procedure', `${e.archetypeId}: demand is procedure`);
      ok(e.representation === 'symbolic', `${e.archetypeId}: representation is symbolic`);
      ok(typeof e.difficultyBand === 'number' && e.difficultyBand >= 1, `${e.archetypeId}: valid difficultyBand`);
      const choices = [e.answer, ...e.wrong.map(w => w.v)].map(x => String(x).trim().toLowerCase());
      eq(new Set(choices).size, 4, `${e.archetypeId}: 4 semantically unique choices`);
      const text = e.prompt.replace(/<[^>]*>/g, '');
      let m, expected = null;
      if (m = text.match(/^(\d+) \+ (\d+) = \?/)) expected = Number(m[1]) + Number(m[2]);
      else if (m = text.match(/^(\d+) − (\d+) = \?/)) expected = Number(m[1]) - Number(m[2]);
      else if (m = text.match(/^(\d+) \+ ___ = (\d+)/)) expected = Number(m[2]) - Number(m[1]);
      else if (m = text.match(/^(\d+) \+ (\d+) − (\d+) = \?/)) expected = Number(m[1]) + Number(m[2]) - Number(m[3]);
      if (expected !== null) eq(Number(e.answer), expected, `${e.archetypeId}: arithmetic correct (${text} -> ${e.answer})`);
    }
  }
  ok(checkedNew > 200, `a substantial number of new-template samples were checked (got ${checkedNew})`);
}

// =======================================================================
// 2. D3.ADD10000 / D3.SUB10000 distribution: procedure share materially
// present and roughly 30-40%, zero-procedure sessions eliminated, longest
// reasoning/application streak substantially below the prior 20-extreme,
// original reasoning/application archetypes remain reachable.
// =======================================================================
{
  const ctx = buildCtx(); const bridge = ctx.PAQuestionSystemV2Bridge;
  bridge.setPilotMode('live', false);
  const skills = ['D3.ADD10000', 'D3.SUB10000', 'D3.MUL', 'D3.DIV'];
  const masteryLevels = [15, 45, 60, 85];
  let zeroProcSessions = 0, totalSessions = 0, maxRAStreak = 0, procCount = 0, totalQ = 0;
  const seenArchetypes = new Set();
  for (let r = 0; r < 60; r++) {
    const skill = skills[r % skills.length];
    const mastery = masteryLevels[r % masteryLevels.length];
    const entries = runSession(bridge, skill, mastery, 20, makeRng(5000 + r * 53)).filter(x => x);
    for (const e of entries) seenArchetypes.add(e.archetypeId);
    if (skill === 'D3.ADD10000' || skill === 'D3.SUB10000') {
      totalSessions++;
      const hasProc = entries.some(e => e.demand === 'procedure');
      if (!hasProc) zeroProcSessions++;
      procCount += entries.filter(e => e.demand === 'procedure').length;
      totalQ += entries.length;
      maxRAStreak = Math.max(maxRAStreak, longestRAStreak(entries));
    }
  }
  const procShare = 100 * procCount / totalQ;
  ok(zeroProcSessions === 0, `zero-procedure sessions eliminated (found ${zeroProcSessions}/${totalSessions})`);
  ok(procShare >= 25 && procShare <= 45, `procedure share roughly in the 30-40% target range (got ${procShare.toFixed(1)}%)`);
  ok(maxRAStreak <= 6, `longest reasoning/application streak substantially below the prior 20-question extreme (got ${maxRAStreak})`);
  ok(maxRAStreak >= 1, `reasoning/application content still genuinely occurs (streak ${maxRAStreak} > 0)`);
  for (const a of ['word_problem_result', 'word_problem_missing_part', 'choose_operation_from_context', 'mixed_add_then_subtract', 'mixed_subtract_then_add', 'choose_expression_for_two_step']) {
    ok(seenArchetypes.has(a), `original archetype ${a} remains reachable`);
  }
  for (const a of ['direct_addition_fluency', 'direct_subtraction_fluency', 'missing_addend_fluency', 'direct_two_step_fluency']) {
    ok(seenArchetypes.has(a), `new archetype ${a} is reachable`);
  }
}

// =======================================================================
// 3. MUL/DIV remain healthy (unaffected by this patch).
// =======================================================================
{
  const ctx = buildCtx(); const bridge = ctx.PAQuestionSystemV2Bridge;
  bridge.setPilotMode('live', false);
  for (const skill of ['D3.MUL', 'D3.DIV']) {
    const entries = runSession(bridge, skill, 60, 300, makeRng(9000 + skill.length)).filter(x => x);
    const demandSet = new Set(entries.map(e => e.demand));
    eq([...demandSet].sort(), ['concept', 'procedure', 'reasoning'], `${skill}: demand pool unchanged (procedure/concept/reasoning)`);
  }
}

// =======================================================================
// 4. T1, T3, other non-T7, and T7 remain materially unchanged (spot
// check against the documented pre-patch baseline).
// =======================================================================
{
  const ctx = buildCtx(); const bridge = ctx.PAQuestionSystemV2Bridge;
  bridge.setPilotMode('live', false);
  function demandPctMulti(skills, n, mastery) {
    let entries = [];
    for (const skill of skills) entries = entries.concat(runSession(bridge, skill, mastery, n, makeRng(7000 + skill.length)).filter(x => x));
    const c = {}; for (const e of entries) c[e.demand] = (c[e.demand] || 0) + 1;
    return Object.fromEntries(Object.entries(c).map(([k, v]) => [k, +(100 * v / entries.length).toFixed(1)]));
  }
  const t1 = demandPctMulti(['D3.N10000', 'D3.PV10000'], 300, 60);
  ok(Math.abs((t1.procedure || 0) - 11.8) < 5, `D3.T1 procedure share materially unchanged (got ${t1.procedure})`);
  const t3 = demandPctMulti(['D3.FRAC', 'D3.DEC', 'D3.PERCENT'], 300, 60);
  ok(Math.abs((t3.procedure || 0) - 25) < 8, `D3.T3 procedure share materially unchanged (got ${t3.procedure})`);
  const t7 = demandPctMulti(['D3.SHAPE'], 300, 60);
  ok(Math.abs((t7.procedure || 0) - 5) < 5, `D3.T7 procedure share materially unchanged (got ${t7.procedure})`);
  ok((t7.reasoning || 0) > 30, `D3.T7 reasoning share remains dominant, unaffected (got ${t7.reasoning})`);
}

console.log(JSON.stringify({ status: 'pass', checks, newTemplates: ['D3-T2-211-direct_add-v1', 'D3-T2-211-direct_subtract-v1', 'D3-T2-212-missing_addend-v1', 'D3-T2-212-direct_two_step-v1'], totalD3Templates: 162 }, null, 2));
