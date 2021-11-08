const path = require('path');
const { copy } = require('../../post-builds');
const {konsole} = require('../../lib/util');
konsole.LOG_LEVEL = 'error';

function longestCommonSubstring(str1, str2) {
  let i = 0;
  while (str1.charAt(i) === str2.charAt(i)) i++;
  return str1.substring(0, i);
}

beforeEach( async () => {});
afterEach( async () => { });

test('post-builds - copy', () => {
  const {fs, vol} = require('memfs');
  const replacements = [
    {match: /index\.html/, find: /FOO/, replace: 'BAR'}
  ];
  // path is relative to main directory, which package.json exists
  copy('test/test-files/**/!(*.js) dist', {fs, replacements})();

  const result = vol.toJSON();
  const prefix = path.join(process.cwd(), 'dist');
  expect(result[`${prefix}/index.html`]).toBeTruthy();
  expect(result[`${prefix}/test.html`]).toBeTruthy();
  expect(result[`${prefix}/test.css`]).toBeTruthy();
  expect(result[`${prefix}/index.html`]).toContain('<!-- BAR -->');
});




