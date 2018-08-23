const path = require('path')
const R = require('ramda')

const base = require('./webpack.config.js')

const config = {
  target: 'web',
  output: {
    path: path.join(__dirname, './browser'),
    library: 'pagarme',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    filename: 'pagarme.js',
    sourceMapFilename: 'pagarme.js.map',
  },
}

module.exports = R.merge(base, config)

