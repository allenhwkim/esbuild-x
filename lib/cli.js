#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const { konsole } = require('./util.js');
const defaultConfig = require('./esbuild.config');
const bojagi = require('./index');

// parse shell command and arguments
// command: e.g. build or serve
// commandArgs : e.g. --config=my-bojagi.config.js --outdir=out
const argv = yargs(hideBin(process.argv)).argv
const command = (argv._ || ['build'])[0];
const commandArgs = Object.assign({}, {config:'bojagi.config.js'}, argv);
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

bojagi.build(options);