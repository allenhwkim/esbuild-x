#!/usr/bin/env node
const esbuild = require('esbuild');

const build = async function(options) {
  // run preBuilds
  (options.preBuilds || []).forEach(preBuildFunc => preBuildFunc(options));

  // run esbuild
  const esbuildOptions = Object.keys(options).reduce( (acc, key) => {
    !['preBuilds', 'postBuilds'].includes(key) && (acc[key] = options[key]);
    return acc;
  }, {metafile: true});
  const esbuildResult = await esbuild.build(esbuildOptions);

  // run postBuilds
  (options.postBuilds || []).forEach(postBuildFunc => postBuildFunc(options, esbuildResult) );
  return Promise.resolve(esbuildResult);
};

module.exports = Object.assign({}, esbuild, {
  build,
  plugins: require('../esbuild-plugins'),
  postBuilds: require('../post-builds')
});