const WebSocketServer = require('ws').Server;
const wsClients = require('./websocket-clients');
const { konsole } = require('../lib/util');

module.exports = function runWebsocketServer(options, buildResult) {
  const wss = new WebSocketServer({ port: options.port + 1});
  wss.on('connection', socket => wsClients.push(socket));
  konsole.info(`[bojagi post-builds] websocket server running on ${options.port + 1}`);
};