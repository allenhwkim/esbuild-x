const { getHtmlToInject } = require('../lib/util');

test('util - getHtmlToInject', () => {
  const esbuildResult = {
    outputFiles : [{path: 'a.js'}, {path: 'b.css'}]
  }
  const result = getHtmlToInject(esbuildResult);

  expect(result).toContain(`<script src="a.js"></script>`);
  expect(result).toContain(`<link rel="stylesheet" href="b.css" />`);
});

