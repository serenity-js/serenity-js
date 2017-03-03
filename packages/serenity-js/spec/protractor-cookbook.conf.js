'use strict';
require('ts-node/register');

var _            = require('lodash'),
    path         = require('path'),
    protractor   = require.resolve('protractor'),
    node_modules = protractor.substring(0, protractor.lastIndexOf('node_modules') + 12);

var capabilities = {
    chrome: {
        browserName:          'chrome',
        build:                process.env.BROWSERSTACK_AUTOMATE_BUILD,
        project:              process.env.BROWSERSTACK_AUTOMATE_PROJECT,

        'browserstack.localIdentifier': process.env.BROWSERSTACK_LOCAL_IDENTIFIER,
        'browserstack.local': true,
    },

    phantomjs: {
        'browserName': 'phantomjs',
        'phantomjs.binary.path': path.resolve(node_modules, 'phantomjs-prebuilt/lib/phantom/bin/phantomjs'),
    }
}

exports.config = {
    seleniumServerJar: path.resolve(node_modules, 'protractor/node_modules/webdriver-manager/selenium/selenium-server-standalone-2.53.1.jar'),

    framework: 'mocha',
    specs: [ 'cookbook/**/*.recipe.ts' ],

    browserstackUser: process.env.BROWSERSTACK_USERNAME,
    browserstackKey:  process.env.BROWSERSTACK_KEY,

    restartBrowserBetweenTests: false,

    getMultiCapabilities: function() {
        var browsers = (this.params.browsers || 'chrome').split(',');

        return _(capabilities)
            .pick(browsers)
            .values()
            .value();
    }
};
