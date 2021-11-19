# esbuild-x 
[esbuid](https://esbuild.github.io/) extended; esbuild + pre/post builds

## Features
* esbuild CLI available (since it's a dependency)
* esbuild npm available (since it's a dependency)
* plus, accepting configuration file (e.g., `esbuild.config.js`)
* plus, accepting custom pre build functions
* plus, accepting custom post build functions

## Install
```
$ npm i esbuild-x -D
```

## Usage as command
```
$ esbuild main.js --bundle
$ esbuild-x --config=esbuild.config.js
$ esbuild-x build
$ esbuild-x serve
```

## Usage as node module
```
// esbuild as it is
const esbuild = require('esbuild');
esbuild.build({
  entryPoints: ['src/main.js'],
  entryNames: '[name]-[hash]',
  outdir: 'dist',
  bundle: true
})

// or esbuildX along with pre/post builds extended  
const esbuildX = require('esbuild-x');
esbuildX.build({
  entryPoints: ['src/main.js'],
  entryNames: '[name]-[hash]',
  outdir: 'dist',
  bundle: true,
  preBuilds: [ function() {rimraf('dist')} ], 
  postBuilds: [ function() {console.log('done')} ]
})
```

## esbuild-x.config.js example
* all esbuild options are allowed, https://esbuild.github.io/api/#build-api.
* preBuilds: an array of function to run before esbuild.build()
  Example
  ```
  module.exports = {
    build: {
      entryPoints: ['src/main.js'],
      entryNames: '[name]-[hash]',
      outdir: 'dist',
      bundle: true,
      ...
      preBuilds: [ function clear() {rimraf('dist')} ], 
      ...
    }
  }
  ```

* postBuilds: an array of function to run after esbuild.build().  
  a post build function takes two parameters internally
    * esbuild option 
    * esbuild result
  ```
  module.exports = {
    build: {
      entryPoints: ['src/main.js'],
      entryNames: '[name]-[hash]',
      outdir: 'dist',
      bundle: true,
      ...
      postBuilds: [ 
        async function(_, result) { // bundle analyzer
          let text = await esbuild.analyzeMetafile(result.metafile, {verbose: true});
          console.log(text);
        }
      ]
    }
  }
  ```
A full example can be found here.
https://github.com/elements-x/elements-x/blob/master/esbuild-x.config.js

## built-in esbuild plugins

### minifyCssPlugin / minifyHtmlPlubin
esbuild plugin that minify css and html
 * Read .css files as a minified text, not as css object.
 * Read .html files as a minified text

src/main.js
```
import html from './test.html';
import css from './test.css';
console.log(html + css);
```

Example
```
const esbuildX = require('esbuild-x');
const { minifyCssPlugin, minifyHtmlPlugin } = esbuildX.plugins;
const options = {
  entryPoints: ['src/main.js'],
  plugins: [minifyCssPlugin, minifyHtmlPlugin]
};
esbuildX.build(options).then(esbuildResult => {
  ...
});
```

## built-in post builds

### copy
copy files to a directory by replacing file contents

#### parameters
* fromsTo: string. Accepts glob patterns. e.g., 'src/**/!(*.js) public/* dist'
* options:
  * replacements: list of replacement objects
    * match: replacement happens when this regular expression match to a file path.
    * find: regular expression to search string in a file.
    * replace: string value to replace the string found.
  * excludes: list of exclude patterns.

Example
```
const esbuildX = require('esbuild-x');
const {copy} = esbuildX.postBuilds
const options = { 
  entryPoints: ['src/main.js']
  postBuilds: [
    copy('src/**/!(*.js) public/* dist', {
      replacements: [ {match: /index\.html/, find: /FOO/, replace: 'BAR'} ],
      excludes: [/node_moules/]
    })
  ]
}
esbuildX.build(options).then(esbuildResult => {
  ...
})
```

### injectEsbuildResult
Inject esbuild compile output to index.html.

e.g. 
```
  <!-- your index.html -->
  <script src="main.js"></script>
  <link rel="stylesheet" href="style.css" />
  </body>
</html>
```

Example
```
const esbuildX = require('esbuild-x');
const {injectEsbuildResult} = esbuildX.postBuilds;
const options = { 
  entryPoints: ['src/main.js']
  postBuilds: [ injectEsbuildResult() ]
}
esbuildX.build(options).then(esbuildResult => {
  ...
})
```

### runStaticServer
Run a static http server for a given directory. Two parameters accepted
* dir: a directory to run a static http server. required.
* options (optional)
  * fs: file system to run a static server. e.g. `require('memfs')`. Default `require('fs')`. 
  * port: port number to run a static server. Default 9100
  * notFound: 404 redirection logic.
    e.g. `{match: /.*$/, serve: path.join(dir, 'index.html')}`

Example
```
const esbuildX = require('esbuild-x');
const {runStaticServer} = esbuildX.postBuilds;
const options = { 
  entryPoints: ['src/main.js']
  postBuilds: [
    runStaticServer('src', {
      fs: require('memfs'), 
      port: 9100, 
      notFound: {match: /.*$/, serve: path.join(dir, 'index.html')
    }}) 
  ]
}
esbuildX.build(options).then(esbuildResult => {
  ...
})
```

### watchAndReload
Watch the given directory, and rebuild and reload when a file change happens. 
It also starts a WebSocket server to reload the browser client when a file change happens.

Parameters: 
  * dir: a directory to watch
  * websocket port: Optional, Default 9110. If null, it does not run websocket server

Example
```
const esbuildX = require('esbuild-x');
const {watchAndReload} = esbuildX.postBuilds;
const options = { 
  entryPoints: ['src/main.js']
  postBuilds: [
    watchAndReload('src', 9110) 
  ]
}
esbuildX.build(options).then(esbuildResult => {
  ...
})
```
