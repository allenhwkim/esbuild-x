# bojagi (esbuild + pre builds + post builds)
bojagi is a a traditional Korean wrapping cloth for books, gifts, etc.

<img src="https://user-images.githubusercontent.com/1437734/137397396-907b5436-7489-4a6f-8e5a-25b111397258.png" width=200 />

## Features
* start dev server instantly using esbuild
* support single page application 404 fallback page
* reload browser when rebuild and a file changes
* open browser when a dev server starts
* customizable pre build functions
* customizable post build functions

## Usage
```
$ npm i bojagi -D
$ bojagi build
$ bojagi serve
```

### Config example(e.g. bojagi.config.js)
https://github.com/elements-x/elements-x/blob/master/bojagi.config.js
```
const glob = require('glob');
const open  = require('open');
const { rimraf } = require('bojagi/lib/util');

const { minifyHtmlPlugin, minifyCssPlugin } = require('bojagi/esbuild-plugins');
const {
  copy, 
  injectBuild, 
  replace, 
  runWebsocketServer, 
  runStaticServer, 
  watchAndReload
} = require('bojagi/post-builds');

const config = {};
config.build = {
  entryPoints: ['src/main.js'],
  plugins: [minifyCssPlugin, minifyHtmlPlugin],
  preBuilds: [ function clear() {rimraf('dist')} ], 
  postBuilds: [ 
    copy('src/assets src/components src/tools src/*.html src/*.css public/* dist'),
    injectBuild,
    replace([{match: 'index.html', regex: /BUILD_DATE/, replace: new Date()}]),
  ]
};

config.serve = {
  entryPoints: ['src/main.js'],
  loader: { '.html': 'text', '.css': 'text' },
  entryNames: '[name]',
  postBuilds: [
    copy('src/assets src/components src/tools src/*.html src/*.css public/* dist'),
    injectBuild,
    replace([{match: 'index.html', regex: /BUILD_DATE/, replace: new Date()}]),
    runStaticServer,
    runWebsocketServer,
    watchAndReload(['src', 'lib']),
    function openBrowser() { open(`http://localhost:8080`); }
  ]
};

const entryPoints = glob.sync('lib/*/index.js').reduce( (ret, el) => {
  ret[el.split('/')[1]] = el;
  return ret;
}, {});
config.lib = {
  entryPoints,
  entryNames: '[name]',
  minify: false,
  format: 'esm',
  sourcemap: false,
  loader: { '.html': 'text', '.css': 'text' },
  preBuilds: [ _ =>  rimraf('dist') ], 
  postBuilds: [copy('lib/index.js dist')],
};

config.libmin = {
  entryPoints: ['lib/index.js'],
  entryNames: 'elements-x.min',
  legalComments: 'none',
  plugins: [minifyCssPlugin, minifyHtmlPlugin]
};

module.exports = config;
```
