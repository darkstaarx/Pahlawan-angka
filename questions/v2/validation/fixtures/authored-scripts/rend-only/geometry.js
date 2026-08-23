// Fixture-only authored renderer used solely by self-test.js §4d/4e.
// Registers the same key referenced by fixtures/enabled-ready-template.json
// ("geometry"). This file must NOT be copied into questions/v2/renderers/
// — that directory stays empty until real Phase 2 content is authored.
registerRenderer('geometry', function (question, params) {
  return '<svg></svg>';
});
