const testPlugins = [
  [
    "babel-plugin-module-resolver",
    {
      root: [".", "./src"],
      alias: {
        src: "./src",
        test: "./test"
      },
      loglevel: "verbose"
    }
  ]
];
const coveragePlugins = ["babel-plugin-istanbul", ...testPlugins];

module.exports = {
  env: {
    test: {
      plugins: testPlugins
    },
    coverage: {
      plugins: coveragePlugins
    },
    production: {
      plugins: ["babel-plugin-lodash"]
    }
  },
  presets: ["@babel/preset-env"]
};
