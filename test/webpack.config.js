const path = require("path");
const nodeExternals = require("webpack-node-externals");

const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
  target: "node",
  mode: "development",
  plugins: [new VueLoaderPlugin()],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    useBuiltIns: "usage",
                    corejs: { version: 3, proposals: false },
                    modules: "umd"
                  }
                ]
              ]
            }
          }
        ],
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
  },
  externals: [nodeExternals()],
  devtool: process.env.NODE_ENV === "test" ? "source-map" : "eval"
};
