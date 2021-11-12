const esbuildX = require('../lib');
const fs = require('fs');
const {konsole} = require('../lib/util.js');

jest.mock('../lib/util.js');
konsole.error = jest.fn().mockReturnValue(null);

jest.mock('fs');
jest.mock('../lib');

/**
 * cli app are the same except it uses the following 
 *  - process.stdin(.stdout, .argv, .exit)
 */

test('esbuild-x cli "esbuild-x main.js"', done => {
  fs.existsSync = jest.fn().mockReturnValue(false);

  process.argv = `node esbuild-x main.js`.split(' ');
  require('../lib/cli.js');
  expect(esbuildX.build).toHaveBeenCalledWith({
      entryPoints: [ 'main.js' ],
      entryNames: '[name]-[hash]',
      outdir: 'dist',
      bundle: true,
      minify: true,
      metafile: true,
      write: true,
      sourcemap: 'external'
    });
  done();
});

// test('esbuild-x cli "esbuild-x INVALID"', () => {
//   fs.existsSync = jest.fn().mockReturnValue(false);
//   jest.spyOn(process, 'exit').mockImplementationOnce(() => {
//     throw new Error('process.exit() was called.')
//   });

//   process.argv = `node esbuild-x INVALID`.split(' ');

//   expect(_ => require('../lib/cli.js')).toThrow('process.exit() was called.');
//   expect(process.exit).toHaveBeenCalledWith(1);
//   expect(konsole.error).toHaveBeenCalledWith('Error, invalid command');
// });

// test('esbuild-x cli - esbuild-x serve --outdir=out --minify=false', () => {
//   fs.existsSync = jest.fn().mockReturnValue(false);
//   esbuildX.build = jest.fn();

//   process.argv = `node esbuild-x serve --outdir=out --minify=false`.split(' ');
//   require('../lib/cli.js');

//   expect(esbuildX.build).toHaveBeenCalledWith(expect.objectContaining(
//     {
//       entryPoints: [ 'src/main.js' ],
//       entryNames: '[name]',
//       outdir: 'out',
//       bundle: true,
//       minify: false,
//       metafile: true,
//       watch: false,
//       write: false,
//       sourcemap: 'external'
//     })
//   )
// });