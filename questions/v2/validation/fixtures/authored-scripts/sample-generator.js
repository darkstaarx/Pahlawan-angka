// Fixture-only authored generator, used solely by self-test.js to prove the
// authoring/bundling mechanism (registerGenerator injection) works. This
// file must NOT be copied into questions/v2/generators/ — that directory
// stays empty until real Phase 2 content is authored.
registerGenerator('fixture.addOneAndTwo', function (params, rng) {
  return { value: 3, distractors: [2, 4, 5] };
});
