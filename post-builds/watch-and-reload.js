const copy = require('bojagi/post-builds/copy');
const esbuild = require('esbuild');
const {konsole, getEsbuildOptions} = require('../lib/util');
const wsClients = require('./websocket-clients');

module.exports = function runWatchAndReload(watchDir) {
  // watch file change and broadcast it to web browsers
  return function runWatchAndReload(options, buildResult) { 

    require('chokidar').watch(watchDir, {ignoreInitial: true, interval: 1000})
      .on('all', async (event, path) => {
        const fs = options.write ? require('fs') : require('memfs');
        // const fs = require('fs');
        konsole.info(`[serve] file ${event} detected in ${path}`);

        // rebuild
        const esbuildOptions = getEsbuildOptions(options);
        const esbuildResult = await esbuild.build(esbuildOptions);
        esbuildResult.outputFiles.forEach(outputFile => {
          fs.writeFileSync(outputFile.path, outputFile.contents);
        });

        // copy file if not a part of build
        if (!esbuildResult.metafile.inputs[path]) { 
          const contents = require('fs').readFileSync(path, {encoding: 'utf8'});
          // todo, destination directory might be different by how it's copied
          const destPath = path.replace(/^.*?\//, options.outdir + '/');
          fs.writeFileSync(destPath, contents);
          console.log('watch-and-reload', path, '>', destPath )
        }
      
        // reload
        wsClients.forEach(wsClient => wsClient.send('reload'));
      });
  }
}