#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const { konsole } = require('./util.js');
const defaultConfig = require('./default.config');
const esbuildX = require('./index');

// command: e.g. build, serve, or src/main.js
// commandArgs : e.g. --config=esbuild-x.config.js --outdir=out
const argv = yargs(hideBin(process.argv)).argv
let command = argv._[0] || 'build';
const commandArgs = Object.assign({}, {config:'esbuild-x.config.js'}, argv);
delete commandArgs._;
delete commandArgs.$0;

const userConfigFile = commandArgs.config;
const userConfig = fs.existsSync(userConfigFile) ? 
  require(path.join(process.cwd(), userConfigFile)) : {};
const userConfigKeys = Object.keys(userConfig);
const allPossibleKeys = ['build', 'serve', ...userConfigKeys];

if (command.match(/\.[a-z]+$/)) {
  commandArgs.entryPoints = [command];
  command = 'build';
} else if (!allPossibleKeys.includes(command)) {
  konsole.error('Error, invalid command')
  process.exit(1);
}

// convert 'true' and 'false' to booleans
for(var key in commandArgs) {
  (commandArgs[key] === 'true') && (commandArgs[key] = true);
  (commandArgs[key] === 'false') && (commandArgs[key] = false);
}

// merge options
const defaultConfigOptions = defaultConfig[command];
const userConfigOptions = userConfig[command];
const options = Object.assign(
    {}, 
    defaultConfigOptions, 
    userConfigOptions, 
    commandArgs
  );

(async function() {
  const analyze = options.analyze;
  delete options.config;
  delete options.analyze;
  // console.log({options, command});
  // options.entryPoints = [command];
  const result = await esbuildX.build(options);
  if (analyze) {
    const verbose = analyze === 'verbose';
    let analytics = await esbuild.analyzeMetafile(result.metafile, {verbose});
    console.log(analytics)
  }
})();