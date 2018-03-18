'use strict';
require('ts-node/register');

const
    isCI         = require('../../isCI'),
    path         = require('path'),
    protractor   = require.resolve('protractor'),
    node_modules = protractor.substring(0, protractor.lastIndexOf('node_modules') + 12),
    crew         = require('../../support/child_process_reporter.ts');

exports.config = {
    // seleniumServerJar: path.resolve(node_modules, 'protractor/node_modules/webdriver-manager/selenium/selenium-server-standalone-2.53.1.jar'),

    directConnect: true,

    framework: 'custom',

    frameworkPath: path.resolve(__dirname, '../../../src'),
    serenity: {
        dialect: 'cucumber',
        crew: [ crew.childProcessReporter() ],
    },

    specs: [ 'features/**/*.feature' ],
    cucumberOpts: {
        require:    [
            'features/**/*.ts'
        ],
        format:     'pretty',
        compiler:   'ts:ts-node/register',
    },

    capabilities: {
        browserName: 'chrome',

        chromeOptions: {
            args: [ "--headless", "--disable-gpu", "--window-size=800,600" ]
                .concat(isCI() ? ['--no-sandbox'] : [])
        }
    },
};
