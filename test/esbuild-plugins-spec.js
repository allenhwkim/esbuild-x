const esbuild = require('esbuild');
const path = require('path');
const {minifyCssPlugin, minifyHtmlPlugin} = require('../esbuild-plugins');

let esbuildResult;
beforeEach( async () => {
  const options = {
    entryPoints: [path.join(__dirname, 'test-files/main.js')],
    plugins: [minifyCssPlugin, minifyHtmlPlugin],
    entryNames: '[name]',
    bundle: true,
    minify: true,
    write: false
  };

  esbuildResult = await esbuild.build(options);
});

afterEach(() => {/* test cleanup */});

test('plugin - minify html / minify css', () => {
  const out = esbuildResult.outputFiles[0].text;
  expect(out.length).toBe(488);
});


