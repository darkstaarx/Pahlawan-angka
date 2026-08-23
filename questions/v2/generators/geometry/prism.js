// questions/v2/generators/geometry/prism.js
//
// Reusable geometry generator family for D3 Topic 7.1 ("Ruang" — Prisma),
// Phase 2A-1 pilot. Registers three keys:
//
//   geometry.identifyPrism  -> SP 7.1.1 (identify_prism)
//   geometry.prismFeatures  -> SP 7.1.2 (describe_prism_features)
//   geometry.classifyPrism  -> SP 7.1.3 (classify_prism_vs_non_prism)
//
// Each key supports several `params.mode` values (the evidence-family
// variants declared by the bank JSON, see
// questions/v2/banks/kssr-e3-2024/d3/space-prism.json). This file owns NO
// curriculum routing: it never reads/writes a competencyId, standardId,
// or topicId. It only knows abstract geometry facts about a small set of
// solid IDs and produces MCQ-shaped question data from them, parameterised
// entirely by `params` and randomised entirely by the injected `rng`.
//
// Known-bug guard (Phase 2A-1): Bahasa Melayu labels for "segi empat sama"
// (square) and "segi empat tepat" (rectangle) must NEVER be compared by
// substring — "segi empat tepat".includes("segi empat") is true for both,
// which previously caused a false-match QA bug. This file compares only
// structured internal IDs (e.g. "square_prism" !== "rectangular_prism")
// and maps an ID to its Bahasa Melayu label solely for display, at the
// last possible step, never the reverse.
//
// Fix (Phase 2A-1F1): geometry.classifyPrism's classify_properties mode
// (D3-T7-713-classify-prism-properties-v1, archetype classify_by_properties)
// previously described every prism with one shared generic sentence, and
// both pyramid types with one shared generic sentence, so a distractor of
// the same family (e.g. triangular_prism as a distractor when the answer
// is square_prism) also satisfied the description as literally written.
// The description is now built from SOLID_SEMANTIC_PROPERTIES
// (solidKind + baseShapeId), which is unique per solid id, and that same
// structured descriptor is exposed on meta.semanticProperties for
// independent QA. See questions/v2/validation/d3-topic7-1-prism-qa.js.
//
// Authoring contract (see questions/v2/build/README.md): no require, no
// module.exports, no Node/browser globals — a pure function of (params, rng).

