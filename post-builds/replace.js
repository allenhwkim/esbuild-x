const glob = require('glob');
const {konsole} = require('../lib/util');

function replace(replacements) {
  return function replace(buildOptions, buildResult) {
    const fs = buildOptions.write ? require('fs') : require('memfs');
    replacements.forEach( repl => {
      glob.sync(`${buildOptions.outdir}/${repl.match}`).forEach(file => {
        const contents = fs.readFileSync(file, {encoding: 'utf8'})
          .replace(repl.regex, repl.replace);
        fs.writeFileSync(file, contents);
      });
      konsole.info(`[bojagi post-builds] replaced ${repl.rege} to ${repl.replace} in ${repl.match}`);
    })
  };
}

module.exports = replace;