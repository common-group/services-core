const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

const ifDefOpts = {
    DEBUG: !isProd,
    version: 3,
    'ifdef-verbose': true,
};

module.exports = {
    entry: './legacy/src/app.js',
    mode: isProd ? 'production' : 'development',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                          use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true
                        }
                    },
                    {
                        loader: 'ifdef-loader',
                        options: ifDefOpts,
                    },
                ],
            },
        ],
    },
    devServer: {
        contentBase: './dist',
    },
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'catarse.js',
        sourceMapFilename: 'catarse.js.map',
    },
    plugins: isProd ? [new UglifyJsPlugin({
        sourceMap: true,
        uglifyOptions: {
            compress: true
        }
    })] : [],
};
