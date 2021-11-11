#!/usr/bin/env node
const path = require('path');
const memfs = require('memfs');
const esbuild = require('esbuild');

const esbuildPlugins = require('../esbuild-plugins');
const postBuilds = require('../post-builds');

const build = async function(options) {
  // run preBuilds
  (options.preBuilds || []).forEach(preBuildFunc => preBuildFunc(options));

  // run esbuild
  const esbuildOptions = Object.keys(options).reduce( (acc, key) => {
    !['config', 'preBuilds', 'postBuilds'].includes(key) && (acc[key] = options[key]);
    return acc;
  }, {metafile: true});
  const esbuildResult = await esbuild.build(esbuildOptions);

  // if not write to disk, write to memory so that we can serve
  if (!options.write) {
    memfs.mkdirSync(path.join(process.cwd(), options.outdir), {recursive: true});
    esbuildResult.outputFiles.forEach(file => memfs.writeFileSync(file.path, file.contents) );
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