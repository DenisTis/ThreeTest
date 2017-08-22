var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './src/js/app.js',
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/dist'
    },
    plugins: [
        new webpack.ProvidePlugin({
            THREE: 'three',
            CANNON: 'cannon'
        })
    ]
};