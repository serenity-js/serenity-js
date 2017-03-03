'use strict';

require('ts-node/register');    // because of the child_process_reporter.ts

let path         = require('path'),
    src          = path.resolve(path.relative(process.cwd(), __dirname), '../../../src'),
    protractor   = require.resolve('protractor'),
    node_modules = protractor.substring(0, protractor.lastIndexOf('node_modules') + 12),
    crew         = require('../../support/child_process_reporter.ts');

exports.config = {
    seleniumServerJar: path.resolve(node_modules, 'protractor/node_modules/webdriver-manager/selenium/selenium-server-standalone-2.53.1.jar'),

    framework: 'custom',

    frameworkPath: path.resolve(__dirname, '../../../src'),
    serenity: {
        dialect: 'mocha',
        crew: [ crew.childProcessReporter() ],
    },

    specs: [ 'spec/**.ts' ],

    mochaOpts: {
        ui: 'bdd',
        compiler: 'ts:ts-node/register',
    },

    capabilities: {
        'browserName': 'phantomjs',
        'phantomjs.binary.path': path.resolve(node_modules, 'phantomjs-prebuilt/lib/phantom/bin/phantomjs'),
    },
};
