// questions/v2/generators/geometry/polygon-symmetry.js
// Phase 2A-2: D3 Topic 7.2 regular polygons + 7.3 symmetry-axis evidence.
// Pure authored source: no Node/browser globals. Correctness uses structured ids,
// side counts, pattern units and angle sets; Bahasa Melayu labels are display-only.
(function () {
  'use strict';

  var POLYGONS = {
    pentagon: { sides: 5, labelMs: 'Pentagon Sekata' },
    hexagon: { sides: 6, labelMs: 'Heksagon Sekata' },
    heptagon: { sides: 7, labelMs: 'Heptagon Sekata' },
    octagon: { sides: 8, labelMs: 'Oktagon Sekata' },
  };
  var POLYGON_IDS = ['pentagon', 'hexagon', 'heptagon', 'octagon'];

  // Angles are undirected line orientations in degrees modulo 180 and are tied
  // to the canonical renderer orientation for each shape.
  var SYMMETRY_SHAPES = {
    square: { labelMs: 'segi empat sama', shapeType: 'regular_polygon', sides: 4, axisAngles: [0, 45, 90, 135], distractorAngles: [22.5, 67.5, 112.5, 157.5] },
    rectangle: { labelMs: 'segi empat tepat', shapeType: 'rectangle', axisAngles: [0, 90], distractorAngles: [30, 45, 60, 120, 135, 150] },
    equilateral_triangle: { labelMs: 'segi tiga sama sisi', shapeType: 'regular_polygon', sides: 3, axisAngles: [30, 90, 150], distractorAngles: [0, 60, 120] },
    isosceles_triangle: { labelMs: 'segi tiga sama kaki', shapeType: 'isosceles_triangle', axisAngles: [90], distractorAngles: [0, 30, 60, 120, 150] },
    regular_pentagon: { labelMs: 'pentagon sekata', shapeType: 'regular_polygon', sides: 5, axisAngles: [18, 54, 90, 126, 162], distractorAngles: [0, 36, 72, 108, 144] },
    regular_hexagon: { labelMs: 'heksagon sekata', shapeType: 'regular_polygon', sides: 6, axisAngles: [0, 30, 60, 90, 120, 150], distractorAngles: [15, 45, 75, 105, 135, 165] },
  };
  var SYMMETRY_IDS = Object.keys(SYMMETRY_SHAPES);

  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) {
    var out = arr.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = out[i]; out[i] = out[j]; out[j] = t;
    }
    return out;
  }
  function sampleUnique(rng, arr, n) { return shuffle(rng, arr).slice(0, n); }
  function makeChoice(id, labelMs, misconceptionTag) {
    return { id: String(id), labelMs: String(labelMs), misconceptionTag: misconceptionTag || null };
  }
  function fingerprint(archetype, answerId, details) {
    return archetype + '::' + String(answerId) + '::' + (details || []).join(',');
  }
  function polygonLabel(id) { return POLYGONS[id].labelMs; }
  function sequenceLabel(unit) { return unit.map(polygonLabel).join(' → '); }
  function repeatUnit(unit, length) {
    var out = [];
    for (var i = 0; i < length; i++) out.push(unit[i % unit.length]);
    return out;
  }
  function uniqueSequenceDistractors(correct, candidates, n) {
    var seen = Object.create(null); seen[correct.join('|')] = true;
    var out = [];
    for (var i = 0; i < candidates.length && out.length < n; i++) {
      var c = candidates[i], key = c.join('|');
      if (!seen[key]) { seen[key] = true; out.push(c); }
    }
    return out;
  }

  registerGenerator('geometry.identifyRegularPolygon', function (params, rng) {
    var mode = (params && params.mode) || 'identify_picture';
    var targetId = pick(rng, POLYGON_IDS);
    var target = POLYGONS[targetId];
    var otherIds = POLYGON_IDS.filter(function (id) { return id !== targetId; });

    if (mode === 'identify_picture') {
      var ans = makeChoice(targetId, target.labelMs);
      var dis = otherIds.map(function (id) { return makeChoice(id, polygonLabel(id), 'polygon_name_side_count_confusion'); });
      return {
        value: {
          promptMs: 'Apakah nama poligon sekata di bawah?', answer: ans,
          visual: { kind: 'polygon_single', figures: [{ id: 'main', polygonId: targetId, sides: target.sides, regular: true }] },
        },
        distractors: shuffle(rng, dis),
        meta: { archetype: 'identify_polygon_from_picture', misconceptionTargets: ['polygon_name_side_count_confusion'],
          semanticProperties: { polygonId: targetId, sideCount: target.sides, regular: true },
          fingerprint: fingerprint('polygon_picture', targetId, otherIds) }
      };
    }

    if (mode === 'identify_sides') {
      var ans2 = makeChoice(targetId, target.labelMs);
      var dis2 = otherIds.map(function (id) { return makeChoice(id, polygonLabel(id), 'polygon_name_side_count_confusion'); });
      return {
        value: { promptMs: 'Sebuah poligon sekata mempunyai ' + target.sides + ' sisi yang sama panjang dan ' + target.sides + ' bucu. Apakah nama poligon itu?', answer: ans2, visual: null },
        distractors: shuffle(rng, dis2),
        meta: { archetype: 'identify_polygon_from_sides', misconceptionTargets: ['polygon_name_side_count_confusion'],
          semanticProperties: { polygonId: targetId, sideCount: target.sides, regular: true },
          fingerprint: fingerprint('polygon_sides', targetId, [String(target.sides)]) }
      };
    }

    if (mode === 'select_named') {
      var figures = shuffle(rng, POLYGON_IDS).map(function (id, i) {
        return { id: 'fig_' + i + '_' + id, polygonId: id, sides: POLYGONS[id].sides, regular: true };
      });
      var correct = figures.filter(function (f) { return f.polygonId === targetId; })[0];
      var wrong = figures.filter(function (f) { return f.polygonId !== targetId; });
      var ans3 = makeChoice(correct.id, target.labelMs);
      var dis3 = wrong.map(function (f) { return makeChoice(f.id, polygonLabel(f.polygonId), 'polygon_name_side_count_confusion'); });
      return {
        value: { promptMs: 'Yang manakah ' + target.labelMs + '?', answer: ans3, visual: { kind: 'polygon_gallery', figures: figures } },
        distractors: dis3,
        meta: { archetype: 'select_named_regular_polygon', misconceptionTargets: ['polygon_name_side_count_confusion'],
          semanticProperties: { polygonId: targetId, sideCount: target.sides, regular: true },
          fingerprint: fingerprint('polygon_gallery', targetId, figures.map(function (f) { return f.polygonId; })) }
      };
    }
    throw new Error('geometry.identifyRegularPolygon: unknown mode "' + mode + '"');
  });

  registerGenerator('geometry.regularPolygonPattern', function (params, rng) {
    var mode = (params && params.mode) || 'continue_pattern';
    var unitLength = rng() < 0.55 ? 2 : 3;
    var unit = sampleUnique(rng, POLYGON_IDS, unitLength);
    // Occasionally create AAB / ABB units to broaden structure while preserving
    // a unique smallest repeating unit of length 3.
    if (unitLength === 3 && rng() < 0.45) {
      var a = unit[0], b = unit[1];
      unit = rng() < 0.5 ? [a, a, b] : [a, b, b];
    }

    if (mode === 'continue_pattern') {
      var shownLength = unit.length * 2 + (unit.length === 2 ? 1 : 2);
      var full = repeatUnit(unit, shownLength + 1);
      var shown = full.slice(0, shownLength);
      var expected = full[shownLength];
      var wrongIds = POLYGON_IDS.filter(function (id) { return id !== expected; });
      var ans = makeChoice(expected, polygonLabel(expected));
      var dis = wrongIds.map(function (id) { return makeChoice(id, polygonLabel(id), 'pattern_position_confusion'); });
      return {
        value: { promptMs: 'Teruskan corak poligon sekata ini. Bentuk apakah seterusnya?', answer: ans,
          visual: { kind: 'polygon_pattern', sequence: shown, showQuestionMark: true } },
        distractors: shuffle(rng, dis),
        meta: { archetype: 'continue_regular_polygon_pattern', misconceptionTargets: ['pattern_unit_confusion', 'pattern_position_confusion'],
          semanticProperties: { unit: unit.slice(), shownSequence: shown.slice(), expectedNextId: expected },
          fingerprint: fingerprint('pattern_continue', expected, unit.concat(shown)) }
      };
    }

    if (mode === 'identify_unit') {
      var sequence = repeatUnit(unit, unit.length * 3);
      var candidates;
      if (unit.length === 2) {
        candidates = [unit.slice().reverse(), [unit[0], unit[0]], [unit[1], unit[1]], [unit[0], unit[1], unit[0]]];
      } else {
        candidates = [unit.slice().reverse(), [unit[1], unit[0], unit[2]], [unit[0], unit[2], unit[1]], [unit[0], unit[1]]];
      }
      var wrongUnits = uniqueSequenceDistractors(unit, candidates, 3);
      // Defensive fill in the unlikely event a constructed distractor equals the unit.
      var allPairs = [[POLYGON_IDS[0], POLYGON_IDS[1]], [POLYGON_IDS[1], POLYGON_IDS[2]], [POLYGON_IDS[2], POLYGON_IDS[3]], [POLYGON_IDS[3], POLYGON_IDS[0]]];
      wrongUnits = wrongUnits.concat(uniqueSequenceDistractors(unit, allPairs, 3)).slice(0, 3);
      var ans2 = makeChoice('unit:' + unit.join('-'), sequenceLabel(unit));
      var dis2 = wrongUnits.map(function (u, i) { return makeChoice('wrongunit:' + i + ':' + u.join('-'), sequenceLabel(u), 'pattern_unit_confusion'); });
      return {
        value: { promptMs: 'Bahagian manakah yang diulang untuk membina corak ini?', answer: ans2,
          visual: { kind: 'polygon_pattern', sequence: sequence, showQuestionMark: false } },
        distractors: shuffle(rng, dis2),
        meta: { archetype: 'identify_smallest_repeating_unit', misconceptionTargets: ['pattern_unit_confusion'],
          semanticProperties: { unit: unit.slice(), shownSequence: sequence.slice() },
          fingerprint: fingerprint('pattern_unit', ans2.id, sequence) }
      };
    }

    if (mode === 'construct_pattern') {
      var slots = unit.length * 3;
      var expectedSequence = repeatUnit(unit, slots);
      var palette = shuffle(rng, POLYGON_IDS.slice());
      return {
        value: {
          promptMs: 'Bina corak dengan mengulang unit ini: ' + sequenceLabel(unit) + '. Lengkapkan semua petak.',
          answer: { id: 'sequence:' + expectedSequence.join('-'), labelMs: 'Corak lengkap' },
          visual: { kind: 'polygon_pattern_builder', unit: unit.slice(), slots: slots, palette: palette },
          interaction: { type: 'sequence_build', slots: slots, paletteIds: palette.slice(), expectedSequence: expectedSequence.slice() },
        },
        distractors: [],
        meta: { archetype: 'construct_regular_polygon_pattern', misconceptionTargets: ['pattern_unit_confusion', 'pattern_position_confusion'],
          semanticProperties: { unit: unit.slice(), expectedSequence: expectedSequence.slice(), constrainedConstruction: true },
          fingerprint: fingerprint('pattern_construct', expectedSequence.join('-'), unit) }
      };
    }
    throw new Error('geometry.regularPolygonPattern: unknown mode "' + mode + '"');
  });

  registerGenerator('geometry.symmetryAxis', function (params, rng) {
    var mode = (params && params.mode) || 'count_axes';
    var shapeId = pick(rng, SYMMETRY_IDS);
    var shape = SYMMETRY_SHAPES[shapeId];
    var trueAxes = shape.axisAngles.slice();

    if (mode === 'count_axes') {
      var count = trueAxes.length;
      var wrongPool = [count - 1, count + 1, count + 2, count + 3, 0].filter(function (n) { return n >= 0 && n !== count; });
      var wrongCounts = sampleUnique(rng, Array.from(new Set(wrongPool)), 3);
      var fill = 1;
      while (wrongCounts.length < 3) { if (fill !== count && wrongCounts.indexOf(fill) < 0) wrongCounts.push(fill); fill++; }
      var ans = makeChoice(String(count), String(count) + ' paksi');
      var dis = wrongCounts.map(function (n) { return makeChoice(String(n), String(n) + ' paksi', 'symmetry_axis_count_confusion'); });
      return {
        value: { promptMs: 'Berapakah bilangan paksi simetri bagi bentuk ini?', answer: ans,
          visual: { kind: 'symmetry_shape', shape: { id: 'main', shapeId: shapeId, shapeType: shape.shapeType, sides: shape.sides || null } } },
        distractors: shuffle(rng, dis),
        meta: { archetype: 'identify_symmetry_axis_count', misconceptionTargets: ['symmetry_axis_count_confusion'],
          semanticProperties: { shapeId: shapeId, axisAngles: trueAxes.slice(), axisCount: count },
          fingerprint: fingerprint('symmetry_count', count, [shapeId]) }
      };
    }

    if (mode === 'select_axis') {
      var answerAngle = pick(rng, trueAxes);
      var wrongAngles = sampleUnique(rng, shape.distractorAngles, 3);
      var mixedAngles = shuffle(rng, [answerAngle].concat(wrongAngles));
      var letters = ['A', 'B', 'C', 'D'];
      var candidates = mixedAngles.map(function (angle, i) { return { id: 'axis_' + letters[i], labelMs: 'Garis ' + letters[i], angle: angle }; });
      var correctCandidate = candidates.filter(function (c) { return c.angle === answerAngle; })[0];
      var wrongCandidates = candidates.filter(function (c) { return c.id !== correctCandidate.id; });
      var ans2 = makeChoice(correctCandidate.id, correctCandidate.labelMs);
      var dis2 = wrongCandidates.map(function (c) { return makeChoice(c.id, c.labelMs, 'symmetry_axis_orientation_confusion'); });
      return {
        value: { promptMs: 'Garis manakah merupakan paksi simetri bagi bentuk ini?', answer: ans2,
          visual: { kind: 'symmetry_candidates', shape: { id: 'main', shapeId: shapeId, shapeType: shape.shapeType, sides: shape.sides || null }, candidates: candidates } },
        distractors: dis2,
        meta: { archetype: 'select_valid_symmetry_axis', misconceptionTargets: ['symmetry_axis_orientation_confusion'],
          semanticProperties: { shapeId: shapeId, axisAngles: trueAxes.slice(), answerAngle: answerAngle, candidateAngles: candidates.map(function (c) { return c.angle; }) },
          fingerprint: fingerprint('symmetry_select', answerAngle, [shapeId].concat(candidates.map(function (c) { return String(c.angle); }))) }
      };
    }

    if (mode === 'draw_axis') {
      return {
        value: {
          promptMs: 'Lukis SATU paksi simetri pada bentuk ini.',
          answer: { id: 'valid_axis', labelMs: 'Satu paksi simetri yang betul' },
          visual: { kind: 'symmetry_draw', shape: { id: 'main', shapeId: shapeId, shapeType: shape.shapeType, sides: shape.sides || null } },
          interaction: { type: 'draw_axis', acceptedAxisAngles: trueAxes.slice(), angleToleranceDeg: 4, mustPassThroughCenter: true, centerToleranceRatio: 0.08, requirement: 'one_valid_axis' },
        },
        distractors: [],
        meta: { archetype: 'draw_valid_symmetry_axis', misconceptionTargets: ['symmetry_axis_orientation_confusion'],
          semanticProperties: { shapeId: shapeId, axisAngles: trueAxes.slice(), requirement: 'one_valid_axis' },
          fingerprint: fingerprint('symmetry_draw', shapeId, trueAxes.map(String)) }
      };
    }
    throw new Error('geometry.symmetryAxis: unknown mode "' + mode + '"');
  });
})();
