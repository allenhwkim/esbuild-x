const path = require('path');
const { injectEsbuildResult } = require('../../post-builds');
const { getHtmlToInject, konsole } = require('../../lib/util');
konsole.LOG_LEVEL = 'error';

jest.mock('../../lib/util');
getHtmlToInject.mockImplementation(() => 'BUILD_RESULT');

// beforeEach( async () => { });
// afterEach( async () => { });

test('post-builds - injectEsbuildResult', () => {
  const {fs, vol} = require('memfs');
  
  // write to index.html, path is relative to main directory, which package.json exists
  fs.mkdirSync('dist', {recursive: true});
  fs.writeFileSync('dist/index.html', `<html><head></head><body></body></html>`);

  // FYI, path is relative to main directory, which package.json exists
  const buildOptions = { entryPoints: 'test/test-files/main.js', outdir: 'dist' };
  const wss = injectEsbuildResult()(buildOptions, {});

  // then verify the result
  const result = vol.toJSON();
  const outPath = path.resolve(path.join('dist', 'index.html'));
  expect(result[outPath]).toContain('BUILD_RESULT');
});
