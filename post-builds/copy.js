const path = require('path');
const glob = require('glob');
const nodefs = require('fs');
const {konsole} = require('../lib/util');

function copyFromTo(from, to, {fs, replacements}) {
  const wildcard = from.indexOf('*') !== -1;
  const pattern = !wildcard && nodefs.lstatSync(from).isDirectory() ? `${from}/**/*` : from;
  const fromDirname = from.match(/\//) ? path.dirname(from.replace(/\/\*.*/, '/wildcard')) : from;

  glob.sync(pattern).forEach(file => {
    const target = file.replace(fromDirname, to);
    const targetDir= path.dirname(target);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, {recursive: true});
      konsole.debug('creating directory', targetDir);
    } 
    if (nodefs.lstatSync(file).isDirectory()) {
      fs.mkdirSync(target, {recursive: true});
      konsole.log('[esbuild-x] creating directory', target);
    } else {
      // if match to replace, run replace
      const replacement = replacements.find(repl => repl.match.test(file));
      if (replacement) {
        const contents = nodefs.readFileSync(file, 'utf8');
        const newContents = contents.replace(replacement.find, replacement.replace);
        fs.writeFileSync(target, newContents);
      } else {
        fs.writeFileSync(target, nodefs.readFileSync(file));
      }
      konsole.log('[esbuild-x] copying files', {from: file, to: target});
    }
  });
}

// copy files or directories to a given directory
module.exports = function copy(fromTos, {replacements} = {}) {
  replacements = replacements || [];

  return function copy(options={}, esbuildResult) {
    const fs = options.write ? require('fs') : require('memfs');
    fromTos = typeof fromTos === 'string' ? [fromTos] : fromTos;
    fromTos.forEach(strExpr => {
      const froms = strExpr.split(' ').slice(0, -1);
      const to = strExpr.split(' ').slice(-1)[0];
      froms.forEach( from => copyFromTo(from, to, {fs, replacements}) );
      konsole.info(`[esbuild-x post-builds] copying files ${froms} -> ${to}`);
    })
  }
}