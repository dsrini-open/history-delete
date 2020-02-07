module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    "plugin:vue/essential",
    "airbnb-base",
    "plugin:prettier/recommended"
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },
  plugins: ["vue"],
  settings: {
    "import/resolver": {
      node: {
        paths: ["src"]
      }
    }
  },
  overrides: [
    {
      files: ["src/background/index.js", "common.js"],
      rules: {
        "no-use-before-define": "off"
      }
    },
    {
      files: ["storage.js"],
      rules: {
        "no-param-reassign": "off"
      }
    },
    {
      files: ["install.js"],
      rules: {
        "import/prefer-default-export": "off"
      }
    },
    {
      files: ["*.vue"],
      rules: {
        "prettier/prettier": "off",
        "func-names": "off",
        quotes: "off",
        "object-shorthand": "off"
      }
    }
  ],
  rules: {
    quotes: ["error", "double"],
    eqeqeq: ["error", "smart"],
    "no-use-before-define": ["error", { functions: false }],
    "no-param-reassign": [
      "error",
      { props: true, ignorePropertyModificationsFor: ["area"] }
    ]
  }
};
