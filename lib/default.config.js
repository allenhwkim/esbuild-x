const { copy, injectEsbuildResult, runStaticServer, watchAndReload} = require('../post-builds');

module.exports = {
  build: {
    entryPoints: ['src/main.js'],
    entryNames: '[name]-[hash]',
    outdir: 'dist',
    bundle: true,
    minify: true,
    metafile: true,
    write: true,
    sourcemap: 'external'
  },
  serve: {
    entryPoints: ['src/main.js'],
    entryNames: '[name]',
    outdir: 'dist',
    bundle: true,
    minify: false,
    metafile: true,
    watch: false,
    write: false,
    sourcemap: 'external',
    // belows are custom options for serve
    postBuilds: [
      copy('src/**/* dist'),
      injectEsbuildResult(9000),
      runStaticServer('src', {
        port: 9100,
        notFound: {match: /^\//, serve: 'index.html'}
      }),
      watchAndReload(['src', 'lib'])
    ]
  }
}