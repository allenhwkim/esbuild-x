const esbuildX = require('../lib');
const fs = require('fs');
const {konsole} = require('../lib/util.js');

jest.mock('../lib/util.js');
konsole.error = jest.fn().mockReturnValue(null);

jest.mock('fs');
jest.mock('../lib');

test('esbuild-x cli - esbuild-x serve --outdir=out --minify=false', () => {
  fs.existsSync = jest.fn().mockReturnValue(false);
  esbuildX.build = jest.fn();

  process.argv = `node esbuild-x serve --outdir=out --minify=false`.split(' ');
  require('../lib/cli.js');

  expect(esbuildX.build).toHaveBeenCalledWith(expect.objectContaining(
    {
      entryPoints: [ 'src/main.js' ],
      entryNames: '[name]',
      outdir: 'out',
      bundle: true,
      minify: false,
      metafile: true,
      watch: false,
      write: false,
      sourcemap: 'external'
    })
  )
});