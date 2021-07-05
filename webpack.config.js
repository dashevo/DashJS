const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

const path = require('path');

const webConfig =  {
  entry: './build/src/index.js',
  mode: "production",
  target: 'web',
  node: {
    // Prevent embedded winston to throw error with FS not existing.
    fs: 'empty',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    library: 'Dash',
    filename: 'dash.min.js',
    // fixes ReferenceError: window is not defined
    globalObject: "(typeof self !== 'undefined' ? self : this)"
  },
  // Webpack versions > 5 do not automatically provide polyfills, need to manually set using this plugin
  plugins: [
    new NodePolyfillPlugin()
  ],
  resolve: {
    extensions: ['.js', '.json'],
    // fixes webpack bundle of node packages requiring 'fs' for web
    fallback: {
        fs: false
    },
    alias: {
      'bn.js': path.resolve(__dirname, 'node_modules', 'bn.js')
    }
  },
}

module.exports = webConfig;
