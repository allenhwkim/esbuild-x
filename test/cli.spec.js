const bojagi = require('../lib');
const fs = require('fs');
const {konsole} = require('../lib/util.js');

jest.mock('../lib/util.js');
konsole.error = jest.fn().mockReturnValue(null);

jest.mock('fs');
jest.mock('bojagi');

/**
 * cli app are the same except it uses the following
 *  - process.stdin
 *  - process.stdout
 *  - process.argv
 *  - process.exit
 */
test('bojagi cli - invalid command', () => {

  fs.existsSync = jest.fn().mockReturnValue(false);
  jest.spyOn(process, 'exit').mockImplementationOnce(() => {
    throw new Error('process.exit() was called.')
  });

  // process.argv = `node bojagi command1 command2 --arg1 1 --arg2 2`.split(' ');

  expect(_ => require('../lib/cli.js')).toThrow('process.exit() was called.');
  expect(process.exit).toHaveBeenCalledWith(1);
  expect(konsole.error).toHaveBeenCalledWith('Error, invalid command');
});

test('bojagi cli - bojagi build', () => {

  fs.existsSync = jest.fn().mockReturnValue(false);
  bojagi.build = jest.fn();

  process.argv = `node bojagi build --outdir=out --minify=false`.split(' ');
  require('../lib/cli.js');

  expect(bojagi.build).toHaveBeenCalledWith(
    {
      entryPoints: [ 'src/main.js' ],
      entryNames: '[name]-[hash]',
      outdir: 'out',
      bundle: true,
      minify: 'false',
      metafile: true,
      write: true,
      sourcemap: 'external',
      config: 'bojagi.config.js'
    }
  )
});