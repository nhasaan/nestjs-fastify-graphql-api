const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  // ...other webpack config options
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@resources': path.resolve(__dirname, 'src/resources'),
      '@core': path.resolve(__dirname, 'src/core'),
      '@config': path.resolve(__dirname, 'src/config'),
    },
  },
  externals: [nodeExternals()],
};
