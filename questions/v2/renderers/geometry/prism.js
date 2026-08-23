// questions/v2/renderers/geometry/prism.js
//
// Reusable "geometry" renderer for D3 Topic 7.1 (Prisma), Phase 2A-1 pilot.
// Registers a single key, "geometry", matching the `renderer` field used by
// the visual-representation templates in
// questions/v2/banks/kssr-e3-2024/d3/space-prism.json.
//
// Draws simple, clean pseudo-3D (isometric-style) SVG line-art for the
// solid IDs referenced by questions/v2/generators/geometry/prism.js:
// square_prism, rectangular_prism, triangular_prism (the three prisms) and
// cone, sphere, cylinder, square_pyramid, triangular_pyramid (non-prism
// comparison solids). This is a clean-room QS v2 renderer, not a reuse of
// any existing legacy production drawing code, to avoid coupling QS v2 to
// the legacy runtime.
//
// Input contract: `question` is the assembled question object produced by
// merging a geometry.* generator's `value`/`distractors` (see
// questions/v2/engine/generator.js's future contract) — in particular
// `question.visual = { layout: 'single'|'gallery', figures: [{id, solidId}] }`.
// A template with `representation !== 'visual'` (renderer: null) never
// calls this file at all.
//
// Output contract: returns one HTML string containing a <svg> per figure,
// each tagged `data-figure-id="..."` so the caller can associate a figure
// with its MCQ choice id. Pure function of (question, params) — no DOM,
// no globals, deterministic for a given input (no randomness is used here;
// all variation already happened in the generator).
//
// Authoring contract (see questions/v2/build/README.md): no require, no
// module.exports, no Node/browser globals — call registerRenderer directly.

