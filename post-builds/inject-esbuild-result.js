const { build } = require('esbuild');
const path = require('path');
const {konsole} = require('../lib/util');

module.exports  = function injectEsbuildResult() { 

  return function(buildOptions, buildResult) {
    const fs = buildOptions.write ? require('fs') : require('memfs');

    // write build result, e.g. main.js, to outdir if write is false
    if (!buildOptions.write) {
      fs.mkdirSync(path.join(process.cwd(), buildOptions.outdir), {recursive: true});
      buildResult.outputFiles.forEach(file => {
        const filePath = path.join(process.cwd(), buildOptions.outdir, file.path);
        fs.writeFileSync(filePath, file.contents) 
      });
    }

    // get html to inject to the end of <body> of index.html
    const buildFileNames = buildResult.outputFiles ?
    buildResult.outputFiles.map(el => el.path) : Object.keys(buildResult.metafile.outputs);
    const htmlToInject = buildFileNames.map(fileName => {
        const path = fileName.split('/').slice(-1)[0];
        const ext = path.match(/\.([a-z]+)$/)[1];
        return ext === 'js' ? `    <script src="${path}"></script>` :
              ext === 'css' ? `    <link rel="stylesheet" href="${path}" />` : '';
      }).join('\n');
      
    // update index.html
    const indexPath = path.join(buildOptions.outdir, 'index.html');
    const contents = fs.readFileSync(indexPath, {encoding: 'utf8'})
      .replace(/<\/body>/, `${htmlToInject}\n</body>`);
    fs.writeFileSync(indexPath, contents);

    konsole.info(`[esbuild-x post-builds] inject build script into ${indexPath}`);
  }

}