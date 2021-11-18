const path = require('path');
const { copy } = require('../../post-builds');
const {konsole} = require('../../lib/util');
konsole.LOG_LEVEL = 'error';

beforeEach( async () => {});
afterEach( async () => { });

test('post-builds - copy', () => {
  const {fs, vol} = require('memfs');
  const replacements = [
    {match: /index\.html/, find: /FOO/, replace: 'BAR'}
  ];
  const excludes = [/excludes/];
  // path is relative to main directory, which package.json exists
  copy('test/test-files/**/!(*.js) dist', {fs, replacements, excludes})();

  const result = vol.toJSON();
  const prefix = path.join(process.cwd(), 'dist');
  expect(result[`${prefix}/index.html`]).toBeTruthy();
  expect(result[`${prefix}/test.html`]).toBeTruthy();
  expect(result[`${prefix}/test.css`]).toBeTruthy();
  expect(result[`${prefix}/excludes`]).toBeFalsy();
  expect(result[`${prefix}/excludes/foo.html`]).toBeFalsy();
  expect(result[`${prefix}/index.html`]).toContain('<head><!-- Build at:');
  expect(result[`${prefix}/index.html`]).toContain('<!-- BAR -->');
});




