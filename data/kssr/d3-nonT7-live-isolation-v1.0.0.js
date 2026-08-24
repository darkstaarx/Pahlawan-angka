// Pahlawan Angka — Phase 3A-3 R3: generic D3 non-Topic-7 QSv2 LIVE mastery isolation.
//
// Additive companion to:
//   data/kssr/d3-topic7-live-cutover-v3.40.0.js
//   data/kssr/d3-topic7-evidence-epoch-v3.39.0.js
// Both remain byte-for-byte unchanged. This module mirrors their
// capture/restore mechanics and evidence-recording contract for any D3
// topic OTHER than D3.T7. It deliberately duplicates a small amount of
// persist/store-shape logic rather than importing from the T7 files, to
// keep those files at zero diff.
//
// Contract (mirrors PAD3Topic7LiveCutover / PAD3Topic7Evidence shapes):
//   isTargetQuestion(question) -> boolean
//   newAttemptId(question, token) -> string|null
//   captureLegacyState(question, skillState) -> clone|null
//   restoreLegacyState(question, skillState, snapshot) -> boolean
//   recordBattleResult(stateRoot, question, session, finalCorrect) -> {accepted, reason}
//   summary(stateRoot, topicId) -> {ok, ...}
//
// Evidence is stored in the SAME top-level store as T7
// (stateRoot.qsv2Evidence), which already keys by topic under `.topics`.
// This module only ever writes to topics[topicId] for topicId !== 'D3.T7'.
(function (root) {
  'use strict';

  var VERSION = '1.0.0';
  var SCHEMA_VERSION = 1;
  var STORE_KEY = 'qsv2Evidence';
  var MAX_RECENT_ATTEMPTS = 120;

  function now() { return Date.now(); }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function num(v) { v = Number(v); return Number.isFinite(v) ? v : 0; }
  function text(v, max) { return String(v == null ? '' : v).slice(0, max || 160); }

  // A question is an isolation target for THIS module only when it is a
  // live QSv2 question for a D3 topic other than T7. T7 questions are
  // never true here (qsv2Live is topic-agnostic, but the topicId!=='D3.T7'
  // guard below is what actually excludes them; T7's own module still
  // recognises T7 questions independently via its unchanged qsv2Pilot
  // check, so the two gates are mutually exclusive by construction).
  function isTargetQuestion(question) {
    return !!(question && question.source === 'qsv2' && question.qsv2Live === true &&
      question.topicId && question.topicId !== 'D3.T7' &&
      question.legacySkillId && question.standardId && question.competencyId);
  }

  function newAttemptId(question, token) {
    if (!isTargetQuestion(question)) return null;
    var rand = Math.random().toString(36).slice(2, 8), stamp = now().toString(36);
    return 'nont7-live:' + stamp + ':' + (Number(token) || 0) + ':' + rand;
  }

  // Whole-object capture/restore, identical mechanics to the T7 module.
  function captureLegacyState(question, skillState) {
    return (isTargetQuestion(question) && skillState) ? clone(skillState) : null;
  }
  function restoreLegacyState(question, skillState, snapshot) {
    if (!isTargetQuestion(question) || !skillState || !snapshot) return false;
    Object.keys(skillState).forEach(function (k) { delete skillState[k]; });
    Object.assign(skillState, clone(snapshot));
    return true;
  }

  function persist(stateRoot) {
    if (!stateRoot) return;
    stateRoot.lastSavedAt = now();
    try { if (root.localStorage && typeof root.localStorage.setItem === 'function') root.localStorage.setItem('pa_coach_v6_full', JSON.stringify(stateRoot)); } catch (_) {}
    try { if (root.PACloud && typeof root.PACloud.scheduleSave === 'function') setTimeout(function () { try { root.PACloud.scheduleSave(); } catch (_) {} }, 0); } catch (_) {}
  }

  function legacySnapshot(skill) {
    return {
      mastery: num(skill && skill.mastery), confidence: num(skill && skill.confidence),
      evidence: num(skill && skill.evidence), correct: num(skill && skill.correct),
      wrong: num(skill && skill.wrong), stability: num(skill && skill.stability)
    };
  }

  function freshCompetency(standardId) {
    return {
      standardId: standardId, attempts: 0, finalCorrect: 0, firstAttemptWrong: 0, cleanCorrect: 0,
      assistedCorrect: 0, incorrect: 0, hintsUsed: 0, families: {}, cleanFamilies: {},
      representations: {}, demands: {}, templates: {}, legacySkillIds: {}, lastSeen: 0, lastTemplateId: null
    };
  }

  function freshTopic(topicId, legacySkill, legacySkillId) {
    var baselineSkills = {};
    if (legacySkill && legacySkillId) baselineSkills[legacySkillId] = legacySnapshot(legacySkill);
    return {
      schemaVersion: SCHEMA_VERSION, topicId: topicId, epochId: topicId + ':qsv2:v1', status: 'shadow_plumbed',
      createdAt: now(),
      legacy: { acceptedForTarget: false, aggregateContinuesOutsideTargetEpoch: true, baselineCapturedAt: now(), baselineSkills: baselineSkills },
      competencies: {}, recentAttemptIds: [], updatedAt: 0
    };
  }

  function ensureStore(stateRoot) {
    var store = stateRoot[STORE_KEY];
    if (store && Number(store.schemaVersion) !== SCHEMA_VERSION) return null;
    if (!store) store = stateRoot[STORE_KEY] = { schemaVersion: SCHEMA_VERSION, topics: {} };
    if (!store.topics || typeof store.topics !== 'object' || Array.isArray(store.topics)) store.topics = {};
    return store;
  }

  function ensureTopic(stateRoot, question) {
    if (!stateRoot) return null;
    var store = ensureStore(stateRoot); if (!store) return null;
    var topic = store.topics[question.topicId];
    if (topic && Number(topic.schemaVersion) !== SCHEMA_VERSION) return null;
    if (!topic) {
      var legacySkill = stateRoot.skills && stateRoot.skills[question.legacySkillId];
      topic = store.topics[question.topicId] = freshTopic(question.topicId, legacySkill, question.legacySkillId);
    }
    if (!Array.isArray(topic.recentAttemptIds)) topic.recentAttemptIds = [];
    if (!topic.competencies || typeof topic.competencies !== 'object') topic.competencies = {};
    return topic;
  }

  function validateQuestion(question) {
    if (!isTargetQuestion(question)) return { ok: false, reason: 'not_qsv2_nonT7_live' };
    if (question.curriculumVersion && text(question.curriculumVersion, 64) !== 'KSSR-E3-2024') return { ok: false, reason: 'curriculum_version_mismatch' };
    return { ok: true };
  }

  function incrementMap(map, key) { key = text(key || 'unknown', 160) || 'unknown'; map[key] = num(map[key]) + 1; }

  function record(stateRoot, question, result) {
    result = result || {};
    var checked = validateQuestion(question);
    if (!checked.ok) return { accepted: false, reason: checked.reason };
    var attemptId = text(result.attemptId, 128);
    if (!attemptId || !/^[A-Za-z0-9:._-]{1,128}$/.test(attemptId)) return { accepted: false, reason: 'invalid_attempt_id' };

    var topic = ensureTopic(stateRoot, question);
    if (!topic) return { accepted: false, reason: 'topic_not_prepared' };
    if (topic.recentAttemptIds.indexOf(attemptId) !== -1) return { accepted: false, reason: 'duplicate_attempt' };

    if (!topic.competencies[question.standardId]) topic.competencies[question.standardId] = freshCompetency(question.standardId);
    var c = topic.competencies[question.standardId];
    var finalCorrect = result.finalCorrect === true, firstAttemptCorrect = result.firstAttemptCorrect === true, usedHint = result.usedHint === true;
    var clean = finalCorrect && firstAttemptCorrect && !usedHint;
    var family = text(question.familyKey, 160) || 'unknown';
    var representation = text(question.representation, 64) || 'unknown';
    var demand = text(question.demand, 64) || 'unknown';
    var templateId = text(question.templateId, 160) || 'unknown';

    c.attempts++;
    if (finalCorrect) c.finalCorrect++; else c.incorrect++;
    if (!firstAttemptCorrect) c.firstAttemptWrong++;
    if (usedHint) c.hintsUsed++;
    if (clean) c.cleanCorrect++; else if (finalCorrect) c.assistedCorrect++;
    incrementMap(c.families, family); incrementMap(c.representations, representation); incrementMap(c.demands, demand);
    incrementMap(c.templates, templateId); incrementMap(c.legacySkillIds, question.legacySkillId);
    c.lastSeen = now(); c.lastTemplateId = templateId;

    topic.recentAttemptIds.push(attemptId);
    if (topic.recentAttemptIds.length > MAX_RECENT_ATTEMPTS) topic.recentAttemptIds = topic.recentAttemptIds.slice(-MAX_RECENT_ATTEMPTS);
    topic.updatedAt = now();
    persist(stateRoot);
    return { accepted: true, reason: 'ok', standardId: question.standardId, attempts: c.attempts };
  }

  function recordBattleResult(stateRoot, question, session, finalCorrect) {
    if (!isTargetQuestion(question)) return { accepted: false, reason: 'not_qsv2_nonT7_live' };
    return record(stateRoot, question, {
      attemptId: question.qsv2AttemptId,
      finalCorrect: finalCorrect === true,
      firstAttemptCorrect: finalCorrect === true && !(session && session.retryState),
      usedHint: !!(session && session.hint)
    });
  }

  function summary(stateRoot, topicId) {
    if (!stateRoot) return { ok: false, reason: 'state_missing' };
    var store = stateRoot[STORE_KEY];
    var topic = store && store.topics && topicId ? store.topics[topicId] : null;
    if (!topic) return { ok: false, reason: 'not_prepared' };
    var totalAttempts = 0;
    Object.keys(topic.competencies || {}).forEach(function (k) { totalAttempts += num(topic.competencies[k].attempts); });
    return { ok: true, topicId: topicId, epochId: topic.epochId, totalAttempts: totalAttempts, competencies: topic.competencies };
  }

  root.PAD3NonT7LiveIsolation = {
    version: VERSION, schemaVersion: SCHEMA_VERSION,
    isTargetQuestion: isTargetQuestion, newAttemptId: newAttemptId,
    captureLegacyState: captureLegacyState, restoreLegacyState: restoreLegacyState,
    recordBattleResult: recordBattleResult, record: record, summary: summary, validateQuestion: validateQuestion,
    _test: { ensureStore: ensureStore, ensureTopic: ensureTopic, freshTopic: freshTopic, freshCompetency: freshCompetency }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
