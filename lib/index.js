#!/usr/bin/env node
const path = require('path');
const esbuild = require('esbuild');

const {konsole} = require('./util.js');
const esbuildPlugins = require('../esbuild-plugins');
const postBuilds = require('../post-builds');

const build = async function(options) {
  // run preBuilds
  (options.preBuilds || []).forEach(preBuildFunc => preBuildFunc(options));

  // run esbuild
  const esbuildOptions = {metafile: true};
  for(var key in options) {
    if (!['config', 'preBuilds', 'postBuilds'].includes(key)) {
      esbuildOptions[key] = options[key];
    }
  }
  const esbuildResult = await esbuild.build(esbuildOptions);

  // print esbuild result
  esbuildResult.warnings.forEach(warning => konsole.warn(warning))
  esbuildResult.errors.forEach(error => konsole.error(error));
  for (var key in esbuildResult.metafile.outputs) {
    konsole.info('output', key, esbuildResult.metafile.outputs[key].bytes);
  }

  // write to memory disk if !options.write
  if (!options.write) {
    // need to create a memory directory
    const dirPath = path.join(process.cwd(), options.outdir);
    require('memfs').mkdirSync(dirPath, {recursive: true});
    // write build result to a memory directory
    esbuildResult.outputFiles.forEach(outputFile => {
      require('memfs').writeFileSync(outputFile.path, outputFile.contents);
    });
  }

  // run postBuilds
  (options.postBuilds || []).forEach(postBuildFunc => postBuildFunc(options, esbuildResult) );
  return esbuildResult;
};

module.exports = {
  build,
  esbuildPlugins,
  postBuilds
};