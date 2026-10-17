const assert = require('node:assert/strict');

global.window = global;
require('../js/tapak-bina-router.js');
const router = global.PATapakBina;

const probes = {
  'D1.SHAPE': ['identify2d', 'identify3d'],
  'D2.7.1': ['identify3d', 'faces3d'],
  'D2.7.2': ['identify2d', 'property2d'],
  'D2.7.3': ['identify2d', 'identify3d', 'pattern2d'],
  'D3.SHAPE': ['identify_prism', 'identify_polygon', 'continue_pattern', 'select_axis'],  // v3.86.52: no perimeter in KSSR Tahun 3
  'D3.POSITION': ['read_position'],
  'D4.PERIM': ['perimeter_rect', 'composite_perimeter'],
  'D4.COORD': ['read_grid', 'reverse_axes'],
  'D5.AREA': ['area_rect', 'build_area', 'composite_area'],
  'D5.COORD': ['read_point', 'translate'],
  'D6.AREA': ['polygon_name6', 'polygon_perimeter6'],
  'D6.ANGLE': ['angle_measure', 'angle_construct', 'polygon_angle', 'y6v2_6_1_1_polygon_interior', 'y6v2_6_1_1_polygon_name', 'y6v2_6_1_1_polygon_perimeter', 'y6v2_6_1_1_perimeter_side'],
  'D6.CIRCLE': ['circle_part', 'radius_diameter', 'circle_draw'],
  'D6.SPACE_PROBLEM': ['polygon_angle', 'angle_construct', 'circle_part', 'y6v2_6_3_1_polygon_fence', 'y6v2_6_3_1_fence_compare'],
  'D6.COORD': ['scaled_distance', 'direction', 'missing_point']
};

for (const [skillId, archetypes] of Object.entries(probes)) {
  const grade = Number(skillId.match(/^D(\d)/)[1]);
  for (const archetypeId of archetypes) {
    const route = router.mapArch(grade, skillId, archetypeId);
    assert.ok(route, `${skillId}/${archetypeId} should map to a game challenge`);
    assert.ok(router.SKILL_FAMS[skillId].includes(route.fam), `${skillId}/${archetypeId} mapped outside its allowed families`);
  }
  const emptyPlan = router.planFor({ learnerReviewV1: { encounters: [] } }, skillId);
  assert.ok(emptyPlan?.fams.length, `${skillId} should have a safe starter route without prior encounters`);
}

const weakArea = router.planFor({ learnerReviewV1: { encounters: [1, 2, 3].map((n) => ({
  skillId: 'D5.AREA', grade: 5, mode: 'practice', archetypeId: 'area_rect', outcome: n === 1 ? 'independent' : 'corrected'
})) } }, 'D5.AREA');
assert.deepEqual(weakArea.fams, [{ fam: 'luas', start: 0 }]);
assert.equal(weakArea.reason, 'archetype');

console.log(`PASS: ${Object.keys(probes).length} Ruang skill routes and ${Object.values(probes).flat().length} sample archetypes across D1–D6.`);
