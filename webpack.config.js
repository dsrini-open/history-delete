const path = require("path");

const webpack = require("webpack");
const MinifyPlugin = require("babel-minify-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");

const targetEnv = process.env.TARGET_ENV || "firefox";
const isProduction = process.env.NODE_ENV === "production";
const distFolder = process.env.DIST_FOLDER || "dist";

let plugins = [
  new webpack.DefinePlugin({
    "process.env": {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || "development"),
      TARGET_ENV: JSON.stringify(targetEnv)
    },
    global: {}
  }),
  isProduction ? new MinifyPlugin() : null,
  new VueLoaderPlugin()
];
plugins = plugins.filter(Boolean);

const moduleConfig = {
  rules: [
    {
      test: /\.js$/,
      use: {
        loader: "babel-loader",
        options: {
          presets: [
            [
              "@babel/preset-env",
              {
                useBuiltIns: "usage",
                corejs: { version: 3, proposals: false },
                modules: false,
                targets: {
                  browsers: [
                    "Firefox > 55",
                    "> 5%",
                    "last 2 major versions",
                    "Firefox ESR"
                  ]
                }
              }
            ]
          ]
        }
      },
      exclude: /node_modules/
    },
    {
      test: /\.vue$/,
      use: ["vue-loader"]
    },
    {
      test: /\.css$/,
      use: ["style-loader", "css-loader"]
    },
    {
      test: /\.scss$/,
      use: ["style-loader", "css-loader", "sass-loader"]
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
    settings: "./src/settings/index.js",
    background: "./src/background/index.js",
    action: "./src/action/index.js"
  },
  output: {
    path: path.resolve(__dirname, `${distFolder}`, "src"),
    filename: "[name]/[name].bundle.js"
  },
  module: moduleConfig,
  plugins: plugins,
  resolve: {
    modules: [path.resolve(__dirname, "src"), "node_modules"],
    extensions: [".js", ".css", ".scss", ".vue"]
  }
};

if (process.env.NODE_ENV === "development") {
  module.exports.devtool = "inline-source-map";
}
