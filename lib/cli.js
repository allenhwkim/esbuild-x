#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const { konsole } = require('./util.js');
const defaultConfig = require('./default.config');
const esbuildX = require('./index');

// parse shell command and arguments
// command: e.g. build, serve, or src/main.js
// commandArgs : e.g. --config=esbuild-x.config.js --outdir=out
const argv = yargs(hideBin(process.argv)).argv
const command = (argv._ || ['build'])[0];
const commandArgs = Object.assign({}, {config:'esbuild-x.config.js'}, argv);
delete commandArgs._;
delete commandArgs.$0;

const defaultConfigOptions = defaultConfig[command];

const userConfig = fs.existsSync(commandArgs.config) 
  && require(path.join(process.cwd(), commandArgs.config));
const userConfigOptions = userConfig[command];

if (!['build', 'serve'].includes(command) && !userConfigOptions) {
  konsole.error('Error, invalid command')
  process.exit(1);
}

// merge options
const options = Object.assign(
    {}, 
    defaultConfigOptions, 
    userConfigOptions, 
    commandArgs
  );

(async function() {
  delete options.config;
  // console.log({options, command});
  // options.entryPoints = [command];
  await esbuildX.build(options);
})();