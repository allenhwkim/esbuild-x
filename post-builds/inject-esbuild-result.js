const path = require('path');
const WebSocketServer = require('ws').Server;

const wsClients = require('./websocket-clients');
const {getHtmlToInject, konsole} = require('../lib/util');

module.exports  = function injectEsbuildResult(webSocketPort) { //port: websocket port

  return function(buildOptions, buildResult) {
    const fs = buildOptions.write ? require('fs') : require('memfs');

    // run a websocket server when a websocket port is given
    let wsHtml = '';
    let wss;
    if (webSocketPort) {
      wsHtml = `\n<script>setTimeout(_ => {` +
          `var ws = new WebSocket('ws://localhost:${webSocketPort}');` +
          `ws.onmessage = e => window.location.reload();` +
        `}, 1000)</script>`;
      wss = new WebSocketServer({port: webSocketPort});
      wss.on('connection', socket => wsClients.push(socket));
      konsole.info(`[bojagi post-builds] websocket server running on ${webSocketPort}`);
    }

    const indexPath = path.join(buildOptions.outdir, 'index.html');
    const htmlToInject = getHtmlToInject(buildResult);
    const contents = fs.readFileSync(indexPath, {encoding: 'utf8'})
      .replace(/<\/body>/, `${htmlToInject}${wsHtml}\n</body>`);
    fs.writeFileSync(indexPath, contents);

    konsole.info(`[bojagi post-builds] inject build script into ${indexPath}`);
    return wss;
  }
}