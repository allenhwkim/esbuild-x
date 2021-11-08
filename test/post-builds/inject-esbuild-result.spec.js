const path = require('path');
const WebSocket = require('ws');
const { injectEsbuildResult } = require('../../post-builds');
const { getHtmlToInject, konsole } = require('../../lib/util');
konsole.LOG_LEVEL = 'error';
const wsClients = require('../../post-builds/websocket-clients');

jest.mock('../../lib/util', () => {
  const originalModule = jest.requireActual('../../lib/util');

  return {
    __esModule: true,
    ...originalModule,
    getHtmlToInject: _ => 'BUILD_RESULT'
  };
});

beforeEach( async () => { });
afterEach( async () => { });

test('post-builds - injectEsbuildResult', done => {
  const {fs, vol} = require('memfs');
  
  // write to index.html, path is relative to main directory, which package.json exists
  fs.mkdirSync('dist', {recursive: true});
  fs.writeFileSync(
    'dist/index.html', 
    `<html><head><!-- FOO --></head><body></body></html>`
  );

  // then run injectEsbuildResult()
  // FYI, path is relative to main directory, which package.json exists
  const buildOptions = { entryPoints: 'test-files/main.js', outdir: 'dist' };
  const buildResult = {};
  const wss = injectEsbuildResult(9000)(buildOptions, buildResult);

  // then verify the result
  const result = vol.toJSON();
  const outPath = path.resolve(path.join('dist', 'index.html'));
  expect(result[outPath]).toContain('BUILD_RESULT');
  expect(result[outPath]).toContain('ws://localhost:9000');
  expect(result[outPath]).toContain('ws.onmessage = e => window.location.reload()');

  expect(wsClients.length).toBe(0);
  const ws = new WebSocket('ws://localhost:9000'); // a websocket client

  ws.on('open', _ => expect(wsClients.length).toBe(1))

  setTimeout(_ =>  {
    ws.close();
    wss.close();
    done();
  }, 1000)
});