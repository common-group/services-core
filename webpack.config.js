const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: './src/app.js',
    output: {
        filename: 'catarse.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new UglifyJsPlugin()
    ]
};
