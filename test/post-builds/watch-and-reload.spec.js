const WebSocket = require('ws');
const { fs, vol } = require('memfs');
const path = require('path');
const { watchAndReload } = require('../../post-builds');
const wsClients = require('../../post-builds/websocket-clients');
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
  const {watcher} = watchAndReload(watchDir, null)(buildOptions);
  require('memfs').mkdirSync('dist', {recursive: true});

  setTimeout(_ => { // to avoid initial changes detection
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

test('post-builds - watch and reload - websocket', done => {
  const {fs, vol} = require('memfs');
  const watchDir = 'test/test-files';
  const buildOptions = {
    bundle: true,
    write: false,
    metafile: true,
    outdir: 'dist',
    loader: {'.css': 'text', '.html': 'text'},
    entryPoints: ['test/test-files/main.js']
  };
  fs.mkdirSync('dist', {recursive: true});
  fs.writeFileSync( 'dist/index.html', `<html><head></head><body></body></html>`);

  const {watcher, wss}  = watchAndReload(watchDir, 9010, fs)(buildOptions);
  setTimeout(_ => { // to avoid initial changes detection
    // then verify the result
    const result = vol.toJSON();
    const outPath = path.resolve(path.join('dist', 'index.html'));
    expect(result[outPath]).toContain('ws://localhost:9010');
    expect(result[outPath]).toContain('ws.onmessage = e => window.location.reload()');

    expect(wsClients.length).toBe(0);
    const ws = new WebSocket('ws://localhost:9010'); // a websocket client
    ws.on('open', _ => expect(wsClients.length).toBe(1))

    setTimeout(_ =>  {
      ws.close();
      wss.close();
      watcher.close();
      done();
    }, 1000)
  });
});