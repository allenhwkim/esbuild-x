const path = require('path');
const axios = require('axios');
const { runStaticServer } = require('../../post-builds');
const {konsole} = require('../../lib/util');
konsole.LOG_LEVEL = 'error';

// beforeEach( async () => { });
// afterEach( async () => { });
test('post-builds - runStaticServer', async () => {
  const server = runStaticServer('test/test-files', { // relative to main directory
    fs: require('fs'), 
    port: 9100
  })();

  // serve test.html
  const res1 = await axios('http://localhost:9100/test.html');
  expect(res1.status).toBe(200);

  // serve test.css
  const res2 = await axios('http://localhost:9100/test.css');
  expect(res2.status).toBe(200);

  // serve / (/index.html)
  const res3 = await axios('http://localhost:9100');
  expect(res3.status).toBe(200);

  // serve 404 -> /index.html
  const res4 = await axios('http://localhost:9100/foo');
  expect(res4.status).toBe(200);

  server.close();
});