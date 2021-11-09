const path = require('path');
const {vol} = require('memfs');

const { copy } = require('../post-builds');
const {konsole} = require('../lib/util');
konsole.LOG_LEVEL = 'error';

const bojagi = require('../lib');

beforeEach( async () => {});
afterEach( async () => { });

test('bojagi.build', async () => {
  const preBuildFunc = jest.fn();
  const postBuildFunc = jest.fn();
  const result = await bojagi.build({
      entryPoints: ['test/test-files/main.js'],
      entryNames: '[name]',
      outdir: 'dist',
      bundle: true,
      minify: true,
      write: false,
      metafile: true,
      plugins: [bojagi.esbuildPlugins.minifyHtmlPlugin],
      preBuilds: [preBuildFunc],
      postBuilds: [postBuildFunc]
    });
  
  // bojagi properties
  expect(typeof bojagi.build).toBe('function');
  expect(bojagi.esbuildPlugins).toBeTruthy();
  expect(bojagi.postBuilds).toBeTruthy();

  // bojagi.build must calls preBuild and postBuild functions
  expect(preBuildFunc).toHaveBeenCalled();
  expect(postBuildFunc).toHaveBeenCalled();

  // bojagi.build must run esbuild.build
  expect(result.warnings.length).toBe(0);
  expect(result.errors.length).toBe(0);
  expect(result.metafile.outputs['dist/main.js']).toBeTruthy();
  expect(result.metafile.outputs['dist/main.css']).toBeTruthy();

  // bojagi.build write outputs to memfs
  expect(vol.toJSON()['/Users/allen.kim/github/bojagi/dist/main.js']).toBeTruthy();
  expect(vol.toJSON()['/Users/allen.kim/github/bojagi/dist/main.css']).toBeTruthy();
});
