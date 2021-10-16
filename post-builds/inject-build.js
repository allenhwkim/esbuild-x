const path = require('path');
const {getHtmlToInject} = require('bojagi/lib/util');


module.exports  = function injectBuild(buildOptions, buildResult) {
  const fs = buildOptions.write ? require('fs') : require('memfs');
  const htmlToInject = getHtmlToInject(buildResult);
  const wsHtml = buildOptions.port ? `\n<script>setTimeout(_ => {` +
        `var ws = new WebSocket('ws://localhost:${buildOptions.port + 1}');` +
        `ws.onmessage = e => window.location.reload();` +
      `}, 1000)</script>` : '';

  const indexPath = path.join(buildOptions.outdir, 'index.html');
  const contents = fs.readFileSync(indexPath, {encoding: 'utf8'})
    .replace(/<\/body>/, `${htmlToInject}${wsHtml}\n</body>`);
  fs.writeFileSync(indexPath, contents);
}