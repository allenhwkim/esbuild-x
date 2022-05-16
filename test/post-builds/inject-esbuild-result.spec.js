const path = require('path');
const { injectEsbuildResult } = require('../../post-builds');
const { konsole } = require('../../lib/util');
konsole.LOG_LEVEL = 'error';

// beforeEach( async () => { });
// afterEach( async () => { });

test('post-builds - injectEsbuildResult', () => {
  const {fs, vol} = require('memfs');
  
  // write to index.html, path is relative to main directory, which package.json exists
  fs.mkdirSync('dist', {recursive: true});
  fs.writeFileSync('dist/index.html', `<html><head></head><body></body></html>`);

  // FYI, path is relative to main directory, which package.json exists
  const buildOptions = { entryPoints: 'test/test-files/main.js', outdir: 'dist' };
  const wss = injectEsbuildResult('test/test-files/index.html')(buildOptions, {
    outputFiles: [ {path: 'main.js', contents: 'MAIN_JS'} ] 
  });

  // then verify the result
  const result = vol.toJSON();

  expect(result[path.resolve('dist/main.js')]).toBe('MAIN_JS');
  expect(result[path.resolve('dist/index.html')]).toContain(` <script src="main.js"></script>`);
});
