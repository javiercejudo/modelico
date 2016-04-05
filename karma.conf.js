// Karma configuration

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],


    // list of files / patterns to load in the browser
    files: [
      'node_modules/should/should.min.js',
      'node_modules/babel-polyfill/dist/polyfill.min.js',
      'dist/modelico.min.js',
      'tmp/modelico-spec.js',
      'test/karmaEntry.js'
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
    //browsers: ['Chrome', 'Firefox'],
    browsers: Object.keys(customLaunchers()),


    // timeout for capturing a browser (in ms)
    captureTimeout: 0,


    // how long will Karma wait for a message from a browser before disconnecting from it (in ms).
    browserNoActivityTimeout: 0,


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};

function customLaunchers() {
  return {
    'SL_Chrome': {
      base: 'SauceLabs',
      browserName: 'chrome'
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
      platform: 'OS X 10.10'
    },
    'SL_IE_11': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8.1',
      version: '11'
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
      deviceName: 'Samsung Galaxy S4 Emulator',
      deviceOrientation: 'portrait',
      platform: 'Linux',
      version: '4.4'
    },
    'SL_iOS': {
      base: 'SauceLabs',
      browserName: 'iphone',
      deviceName: 'iPhone Simulator',
      deviceOrientation: 'portrait',
      platform: 'OS X 10.10',
      version: '8.2'
    }
  };
}
