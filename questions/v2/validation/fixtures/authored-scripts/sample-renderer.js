// Fixture-only authored renderer, used solely by self-test.js.
registerRenderer('fixture.plainText', function (question, params) {
  return '<span>' + question.prompt + '</span>';
});
