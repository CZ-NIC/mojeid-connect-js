const path = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    mode: "production",
    entry: {
        mojeid_connect: [
            path.resolve(__dirname, './src/index.js')
        ]
    },
    module: {
        rules: [{
            test: /\.(js)$/,
            exclude: /node_modules/,
            use: ['babel-loader']
        }]
    },
    resolve: {
        extensions: ['*', '.js']
    },
    optimization: {
        minimizer: [new UglifyJsPlugin({
            sourceMap: true
        })],
    },
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/',
        library: '[name]',
        filename: '[name].' + require("./package.json").version + '.js',
        sourceMapFilename: '[name].js.map'
    },
    devServer: {
        contentBase: './dist'
    },
    devtool: 'source-map'
}
