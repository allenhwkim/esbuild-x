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

## Config 
* all esbuild options are allowed, https://esbuild.github.io/api/#build-api.  
* preBuilds: an array of function to be executed before esbuild.build()  
  a pre build function takes esbuild option as a parameter
  ```
  config = {
    build: {
      entryPoints: ['src/main.js'],
      ...
      preBuilds: [ function clear() {rimraf('dist')} ], // delete dist directory
      ...
    }
  }
  ```
* postBuilds: an array of function to run after esbuild.build().  
  a post build function takes esbuild option and esbuild results as parameters.
  ```
  config = {
    serve: {
      entryPoints: ['src/main.js'],
      ...
      postBuilds: [ function(options, buildResult) { // run a websocket server
        const wss = new WebSocketServer({ port: 8081});
        wss.on('connection', socket => wsClients.push(socket));
      }],
      ...
    }
  }
  ```
* port: a port number to run dev server with `bojagi serve`
* notFoundHandler: an object to redirect when dev server meets 404.  
  This can be used for S.P.A. application history api fallback.
  e.g., 
  ```
  config = {
    serve: {
      entryPoints: ['src/main.js'],
      ...
      // when file is not found with url starts with component or tool, serve index.html
      notFoundHandler: { '^/(component|tool)': 'index.html' }
      ...
    }
  }
  ```


A full example can be found here.
https://github.com/elements-x/elements-x/blob/master/bojagi.config.js

```