(function () {
  'use strict';

  // ---- Structured solid data (canonical IDs only; labels are display-only) ----

  var PRISM_TYPES = {
    square_prism: {
      kind: 'prism',
      baseShapeId: 'square',
      baseCount: 2,
      faces: 6,
      vertices: 8,
      edges: 12,
      labelMs: 'Prisma Segi Empat Sama',
      baseShapeLabelMs: 'segi empat sama',
    },
    rectangular_prism: {
      kind: 'prism',
      baseShapeId: 'rectangle',
      baseCount: 2,
      faces: 6,
      vertices: 8,
      edges: 12,
      labelMs: 'Prisma Segi Empat Tepat',
      baseShapeLabelMs: 'segi empat tepat',
    },
    triangular_prism: {
      kind: 'prism',
      baseShapeId: 'triangle',
      baseCount: 2,
      faces: 5,
      vertices: 6,
      edges: 9,
      labelMs: 'Prisma Segi Tiga',
      baseShapeLabelMs: 'segi tiga',
    },
  };

  var NON_PRISM_TYPES = {
    cone: {
      kind: 'non_prism',
      labelMs: 'Kon',
      propertyMs: 'mempunyai satu tapak bulat dan permukaannya meruncing ke satu titik',
    },
    sphere: {
      kind: 'non_prism',
      labelMs: 'Sfera',
      propertyMs: 'permukaannya melengkung sepenuhnya dan tiada tapak rata',
    },
    cylinder: {
      kind: 'non_prism',
      labelMs: 'Silinder',
      propertyMs: 'mempunyai dua tapak bulat yang selari, disambungkan oleh satu permukaan melengkung',
    },
    square_pyramid: {
      kind: 'non_prism',
      labelMs: 'Piramid Tapak Segi Empat Sama',
      propertyMs: 'mempunyai satu tapak sahaja dan semua permukaan sisinya bertemu di satu puncak',
    },
    triangular_pyramid: {
      kind: 'non_prism',
      labelMs: 'Piramid Tapak Segi Tiga',
      propertyMs: 'mempunyai satu tapak sahaja dan semua permukaan sisinya bertemu di satu puncak',
    },
  };

  var PRISM_BASE_SHAPE_LABELS = { square: 'segi empat sama', rectangle: 'segi empat tepat', triangle: 'segi tiga' };
  var NON_PRISM_BASE_SHAPE_LABELS = { pentagon: 'pentagon' };

  var PRISM_IDS = ['square_prism', 'rectangular_prism', 'triangular_prism'];
  var NON_PRISM_IDS = ['cone', 'sphere', 'cylinder', 'square_pyramid', 'triangular_pyramid'];

  // Phase 2A-1F1 fix: structured semantic descriptor per solid id, used by
  // geometry.classifyPrism's classify_properties mode (SP 7.1.3) to build
  // a property description that is unique to exactly one solid, and
  // exposed on meta.semanticProperties so independent QA can verify that
  // uniqueness without parsing Bahasa Melayu text or trusting the
  // generator's own "correctness". (solidKind, baseShapeId) is a unique
  // pair across all 8 known solids: three prism types differ by
  // baseShapeId, the two pyramid types differ by baseShapeId, and cone /
  // sphere / cylinder each have a distinct solidKind. Adding a new solid
  // later must preserve that uniqueness or this invariant breaks loudly
  // (see the defensive distractor filter below).
  var SOLID_SEMANTIC_PROPERTIES = {
    square_prism: { solidKind: 'prism', baseShapeId: 'square' },
    rectangular_prism: { solidKind: 'prism', baseShapeId: 'rectangle' },
    triangular_prism: { solidKind: 'prism', baseShapeId: 'triangle' },
    square_pyramid: { solidKind: 'pyramid', baseShapeId: 'square' },
    triangular_pyramid: { solidKind: 'pyramid', baseShapeId: 'triangle' },
    cone: { solidKind: 'cone', baseShapeId: 'circle' },
    sphere: { solidKind: 'sphere', baseShapeId: null },
    cylinder: { solidKind: 'cylinder', baseShapeId: 'circle' },
  };

  function sameDescriptor(a, b) {
    return a.solidKind === b.solidKind && a.baseShapeId === b.baseShapeId;
  }

  function solidLabelMs(id) {
    if (PRISM_TYPES[id]) return PRISM_TYPES[id].labelMs;
    if (NON_PRISM_TYPES[id]) return NON_PRISM_TYPES[id].labelMs;
    throw new Error('geometry/prism: unknown solid id "' + id + '"');
  }

  // ---- rng-driven helpers (pure; take rng as an explicit argument) ----

  function pick(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
  }

  function shuffle(rng, arr) {
    var out = arr.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  /** Sample `n` distinct items from `arr` without replacement. */
  function sampleUnique(rng, arr, n) {
    return shuffle(rng, arr).slice(0, n);
  }

  function makeChoice(id, labelMs, misconceptionTag) {
    return { id: id, labelMs: labelMs, misconceptionTag: misconceptionTag || null };
  }

  function fingerprint(archetype, answerId, distractorIds) {
    return archetype + '::' + answerId + '::' + distractorIds.slice().sort().join(',');
  }

  // =========================================================================
  // geometry.identifyPrism  (SP 7.1.1)
  // =========================================================================

  registerGenerator('geometry.identifyPrism', function (params, rng) {
    var mode = (params && params.mode) || 'identify_picture';

    if (mode === 'identify_picture') {
      var targetId = pick(rng, PRISM_IDS);
      var otherPrisms = PRISM_IDS.filter(function (id) { return id !== targetId; });
      var nonPrismDistractor = pick(rng, NON_PRISM_IDS);

      var answer = makeChoice(targetId, solidLabelMs(targetId));
      var distractors = otherPrisms
        .map(function (id) { return makeChoice(id, solidLabelMs(id), 'prism_type_confusion'); })
        .concat([makeChoice(nonPrismDistractor, solidLabelMs(nonPrismDistractor), 'prism_vs_non_prism')]);

      return {
        value: {
          promptMs: 'Perhatikan pepejal di bawah. Apakah nama pepejal ini?',
          answer: answer,
          visual: { layout: 'single', figures: [{ id: 'main', solidId: targetId }] },
        },
        distractors: shuffle(rng, distractors),
        meta: {
          archetype: 'identify_from_picture',
          misconceptionTargets: ['prism_type_confusion', 'prism_vs_non_prism'],
          fingerprint: fingerprint('identify_picture', answer.id, distractors.map(function (d) { return d.id; })),
        },
      };
    }

    if (mode === 'identify_properties') {
      var tId = pick(rng, PRISM_IDS);
      var t = PRISM_TYPES[tId];
      var otherIds = PRISM_IDS.filter(function (id) { return id !== tId; });
      var nonPrismId = pick(rng, NON_PRISM_IDS);

      var promptMs =
        'Sebuah pepejal mempunyai ' + t.faces + ' permukaan rata dan ' + t.baseCount +
        ' tapak berbentuk ' + t.baseShapeLabelMs + ' yang selari serta sama saiz. Apakah nama pepejal ini?';

      var ans2 = makeChoice(tId, t.labelMs);
      var dis2 = otherIds
        .map(function (id) { return makeChoice(id, solidLabelMs(id), 'prism_type_confusion'); })
        .concat([makeChoice(nonPrismId, solidLabelMs(nonPrismId), 'prism_vs_non_prism')]);

      return {
        value: {
          promptMs: promptMs,
          answer: ans2,
          visual: null,
        },
        distractors: shuffle(rng, dis2),
        meta: {
          archetype: 'identify_from_properties',
          misconceptionTargets: ['prism_type_confusion', 'prism_vs_non_prism'],
          fingerprint: fingerprint('identify_properties', ans2.id, dis2.map(function (d) { return d.id; })),
        },
      };
    }

    if (mode === 'discriminate') {
      var dTargetId = pick(rng, PRISM_IDS);
      var trapPrismId = pick(rng, PRISM_IDS.filter(function (id) { return id !== dTargetId; }));
      var nonPrismPair = sampleUnique(rng, NON_PRISM_IDS, 2);

      var figureIds = [dTargetId, trapPrismId].concat(nonPrismPair);
      var figures = shuffle(rng, figureIds).map(function (solidId, i) {
        return { id: 'fig_' + i + '_' + solidId, solidId: solidId };
      });
      var correctFigure = figures.filter(function (f) { return f.solidId === dTargetId; })[0];
      var wrongFigures = figures.filter(function (f) { return f.solidId !== dTargetId; });

      var dAnswer = makeChoice(correctFigure.id, solidLabelMs(dTargetId));
      var dDistractors = wrongFigures.map(function (f) {
        var tag = PRISM_TYPES[f.solidId] ? 'prism_type_confusion' : 'prism_vs_non_prism';
        return makeChoice(f.id, solidLabelMs(f.solidId), tag);
      });

      return {
        value: {
          promptMs: 'Yang manakah ' + PRISM_TYPES[dTargetId].labelMs + '?',
          answer: dAnswer,
          visual: { layout: 'gallery', figures: figures },
        },
        distractors: dDistractors,
        meta: {
          archetype: 'discriminate_solids',
          misconceptionTargets: ['prism_type_confusion', 'prism_vs_non_prism'],
          fingerprint: fingerprint('discriminate', dTargetId, wrongFigures.map(function (f) { return f.solidId; })),
        },
      };
    }

    throw new Error('geometry.identifyPrism: unknown mode "' + mode + '"');
  });

  // =========================================================================
  // geometry.prismFeatures  (SP 7.1.2)
  // =========================================================================

  registerGenerator('geometry.prismFeatures', function (params, rng) {
    var mode = (params && params.mode) || 'count_faces';

    if (mode === 'count_faces') {
      var fId = pick(rng, PRISM_IDS);
      var f = PRISM_TYPES[fId];
      var otherFaceCounts = PRISM_IDS
        .filter(function (id) { return id !== fId; })
        .map(function (id) { return PRISM_TYPES[id].faces; })
        .filter(function (n) { return n !== f.faces; });

      var wrongCountsPool = [f.faces - 1, f.faces + 1].concat(otherFaceCounts).filter(function (n) {
        return n > 0 && n !== f.faces;
      });
      var uniqueWrong = Array.from(new Set(wrongCountsPool));
      var chosenWrong = sampleUnique(rng, uniqueWrong, Math.min(3, uniqueWrong.length));
      // Guarantee exactly 3 distractors even in a degenerate small pool.
      var fillIdx = f.faces + 2;
      while (chosenWrong.length < 3) {
        if (chosenWrong.indexOf(fillIdx) === -1 && fillIdx !== f.faces) chosenWrong.push(fillIdx);
        fillIdx++;
      }

      var fAnswer = makeChoice(String(f.faces), String(f.faces) + ' permukaan');
      var fDistractors = chosenWrong.map(function (n) {
        return makeChoice(String(n), String(n) + ' permukaan', 'face_count_confusion');
      });

      return {
        value: {
          promptMs: 'Perhatikan pepejal di bawah. Berapakah bilangan permukaan (muka) bagi pepejal ini?',
          answer: fAnswer,
          visual: { layout: 'single', figures: [{ id: 'main', solidId: fId }] },
        },
        distractors: shuffle(rng, fDistractors),
        meta: {
          archetype: 'count_faces',
          misconceptionTargets: ['face_count_confusion'],
          fingerprint: fingerprint('count_faces', fAnswer.id, fDistractors.map(function (d) { return d.id; })),
        },
      };
    }

    if (mode === 'identify_base') {
      var bId = pick(rng, PRISM_IDS);
      var b = PRISM_TYPES[bId];
      var otherBaseIds = Object.keys(PRISM_BASE_SHAPE_LABELS).filter(function (id) { return id !== b.baseShapeId; });
      var extraShapeId = 'pentagon';

      var bAnswer = makeChoice(b.baseShapeId, PRISM_BASE_SHAPE_LABELS[b.baseShapeId]);
      var bDistractors = otherBaseIds
        .map(function (id) { return makeChoice(id, PRISM_BASE_SHAPE_LABELS[id], 'base_shape_confusion'); })
        .concat([makeChoice(extraShapeId, NON_PRISM_BASE_SHAPE_LABELS[extraShapeId], 'not_a_prism_base')]);

      return {
        value: {
          promptMs: 'Perhatikan pepejal di bawah. Apakah bentuk tapak pepejal ini?',
          answer: bAnswer,
          visual: { layout: 'single', figures: [{ id: 'main', solidId: bId }] },
        },
        distractors: shuffle(rng, bDistractors),
        meta: {
          archetype: 'identify_base',
          misconceptionTargets: ['base_shape_confusion', 'not_a_prism_base'],
          fingerprint: fingerprint('identify_base', bAnswer.id, bDistractors.map(function (d) { return d.id; })),
        },
      };
    }

    if (mode === 'reason_features') {
      var rId = pick(rng, PRISM_IDS);
      var r = PRISM_TYPES[rId];
      var askEdges = rng() < 0.5;
      var targetValue = askEdges ? r.edges : r.vertices;
      var targetLabelMs = askEdges ? 'tepi' : 'bucu';

      var otherValues = PRISM_IDS
        .filter(function (id) { return id !== rId; })
        .map(function (id) { return askEdges ? PRISM_TYPES[id].edges : PRISM_TYPES[id].vertices; })
        .filter(function (n) { return n !== targetValue; });

      var rWrongPool = [targetValue - 1, targetValue + 1].concat(otherValues).filter(function (n) {
        return n > 0 && n !== targetValue;
      });
      var rUniqueWrong = Array.from(new Set(rWrongPool));
      var rChosenWrong = sampleUnique(rng, rUniqueWrong, Math.min(3, rUniqueWrong.length));
      var rFill = targetValue + 3;
      while (rChosenWrong.length < 3) {
        if (rChosenWrong.indexOf(rFill) === -1 && rFill !== targetValue) rChosenWrong.push(rFill);
        rFill++;
      }

      var promptMs =
        'Sebuah prisma mempunyai ' + r.baseCount + ' tapak berbentuk ' + r.baseShapeLabelMs +
        ' dan ' + r.faces + ' permukaan rata semuanya. Berapakah bilangan ' + targetLabelMs + ' pepejal ini?';

      var rAnswer = makeChoice(String(targetValue), String(targetValue) + ' ' + targetLabelMs);
      var rDistractors = rChosenWrong.map(function (n) {
        return makeChoice(String(n), String(n) + ' ' + targetLabelMs, 'vertex_edge_confusion');
      });

      return {
        value: { promptMs: promptMs, answer: rAnswer, visual: null },
        distractors: shuffle(rng, rDistractors),
        meta: {
          archetype: 'reason_vertices_edges',
          misconceptionTargets: ['vertex_edge_confusion'],
          fingerprint: fingerprint('reason_features:' + targetLabelMs, rAnswer.id, rDistractors.map(function (d) { return d.id; })),
        },
      };
    }

    throw new Error('geometry.prismFeatures: unknown mode "' + mode + '"');
  });

  // =========================================================================
  // geometry.classifyPrism  (SP 7.1.3)
  // =========================================================================

  registerGenerator('geometry.classifyPrism', function (params, rng) {
    var mode = (params && params.mode) || 'select_prism';

    if (mode === 'select_prism') {
      var sPrismId = pick(rng, PRISM_IDS);
      var sNonPrismIds = sampleUnique(rng, NON_PRISM_IDS, 3);
      var sFigureIds = [sPrismId].concat(sNonPrismIds);
      var sFigures = shuffle(rng, sFigureIds).map(function (solidId, i) {
        return { id: 'fig_' + i + '_' + solidId, solidId: solidId };
      });
      var sCorrectFig = sFigures.filter(function (f) { return f.solidId === sPrismId; })[0];
      var sWrongFigs = sFigures.filter(function (f) { return f.solidId !== sPrismId; });

      var sAnswer = makeChoice(sCorrectFig.id, solidLabelMs(sPrismId));
      var sDistractors = sWrongFigs.map(function (f) {
        return makeChoice(f.id, solidLabelMs(f.solidId), 'prism_vs_non_prism');
      });

      return {
        value: {
          promptMs: 'Yang manakah PRISMA?',
          answer: sAnswer,
          visual: { layout: 'gallery', figures: sFigures },
        },
        distractors: sDistractors,
        meta: {
          archetype: 'select_prism_from_set',
          misconceptionTargets: ['prism_vs_non_prism'],
          fingerprint: fingerprint('select_prism', sPrismId, sNonPrismIds),
        },
      };
    }

    if (mode === 'classify_properties') {
      var allIds = PRISM_IDS.concat(NON_PRISM_IDS);
      var cTargetId = pick(rng, allIds);
      var cDescriptor = SOLID_SEMANTIC_PROPERTIES[cTargetId];

      // Build a property description from the structured descriptor, not
      // from a single shared "isPrism" bucket. Prisms and pyramids each
      // name their specific base shape, so the three prism types and the
      // two pyramid types no longer collapse onto one shared sentence.
      var cPropertyMs;
      if (cDescriptor.solidKind === 'prism') {
        cPropertyMs =
          'mempunyai dua tapak berbentuk ' + PRISM_BASE_SHAPE_LABELS[cDescriptor.baseShapeId] +
          ' yang sama bentuk, sama saiz dan selari, disambungkan oleh permukaan sisi berbentuk segi empat';
      } else if (cDescriptor.solidKind === 'pyramid') {
        cPropertyMs =
          'mempunyai satu tapak sahaja berbentuk ' + PRISM_BASE_SHAPE_LABELS[cDescriptor.baseShapeId] +
          ' dan semua permukaan sisinya bertemu di satu puncak';
      } else {
        cPropertyMs = NON_PRISM_TYPES[cTargetId].propertyMs;
      }

      // Defensive distractor filter: exclude any id whose structured
      // descriptor equals the target's. With the fixed 8-solid set this
      // never removes anything (every descriptor is already unique), but
      // it keeps "no distractor can satisfy the described property" true
      // by construction rather than by coincidence if the solid set grows.
      var cOtherIds = allIds.filter(function (id) {
        return id !== cTargetId && !sameDescriptor(SOLID_SEMANTIC_PROPERTIES[id], cDescriptor);
      });
      var cDistractorIds = sampleUnique(rng, cOtherIds, 3);

      var cAnswer = makeChoice(cTargetId, solidLabelMs(cTargetId));
      var cDistractors = cDistractorIds.map(function (id) {
        return makeChoice(id, solidLabelMs(id), 'prism_vs_non_prism');
      });

      return {
        value: {
          promptMs: 'Satu pepejal ' + cPropertyMs + '. Pepejal manakah yang sepadan dengan penerangan ini?',
          answer: cAnswer,
          visual: null,
        },
        distractors: shuffle(rng, cDistractors),
        meta: {
          archetype: 'classify_by_properties',
          misconceptionTargets: ['prism_vs_non_prism'],
          fingerprint: fingerprint('classify_properties', cAnswer.id, cDistractorIds),
          semanticProperties: {
            targetId: cTargetId,
            solidKind: cDescriptor.solidKind,
            baseShapeId: cDescriptor.baseShapeId,
            distractorIds: cDistractorIds.slice(),
          },
        },
      };
    }

    if (mode === 'compare') {
      var comparePrismIds = shuffle(rng, PRISM_IDS.slice());
      var compareNonPrismId = pick(rng, NON_PRISM_IDS);
      var compareFigureIds = comparePrismIds.concat([compareNonPrismId]);
      var compareFigures = shuffle(rng, compareFigureIds).map(function (solidId, i) {
        return { id: 'fig_' + i + '_' + solidId, solidId: solidId };
      });
      var compareCorrectFig = compareFigures.filter(function (f) { return f.solidId === compareNonPrismId; })[0];
      var compareWrongFigs = compareFigures.filter(function (f) { return f.solidId !== compareNonPrismId; });

      var compareAnswer = makeChoice(compareCorrectFig.id, solidLabelMs(compareNonPrismId));
      var compareDistractors = compareWrongFigs.map(function (f) {
        return makeChoice(f.id, solidLabelMs(f.solidId), 'prism_vs_non_prism');
      });

      return {
        value: {
          promptMs: 'Yang manakah BUKAN prisma?',
          answer: compareAnswer,
          visual: { layout: 'gallery', figures: compareFigures },
        },
        distractors: compareDistractors,
        meta: {
          archetype: 'compare_prism_non_prism',
          misconceptionTargets: ['prism_vs_non_prism'],
          fingerprint: fingerprint('compare', compareNonPrismId, comparePrismIds),
        },
      };
    }

    throw new Error('geometry.classifyPrism: unknown mode "' + mode + '"');
  });
})();
