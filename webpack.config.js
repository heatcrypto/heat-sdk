const path = require('path');
module.exports = {
  mode: 'production',
  entry: './src/heat-sdk.ts',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ]
  },
  // target: 'node',
  // experiments: { asyncWebAssembly: true, importAsync: true },
  // optimization: {
  //   minimize: false,
  // },
  // resolve: {
  //   extensions: [".tsx", ".ts", ".js"]
  // },
  output: {
    filename: 'node.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  // externals: [
  //   // fimk-sdk + heat-sdk use bufferutils which uses this as an optional dependency
  //   'memcpy'
  // ]
};