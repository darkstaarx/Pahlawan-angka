// Fixture-only authored generator used solely by self-test.js §4d/4e to
// prove the enabled-readiness gate derives its generator keys from real
// authored source files (via engine/authored-registry.js) rather than a
// separate static registry. Registers the same key referenced by
// fixtures/enabled-ready-template.json ("geometry.identifyPrism"). This
// file must NOT be copied into questions/v2/generators/ — that directory
// stays empty until real Phase 2 content is authored.
registerGenerator('geometry.identifyPrism', function (params, rng) {
  return { value: 'prism', distractors: ['cube', 'cylinder'] };
});
