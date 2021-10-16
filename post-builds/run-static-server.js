const path = require('path');
const http = require('http');
const { konsole } = require('../lib/util.js');

module.exports = function runStaticServer(options, esbuildResult) {

  http.createServer(function (req, res) {
    const fs = options.write ? require('fs') : require('memfs');

    let filePath = new URL(`file://${req.url}`).pathname;
    filePath = path.join(options.outdir, filePath);
    fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory() &&
      (filePath = path.join(filePath, 'index.html'));

    if (fs.existsSync(filePath)) {
      const contents = fs.readFileSync(filePath);
      res.end(contents);
    } else { // 404
      const foundKey = Object.keys(options.notFoundHandler)
        .find(re => req.url.match(new RegExp(re)));
      if (foundKey) {
        konsole.info('\n[serve]', 404, req.url, '->', options.notFoundHandler[foundKey] );
        const redirPath = path.join(options.outdir, options.notFoundHandler[foundKey]);
        const contents = fs.readFileSync(redirPath, {encoding: 'utf8'});
        res.end(contents);
      } 
    }

    konsole.info(`[bojagi post-builds] http static web server running, http://localhost:${options.port}`);
  }).listen(options.port);
}