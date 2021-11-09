const path = require('path');
const {getHtmlToInject, konsole} = require('../lib/util');

module.exports  = function injectEsbuildResult() { //port: websocket port

  return function(buildOptions, buildResult) {
    const fs = buildOptions.write ? require('fs') : require('memfs');

    const indexPath = path.join(buildOptions.outdir, 'index.html');
    const htmlToInject = getHtmlToInject(buildResult);
    const contents = fs.readFileSync(indexPath, {encoding: 'utf8'})
      .replace(/<\/body>/, `${htmlToInject}\n</body>`);
    fs.writeFileSync(indexPath, contents);

    konsole.info(`[bojagi post-builds] inject build script into ${indexPath}`);
  }

}