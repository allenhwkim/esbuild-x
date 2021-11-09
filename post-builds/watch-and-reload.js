const esbuild = require('esbuild');
const path = require('path');
const WebSocketServer = require('ws').Server;
const { konsole } = require('../lib/util');
const wsClients = require('./websocket-clients');

// returns options for esbuild only from all possible options by excluding keys
function getEsbuildOptions(allOptions) {
  const excludes = `config,preBuilds,postBuilds`.split(',');
  const esbuildOptions = {...allOptions};
  excludes.forEach(key => delete esbuildOptions[key]);
  return esbuildOptions;
}

function longestCommonSubstring(str1, str2) {
  let i = 0;
  while (str1.charAt(i) === str2.charAt(i)) i++;
  return str1.substring(0, i);
}

function runWebSocketServer(port, indexPath, fs) {
  const wsHtml = `\n<script>setTimeout(_ => {` +
      `var ws = new WebSocket('ws://localhost:${port}');` +
      `ws.onmessage = e => window.location.reload();` +
    `}, 1000)</script>`;
  const wss = new WebSocketServer({port});
  wss.on('connection', socket => wsClients.push(socket));
  konsole.info(`[bojagi post-builds] websocket server running on ${port}`);

  const contents = fs.readFileSync(indexPath, {encoding: 'utf8'})
    .replace(/<\/body>/, `${wsHtml}\n</body>`);
  fs.writeFileSync(indexPath, contents);

  return wss; 
}

module.exports = function runWatchAndReload(watchDir, websocketPort = 9100) {
  // watch file change and broadcast it to web browsers

  return function runWatchAndReload(options, buildResult) { 
    const fs = options.write ? require('fs') : require('memfs');

    /**
     * run websocket server to reload web browsers when file change
     */
    const indexPath = path.join(options.outdir, 'index.html');
    const wss = websocketPort && runWebSocketServer(websocketPort, indexPath, fs); // this updates index.html

    /**
     * watch file changes and rebuild, copy file, then broadcast to web browsers
     */
    const watcher = require('chokidar').watch(watchDir, {
      ignoreInitial: true, 
      interval: 1000
    });
    watcher.on('all', async (event, filePath) => {
      konsole.info(`[bojagi serve] file ${event} detected in ${filePath}`);

      // rebuild
      const esbuildOptions = getEsbuildOptions(options);
      esbuildOptions.metafile = true;
      const esbuildResult = await esbuild.build(esbuildOptions);
      esbuildResult.outputFiles.forEach(outputFile => {
        fs.writeFileSync(outputFile.path, outputFile.contents);
      });

      // copy file because it's changed unless it's a part of build
      if (!esbuildResult.metafile.inputs[filePath]) { 
        const contents = require('fs').readFileSync(filePath, {encoding: 'utf8'});

        const commonPath = longestCommonSubstring(filePath, options.outdir);
        const pathRelPath = filePath.replace(commonPath, '');
        const outdirRelPath = options.outdir.replace(commonPath, '');
        const destPath = pathRelPath.replace(/^.*?\//, outdirRelPath + '/');

        const outPath = commonPath + destPath;
        if (fs.existsSync(path.dirname(outPath)) === false) {
          fs.mkdirSync(path.dirname(outPath));
        }

        fs.writeFileSync(commonPath + destPath, contents);
        konsole.info('[bojagi watch-and-reload]', filePath, '>', destPath )
      }
    
      // broadcast to web browsers
      wsClients.forEach(wsClient => wsClient.send('reload'));
      konsole.info(`[bojagi post-builds] watching changes on ${watchDir}`);
    });

    return {watcher, wss};
  }

}