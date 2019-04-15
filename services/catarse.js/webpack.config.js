const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
    entry: './legacy/src/app.js',
    mode: isProd ? 'production' : 'development',
    module: {
      rules: [
          { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
          {
            test: /\.elm$/,
            exclude: [/elm-stuff/, /node_modules/],
            loader: 'elm-webpack-loader',
            options: {
              debug: true,
              warn: true
          }
        }
      ]
    },
    devServer: {
        contentBase: './dist'
    },
    devtool: isProd ? false : 'source-map',
    output: {
      filename: 'catarse.js',
      path: path.resolve(__dirname, 'dist'),
    },
    plugins: !isProd ? [] : [ new UglifyJsPlugin() ],
};
