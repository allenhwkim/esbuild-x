const { doesNotMatch } = require('assert');
const { fs, vol } = require('memfs');
const path = require('path');
const { watchAndReload } = require('../../post-builds');
const {konsole} = require('../../lib/util');
konsole.LOG_LEVEL = 'error';

test('post-builds - watchAndReload', done => {
  // path is relative to main directory, which package.json
  // const watchDir = path.join(__dirname, '..', 'test-files');
  const watchDir = 'test/test-files';
  const buildOptions = {
    bundle: true,
    write: false,
    metafile: true,
    outdir: 'dist',
    loader: {'.css': 'text', '.html': 'text'},
    entryPoints: ['test/test-files/main.js']
  };
  const watcher = watchAndReload(watchDir)(buildOptions);
  require('memfs').mkdirSync('dist', {recursive: true});

  setTimeout(_ => {
    const filename = 'test/test-files/index.html';
    const contents = require('fs').readFileSync(filename);
    require('fs').writeFileSync(filename, contents);

    setTimeout(_ => {
      // rebuild must happen
      expect(fs.existsSync('dist/main.js')).toBe(true);
      // updated file file must be copied to outdir
      //expect(fs.existsSync('dist/index.html')).toBe(true);
      watcher.close();
      done()
    }, 500)
  }, 1000);
});