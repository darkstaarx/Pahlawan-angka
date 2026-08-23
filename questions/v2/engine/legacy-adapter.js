// questions/v2/engine/legacy-adapter.js
//
// Phase 2C controlled browser bridge for the D3 Topic 7 pilot with shadow observability.
//
// Contract:
//   production questions/index.js -> PAQuestionSystemV2Bridge.tryGenerate(...)
//     - feature flag OFF: return null immediately -> legacy bank unchanged
//     - shadow: generate/validate a v2 item but still return null -> legacy item shown
//     - live: return one battle-compatible v2 MCQ
//     - any missing runtime / unsupported item / generation error: return null -> legacy fallback
//
// No production bank is monkey-patched here. The dispatcher calls this bridge
// explicitly, so rollback is one flag (or removal of the one adapter call).
(function (root, factory) {
  'use strict';
  var exported = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = exported;
  if (root && root.document) root.PAQuestionSystemV2Bridge = exported.createBridge(root);
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var CURRICULUM_VERSION = 'KSSR-E3-2024';
  var PILOT_LEGACY_SKILL = 'D3.SHAPE';
  var STORAGE_KEY = 'pa.qsv2.d3Topic7';
  var DEFAULT_MODE = 'shadow';
  var VALID_MODES = { off: true, shadow: true, live: true };
  var seedCounter = 0;

  function normaliseMode(value) {
    if (value === true) return 'live';
    if (value === false || value == null) return 'off';
    var mode = String(value).toLowerCase();
    return VALID_MODES[mode] ? mode : 'off';
  }

  function safeStoredMode(root) {
    try {
      if (!root.localStorage) return DEFAULT_MODE;
      var stored = root.localStorage.getItem(STORAGE_KEY);
      return stored == null ? DEFAULT_MODE : normaliseMode(stored);
    } catch (_) {
      return DEFAULT_MODE;
    }
  }

  function configuredMode(root) {
    var flags = root.PA_QSV2_FLAGS || {};
    if (flags.killSwitch === true) return 'off';
    if (Object.prototype.hasOwnProperty.call(flags, 'd3Topic7')) return normaliseMode(flags.d3Topic7);
    return safeStoredMode(root);
  }

  function makeRng(seed) {
    var a = (seed >>> 0) || 0x6d2b79f5;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function liveRng(root) {
    var now = Date.now() >>> 0;
    var perf = 0;
    try { perf = root.performance && typeof root.performance.now === 'function' ? Math.floor(root.performance.now() * 1000) >>> 0 : 0; } catch (_) {}
    seedCounter = (seedCounter + 1) >>> 0;
    return makeRng((now ^ perf ^ Math.imul(seedCounter, 2654435761)) >>> 0);
  }

  function exactTemplates(runtime, record) {
    return (runtime.templates || []).filter(function (tpl) {
      return tpl.curriculumVersion === record.curriculumVersion &&
        tpl.grade === record.grade &&
        tpl.standardId === record.standardId &&
        tpl.competencyId === record.competencyId &&
        tpl.topicId === record.topicId &&
        tpl.responseType === 'mcq';
    });
  }

  function enabledPilotRecords(runtime, legacySkillId) {
    return (runtime.curriculum || []).filter(function (rec) {
      return rec.curriculumVersion === CURRICULUM_VERSION &&
        rec.grade === 3 &&
        rec.topicId === 'D3.T7' &&
        rec.status === 'enabled' &&
        Array.isArray(rec.legacySkills) && rec.legacySkills.indexOf(legacySkillId) !== -1;
    });
  }

  function countRecent(history, field, value, limit) {
    var rows = (history || []).slice(-(limit || 12));
    var count = 0;
    for (var i = 0; i < rows.length; i++) if (rows[i] && rows[i][field] === value) count++;
    return count;
  }

  function chooseMinScore(items, scoreFn, rng) {
    if (!items.length) return null;
    var best = [], bestScore = Infinity;
    for (var i = 0; i < items.length; i++) {
      var score = scoreFn(items[i]);
      if (score < bestScore) { bestScore = score; best = [items[i]]; }
      else if (score === bestScore) best.push(items[i]);
    }
    return best[Math.floor(rng() * best.length)] || best[0];
  }

  function targetDifficulty(state) {
    var mastery = Number(state && state.mastery);
    if (!Number.isFinite(mastery)) mastery = 50;
    return mastery < 35 ? 1 : mastery < 70 ? 2 : 3;
  }

  function selectTemplate(runtime, legacySkillId, state, history, rng) {
    var records = enabledPilotRecords(runtime, legacySkillId).filter(function (rec) {
      return exactTemplates(runtime, rec).length > 0;
    });
    if (!records.length) return null;

    var last = (history || []).length ? history[history.length - 1] : null;
    // Avoid returning to the same competency within the previous two visible
    // questions when other Topic 7 competencies are available.
    var recordPool = records;
    var cooledRecords = records.filter(function (rec) {
      return countRecent(history, 'competencyId', rec.competencyId, 2) === 0;
    });
    if (cooledRecords.length) recordPool = cooledRecords;

    var record = chooseMinScore(recordPool, function (rec) {
      var score = countRecent(history, 'competencyId', rec.competencyId, 12) * 18;
      score += countRecent(history, 'competencyId', rec.competencyId, 5) * 8;
      if (last && last.competencyId === rec.competencyId) score += 60;
      return score;
    }, rng);

    var targetBand = targetDifficulty(state);
    var templates = exactTemplates(runtime, record);
    // Prefer a template not shown in the previous six questions. If every
    // template for this competency is still in cooldown, fall back to the
    // full set rather than failing generation.
    var freshTemplates = templates.filter(function (tpl) {
      return countRecent(history, 'templateId', tpl.templateId, 6) === 0;
    });
    if (freshTemplates.length) templates = freshTemplates;

    return chooseMinScore(templates, function (tpl) {
      var score = countRecent(history, 'templateId', tpl.templateId, 60) * 28;
      score += countRecent(history, 'templateId', tpl.templateId, 12) * 10;
      score += countRecent(history, 'archetypeId', tpl.archetypeId, 8) * 16;
      score += countRecent(history, 'representation', tpl.representation, 4) * 7;
      score += countRecent(history, 'demand', tpl.demand, 4) * 5;
      score += Math.abs(Number(tpl.difficultyBand || 2) - targetBand) * 4;
      if (last && last.archetypeId === tpl.archetypeId) score += 45;
      if (last && last.representation === tpl.representation) score += 8;
      if (last && last.demand === tpl.demand) score += 5;
      return score;
    }, rng);
  }

  function htmlEscape(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function figureMarker(choiceId, visual) {
    if (!choiceId || !visual || !Array.isArray(visual.figures)) return null;
    for (var i = 0; i < visual.figures.length; i++) {
      if (visual.figures[i] && visual.figures[i].id === choiceId) return String.fromCharCode(65 + i);
    }
    return null;
  }

  function displayChoice(choice, visual) {
    var marker = figureMarker(choice && choice.id, visual);
    if (marker) return marker;
    if (choice && choice.labelMs != null) return String(choice.labelMs);
    return String(choice && choice.id != null ? choice.id : '');
  }

  function hintFor(competencyId) {
    var hints = {
      identify_prism: 'Perhatikan bentuk tapak dan permukaan sisi pepejal.',
      describe_prism_features: 'Kira tapak, permukaan, bucu atau tepi satu demi satu.',
      classify_prism_vs_non_prism: 'Prisma mempunyai dua tapak yang sama bentuk, sama saiz dan selari.',
      identify_regular_polygon: 'Kira sisi dan bucu, kemudian semak sama ada semua sisinya sama panjang.',
      create_regular_polygon_pattern: 'Cari bahagian bentuk yang berulang. Lihat urutan dari awal, kemudian sambungkan corak itu.',
      identify_and_draw_symmetry_axis: 'Bayangkan bentuk dilipat dua. Garis paksi simetri mesti membuat kedua-dua bahagian bertindih tepat.'
    };
    return hints[competencyId] || 'Perhatikan ciri bentuk satu demi satu.';
  }

  function assembleLegacyQuestion(runtime, tpl, raw) {
    if (!raw || !raw.value || !raw.value.answer || !Array.isArray(raw.distractors)) throw new Error('qsv2 bridge: malformed generator output');
    if (raw.distractors.length !== 3) throw new Error('qsv2 bridge: battle MCQ requires exactly 3 distractors');
    if (raw.value.interaction) throw new Error('qsv2 bridge: interactive item is not battle-compatible');

    var visualHtml = '';
    if (tpl.renderer) {
      var renderer = runtime._renderers && runtime._renderers[tpl.renderer];
      if (typeof renderer !== 'function') throw new Error('qsv2 bridge: missing renderer ' + tpl.renderer);
      visualHtml = renderer(raw.value, tpl.params || {});
    }

    var answer = displayChoice(raw.value.answer, raw.value.visual);
    var wrong = raw.distractors.map(function (d) {
      var v = displayChoice(d, raw.value.visual);
      return { v: v, label: v, tag: d.misconceptionTag || 'shape' };
    });
    var all = [answer].concat(wrong.map(function (d) { return d.v; }));
    var unique = Object.create(null);
    for (var i = 0; i < all.length; i++) unique[String(all[i]).trim().toLowerCase()] = true;
    if (Object.keys(unique).length !== 4) throw new Error('qsv2 bridge: adapted choices are not unique');

    var prompt = (visualHtml ? visualHtml : '') + '<div class="qsv2-prompt">' + htmlEscape(raw.value.promptMs) + '</div>';
    return {
      prompt: prompt,
      answer: answer,
      wrong: wrong,
      hint: hintFor(tpl.competencyId),
      kind: 'Darjah 3 · Ruang',
      diagnostic: true,
      formatShift: tpl.representation === 'visual',
      familyKey: tpl.familyKey,
      competencyId: tpl.competencyId,
      archetypeId: tpl.archetypeId,
      representation: tpl.representation,
      demand: tpl.demand,
      contextId: 'qsv2:' + tpl.familyKey,
      difficultyBand: tpl.difficultyBand,
      misconceptionTargets: (raw.meta && raw.meta.misconceptionTargets) || tpl.misconceptionTargets || [],
      templateId: tpl.templateId,
      standardId: tpl.standardId,
      curriculumVersion: tpl.curriculumVersion,
      source: 'qsv2',
      qsv2Pilot: true,
      qsv2GeneratorFingerprint: raw.meta && raw.meta.fingerprint ? raw.meta.fingerprint : null
    };
  }


  function legacyQuestionFingerprint(q) {
    var raw = String(q && q.prompt || '') + '|' + String(q && q.answer != null ? q.answer : '');
    return raw.replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function nowMs(root) {
    try { if (root.performance && typeof root.performance.now === 'function') return Number(root.performance.now()) || 0; } catch (_) {}
    return Date.now();
  }

  function freshShadowMetrics() {
    return {
      attempts: 0,
      generated: 0,
      fallbacks: 0,
      errors: 0,
      lastOutcome: null,
      lastReason: null,
      lastDurationMs: null,
      lastTemplateId: null,
      lastCompetencyId: null,
      lastFingerprint: null
    };
  }

  function shadowEvent(root, bridge, outcome, details, startedAt) {
    details = details || {};
    var duration = Math.max(0, nowMs(root) - Number(startedAt || 0));
    duration = Math.round(duration * 10) / 10;
    bridge.shadowMetrics.attempts++;
    if (outcome === 'generated') bridge.shadowMetrics.generated++;
    else if (outcome === 'error') bridge.shadowMetrics.errors++;
    else bridge.shadowMetrics.fallbacks++;
    bridge.shadowMetrics.lastOutcome = outcome;
    bridge.shadowMetrics.lastReason = details.reason || null;
    bridge.shadowMetrics.lastDurationMs = duration;
    bridge.shadowMetrics.lastTemplateId = details.templateId || null;
    bridge.shadowMetrics.lastCompetencyId = details.competencyId || null;
    bridge.shadowMetrics.lastFingerprint = details.fingerprint || null;

    var payload = {
      mode: 'shadow',
      outcome: outcome,
      reason: details.reason || null,
      generationMs: duration,
      standardId: details.standardId || null,
      competencyId: details.competencyId || null,
      templateId: details.templateId || null,
      fingerprint: details.fingerprint || null
    };
    var accepted = false;
    try {
      if (root.PATelemetry && typeof root.PATelemetry.record === 'function') accepted = root.PATelemetry.record('qsv2_shadow', payload) === true;
    } catch (_) {}
    try {
      if (accepted && root.PAQSV2ShadowSync && typeof root.PAQSV2ShadowSync.enqueue === 'function') root.PAQSV2ShadowSync.enqueue(payload);
    } catch (_) {}
    try {
      if (accepted && root.PAQSV2PilotSync && typeof root.PAQSV2PilotSync.enqueue === 'function') root.PAQSV2PilotSync.enqueue(payload);
    } catch (_) {}
  }

  function freshLiveMetrics() {
    return { attempts: 0, generated: 0, fallbacks: 0, errors: 0, blocked: 0, lastOutcome: null, lastReason: null, lastDurationMs: null, lastTemplateId: null, lastCompetencyId: null, lastFingerprint: null };
  }

  function liveEvent(root, bridge, outcome, details, startedAt) {
    details = details || {};
    var duration = Math.max(0, nowMs(root) - Number(startedAt || 0));
    duration = Math.round(duration * 10) / 10;
    bridge.liveMetrics.attempts++;
    if (outcome === 'generated') bridge.liveMetrics.generated++;
    else if (outcome === 'error') bridge.liveMetrics.errors++;
    else if (outcome === 'blocked') bridge.liveMetrics.blocked++;
    else bridge.liveMetrics.fallbacks++;
    bridge.liveMetrics.lastOutcome = outcome; bridge.liveMetrics.lastReason = details.reason || null; bridge.liveMetrics.lastDurationMs = duration; bridge.liveMetrics.lastTemplateId = details.templateId || null; bridge.liveMetrics.lastCompetencyId = details.competencyId || null; bridge.liveMetrics.lastFingerprint = details.fingerprint || null;
    var payload = { mode: 'live', outcome: outcome, reason: details.reason || null, generationMs: duration, standardId: details.standardId || null, competencyId: details.competencyId || null, templateId: details.templateId || null, fingerprint: details.fingerprint || null };
    var accepted = false;
    try { if (root.PATelemetry && typeof root.PATelemetry.record === 'function') accepted = root.PATelemetry.record('qsv2_live', payload) === true; } catch (_) {}
    try { if (accepted && root.PAQSV2PilotSync && typeof root.PAQSV2PilotSync.enqueue === 'function') root.PAQSV2PilotSync.enqueue(payload); } catch (_) {}
  }

  function createBridge(root) {
    var bridge = {
      lastError: null,
      lastShadow: null,
      shadowMetrics: freshShadowMetrics(),
      liveMetrics: freshLiveMetrics(),
      getMode: function () { return configuredMode(root); },
      setPilotMode: function (mode, persist) {
        mode = normaliseMode(mode);
        root.PA_QSV2_FLAGS = root.PA_QSV2_FLAGS || {};
        root.PA_QSV2_FLAGS.d3Topic7 = mode;
        if (persist !== false) {
          try { if (root.localStorage) root.localStorage.setItem(STORAGE_KEY, mode); } catch (_) {}
        }
        return mode;
      },
      clearPilotMode: function () {
        root.PA_QSV2_FLAGS = root.PA_QSV2_FLAGS || {};
        delete root.PA_QSV2_FLAGS.d3Topic7;
        try { if (root.localStorage) root.localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      },
      setKillSwitch: function (active) {
        root.PA_QSV2_FLAGS = root.PA_QSV2_FLAGS || {};
        root.PA_QSV2_FLAGS.killSwitch = !!active;
        return !!root.PA_QSV2_FLAGS.killSwitch;
      },
      resetShadowMetrics: function () {
        bridge.shadowMetrics = freshShadowMetrics();
        bridge.lastShadow = null;
        bridge.lastError = null;
        return Object.assign({}, bridge.shadowMetrics);
      },
      getShadowMetrics: function () { return Object.assign({}, bridge.shadowMetrics); },
      getStatus: function () {
        var runtime = root.PAQuestionSystemV2;
        var records = runtime ? enabledPilotRecords(runtime, PILOT_LEGACY_SKILL) : [];
        var liveTemplates = [];
        if (runtime) records.forEach(function (r) { liveTemplates = liveTemplates.concat(exactTemplates(runtime, r)); });
        return {
          mode: configuredMode(root),
          defaultMode: DEFAULT_MODE,
          killSwitch: !!(root.PA_QSV2_FLAGS && root.PA_QSV2_FLAGS.killSwitch),
          runtimeReady: !!runtime,
          enabledStandards: records.map(function (r) { return r.standardId; }).sort(),
          battleCompatibleTemplates: liveTemplates.length,
          sourceHash: runtime && runtime.sourceHash ? runtime.sourceHash : null,
          shadowMetrics: Object.assign({}, bridge.shadowMetrics),
          liveMetrics: Object.assign({}, bridge.liveMetrics)
        };
      },
      tryGenerate: function (legacySkillId, state, context) {
        bridge.lastError = null;
        var mode = configuredMode(root);
        if (mode === 'off' || legacySkillId !== PILOT_LEGACY_SKILL) return null;
        context = context || {};
        var startedAt = nowMs(root);
        if (mode === 'live') {
          var cutover = root.PAD3Topic7LiveCutover;
          var auth = cutover && typeof cutover.authorizeLive === 'function' ? cutover.authorizeLive(legacySkillId, context.stateRoot || null) : { allowed: false };
          if (!auth || auth.allowed !== true) { liveEvent(root, bridge, 'blocked', { reason: 'live_not_authorized' }, startedAt); return null; }
        }
        var runtime = root.PAQuestionSystemV2;
        if (!runtime || !runtime._generators || !runtime._renderers) {
          if (mode === 'shadow') shadowEvent(root, bridge, 'fallback', { reason: 'runtime_missing' }, startedAt);
          else liveEvent(root, bridge, 'fallback', { reason: 'runtime_missing' }, startedAt);
          return null;
        }
        var history = Array.isArray(context.history) ? context.history : [];
        var rng = typeof context.rng === 'function' ? context.rng : liveRng(root);
        try {
          var recent = new Set(Array.isArray(context.recentFingerprints) ? context.recentFingerprints.slice(-18) : []);
          var q = null, tpl = null;
          for (var attempt = 0; attempt < 10; attempt++) {
            tpl = selectTemplate(runtime, legacySkillId, state || {}, history, rng);
            if (!tpl) { if (mode === 'shadow') shadowEvent(root, bridge, 'fallback', { reason: 'no_template' }, startedAt); else liveEvent(root, bridge, 'fallback', { reason: 'no_template' }, startedAt); return null; }
            var generator = runtime._generators[tpl.generator];
            if (typeof generator !== 'function') { var gd={ reason: 'generator_missing', standardId: tpl.standardId, competencyId: tpl.competencyId, templateId: tpl.templateId }; if (mode === 'shadow') shadowEvent(root, bridge, 'fallback', gd, startedAt); else liveEvent(root, bridge, 'fallback', gd, startedAt); return null; }
            var raw = generator(tpl.params || {}, rng); q = assembleLegacyQuestion(runtime, tpl, raw);
            if (!recent.has(legacyQuestionFingerprint(q)) || attempt === 9) break;
          }
          var details={ reason: 'ok', standardId: tpl.standardId, competencyId: tpl.competencyId, templateId: tpl.templateId, fingerprint: q.qsv2GeneratorFingerprint || null };
          if (mode === 'shadow') { bridge.lastShadow = { templateId: tpl.templateId, competencyId: tpl.competencyId, question: q }; shadowEvent(root, bridge, 'generated', details, startedAt); return null; }
          liveEvent(root, bridge, 'generated', details, startedAt); return q;
        } catch (err) {
          bridge.lastError = err && err.message ? err.message : String(err);
          if (mode === 'shadow') shadowEvent(root, bridge, 'error', { reason: 'exception' }, startedAt); else liveEvent(root, bridge, 'error', { reason: 'exception' }, startedAt);
          return null;
        }
      }
    };
    return bridge;
  }

  return {
    createBridge: createBridge,
    _test: {
      makeRng: makeRng,
      selectTemplate: selectTemplate,
      assembleLegacyQuestion: assembleLegacyQuestion,
      enabledPilotRecords: enabledPilotRecords,
      exactTemplates: exactTemplates,
      figureMarker: figureMarker,
      legacyQuestionFingerprint: legacyQuestionFingerprint
    }
  };
});
