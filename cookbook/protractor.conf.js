'use strict';
require('ts-node/register');

var path         = require('path'),
    protractor   = require.resolve('protractor'),
    node_modules = protractor.substring(0, protractor.lastIndexOf('node_modules') + 12);

exports.config = {
    seleniumServerJar: path.resolve(node_modules, 'protractor/node_modules/webdriver-manager/selenium/selenium-server-standalone-2.53.1.jar'),

    framework: 'mocha',
    specs: [ 'recipes/**/*.recipe.ts' ],

    capabilities: {
        'browserName': 'chrome',
        'phantomjs.binary.path': path.resolve(node_modules, 'phantomjs-prebuilt/lib/phantom/bin/phantomjs'),
    },

    restartBrowserBetweenTests: false
};
