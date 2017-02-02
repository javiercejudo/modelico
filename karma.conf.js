// Karma configuration

module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],

    // list of files / patterns to load in the browser
    files: [
      'node_modules/should/should.js',
      'node_modules/babel-polyfill/dist/polyfill.js',
      'node_modules/immutable/dist/immutable.min.js',
      'node_modules/ajv/dist/ajv.bundle.js',
      'dist/modelico.js',
      'dist/modelico.min.js',
      'dist/modelico-spec.js',
      'test/browser/' + (process.env.ENTRY || 'index.js')
    ],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots', 'saucelabs'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    sauceLabs: {
      username: process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY,
      build: process.env.TRAVIS_BUILD_NUMBER,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
      startConnect: true,
      testName: 'modelico: browser tests'
    },

    customLaunchers: customLaunchers(),

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    // browsers: ['Chrome', 'Firefox'],
    browsers: Object.keys(customLaunchers()),

    // how many browsers Karma launches in parallel
    concurrency: 2,

    // timeout for capturing a browser (in ms)
    captureTimeout: 0,

    // how long will Karma wait for a message from a browser before disconnecting from it (in ms).
    browserNoActivityTimeout: 0,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  })
}

function customLaunchers () {
  return {
    'SL_Chrome': {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 10'
    },
    'SL_Firefox': {
      base: 'SauceLabs',
      browserName: 'firefox'
    },
    'SL_Edge': {
      base: 'SauceLabs',
      browserName: 'microsoftedge',
      platform: 'Windows 10'
    },
    'SL_Safari': {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.11'
    },
    'SL_IE_11': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8.1',
      version: '11'
    },
    'SL_IE_10': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '10'
    },
    'SL_IE_9': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '9'
    },
    'SL_Opera': {
      base: 'SauceLabs',
      browserName: 'opera',
      platform: 'Windows 7',
      version: '12.12'
    },
    'SL_Android': {
      base: 'SauceLabs',
      browserName: 'android',
      deviceOrientation: 'portrait',
      platform: 'Linux',
      version: '5.1'
    },
    'SL_iOS': {
      base: 'SauceLabs',
      browserName: 'iphone',
      deviceName: 'iPhone Simulator',
      deviceOrientation: 'portrait',
      platform: 'macOS 10.12',
      version: '10.0'
    }
  }
}
