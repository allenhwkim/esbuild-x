#!/usr/bin/env node
const orgfs = require('fs');
const {fs, vol} = require('memfs');
const path = require('path');
const util = require('./util.js');
const dflt = require('./default-options');
const esbuild = require('esbuild');
const open = require('open');
const { printEsbuildResult, parseShellCommand, konsole } = util;

// returns options for esbuild only from all possible options by excluding keys
function getEsbuildOptions(allOptions) {
  const excludes = `config,port,notFoundHandler,preBuilds,postBuilds,open`.split(',');
  const esbuildOptions = {...allOptions};
  excludes.forEach(key => delete esbuildOptions[key]);
  return esbuildOptions;
}

const {commands, args} = parseShellCommand();
const command = commands[0];
const configFilePath = path.join(process.cwd(), args.config);
const userConfig = orgfs.existsSync(configFilePath) && require(configFilePath) || {};
const configJs = userConfig[command] || {};
if (!['build', 'serve'].includes(command) && !userConfig[command]) {
  konsole.error('Error, invalid command')
  return 1;
}

// get options
const defaultOptions = command === 'serve' ? dflt.serve: dflt.build;
const options = Object.assign({}, defaultOptions, configJs, args);

// run pre builds
options.preBuilds.forEach(preBuildFunc => {
  konsole.info('[bojagi] pre build', preBuildFunc.name);
  preBuildFunc(options);
});

// run esbuild
const esbuildOptions = getEsbuildOptions(options);
esbuild.build(esbuildOptions).then(esbuildResult => {
  printEsbuildResult(esbuildResult);
  if (!options.write) {
    // need to create a memory directory
    fs.mkdirSync(path.join(process.cwd(), options.outdir), {recursive: true});
    // write build result to a memory directory
    esbuildResult.outputFiles.forEach(outputFile => {
      fs.writeFileSync(outputFile.path, outputFile.contents);
    })
  }

  // run post builds
  (options.open && options.port) &&
    options.postBuilds.push( _ => open(`http://localhost:${options.port}`));
  options.postBuilds.forEach(postBuildFunc => {
    postBuildFunc(options, esbuildResult);
  });
});
