// Karma configuration
// Generated on Tue Oct 13 2015 19:08:06 GMT+0200 (CEST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: 'public/',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'lib/angular/angular.js',
      'lib/angular-mocks/angular-mocks.js',
      'lib/angular-ui-router/release/angular-ui-router.js',
      'lib/angular-cookies/angular-cookies.js',
      'lib/angular-resource/angular-resource.js',
      'lib/angular-loading-bar/build/loading-bar.js',

      'app/app.module.js',
      'app/configuration/configuration.js',
      'app/auth/auth.service.js',
      'app/auth/user.service.js',
      'app/login/login.controller.js',
      'app/account/settings.controller.js',
      'app/master/master.js',
      'app/message/message.js',
      'app/common/item-selector.js',
      'app/navbar/navbar.js',
      'app/sensor/sensor-list.js',
      'app/device/device-list.js',
      'app/group/group-list.js',
      'app/group/group-edit.js',
      'app/scheduler/scheduler.js',
      'app/scheduler/scheduler-list.js',
      'app/scheduler/scheduler-edit.js',
      'app/app.js',

      'app/**/*.html',

      'app/**/*.spec.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'app/**/*.js' : ['coverage']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec', 'coverage'],

    coverageReporter: {
      type : 'html',
      dir : './../coverage/'
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  })
};