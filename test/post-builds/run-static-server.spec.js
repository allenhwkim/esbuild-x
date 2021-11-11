const axios = require('axios');
const killport = require('kill-port');

const { runStaticServer } = require('../../post-builds');
const {konsole} = require('../../lib/util');
konsole.LOG_LEVEL = 'error';

const port = 9100;
beforeAll(async () => await killport(port));
// beforeEach( async () => { });
// afterEach( async () => { });

test('post-builds - runStaticServer', async () => {
  const server = runStaticServer('test/test-files', { // relative to main directory
    fs: require('fs'), 
    port: port
  })();

  // serve test.html
  const res1 = await axios(`http://localhost:${port}/test.html`);
  expect(res1.status).toBe(200);

  // serve test.css
  const res2 = await axios(`http://localhost:${port}/test.css`);
  expect(res2.status).toBe(200);

  // serve / (/index.html)
  const res3 = await axios(`http://localhost:${port}`);

  expect(res3.status).toBe(200);

  // serve 404 -> /index.html
  const res4 = await axios(`http://localhost:${port}/foo`);
  expect(res4.status).toBe(200);

  server.close();
});