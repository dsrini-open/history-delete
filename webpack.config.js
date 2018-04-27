const path = require('path');

const webpack = require('webpack');
const MinifyPlugin = require("babel-minify-webpack-plugin");

const targetEnv = process.env.TARGET_ENV || 'firefox';
const isProduction = process.env.NODE_ENV === 'production';
const distFolder = process.env.DIST_FOLDER || 'dist';

let plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
      TARGET_ENV: JSON.stringify(targetEnv)
    },
    global: {}
  }),
  isProduction ? new MinifyPlugin() : null
];
plugins = plugins.filter(Boolean);

const moduleConfig = {
  rules: [
    {
      test: /\.js$/,
      use: [
        {
          loader: 'babel-loader',
        }
      ]
    },
    {
      test: /\.css$/,
      use: [ 'style-loader', 'css-loader' ]
    },
    {
      test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              loaders: {
                sass: [ 'vue-style-loader',
                        'css-loader',
                        'sass-loader'
                      ],
                scss: [ 'vue-style-loader',
                        'css-loader',
                        'sass-loader'
                      ]
                    }
                  }
              }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'sass-loader',
            options: {
              includePaths: [path.resolve(__dirname, 'node_modules')]
            }
          }
        ]
      }
  ]
};

module.exports = {
    optimization: {
      splitChunks: {
      	cacheGroups: {
      		commons: {
      			name: "commons",
      			chunks: "initial",
      			minChunks: 2
      		}
      	}
      }
    },
    /* Configure by entrypoints
    optimization: {
      splitChunks: {
        chunks: "all"
      }
    },
    */
    mode: `${process.env.NODE_ENV}`,
    entry: {
        settings: './src/settings/index.js',
        background: './src/background/index.js',
        action: './src/action/index.js'
    },
    output: {
        path: path.resolve(__dirname, `${distFolder}`, 'src'),
        filename: '[name]/[name].bundle.js'
    },
    module: moduleConfig,
    plugins: plugins,
    resolve: {
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      extensions: ['.js', '.css', '.scss', '.vue']
    }
};

if (process.env.NODE_ENV === 'development') {
  module.exports.devtool = 'inline-source-map';
}
