const path = require('path');
const {vol} = require('memfs');

const { copy } = require('../post-builds');
const {konsole} = require('../lib/util');
konsole.LOG_LEVEL = 'error';

const esbuildX = require('../lib');

beforeEach( async () => {});
afterEach( async () => { });

test('esbuildX.build', async () => {
  const preBuildFunc = jest.fn();
  const postBuildFunc = jest.fn();
  const result = await esbuildX.build({
      entryPoints: ['test/test-files/main.js'],
      entryNames: '[name]',
      outdir: 'dist',
      bundle: true,
      minify: true,
      write: false,
      metafile: true,
      plugins: [esbuildX.plugins.minifyHtmlPlugin],
      preBuilds: [preBuildFunc],
      postBuilds: [postBuildFunc]
    });
  
  // esbuildX properties
  expect(typeof esbuildX.build).toBe('function');
  expect(typeof esbuildX.buildSync).toBe('function');
  expect(typeof esbuildX.transformSync).toBe('function');
  expect(esbuildX.plugins).toBeTruthy();
  expect(esbuildX.postBuilds).toBeTruthy();

  // esbuildX.build must calls preBuild and postBuild functions
  expect(preBuildFunc).toHaveBeenCalled();
  expect(postBuildFunc).toHaveBeenCalled();

  // esbuildX.build must run esbuild.build
  expect(result.warnings.length).toBe(0);
  expect(result.errors.length).toBe(0);
  expect(result.metafile.outputs['dist/main.js']).toBeTruthy();
  expect(result.metafile.outputs['dist/main.css']).toBeTruthy();

});
