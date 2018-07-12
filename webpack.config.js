const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
    entry: './src/app.js',
    mode: !isProd && 'development',
    module: {
      rules: [
        { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
      ]
    },
    devServer: {
        contentBase: './dist'
    },
    devtool: isProd ? false : 'inline-source-map',
    output: {
      filename: 'catarse.js',
      path: path.resolve(__dirname, 'dist'),
    },
    plugins: !isProd ? [] : [
      new UglifyJsPlugin()
    ],
};