(function () {
  'use strict';

  var STROKE = '#2b2540';
  var FILL_MAIN = '#e8def8';
  var FILL_SHADE = '#c9b8ef';
  var FILL_TOP = '#f4eefc';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function svgOpen(vb) {
    return '<svg viewBox="' + vb + '" width="120" height="120" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">';
  }

  // ---- individual solid drawings (each returns inner SVG markup, no wrapper) ----

  function drawRectangularPrism(w, d) {
    // Isometric cuboid: front face, top face (parallelogram), side face.
    var ox = 30, oy = 85, sk = 18, h = 46, fw = w;
    var frontW = fw;
    var topBack = [[ox + sk, oy - h - sk], [ox + sk + frontW, oy - h - sk], [ox + frontW, oy - h], [ox, oy - h]];
    var front = [[ox, oy - h], [ox + frontW, oy - h], [ox + frontW, oy], [ox, oy]];
    var side = [[ox + frontW, oy - h], [ox + frontW + sk, oy - h - sk], [ox + frontW + sk, oy - sk], [ox + frontW, oy]];
    function poly(pts, fill) {
      return '<polygon points="' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '" fill="' + fill + '" stroke="' + STROKE + '" stroke-width="2.5" stroke-linejoin="round"/>';
    }
    return poly(side, FILL_SHADE) + poly(topBack, FILL_TOP) + poly(front, FILL_MAIN);
  }

  function drawTriangularPrism() {
    var ox = 25, oy = 90, sk = 22, h = 55, bw = 60;
    var frontTri = [[ox, oy], [ox + bw, oy], [ox + bw / 2, oy - h]];
    var backTri = [[ox + sk, oy - sk], [ox + bw + sk, oy - sk], [ox + bw / 2 + sk, oy - h - sk]];
    var topQuad = [frontTri[2], backTri[2], backTri[1], frontTri[1]];
    var sideQuad = [frontTri[0], frontTri[1], backTri[1], backTri[0]];
    function poly(pts, fill) {
      return '<polygon points="' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '" fill="' + fill + '" stroke="' + STROKE + '" stroke-width="2.5" stroke-linejoin="round"/>';
    }
    return poly(sideQuad, FILL_SHADE) + poly(topQuad, FILL_TOP) + poly(frontTri, FILL_MAIN);
  }

  function drawCone() {
    return (
      '<ellipse cx="60" cy="88" rx="34" ry="12" fill="' + FILL_SHADE + '" stroke="' + STROKE + '" stroke-width="2.5"/>' +
      '<path d="M 60 20 L 26 88 A 34 12 0 0 0 94 88 Z" fill="' + FILL_MAIN + '" stroke="' + STROKE + '" stroke-width="2.5" stroke-linejoin="round"/>'
    );
  }

  function drawSphere() {
    return (
      '<circle cx="60" cy="60" r="38" fill="' + FILL_MAIN + '" stroke="' + STROKE + '" stroke-width="2.5"/>' +
      '<ellipse cx="60" cy="60" rx="38" ry="13" fill="none" stroke="' + STROKE + '" stroke-width="1.5" opacity="0.6"/>'
    );
  }

  function drawCylinder() {
    return (
      '<path d="M 26 34 L 26 86" stroke="' + STROKE + '" stroke-width="2.5"/>' +
      '<path d="M 94 34 L 94 86" stroke="' + STROKE + '" stroke-width="2.5"/>' +
      '<rect x="26" y="34" width="68" height="52" fill="' + FILL_MAIN + '" stroke="none"/>' +
      '<ellipse cx="60" cy="86" rx="34" ry="12" fill="' + FILL_SHADE + '" stroke="' + STROKE + '" stroke-width="2.5"/>' +
      '<ellipse cx="60" cy="34" rx="34" ry="12" fill="' + FILL_TOP + '" stroke="' + STROKE + '" stroke-width="2.5"/>'
    );
  }

  function drawSquarePyramid() {
    var ox = 25, oy = 88, sk = 22, bw = 60, apex = [60, 18];
    var base = [[ox, oy], [ox + bw, oy], [ox + bw + sk, oy - sk], [ox + sk, oy - sk]];
    function poly(pts, fill) {
      return '<polygon points="' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '" fill="' + fill + '" stroke="' + STROKE + '" stroke-width="2.5" stroke-linejoin="round"/>';
    }
    var leftFace = [[ox, oy], apex, [ox + sk, oy - sk]];
    var frontFace = [[ox, oy], [ox + bw, oy], apex];
    var rightFace = [[ox + bw, oy], [ox + bw + sk, oy - sk], apex];
    return poly(base, FILL_SHADE) + poly(leftFace, FILL_TOP) + poly(rightFace, FILL_TOP) + poly(frontFace, FILL_MAIN);
  }

  function drawTriangularPyramid() {
    var left = [22, 90], right = [98, 90], back = [60, 55], apex = [58, 15];
    function poly(pts, fill) {
      return '<polygon points="' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '" fill="' + fill + '" stroke="' + STROKE + '" stroke-width="2.5" stroke-linejoin="round"/>';
    }
    var faceLeft = [left, apex, back];
    var faceRight = [right, apex, back];
    var faceFront = [left, right, apex];
    return poly(faceLeft, FILL_SHADE) + poly(faceRight, FILL_TOP) + poly(faceFront, FILL_MAIN);
  }

  var DRAWERS = {
    square_prism: function () { return drawRectangularPrism(50, 50); },
    rectangular_prism: function () { return drawRectangularPrism(64, 34); },
    triangular_prism: drawTriangularPrism,
    cone: drawCone,
    sphere: drawSphere,
    cylinder: drawCylinder,
    square_pyramid: drawSquarePyramid,
    triangular_pyramid: drawTriangularPyramid,
  };

  function drawSolid(solidId) {
    var drawer = DRAWERS[solidId];
    if (!drawer) throw new Error('geometry renderer: unknown solid id "' + solidId + '"');
    return svgOpen('0 0 120 120') + drawer() + '</svg>';
  }

  function renderFigure(fig, index, showMarker) {
    var marker = showMarker ? '<span class="qsv2-choice-marker" aria-hidden="true" style="position:absolute;top:4px;left:6px;z-index:2;font:900 13px/1 sans-serif;background:#fff;border:2px solid #2b2540;border-radius:999px;padding:3px 6px;color:#2b2540">' + String.fromCharCode(65 + index) + '</span>' : '';
    return (
      '<div class="qsv2-geom-figure" style="position:relative;min-width:0;text-align:center" data-figure-id="' + esc(fig.id) + '" data-solid-id="' + esc(fig.solidId) + '">' +
      marker + drawSolid(fig.solidId) +
      '</div>'
    );
  }

  registerRenderer('geometry', function (question, params) {
    var visual = question && question.visual;
    if (!visual || !Array.isArray(visual.figures) || visual.figures.length === 0) {
      return '<div class="qsv2-geom-empty"></div>';
    }
    var layoutClass = visual.layout === 'gallery' ? 'qsv2-geom-gallery' : 'qsv2-geom-single';
    var showMarker = visual.layout === 'gallery';
    var body = visual.figures.map(function (fig, index) { return renderFigure(fig, index, showMarker); }).join('');
    var layoutStyle = visual.layout === 'gallery' ? 'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;max-width:260px;margin:4px auto 10px' : 'display:flex;justify-content:center;margin:4px auto 10px';
    return '<div class="' + layoutClass + '" style="' + layoutStyle + '">' + body + '</div>';
  });
})();
